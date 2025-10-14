using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cloud.AntiCorruptionLayer;

/// <summary>
/// Implementation of AntiCorruptionLayer pattern.
/// Implements facade between modern and legacy applications to prevent legacy domain models
/// from corrupting new application architecture.
/// </summary>
public class AntiCorruptionLayerImplementation : IAntiCorruptionLayer
{
    public void Execute()
    {
        Console.WriteLine("AntiCorruptionLayer pattern executing...");
        Console.WriteLine("This pattern creates a facade between modern and legacy systems.\n");
    }
}

/// <summary>
/// Legacy customer data model with problematic structure
/// </summary>
public class LegacyCustomer
{
    public string CUST_ID { get; set; }
    public string CUST_NAME_FIRST { get; set; }
    public string CUST_NAME_LAST { get; set; }
    public string CUST_ADDR_LINE1 { get; set; }
    public string CUST_ADDR_LINE2 { get; set; }
    public string CUST_CITY { get; set; }
    public string CUST_STATE { get; set; }
    public string CUST_ZIP { get; set; }
    public string CUST_PHONE { get; set; }
    public string CUST_EMAIL { get; set; }
    public string CUST_STATUS { get; set; } // "A"=Active, "I"=Inactive, "S"=Suspended
    public DateTime CUST_CREATE_DT { get; set; }
    public decimal CUST_BALANCE { get; set; }
    public string CUST_TYPE { get; set; } // "R"=Regular, "P"=Premium, "V"=VIP
}

/// <summary>
/// Modern customer model with clean architecture
/// </summary>
public class Customer
{
    public string Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public Address Address { get; set; }
    public ContactInfo ContactInfo { get; set; }
    public CustomerStatus Status { get; set; }
    public CustomerType Type { get; set; }
    public DateTime CreatedDate { get; set; }
    public decimal AccountBalance { get; set; }

    public string FullName => $"{FirstName} {LastName}";
}

/// <summary>
/// Modern address model
/// </summary>
public class Address
{
    public string Street { get; set; }
    public string AddressLine2 { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string PostalCode { get; set; }

    public string FullAddress =>
        $"{Street}{(string.IsNullOrEmpty(AddressLine2) ? "" : ", " + AddressLine2)}, {City}, {State} {PostalCode}";
}

/// <summary>
/// Modern contact information model
/// </summary>
public class ContactInfo
{
    public string Phone { get; set; }
    public string Email { get; set; }
}

/// <summary>
/// Modern customer status enumeration
/// </summary>
public enum CustomerStatus
{
    Active,
    Inactive,
    Suspended
}

/// <summary>
/// Modern customer type enumeration
/// </summary>
public enum CustomerType
{
    Regular,
    Premium,
    VIP
}

/// <summary>
/// Anti-Corruption Layer that translates between legacy and modern models
/// </summary>
public class CustomerAntiCorruptionLayer
{
    /// <summary>
    /// Translates legacy customer to modern customer model
    /// </summary>
    public Customer TranslateToModern(LegacyCustomer legacy)
    {
        if (legacy == null)
            throw new ArgumentNullException(nameof(legacy));

        return new Customer
        {
            Id = legacy.CUST_ID,
            FirstName = legacy.CUST_NAME_FIRST,
            LastName = legacy.CUST_NAME_LAST,
            Address = new Address
            {
                Street = legacy.CUST_ADDR_LINE1,
                AddressLine2 = legacy.CUST_ADDR_LINE2,
                City = legacy.CUST_CITY,
                State = legacy.CUST_STATE,
                PostalCode = legacy.CUST_ZIP
            },
            ContactInfo = new ContactInfo
            {
                Phone = legacy.CUST_PHONE,
                Email = legacy.CUST_EMAIL
            },
            Status = TranslateStatus(legacy.CUST_STATUS),
            Type = TranslateType(legacy.CUST_TYPE),
            CreatedDate = legacy.CUST_CREATE_DT,
            AccountBalance = legacy.CUST_BALANCE
        };
    }

    /// <summary>
    /// Translates modern customer to legacy customer model
    /// </summary>
    public LegacyCustomer TranslateToLegacy(Customer modern)
    {
        if (modern == null)
            throw new ArgumentNullException(nameof(modern));

        return new LegacyCustomer
        {
            CUST_ID = modern.Id,
            CUST_NAME_FIRST = modern.FirstName,
            CUST_NAME_LAST = modern.LastName,
            CUST_ADDR_LINE1 = modern.Address.Street,
            CUST_ADDR_LINE2 = modern.Address.AddressLine2,
            CUST_CITY = modern.Address.City,
            CUST_STATE = modern.Address.State,
            CUST_ZIP = modern.Address.PostalCode,
            CUST_PHONE = modern.ContactInfo.Phone,
            CUST_EMAIL = modern.ContactInfo.Email,
            CUST_STATUS = TranslateStatusToLegacy(modern.Status),
            CUST_TYPE = TranslateTypeToLegacy(modern.Type),
            CUST_CREATE_DT = modern.CreatedDate,
            CUST_BALANCE = modern.AccountBalance
        };
    }

    /// <summary>
    /// Translates batch of legacy customers to modern model
    /// </summary>
    public List<Customer> TranslateBatchToModern(List<LegacyCustomer> legacyCustomers)
    {
        return legacyCustomers?.Select(TranslateToModern).ToList() ?? new List<Customer>();
    }

    private CustomerStatus TranslateStatus(string legacyStatus)
    {
        return legacyStatus switch
        {
            "A" => CustomerStatus.Active,
            "I" => CustomerStatus.Inactive,
            "S" => CustomerStatus.Suspended,
            _ => CustomerStatus.Inactive
        };
    }

    private string TranslateStatusToLegacy(CustomerStatus status)
    {
        return status switch
        {
            CustomerStatus.Active => "A",
            CustomerStatus.Inactive => "I",
            CustomerStatus.Suspended => "S",
            _ => "I"
        };
    }

    private CustomerType TranslateType(string legacyType)
    {
        return legacyType switch
        {
            "R" => CustomerType.Regular,
            "P" => CustomerType.Premium,
            "V" => CustomerType.VIP,
            _ => CustomerType.Regular
        };
    }

    private string TranslateTypeToLegacy(CustomerType type)
    {
        return type switch
        {
            CustomerType.Regular => "R",
            CustomerType.Premium => "P",
            CustomerType.VIP => "V",
            _ => "R"
        };
    }
}

/// <summary>
/// Legacy order model with flat structure
/// </summary>
public class LegacyOrder
{
    public string ORD_ID { get; set; }
    public string CUST_ID { get; set; }
    public DateTime ORD_DATE { get; set; }
    public string ORD_STATUS { get; set; } // "P"=Pending, "S"=Shipped, "D"=Delivered, "C"=Cancelled
    public decimal ORD_TOTAL { get; set; }
    public decimal ORD_TAX { get; set; }
    public decimal ORD_SHIPPING { get; set; }
    public string ORD_SHIP_ADDR { get; set; }
    public string ORD_PAYMENT_TYPE { get; set; } // "CC"=CreditCard, "PP"=PayPal, "BT"=BankTransfer
}

/// <summary>
/// Modern order model with rich domain objects
/// </summary>
public class Order
{
    public string OrderId { get; set; }
    public string CustomerId { get; set; }
    public DateTime OrderDate { get; set; }
    public OrderStatus Status { get; set; }
    public Money Subtotal { get; set; }
    public Money Tax { get; set; }
    public Money Shipping { get; set; }
    public Money Total { get; set; }
    public ShippingAddress ShippingAddress { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
}

/// <summary>
/// Value object for money
/// </summary>
public class Money
{
    public decimal Amount { get; set; }
    public string Currency { get; set; }

    public Money(decimal amount, string currency = "USD")
    {
        Amount = amount;
        Currency = currency;
    }

    public override string ToString() => $"{Amount:C}";
}

/// <summary>
/// Shipping address value object
/// </summary>
public class ShippingAddress
{
    public string FullAddress { get; set; }
}

/// <summary>
/// Payment method enumeration
/// </summary>
public enum PaymentMethod
{
    CreditCard,
    PayPal,
    BankTransfer
}

/// <summary>
/// Order status enumeration
/// </summary>
public enum OrderStatus
{
    Pending,
    Shipped,
    Delivered,
    Cancelled
}

/// <summary>
/// Anti-Corruption Layer for orders
/// </summary>
public class OrderAntiCorruptionLayer
{
    public Order TranslateToModern(LegacyOrder legacy)
    {
        if (legacy == null)
            throw new ArgumentNullException(nameof(legacy));

        return new Order
        {
            OrderId = legacy.ORD_ID,
            CustomerId = legacy.CUST_ID,
            OrderDate = legacy.ORD_DATE,
            Status = TranslateStatus(legacy.ORD_STATUS),
            Subtotal = new Money(legacy.ORD_TOTAL - legacy.ORD_TAX - legacy.ORD_SHIPPING),
            Tax = new Money(legacy.ORD_TAX),
            Shipping = new Money(legacy.ORD_SHIPPING),
            Total = new Money(legacy.ORD_TOTAL),
            ShippingAddress = new ShippingAddress { FullAddress = legacy.ORD_SHIP_ADDR },
            PaymentMethod = TranslatePaymentMethod(legacy.ORD_PAYMENT_TYPE)
        };
    }

    public LegacyOrder TranslateToLegacy(Order modern)
    {
        if (modern == null)
            throw new ArgumentNullException(nameof(modern));

        return new LegacyOrder
        {
            ORD_ID = modern.OrderId,
            CUST_ID = modern.CustomerId,
            ORD_DATE = modern.OrderDate,
            ORD_STATUS = TranslateStatusToLegacy(modern.Status),
            ORD_TOTAL = modern.Total.Amount,
            ORD_TAX = modern.Tax.Amount,
            ORD_SHIPPING = modern.Shipping.Amount,
            ORD_SHIP_ADDR = modern.ShippingAddress.FullAddress,
            ORD_PAYMENT_TYPE = TranslatePaymentMethodToLegacy(modern.PaymentMethod)
        };
    }

    private OrderStatus TranslateStatus(string legacyStatus)
    {
        return legacyStatus switch
        {
            "P" => OrderStatus.Pending,
            "S" => OrderStatus.Shipped,
            "D" => OrderStatus.Delivered,
            "C" => OrderStatus.Cancelled,
            _ => OrderStatus.Pending
        };
    }

    private string TranslateStatusToLegacy(OrderStatus status)
    {
        return status switch
        {
            OrderStatus.Pending => "P",
            OrderStatus.Shipped => "S",
            OrderStatus.Delivered => "D",
            OrderStatus.Cancelled => "C",
            _ => "P"
        };
    }

    private PaymentMethod TranslatePaymentMethod(string legacyMethod)
    {
        return legacyMethod switch
        {
            "CC" => PaymentMethod.CreditCard,
            "PP" => PaymentMethod.PayPal,
            "BT" => PaymentMethod.BankTransfer,
            _ => PaymentMethod.CreditCard
        };
    }

    private string TranslatePaymentMethodToLegacy(PaymentMethod method)
    {
        return method switch
        {
            PaymentMethod.CreditCard => "CC",
            PaymentMethod.PayPal => "PP",
            PaymentMethod.BankTransfer => "BT",
            _ => "CC"
        };
    }
}

/// <summary>
/// Legacy system API simulator
/// </summary>
public class LegacySystemApi
{
    private readonly List<LegacyCustomer> _legacyCustomers;
    private readonly List<LegacyOrder> _legacyOrders;

    public LegacySystemApi()
    {
        _legacyCustomers = new List<LegacyCustomer>();
        _legacyOrders = new List<LegacyOrder>();
        InitializeSampleData();
    }

    public async Task<LegacyCustomer> GetCustomerAsync(string customerId)
    {
        await Task.Delay(100); // Simulate network delay
        return _legacyCustomers.FirstOrDefault(c => c.CUST_ID == customerId);
    }

    public async Task<List<LegacyCustomer>> GetAllCustomersAsync()
    {
        await Task.Delay(200);
        return new List<LegacyCustomer>(_legacyCustomers);
    }

    public async Task<LegacyOrder> GetOrderAsync(string orderId)
    {
        await Task.Delay(100);
        return _legacyOrders.FirstOrDefault(o => o.ORD_ID == orderId);
    }

    public async Task<bool> UpdateCustomerAsync(LegacyCustomer customer)
    {
        await Task.Delay(150);
        int index = _legacyCustomers.FindIndex(c => c.CUST_ID == customer.CUST_ID);
        if (index >= 0)
        {
            _legacyCustomers[index] = customer;
            return true;
        }
        return false;
    }

    private void InitializeSampleData()
    {
        _legacyCustomers.Add(new LegacyCustomer
        {
            CUST_ID = "C001",
            CUST_NAME_FIRST = "John",
            CUST_NAME_LAST = "Doe",
            CUST_ADDR_LINE1 = "123 Main St",
            CUST_ADDR_LINE2 = "Apt 4B",
            CUST_CITY = "Seattle",
            CUST_STATE = "WA",
            CUST_ZIP = "98101",
            CUST_PHONE = "555-1234",
            CUST_EMAIL = "john.doe@example.com",
            CUST_STATUS = "A",
            CUST_CREATE_DT = new DateTime(2020, 1, 15),
            CUST_BALANCE = 1250.50m,
            CUST_TYPE = "P"
        });

        _legacyOrders.Add(new LegacyOrder
        {
            ORD_ID = "O001",
            CUST_ID = "C001",
            ORD_DATE = new DateTime(2024, 1, 10),
            ORD_STATUS = "D",
            ORD_TOTAL = 125.99m,
            ORD_TAX = 10.08m,
            ORD_SHIPPING = 5.99m,
            ORD_SHIP_ADDR = "123 Main St, Apt 4B, Seattle, WA 98101",
            ORD_PAYMENT_TYPE = "CC"
        });
    }
}

/// <summary>
/// Modern service that uses the Anti-Corruption Layer
/// </summary>
public class ModernCustomerService
{
    private readonly LegacySystemApi _legacyApi;
    private readonly CustomerAntiCorruptionLayer _customerAcl;
    private readonly OrderAntiCorruptionLayer _orderAcl;

    public ModernCustomerService()
    {
        _legacyApi = new LegacySystemApi();
        _customerAcl = new CustomerAntiCorruptionLayer();
        _orderAcl = new OrderAntiCorruptionLayer();
    }

    public async Task<Customer> GetCustomerAsync(string customerId)
    {
        Console.WriteLine($"[Modern Service] Fetching customer {customerId}");
        LegacyCustomer legacyCustomer = await _legacyApi.GetCustomerAsync(customerId);

        if (legacyCustomer == null)
        {
            Console.WriteLine($"[Modern Service] Customer {customerId} not found");
            return null;
        }

        Customer modernCustomer = _customerAcl.TranslateToModern(legacyCustomer);
        Console.WriteLine($"[Modern Service] Translated legacy customer to modern model");
        return modernCustomer;
    }

    public async Task<List<Customer>> GetAllCustomersAsync()
    {
        Console.WriteLine("[Modern Service] Fetching all customers");
        List<LegacyCustomer> legacyCustomers = await _legacyApi.GetAllCustomersAsync();
        List<Customer> modernCustomers = _customerAcl.TranslateBatchToModern(legacyCustomers);
        Console.WriteLine($"[Modern Service] Translated {modernCustomers.Count} customers");
        return modernCustomers;
    }

    public async Task<Order> GetOrderAsync(string orderId)
    {
        Console.WriteLine($"[Modern Service] Fetching order {orderId}");
        LegacyOrder legacyOrder = await _legacyApi.GetOrderAsync(orderId);

        if (legacyOrder == null)
        {
            Console.WriteLine($"[Modern Service] Order {orderId} not found");
            return null;
        }

        Order modernOrder = _orderAcl.TranslateToModern(legacyOrder);
        Console.WriteLine($"[Modern Service] Translated legacy order to modern model");
        return modernOrder;
    }

    public async Task<bool> UpdateCustomerAsync(Customer customer)
    {
        Console.WriteLine($"[Modern Service] Updating customer {customer.Id}");
        LegacyCustomer legacyCustomer = _customerAcl.TranslateToLegacy(customer);
        bool result = await _legacyApi.UpdateCustomerAsync(legacyCustomer);
        Console.WriteLine($"[Modern Service] Update {(result ? "successful" : "failed")}");
        return result;
    }
}
