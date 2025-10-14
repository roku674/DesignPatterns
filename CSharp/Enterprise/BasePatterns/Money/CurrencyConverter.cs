using System;
using System.Collections.Generic;

namespace Enterprise.BasePatterns.Money;

/// <summary>
/// Handles currency conversion with exchange rates.
/// </summary>
public class CurrencyConverter
{
    private readonly Dictionary<string, Dictionary<string, decimal>> _exchangeRates;

    /// <summary>
    /// Initializes a new instance of CurrencyConverter.
    /// </summary>
    public CurrencyConverter()
    {
        _exchangeRates = new Dictionary<string, Dictionary<string, decimal>>();
    }

    /// <summary>
    /// Sets an exchange rate between two currencies.
    /// </summary>
    /// <param name="fromCurrency">Source currency code.</param>
    /// <param name="toCurrency">Target currency code.</param>
    /// <param name="rate">Exchange rate.</param>
    public void SetExchangeRate(string fromCurrency, string toCurrency, decimal rate)
    {
        if (rate <= 0)
        {
            throw new ArgumentException("Exchange rate must be positive.", nameof(rate));
        }

        fromCurrency = fromCurrency.ToUpperInvariant();
        toCurrency = toCurrency.ToUpperInvariant();

        if (!_exchangeRates.ContainsKey(fromCurrency))
        {
            _exchangeRates[fromCurrency] = new Dictionary<string, decimal>();
        }

        _exchangeRates[fromCurrency][toCurrency] = rate;

        // Set inverse rate
        if (!_exchangeRates.ContainsKey(toCurrency))
        {
            _exchangeRates[toCurrency] = new Dictionary<string, decimal>();
        }
        _exchangeRates[toCurrency][fromCurrency] = 1 / rate;
    }

    /// <summary>
    /// Converts money from one currency to another.
    /// </summary>
    /// <param name="money">Money to convert.</param>
    /// <param name="toCurrency">Target currency code.</param>
    /// <param name="decimalPlaces">Decimal places for target currency.</param>
    /// <returns>Converted money.</returns>
    /// <exception cref="InvalidOperationException">Thrown when exchange rate is not available.</exception>
    public Money Convert(Money money, string toCurrency, int decimalPlaces = 2)
    {
        toCurrency = toCurrency.ToUpperInvariant();

        if (money.Currency == toCurrency)
        {
            return money;
        }

        if (!_exchangeRates.ContainsKey(money.Currency) ||
            !_exchangeRates[money.Currency].ContainsKey(toCurrency))
        {
            throw new InvalidOperationException(
                $"Exchange rate not available for {money.Currency} to {toCurrency}");
        }

        decimal rate = _exchangeRates[money.Currency][toCurrency];
        decimal convertedAmount = money.ToDecimal() * rate;

        return Money.FromDecimal(convertedAmount, toCurrency, decimalPlaces);
    }

    /// <summary>
    /// Checks if an exchange rate is available.
    /// </summary>
    /// <param name="fromCurrency">Source currency code.</param>
    /// <param name="toCurrency">Target currency code.</param>
    /// <returns>True if exchange rate is available.</returns>
    public bool HasExchangeRate(string fromCurrency, string toCurrency)
    {
        fromCurrency = fromCurrency.ToUpperInvariant();
        toCurrency = toCurrency.ToUpperInvariant();

        return _exchangeRates.ContainsKey(fromCurrency) &&
               _exchangeRates[fromCurrency].ContainsKey(toCurrency);
    }

    /// <summary>
    /// Gets the exchange rate between two currencies.
    /// </summary>
    /// <param name="fromCurrency">Source currency code.</param>
    /// <param name="toCurrency">Target currency code.</param>
    /// <returns>Exchange rate.</returns>
    /// <exception cref="InvalidOperationException">Thrown when exchange rate is not available.</exception>
    public decimal GetExchangeRate(string fromCurrency, string toCurrency)
    {
        fromCurrency = fromCurrency.ToUpperInvariant();
        toCurrency = toCurrency.ToUpperInvariant();

        if (!HasExchangeRate(fromCurrency, toCurrency))
        {
            throw new InvalidOperationException(
                $"Exchange rate not available for {fromCurrency} to {toCurrency}");
        }

        return _exchangeRates[fromCurrency][toCurrency];
    }
}
