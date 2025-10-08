using System;

namespace Enterprise.DomainLogic.DomainModel;

/// <summary>
/// Domain Model - Customer entity with business logic.
/// </summary>
public class Customer
{
    public int Id { get; private set; }
    public string Name { get; private set; }
    public string Email { get; private set; }
    public decimal CreditLimit { get; private set; }
    public bool IsVip { get; private set; }

    public Customer(int id, string name, string email, decimal creditLimit, bool isVip = false)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required", nameof(name));

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required", nameof(email));

        if (creditLimit < 0)
            throw new ArgumentException("Credit limit cannot be negative", nameof(creditLimit));

        Id = id;
        Name = name;
        Email = email;
        CreditLimit = creditLimit;
        IsVip = isVip;
    }

    /// <summary>
    /// Business logic to check if customer can place an order.
    /// </summary>
    public bool CanPlaceOrder(decimal orderAmount)
    {
        return orderAmount <= CreditLimit;
    }

    /// <summary>
    /// Increases customer's credit limit.
    /// </summary>
    public void IncreaseCreditLimit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));

        CreditLimit += amount;
    }

    /// <summary>
    /// Promotes customer to VIP status.
    /// </summary>
    public void PromoteToVip()
    {
        if (!IsVip)
        {
            IsVip = true;
            CreditLimit *= 1.5m; // Increase credit limit by 50%
        }
    }
}
