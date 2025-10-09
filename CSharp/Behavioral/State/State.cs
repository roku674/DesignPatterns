using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DesignPatterns.Behavioral.State
{
    // Real State pattern implementation
    // Use case: Order processing system with multiple states and transitions

    // State interface
    public interface IOrderState
    {
        string GetStateName();
        Task OnEnterAsync(Order order);
        Task OnExitAsync(Order order);
        Task<bool> CanTransitionTo(string newState);
        Task ProcessAsync(Order order);
        Task CancelAsync(Order order);
    }

    // Context - Order
    public class Order
    {
        private IOrderState _currentState;
        private readonly List<string> _stateHistory;
        private readonly object _lockObject = new object();

        public string OrderId { get; private set; }
        public string CustomerId { get; private set; }
        public List<OrderItem> Items { get; private set; }
        public decimal TotalAmount { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? ProcessedAt { get; private set; }
        public DateTime? ShippedAt { get; private set; }
        public DateTime? DeliveredAt { get; private set; }
        public DateTime? CancelledAt { get; private set; }
        public string CancellationReason { get; private set; }
        public string TrackingNumber { get; set; }

        public Order(string customerId, List<OrderItem> items)
        {
            OrderId = Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
            CustomerId = customerId ?? throw new ArgumentNullException(nameof(customerId));
            Items = items ?? throw new ArgumentNullException(nameof(items));
            CreatedAt = DateTime.UtcNow;
            _stateHistory = new List<string>();

            CalculateTotal();

            // Start in pending state
            Task.Run(async () => await SetStateAsync(new PendingState())).Wait();
        }

        private void CalculateTotal()
        {
            TotalAmount = 0;
            foreach (OrderItem item in Items)
            {
                TotalAmount += item.Price * item.Quantity;
            }
        }

        public async Task SetStateAsync(IOrderState newState)
        {
            if (newState == null)
            {
                throw new ArgumentNullException(nameof(newState));
            }

            IOrderState oldState = _currentState;

            // Check if transition is allowed
            if (oldState != null)
            {
                bool canTransition = await oldState.CanTransitionTo(newState.GetStateName());
                if (!canTransition)
                {
                    throw new InvalidOperationException(
                        $"Cannot transition from {oldState.GetStateName()} to {newState.GetStateName()}");
                }

                await oldState.OnExitAsync(this);
            }

            lock (_lockObject)
            {
                _currentState = newState;
                _stateHistory.Add($"{DateTime.UtcNow:HH:mm:ss} - {newState.GetStateName()}");
            }

            await newState.OnEnterAsync(this);

            Console.WriteLine($"[ORDER {OrderId}] State changed: " +
                            $"{(oldState != null ? oldState.GetStateName() : "None")} → {newState.GetStateName()}");
        }

        public async Task ProcessAsync()
        {
            await _currentState.ProcessAsync(this);
        }

        public async Task CancelAsync(string reason)
        {
            CancellationReason = reason;
            await _currentState.CancelAsync(this);
        }

        public string GetCurrentState()
        {
            return _currentState?.GetStateName() ?? "None";
        }

        public List<string> GetStateHistory()
        {
            lock (_lockObject)
            {
                return new List<string>(_stateHistory);
            }
        }

        public void SetProcessedAt()
        {
            ProcessedAt = DateTime.UtcNow;
        }

        public void SetShippedAt()
        {
            ShippedAt = DateTime.UtcNow;
        }

        public void SetDeliveredAt()
        {
            DeliveredAt = DateTime.UtcNow;
        }

        public void SetCancelledAt()
        {
            CancelledAt = DateTime.UtcNow;
        }

        public void PrintStatus()
        {
            Console.WriteLine($"\n=== Order {OrderId} Status ===");
            Console.WriteLine($"Customer: {CustomerId}");
            Console.WriteLine($"State: {GetCurrentState()}");
            Console.WriteLine($"Total: ${TotalAmount:F2}");
            Console.WriteLine($"Items: {Items.Count}");

            if (!string.IsNullOrEmpty(TrackingNumber))
            {
                Console.WriteLine($"Tracking: {TrackingNumber}");
            }

            if (CancelledAt.HasValue)
            {
                Console.WriteLine($"Cancelled: {CancelledAt:yyyy-MM-dd HH:mm:ss}");
                Console.WriteLine($"Reason: {CancellationReason}");
            }

            Console.WriteLine();
        }
    }

    public class OrderItem
    {
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }

        public OrderItem(string productId, string productName, int quantity, decimal price)
        {
            ProductId = productId ?? throw new ArgumentNullException(nameof(productId));
            ProductName = productName ?? throw new ArgumentNullException(nameof(productName));
            Quantity = quantity;
            Price = price;
        }
    }

    // Concrete states
    public class PendingState : IOrderState
    {
        public string GetStateName() => "Pending";

        public async Task OnEnterAsync(Order order)
        {
            await Task.Run(() =>
            {
                Console.WriteLine($"[PENDING] Order {order.OrderId} is awaiting payment confirmation");
            });
        }

        public async Task OnExitAsync(Order order)
        {
            await Task.CompletedTask;
        }

        public async Task<bool> CanTransitionTo(string newState)
        {
            return await Task.FromResult(
                newState == "Processing" ||
                newState == "Cancelled"
            );
        }

        public async Task ProcessAsync(Order order)
        {
            Console.WriteLine($"[PENDING] Verifying payment for order {order.OrderId}...");
            await Task.Delay(500); // Simulate payment verification

            Console.WriteLine($"[PENDING] Payment confirmed for order {order.OrderId}");
            await order.SetStateAsync(new ProcessingState());
        }

        public async Task CancelAsync(Order order)
        {
            Console.WriteLine($"[PENDING] Cancelling order {order.OrderId}...");
            await order.SetStateAsync(new CancelledState());
        }
    }

    public class ProcessingState : IOrderState
    {
        public string GetStateName() => "Processing";

        public async Task OnEnterAsync(Order order)
        {
            await Task.Run(() =>
            {
                order.SetProcessedAt();
                Console.WriteLine($"[PROCESSING] Order {order.OrderId} is being prepared");
            });
        }

        public async Task OnExitAsync(Order order)
        {
            await Task.CompletedTask;
        }

        public async Task<bool> CanTransitionTo(string newState)
        {
            return await Task.FromResult(
                newState == "Shipped" ||
                newState == "Cancelled"
            );
        }

        public async Task ProcessAsync(Order order)
        {
            Console.WriteLine($"[PROCESSING] Picking and packing items for order {order.OrderId}...");
            await Task.Delay(1000); // Simulate order preparation

            Console.WriteLine($"[PROCESSING] Order {order.OrderId} is ready for shipping");
            await order.SetStateAsync(new ShippedState());
        }

        public async Task CancelAsync(Order order)
        {
            Console.WriteLine($"[PROCESSING] Cancelling order {order.OrderId}...");
            Console.WriteLine($"[PROCESSING] Restocking items...");
            await Task.Delay(300);

            await order.SetStateAsync(new CancelledState());
        }
    }

    public class ShippedState : IOrderState
    {
        public string GetStateName() => "Shipped";

        public async Task OnEnterAsync(Order order)
        {
            await Task.Run(() =>
            {
                order.SetShippedAt();
                order.TrackingNumber = $"TRACK-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
                Console.WriteLine($"[SHIPPED] Order {order.OrderId} has been shipped");
                Console.WriteLine($"[SHIPPED] Tracking number: {order.TrackingNumber}");
            });
        }

        public async Task OnExitAsync(Order order)
        {
            await Task.CompletedTask;
        }

        public async Task<bool> CanTransitionTo(string newState)
        {
            return await Task.FromResult(
                newState == "Delivered" ||
                newState == "Returned"
            );
        }

        public async Task ProcessAsync(Order order)
        {
            Console.WriteLine($"[SHIPPED] Tracking delivery for order {order.OrderId}...");
            await Task.Delay(800); // Simulate delivery time

            Console.WriteLine($"[SHIPPED] Order {order.OrderId} has been delivered");
            await order.SetStateAsync(new DeliveredState());
        }

        public async Task CancelAsync(Order order)
        {
            Console.WriteLine($"[SHIPPED] Cannot cancel order {order.OrderId} - already in transit");
            Console.WriteLine($"[SHIPPED] Customer can initiate return after delivery");
            await Task.CompletedTask;
        }
    }

    public class DeliveredState : IOrderState
    {
        public string GetStateName() => "Delivered";

        public async Task OnEnterAsync(Order order)
        {
            await Task.Run(() =>
            {
                order.SetDeliveredAt();
                Console.WriteLine($"[DELIVERED] Order {order.OrderId} delivered successfully");
                Console.WriteLine($"[DELIVERED] Thank you for your purchase!");
            });
        }

        public async Task OnExitAsync(Order order)
        {
            await Task.CompletedTask;
        }

        public async Task<bool> CanTransitionTo(string newState)
        {
            return await Task.FromResult(newState == "Returned");
        }

        public async Task ProcessAsync(Order order)
        {
            Console.WriteLine($"[DELIVERED] Order {order.OrderId} is complete");
            await Task.CompletedTask;
        }

        public async Task CancelAsync(Order order)
        {
            Console.WriteLine($"[DELIVERED] Cannot cancel delivered order {order.OrderId}");
            Console.WriteLine($"[DELIVERED] Customer can request a return");
            await Task.CompletedTask;
        }
    }

    public class CancelledState : IOrderState
    {
        public string GetStateName() => "Cancelled";

        public async Task OnEnterAsync(Order order)
        {
            await Task.Run(() =>
            {
                order.SetCancelledAt();
                Console.WriteLine($"[CANCELLED] Order {order.OrderId} has been cancelled");
                if (!string.IsNullOrEmpty(order.CancellationReason))
                {
                    Console.WriteLine($"[CANCELLED] Reason: {order.CancellationReason}");
                }
                Console.WriteLine($"[CANCELLED] Refund will be processed within 3-5 business days");
            });
        }

        public async Task OnExitAsync(Order order)
        {
            await Task.CompletedTask;
        }

        public async Task<bool> CanTransitionTo(string newState)
        {
            // Terminal state - no transitions allowed
            return await Task.FromResult(false);
        }

        public async Task ProcessAsync(Order order)
        {
            Console.WriteLine($"[CANCELLED] Cannot process cancelled order {order.OrderId}");
            await Task.CompletedTask;
        }

        public async Task CancelAsync(Order order)
        {
            Console.WriteLine($"[CANCELLED] Order {order.OrderId} is already cancelled");
            await Task.CompletedTask;
        }
    }

    public class ReturnedState : IOrderState
    {
        public string GetStateName() => "Returned";

        public async Task OnEnterAsync(Order order)
        {
            await Task.Run(() =>
            {
                Console.WriteLine($"[RETURNED] Order {order.OrderId} has been returned");
                Console.WriteLine($"[RETURNED] Refund will be processed within 3-5 business days");
            });
        }

        public async Task OnExitAsync(Order order)
        {
            await Task.CompletedTask;
        }

        public async Task<bool> CanTransitionTo(string newState)
        {
            // Terminal state - no transitions allowed
            return await Task.FromResult(false);
        }

        public async Task ProcessAsync(Order order)
        {
            Console.WriteLine($"[RETURNED] Order {order.OrderId} return is complete");
            await Task.CompletedTask;
        }

        public async Task CancelAsync(Order order)
        {
            Console.WriteLine($"[RETURNED] Order {order.OrderId} has already been returned");
            await Task.CompletedTask;
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== State Pattern - Order Processing System ===\n");

            try
            {
                // Create orders
                List<OrderItem> items1 = new List<OrderItem>
                {
                    new OrderItem("P001", "Laptop", 1, 999.99m),
                    new OrderItem("P002", "Mouse", 2, 29.99m)
                };

                Order order1 = new Order("CUST-001", items1);
                order1.PrintStatus();

                // Process order through happy path
                Console.WriteLine("=== Processing Order 1 (Happy Path) ===\n");

                await order1.ProcessAsync(); // Pending → Processing
                await Task.Delay(200);

                await order1.ProcessAsync(); // Processing → Shipped
                await Task.Delay(200);

                await order1.ProcessAsync(); // Shipped → Delivered
                await Task.Delay(200);

                order1.PrintStatus();

                // Create second order and cancel early
                Console.WriteLine("\n=== Processing Order 2 (Early Cancellation) ===\n");

                List<OrderItem> items2 = new List<OrderItem>
                {
                    new OrderItem("P003", "Phone", 1, 799.99m)
                };

                Order order2 = new Order("CUST-002", items2);
                order2.PrintStatus();

                await order2.ProcessAsync(); // Pending → Processing
                await Task.Delay(200);

                await order2.CancelAsync("Customer changed mind");
                await Task.Delay(200);

                order2.PrintStatus();

                // Create third order and attempt cancel during shipping
                Console.WriteLine("\n=== Processing Order 3 (Cancel During Shipping) ===\n");

                List<OrderItem> items3 = new List<OrderItem>
                {
                    new OrderItem("P004", "Tablet", 1, 499.99m),
                    new OrderItem("P005", "Case", 1, 39.99m)
                };

                Order order3 = new Order("CUST-003", items3);

                await order3.ProcessAsync(); // Pending → Processing
                await Task.Delay(200);

                await order3.ProcessAsync(); // Processing → Shipped
                await Task.Delay(200);

                await order3.CancelAsync("Changed mind"); // Should fail
                await Task.Delay(200);

                await order3.ProcessAsync(); // Shipped → Delivered
                await Task.Delay(200);

                order3.PrintStatus();

                // Test invalid state transition
                Console.WriteLine("\n=== Testing Invalid State Transition ===\n");

                try
                {
                    await order1.SetStateAsync(new PendingState());
                }
                catch (InvalidOperationException ex)
                {
                    Console.WriteLine($"[ERROR] {ex.Message}");
                }

                // Print state histories
                Console.WriteLine("\n=== State Histories ===\n");

                Console.WriteLine($"Order {order1.OrderId} history:");
                foreach (string state in order1.GetStateHistory())
                {
                    Console.WriteLine($"  {state}");
                }

                Console.WriteLine($"\nOrder {order2.OrderId} history:");
                foreach (string state in order2.GetStateHistory())
                {
                    Console.WriteLine($"  {state}");
                }

                Console.WriteLine($"\nOrder {order3.OrderId} history:");
                foreach (string state in order3.GetStateHistory())
                {
                    Console.WriteLine($"  {state}");
                }

                Console.WriteLine("\n=== Pattern Demonstration Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }
    }
}
