using System.Collections.Generic;

namespace Enterprise.BasePatterns.SpecialCase;

/// <summary>
/// Base interface for customer operations.
/// SpecialCase pattern provides special behavior for particular cases (e.g., null/missing objects).
/// This eliminates null checking by providing a NullObject implementation.
/// </summary>
public interface ICustomer
{
    string Name { get; }
    string Email { get; }
    decimal GetDiscountPercentage();
    void SendEmail(string message);
    List<string> GetOrderHistory();
    bool IsNull { get; }
}
