using System;
using System.Collections.Generic;
using System.Linq;

namespace Enterprise.BasePatterns.ValueObject;

/// <summary>
/// Concrete implementation of ValueObject pattern.
/// Small object where equality based on value
/// </summary>
public class ValueObjectImplementation : IValueObject
{
    public void Execute()
    {
        Console.WriteLine("ValueObject Pattern - Objects whose equality is based on value, not identity");
        Console.WriteLine("================================================================================\n");

        DemonstrateAddressValueObject();
        Console.WriteLine();
        DemonstrateDateRangeValueObject();
        Console.WriteLine();
        DemonstrateMoneyValueObject();
        Console.WriteLine();
        DemonstrateValueObjectBehavior();
    }

    private void DemonstrateAddressValueObject()
    {
        Console.WriteLine("1. Address Value Object Example:");
        Console.WriteLine("   - Immutable value object representing a physical address");
        Console.WriteLine("   - Equality based on all address components\n");

        Address address1 = new Address("123 Main St", "Springfield", "IL", "62701", "USA");
        Address address2 = new Address("123 Main St", "Springfield", "IL", "62701", "USA");
        Address address3 = new Address("456 Oak Ave", "Springfield", "IL", "62702", "USA");

        Console.WriteLine($"Address 1: {address1}");
        Console.WriteLine($"Address 2: {address2}");
        Console.WriteLine($"Address 3: {address3}");
        Console.WriteLine($"\nAddress1 == Address2: {address1.Equals(address2)} (same values)");
        Console.WriteLine($"Address1 == Address3: {address1.Equals(address3)} (different values)");
        Console.WriteLine($"Address1.GetHashCode(): {address1.GetHashCode()}");
        Console.WriteLine($"Address2.GetHashCode(): {address2.GetHashCode()} (same as Address1)");
    }

    private void DemonstrateDateRangeValueObject()
    {
        Console.WriteLine("2. DateRange Value Object Example:");
        Console.WriteLine("   - Immutable value object representing a time period");
        Console.WriteLine("   - Business logic for range validation and overlap detection\n");

        DateRange range1 = new DateRange(new DateTime(2025, 1, 1), new DateTime(2025, 1, 31));
        DateRange range2 = new DateRange(new DateTime(2025, 1, 1), new DateTime(2025, 1, 31));
        DateRange range3 = new DateRange(new DateTime(2025, 1, 15), new DateTime(2025, 2, 15));

        Console.WriteLine($"Range 1: {range1}");
        Console.WriteLine($"Range 2: {range2}");
        Console.WriteLine($"Range 3: {range3}");
        Console.WriteLine($"\nRange1 == Range2: {range1.Equals(range2)} (same values)");
        Console.WriteLine($"Range1 == Range3: {range1.Equals(range3)} (different values)");
        Console.WriteLine($"Range1 overlaps Range3: {range1.Overlaps(range3)}");
        Console.WriteLine($"Range1 duration: {range1.DurationInDays()} days");
    }

    private void DemonstrateMoneyValueObject()
    {
        Console.WriteLine("3. Money Value Object Example:");
        Console.WriteLine("   - Immutable value object for monetary values");
        Console.WriteLine("   - Prevents mixing currencies and provides safe arithmetic\n");

        Money usd100 = new Money(100.00m, "USD");
        Money usd100Copy = new Money(100.00m, "USD");
        Money usd50 = new Money(50.00m, "USD");
        Money eur100 = new Money(100.00m, "EUR");

        Console.WriteLine($"USD $100: {usd100}");
        Console.WriteLine($"USD $100 Copy: {usd100Copy}");
        Console.WriteLine($"USD $50: {usd50}");
        Console.WriteLine($"EUR €100: {eur100}");
        Console.WriteLine($"\nUSD $100 == USD $100 Copy: {usd100.Equals(usd100Copy)}");
        Console.WriteLine($"USD $100 == EUR €100: {usd100.Equals(eur100)} (different currencies)");

        Money total = usd100.Add(usd50);
        Console.WriteLine($"\n$100 + $50 = {total}");

        try
        {
            Money invalid = usd100.Add(eur100);
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"Cannot mix currencies: {ex.Message}");
        }
    }

    private void DemonstrateValueObjectBehavior()
    {
        Console.WriteLine("4. Value Object Key Characteristics:");
        Console.WriteLine("   - No conceptual identity (no ID field)");
        Console.WriteLine("   - Immutable (cannot change after creation)");
        Console.WriteLine("   - Equality based on all fields");
        Console.WriteLine("   - Can be shared freely (no side effects)\n");

        Address address = new Address("789 Elm St", "Chicago", "IL", "60601", "USA");

        Console.WriteLine("Value objects can be safely used as dictionary keys:");
        Dictionary<Address, string> addressBook = new Dictionary<Address, string>();
        addressBook[address] = "John Doe";

        Address samAddress = new Address("789 Elm St", "Chicago", "IL", "60601", "USA");
        Console.WriteLine($"Can retrieve using equivalent value object: {addressBook[samAddress]}");

        Console.WriteLine("\nValue objects in collections:");
        List<Money> prices = new List<Money>
        {
            new Money(10.99m, "USD"),
            new Money(15.50m, "USD"),
            new Money(10.99m, "USD")
        };

        Money searchPrice = new Money(10.99m, "USD");
        int count = prices.Count(price => price.Equals(searchPrice));
        Console.WriteLine($"Number of items with price {searchPrice}: {count}");
    }
}

/// <summary>
/// Base class for value objects providing standard equality implementation.
/// </summary>
public abstract class ValueObject
{
    protected abstract IEnumerable<object> GetEqualityComponents();

    public override bool Equals(object obj)
    {
        if (obj == null || obj.GetType() != GetType())
        {
            return false;
        }

        ValueObject other = (ValueObject)obj;
        return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
    }

    public override int GetHashCode()
    {
        return GetEqualityComponents()
            .Select(x => x != null ? x.GetHashCode() : 0)
            .Aggregate((x, y) => x ^ y);
    }

    public static bool operator ==(ValueObject left, ValueObject right)
    {
        if (ReferenceEquals(left, null) && ReferenceEquals(right, null))
        {
            return true;
        }

        if (ReferenceEquals(left, null) || ReferenceEquals(right, null))
        {
            return false;
        }

        return left.Equals(right);
    }

    public static bool operator !=(ValueObject left, ValueObject right)
    {
        return !(left == right);
    }
}

/// <summary>
/// Address value object - immutable representation of a physical address.
/// Equality is based on all address components.
/// </summary>
public class Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string State { get; }
    public string ZipCode { get; }
    public string Country { get; }

    public Address(string street, string city, string state, string zipCode, string country)
    {
        if (string.IsNullOrWhiteSpace(street))
            throw new ArgumentException("Street cannot be empty", nameof(street));
        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City cannot be empty", nameof(city));
        if (string.IsNullOrWhiteSpace(state))
            throw new ArgumentException("State cannot be empty", nameof(state));
        if (string.IsNullOrWhiteSpace(zipCode))
            throw new ArgumentException("Zip code cannot be empty", nameof(zipCode));
        if (string.IsNullOrWhiteSpace(country))
            throw new ArgumentException("Country cannot be empty", nameof(country));

        Street = street;
        City = city;
        State = state;
        ZipCode = zipCode;
        Country = country;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return State;
        yield return ZipCode;
        yield return Country;
    }

    public override string ToString()
    {
        return $"{Street}, {City}, {State} {ZipCode}, {Country}";
    }
}

/// <summary>
/// DateRange value object - immutable representation of a time period.
/// Provides business logic for date range operations.
/// </summary>
public class DateRange : ValueObject
{
    public DateTime StartDate { get; }
    public DateTime EndDate { get; }

    public DateRange(DateTime startDate, DateTime endDate)
    {
        if (startDate > endDate)
            throw new ArgumentException("Start date must be before or equal to end date");

        StartDate = startDate;
        EndDate = endDate;
    }

    public int DurationInDays()
    {
        return (EndDate - StartDate).Days + 1;
    }

    public bool Overlaps(DateRange other)
    {
        if (other == null)
            throw new ArgumentNullException(nameof(other));

        return StartDate <= other.EndDate && EndDate >= other.StartDate;
    }

    public bool Contains(DateTime date)
    {
        return date >= StartDate && date <= EndDate;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return StartDate;
        yield return EndDate;
    }

    public override string ToString()
    {
        return $"{StartDate:yyyy-MM-dd} to {EndDate:yyyy-MM-dd}";
    }
}

/// <summary>
/// Money value object - immutable representation of a monetary amount.
/// Prevents mixing different currencies and provides safe arithmetic operations.
/// </summary>
public class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency)
    {
        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("Currency cannot be empty", nameof(currency));

        Amount = amount;
        Currency = currency.ToUpperInvariant();
    }

    public Money Add(Money other)
    {
        if (other == null)
            throw new ArgumentNullException(nameof(other));
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot add {other.Currency} to {Currency}");

        return new Money(Amount + other.Amount, Currency);
    }

    public Money Subtract(Money other)
    {
        if (other == null)
            throw new ArgumentNullException(nameof(other));
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot subtract {other.Currency} from {Currency}");

        return new Money(Amount - other.Amount, Currency);
    }

    public Money Multiply(decimal factor)
    {
        return new Money(Amount * factor, Currency);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }

    public override string ToString()
    {
        return $"{Amount:N2} {Currency}";
    }
}
