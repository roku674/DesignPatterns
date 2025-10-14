using System;
using System.Globalization;

namespace Enterprise.BasePatterns.Money;

/// <summary>
/// Represents a monetary value with currency.
/// Handles precision, rounding, and currency-aware operations.
/// Immutable value object for financial calculations.
/// </summary>
public class Money : IEquatable<Money>, IComparable<Money>
{
    /// <summary>
    /// Gets the amount in the smallest unit (e.g., cents for USD).
    /// </summary>
    public long Amount { get; }

    /// <summary>
    /// Gets the currency code (ISO 4217).
    /// </summary>
    public string Currency { get; }

    /// <summary>
    /// Gets the number of decimal places for this currency.
    /// </summary>
    public int DecimalPlaces { get; }

    /// <summary>
    /// Initializes a new instance of Money with amount in smallest units.
    /// </summary>
    /// <param name="amount">Amount in smallest currency unit (e.g., cents).</param>
    /// <param name="currency">ISO 4217 currency code.</param>
    /// <param name="decimalPlaces">Number of decimal places for the currency.</param>
    public Money(long amount, string currency, int decimalPlaces = 2)
    {
        if (string.IsNullOrWhiteSpace(currency))
        {
            throw new ArgumentException("Currency cannot be null or empty.", nameof(currency));
        }

        if (decimalPlaces < 0)
        {
            throw new ArgumentException("Decimal places cannot be negative.", nameof(decimalPlaces));
        }

        Amount = amount;
        Currency = currency.ToUpperInvariant();
        DecimalPlaces = decimalPlaces;
    }

    /// <summary>
    /// Creates Money from a decimal value.
    /// </summary>
    /// <param name="amount">Decimal amount.</param>
    /// <param name="currency">ISO 4217 currency code.</param>
    /// <param name="decimalPlaces">Number of decimal places.</param>
    /// <returns>New Money instance.</returns>
    public static Money FromDecimal(decimal amount, string currency, int decimalPlaces = 2)
    {
        long multiplier = (long)Math.Pow(10, decimalPlaces);
        long amountInSmallestUnit = (long)Math.Round(amount * multiplier, MidpointRounding.AwayFromZero);
        return new Money(amountInSmallestUnit, currency, decimalPlaces);
    }

    /// <summary>
    /// Converts the money to its decimal representation.
    /// </summary>
    /// <returns>Decimal value.</returns>
    public decimal ToDecimal()
    {
        decimal divisor = (decimal)Math.Pow(10, DecimalPlaces);
        return Amount / divisor;
    }

    /// <summary>
    /// Adds two money values.
    /// </summary>
    /// <param name="other">Money to add.</param>
    /// <returns>Sum of the two money values.</returns>
    /// <exception cref="InvalidOperationException">Thrown when currencies don't match.</exception>
    public Money Add(Money other)
    {
        AssertSameCurrency(other);
        return new Money(Amount + other.Amount, Currency, DecimalPlaces);
    }

    /// <summary>
    /// Subtracts another money value from this one.
    /// </summary>
    /// <param name="other">Money to subtract.</param>
    /// <returns>Difference of the two money values.</returns>
    /// <exception cref="InvalidOperationException">Thrown when currencies don't match.</exception>
    public Money Subtract(Money other)
    {
        AssertSameCurrency(other);
        return new Money(Amount - other.Amount, Currency, DecimalPlaces);
    }

    /// <summary>
    /// Multiplies money by a scalar value.
    /// </summary>
    /// <param name="multiplier">Multiplier value.</param>
    /// <returns>Product of money and multiplier.</returns>
    public Money Multiply(decimal multiplier)
    {
        long newAmount = (long)Math.Round(Amount * multiplier, MidpointRounding.AwayFromZero);
        return new Money(newAmount, Currency, DecimalPlaces);
    }

    /// <summary>
    /// Divides money by a scalar value.
    /// </summary>
    /// <param name="divisor">Divisor value.</param>
    /// <returns>Quotient of money and divisor.</returns>
    /// <exception cref="DivideByZeroException">Thrown when divisor is zero.</exception>
    public Money Divide(decimal divisor)
    {
        if (divisor == 0)
        {
            throw new DivideByZeroException("Cannot divide money by zero.");
        }

        long newAmount = (long)Math.Round(Amount / divisor, MidpointRounding.AwayFromZero);
        return new Money(newAmount, Currency, DecimalPlaces);
    }

    /// <summary>
    /// Allocates money proportionally across multiple ratios.
    /// Handles rounding to ensure sum equals original amount.
    /// </summary>
    /// <param name="ratios">Allocation ratios.</param>
    /// <returns>Array of allocated money values.</returns>
    public Money[] Allocate(params int[] ratios)
    {
        if (ratios == null || ratios.Length == 0)
        {
            throw new ArgumentException("Ratios cannot be null or empty.", nameof(ratios));
        }

        int totalRatio = 0;
        foreach (int ratio in ratios)
        {
            if (ratio < 0)
            {
                throw new ArgumentException("Ratios cannot be negative.", nameof(ratios));
            }
            totalRatio += ratio;
        }

        if (totalRatio == 0)
        {
            throw new ArgumentException("Total ratio cannot be zero.", nameof(ratios));
        }

        Money[] results = new Money[ratios.Length];
        long remainder = Amount;

        for (int i = 0; i < ratios.Length; i++)
        {
            long share = (Amount * ratios[i]) / totalRatio;
            results[i] = new Money(share, Currency, DecimalPlaces);
            remainder -= share;
        }

        // Distribute remainder to first allocations
        int index = 0;
        while (remainder != 0)
        {
            long adjustment = remainder > 0 ? 1 : -1;
            results[index] = new Money(results[index].Amount + adjustment, Currency, DecimalPlaces);
            remainder -= adjustment;
            index = (index + 1) % results.Length;
        }

        return results;
    }

    /// <summary>
    /// Checks if this money is zero.
    /// </summary>
    /// <returns>True if amount is zero.</returns>
    public bool IsZero()
    {
        return Amount == 0;
    }

    /// <summary>
    /// Checks if this money is positive.
    /// </summary>
    /// <returns>True if amount is greater than zero.</returns>
    public bool IsPositive()
    {
        return Amount > 0;
    }

    /// <summary>
    /// Checks if this money is negative.
    /// </summary>
    /// <returns>True if amount is less than zero.</returns>
    public bool IsNegative()
    {
        return Amount < 0;
    }

    /// <summary>
    /// Returns the absolute value of this money.
    /// </summary>
    /// <returns>Absolute money value.</returns>
    public Money Abs()
    {
        return new Money(Math.Abs(Amount), Currency, DecimalPlaces);
    }

    /// <summary>
    /// Returns the negative of this money.
    /// </summary>
    /// <returns>Negated money value.</returns>
    public Money Negate()
    {
        return new Money(-Amount, Currency, DecimalPlaces);
    }

    /// <summary>
    /// Asserts that another money value has the same currency.
    /// </summary>
    /// <param name="other">Money to check.</param>
    /// <exception cref="InvalidOperationException">Thrown when currencies don't match.</exception>
    private void AssertSameCurrency(Money other)
    {
        if (Currency != other.Currency)
        {
            throw new InvalidOperationException(
                $"Cannot operate on different currencies: {Currency} and {other.Currency}");
        }
    }

    public bool Equals(Money? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;
        return Amount == other.Amount && Currency == other.Currency && DecimalPlaces == other.DecimalPlaces;
    }

    public override bool Equals(object? obj)
    {
        return obj is Money money && Equals(money);
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Amount, Currency, DecimalPlaces);
    }

    public int CompareTo(Money? other)
    {
        if (other is null) return 1;
        AssertSameCurrency(other);
        return Amount.CompareTo(other.Amount);
    }

    public override string ToString()
    {
        return $"{ToDecimal():F{DecimalPlaces}} {Currency}";
    }

    /// <summary>
    /// Formats the money with culture-specific formatting.
    /// </summary>
    /// <param name="culture">Culture info for formatting.</param>
    /// <returns>Formatted string.</returns>
    public string ToString(CultureInfo culture)
    {
        return ToDecimal().ToString("C", culture);
    }

    // Operator overloads
    public static Money operator +(Money left, Money right) => left.Add(right);
    public static Money operator -(Money left, Money right) => left.Subtract(right);
    public static Money operator *(Money money, decimal multiplier) => money.Multiply(multiplier);
    public static Money operator /(Money money, decimal divisor) => money.Divide(divisor);
    public static Money operator -(Money money) => money.Negate();
    public static bool operator ==(Money? left, Money? right) => Equals(left, right);
    public static bool operator !=(Money? left, Money? right) => !Equals(left, right);
    public static bool operator <(Money left, Money right) => left.CompareTo(right) < 0;
    public static bool operator >(Money left, Money right) => left.CompareTo(right) > 0;
    public static bool operator <=(Money left, Money right) => left.CompareTo(right) <= 0;
    public static bool operator >=(Money left, Money right) => left.CompareTo(right) >= 0;
}
