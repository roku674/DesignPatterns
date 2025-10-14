using System;
using System.Globalization;

namespace Enterprise.BasePatterns.Money;

/// <summary>
/// Demonstrates the Money pattern with various financial scenarios.
/// Shows how to handle monetary values safely with proper precision,
/// currency management, and arithmetic operations.
/// </summary>
public class MoneyImplementation : IMoney
{
    public void Execute()
    {
        Console.WriteLine("=== Money Pattern Implementation ===\n");

        DemoBasicMoneyOperations();
        Console.WriteLine("\n" + new string('-', 70) + "\n");

        DemoMoneyAllocation();
        Console.WriteLine("\n" + new string('-', 70) + "\n");

        DemoCurrencyConversion();
        Console.WriteLine("\n" + new string('-', 70) + "\n");

        DemoMoneyComparison();
        Console.WriteLine("\n" + new string('-', 70) + "\n");

        DemoFinancialCalculations();
        Console.WriteLine("\n" + new string('-', 70) + "\n");

        DemoMultiCurrencyPortfolio();
        Console.WriteLine("\n" + new string('-', 70) + "\n");

        DemoMoneyFormatting();
        Console.WriteLine("\n" + new string('-', 70) + "\n");

        DemoEdgeCases();
    }

    /// <summary>
    /// Demonstrates basic money creation and arithmetic operations.
    /// </summary>
    private void DemoBasicMoneyOperations()
    {
        Console.WriteLine("--- Basic Money Operations ---\n");

        // Create money from decimal
        Money price = Money.FromDecimal(19.99m, "USD");
        Money tax = Money.FromDecimal(1.60m, "USD");

        Console.WriteLine($"Price: {price}");
        Console.WriteLine($"Tax: {tax}");

        // Addition
        Money total = price + tax;
        Console.WriteLine($"Total (Price + Tax): {total}");

        // Subtraction
        Money discount = Money.FromDecimal(5.00m, "USD");
        Money finalPrice = total - discount;
        Console.WriteLine($"After $5 discount: {finalPrice}");

        // Multiplication
        int quantity = 3;
        Money itemsTotal = price * quantity;
        Console.WriteLine($"\n{quantity} items at {price} each: {itemsTotal}");

        // Division
        Money perItem = itemsTotal / quantity;
        Console.WriteLine($"Per item (division check): {perItem}");

        // Negation
        Money refund = -finalPrice;
        Console.WriteLine($"Refund amount: {refund}");

        // Absolute value
        Money absoluteRefund = refund.Abs();
        Console.WriteLine($"Absolute refund: {absoluteRefund}");
    }

    /// <summary>
    /// Demonstrates proportional allocation of money.
    /// This is crucial for splitting bills, dividing profits, etc.
    /// </summary>
    private void DemoMoneyAllocation()
    {
        Console.WriteLine("--- Money Allocation ---\n");

        // Split bill among 3 people
        Money billTotal = Money.FromDecimal(100.00m, "USD");
        Console.WriteLine($"Total bill: {billTotal}");

        Money[] equalSplit = billTotal.Allocate(1, 1, 1);
        Console.WriteLine("\nEqual 3-way split:");
        for (int i = 0; i < equalSplit.Length; i++)
        {
            Console.WriteLine($"  Person {i + 1}: {equalSplit[i]}");
        }

        // Verify sum equals original
        Money sum = Money.FromDecimal(0, "USD");
        foreach (Money share in equalSplit)
        {
            sum = sum + share;
        }
        Console.WriteLine($"Sum verification: {sum} (should equal {billTotal})");

        // Proportional split (2:3:5 ratio)
        Console.WriteLine("\nProportional split (2:3:5 ratio):");
        Money investment = Money.FromDecimal(1000.00m, "USD");
        Console.WriteLine($"Total investment: {investment}");

        Money[] proportionalSplit = investment.Allocate(2, 3, 5);
        for (int i = 0; i < proportionalSplit.Length; i++)
        {
            Console.WriteLine($"  Investor {i + 1}: {proportionalSplit[i]}");
        }

        // Handling edge case: splitting $1 among 3 people
        Console.WriteLine("\nEdge case - Split $1.00 among 3 people:");
        Money oneDollar = Money.FromDecimal(1.00m, "USD");
        Money[] pennySplit = oneDollar.Allocate(1, 1, 1);
        for (int i = 0; i < pennySplit.Length; i++)
        {
            Console.WriteLine($"  Person {i + 1}: {pennySplit[i]}");
        }
    }

    /// <summary>
    /// Demonstrates currency conversion.
    /// </summary>
    private void DemoCurrencyConversion()
    {
        Console.WriteLine("--- Currency Conversion ---\n");

        CurrencyConverter converter = new CurrencyConverter();

        // Set up exchange rates
        converter.SetExchangeRate("USD", "EUR", 0.85m);
        converter.SetExchangeRate("USD", "GBP", 0.73m);
        converter.SetExchangeRate("EUR", "GBP", 0.86m);
        converter.SetExchangeRate("USD", "JPY", 110.0m);

        Console.WriteLine("Exchange Rates:");
        Console.WriteLine($"  USD to EUR: {converter.GetExchangeRate("USD", "EUR"):F4}");
        Console.WriteLine($"  USD to GBP: {converter.GetExchangeRate("USD", "GBP"):F4}");
        Console.WriteLine($"  EUR to USD: {converter.GetExchangeRate("EUR", "USD"):F4}");

        // Convert money
        Money usdAmount = Money.FromDecimal(100.00m, "USD");
        Console.WriteLine($"\nOriginal amount: {usdAmount}");

        Money eurAmount = converter.Convert(usdAmount, "EUR");
        Console.WriteLine($"In EUR: {eurAmount}");

        Money gbpAmount = converter.Convert(usdAmount, "GBP");
        Console.WriteLine($"In GBP: {gbpAmount}");

        Money jpyAmount = converter.Convert(usdAmount, "JPY", 0); // JPY has no decimal places
        Console.WriteLine($"In JPY: {jpyAmount}");

        // Convert back to verify
        Money backToUsd = converter.Convert(eurAmount, "USD");
        Console.WriteLine($"\nConverted back to USD: {backToUsd}");
    }

    /// <summary>
    /// Demonstrates money comparison operations.
    /// </summary>
    private void DemoMoneyComparison()
    {
        Console.WriteLine("--- Money Comparison ---\n");

        Money amount1 = Money.FromDecimal(50.00m, "USD");
        Money amount2 = Money.FromDecimal(75.00m, "USD");
        Money amount3 = Money.FromDecimal(50.00m, "USD");

        Console.WriteLine($"Amount 1: {amount1}");
        Console.WriteLine($"Amount 2: {amount2}");
        Console.WriteLine($"Amount 3: {amount3}");

        Console.WriteLine($"\nAmount1 == Amount3: {amount1 == amount3}");
        Console.WriteLine($"Amount1 != Amount2: {amount1 != amount2}");
        Console.WriteLine($"Amount1 < Amount2: {amount1 < amount2}");
        Console.WriteLine($"Amount2 > Amount1: {amount2 > amount1}");
        Console.WriteLine($"Amount1 <= Amount3: {amount1 <= amount3}");

        // State checks
        Money zero = Money.FromDecimal(0, "USD");
        Money positive = Money.FromDecimal(10.00m, "USD");
        Money negative = Money.FromDecimal(-5.00m, "USD");

        Console.WriteLine($"\nZero is zero: {zero.IsZero()}");
        Console.WriteLine($"Positive is positive: {positive.IsPositive()}");
        Console.WriteLine($"Negative is negative: {negative.IsNegative()}");

        // Try comparing different currencies (will throw exception)
        try
        {
            Money usd = Money.FromDecimal(100, "USD");
            Money eur = Money.FromDecimal(100, "EUR");
            bool result = usd > eur; // This will throw
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"\nCannot compare different currencies: {ex.Message}");
        }
    }

    /// <summary>
    /// Demonstrates practical financial calculations.
    /// </summary>
    private void DemoFinancialCalculations()
    {
        Console.WriteLine("--- Financial Calculations ---\n");

        // Calculate order total with tax
        Console.WriteLine("Order Calculation:");
        Money itemPrice = Money.FromDecimal(29.99m, "USD");
        int quantity = 5;
        Money subtotal = itemPrice * quantity;

        decimal taxRate = 0.08m; // 8% tax
        Money taxAmount = subtotal * taxRate;
        Money total = subtotal + taxAmount;

        Console.WriteLine($"  Item price: {itemPrice} x {quantity}");
        Console.WriteLine($"  Subtotal: {subtotal}");
        Console.WriteLine($"  Tax (8%): {taxAmount}");
        Console.WriteLine($"  Total: {total}");

        // Calculate interest
        Console.WriteLine("\nInterest Calculation:");
        Money principal = Money.FromDecimal(10000.00m, "USD");
        decimal annualRate = 0.05m; // 5% annual interest
        int months = 6;

        Money interest = principal * (annualRate * months / 12);
        Money finalAmount = principal + interest;

        Console.WriteLine($"  Principal: {principal}");
        Console.WriteLine($"  Annual rate: {annualRate * 100}%");
        Console.WriteLine($"  Period: {months} months");
        Console.WriteLine($"  Interest earned: {interest}");
        Console.WriteLine($"  Final amount: {finalAmount}");

        // Calculate discount
        Console.WriteLine("\nDiscount Calculation:");
        Money originalPrice = Money.FromDecimal(250.00m, "USD");
        decimal discountPercent = 0.20m; // 20% off

        Money discountAmount = originalPrice * discountPercent;
        Money salePrice = originalPrice - discountAmount;

        Console.WriteLine($"  Original price: {originalPrice}");
        Console.WriteLine($"  Discount (20%): {discountAmount}");
        Console.WriteLine($"  Sale price: {salePrice}");
    }

    /// <summary>
    /// Demonstrates managing a multi-currency investment portfolio.
    /// </summary>
    private void DemoMultiCurrencyPortfolio()
    {
        Console.WriteLine("--- Multi-Currency Portfolio ---\n");

        CurrencyConverter converter = new CurrencyConverter();
        converter.SetExchangeRate("USD", "EUR", 0.85m);
        converter.SetExchangeRate("USD", "GBP", 0.73m);
        converter.SetExchangeRate("USD", "JPY", 110.0m);

        // Portfolio holdings
        Money usdHolding = Money.FromDecimal(10000.00m, "USD");
        Money eurHolding = Money.FromDecimal(5000.00m, "EUR");
        Money gbpHolding = Money.FromDecimal(3000.00m, "GBP");
        Money jpyHolding = Money.FromDecimal(500000m, "JPY", 0);

        Console.WriteLine("Portfolio Holdings:");
        Console.WriteLine($"  {usdHolding}");
        Console.WriteLine($"  {eurHolding}");
        Console.WriteLine($"  {gbpHolding}");
        Console.WriteLine($"  {jpyHolding}");

        // Convert everything to USD for total
        Money eurInUsd = converter.Convert(eurHolding, "USD");
        Money gbpInUsd = converter.Convert(gbpHolding, "USD");
        Money jpyInUsd = converter.Convert(jpyHolding, "USD");

        Money totalInUsd = usdHolding + eurInUsd + gbpInUsd + jpyInUsd;

        Console.WriteLine("\nTotal Portfolio Value (in USD):");
        Console.WriteLine($"  USD holdings: {usdHolding}");
        Console.WriteLine($"  EUR holdings: {eurInUsd} (converted)");
        Console.WriteLine($"  GBP holdings: {gbpInUsd} (converted)");
        Console.WriteLine($"  JPY holdings: {jpyInUsd} (converted)");
        Console.WriteLine($"  Total: {totalInUsd}");
    }

    /// <summary>
    /// Demonstrates money formatting with different cultures.
    /// </summary>
    private void DemoMoneyFormatting()
    {
        Console.WriteLine("--- Money Formatting ---\n");

        Money amount = Money.FromDecimal(1234.56m, "USD");

        Console.WriteLine($"Default format: {amount}");
        Console.WriteLine($"US format: {amount.ToString(CultureInfo.GetCultureInfo("en-US"))}");
        Console.WriteLine($"UK format: {amount.ToString(CultureInfo.GetCultureInfo("en-GB"))}");
        Console.WriteLine($"French format: {amount.ToString(CultureInfo.GetCultureInfo("fr-FR"))}");
        Console.WriteLine($"German format: {amount.ToString(CultureInfo.GetCultureInfo("de-DE"))}");

        // Different currencies
        Money eur = Money.FromDecimal(1234.56m, "EUR");
        Money gbp = Money.FromDecimal(1234.56m, "GBP");
        Money jpy = Money.FromDecimal(123456m, "JPY", 0);

        Console.WriteLine($"\nEUR: {eur}");
        Console.WriteLine($"GBP: {gbp}");
        Console.WriteLine($"JPY: {jpy}");
    }

    /// <summary>
    /// Demonstrates handling edge cases and errors.
    /// </summary>
    private void DemoEdgeCases()
    {
        Console.WriteLine("--- Edge Cases and Error Handling ---\n");

        // Precision handling
        Console.WriteLine("Precision Handling:");
        Money precise1 = Money.FromDecimal(0.01m, "USD");
        Money precise2 = Money.FromDecimal(0.02m, "USD");
        Money preciseSum = precise1 + precise2;
        Console.WriteLine($"  0.01 + 0.02 = {preciseSum} (exact: {preciseSum.ToDecimal()})");

        // Very large amounts
        Console.WriteLine("\nLarge Amounts:");
        Money billion = Money.FromDecimal(1_000_000_000.00m, "USD");
        Console.WriteLine($"  One billion: {billion}");

        // Currency mismatch error
        Console.WriteLine("\nCurrency Mismatch:");
        try
        {
            Money usd = Money.FromDecimal(100, "USD");
            Money eur = Money.FromDecimal(100, "EUR");
            Money invalid = usd + eur; // This will throw
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"  Error: {ex.Message}");
        }

        // Division by zero
        Console.WriteLine("\nDivision by Zero:");
        try
        {
            Money amount = Money.FromDecimal(100, "USD");
            Money invalid = amount / 0; // This will throw
        }
        catch (DivideByZeroException ex)
        {
            Console.WriteLine($"  Error: {ex.Message}");
        }

        // Invalid allocation
        Console.WriteLine("\nInvalid Allocation:");
        try
        {
            Money amount = Money.FromDecimal(100, "USD");
            Money[] invalid = amount.Allocate(-1, 2, 3); // This will throw
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"  Error: {ex.Message}");
        }
    }
}
