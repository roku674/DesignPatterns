package Enterprise.Base.Money;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Money Pattern Demonstration
 *
 * The Money pattern represents monetary values with proper currency handling
 * and prevents common floating-point arithmetic errors. It ensures type safety
 * and currency consistency in financial calculations.
 *
 * Key Benefits:
 * - Prevents floating-point rounding errors
 * - Enforces currency matching in operations
 * - Provides domain-specific operations (allocation, etc.)
 * - Immutable and thread-safe
 *
 * Use Cases:
 * - Financial applications
 * - E-commerce systems
 * - Accounting software
 * - Multi-currency transactions
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Money Pattern Demo ===\n");

        // Scenario 1: Basic arithmetic operations
        demonstrateBasicArithmetic();

        // Scenario 2: Currency mismatch prevention
        demonstrateCurrencyMismatch();

        // Scenario 3: Money allocation
        demonstrateAllocation();

        // Scenario 4: Comparison operations
        demonstrateComparisons();

        // Scenario 5: Tax calculations
        demonstrateTaxCalculations();

        // Scenario 6: Multi-currency support
        demonstrateMultiCurrency();

        // Scenario 7: Shopping cart example
        demonstrateShoppingCart();

        // Scenario 8: Tip splitting
        demonstrateTipSplitting();

        // Scenario 9: Floating-point precision issues
        demonstrateFloatingPointPrecision();

        // Scenario 10: Financial reporting
        demonstrateFinancialReporting();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Basic arithmetic operations
     * Demonstrates addition, subtraction, multiplication, and division.
     */
    private static void demonstrateBasicArithmetic() {
        System.out.println("--- Scenario 1: Basic Arithmetic ---");
        try {
            Money price1 = new Money(29.99, "USD");
            Money price2 = new Money(15.50, "USD");

            System.out.println("Price 1: " + price1);
            System.out.println("Price 2: " + price2);

            Money sum = price1.add(price2);
            System.out.println("Sum: " + sum);

            Money difference = price1.subtract(price2);
            System.out.println("Difference: " + difference);

            Money doubled = price1.multiply(2);
            System.out.println("Price 1 doubled: " + doubled);

            Money half = price1.divide(2);
            System.out.println("Price 1 halved: " + half);

            // Tax calculation (8.5%)
            Money tax = price1.multiply(0.085);
            System.out.println("Tax on Price 1: " + tax);

            Money total = price1.add(tax);
            System.out.println("Total with tax: " + total);

            System.out.println("Arithmetic operations successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 2: Currency mismatch prevention
     * Demonstrates how the pattern prevents mixing different currencies.
     */
    private static void demonstrateCurrencyMismatch() {
        System.out.println("--- Scenario 2: Currency Mismatch Prevention ---");

        Money usd = new Money(100.00, "USD");
        Money eur = new Money(100.00, "EUR");

        System.out.println("Amount in USD: " + usd);
        System.out.println("Amount in EUR: " + eur);

        // Try to add different currencies
        try {
            Money invalid = usd.add(eur);
            System.out.println("ERROR: Should have thrown exception!");
        } catch (IllegalArgumentException e) {
            System.out.println("Correctly prevented: " + e.getMessage());
        }

        // Try to subtract different currencies
        try {
            Money invalid = usd.subtract(eur);
            System.out.println("ERROR: Should have thrown exception!");
        } catch (IllegalArgumentException e) {
            System.out.println("Correctly prevented: " + e.getMessage());
        }

        // Same currency operations work fine
        Money usd2 = new Money(50.00, "USD");
        Money validSum = usd.add(usd2);
        System.out.println("Valid same-currency addition: " + validSum);

        System.out.println("Currency mismatch prevention successful!\n");
    }

    /**
     * Scenario 3: Money allocation
     * Demonstrates splitting money into equal or proportional parts.
     */
    private static void demonstrateAllocation() {
        System.out.println("--- Scenario 3: Money Allocation ---");
        try {
            // Equal allocation
            Money total = new Money(100.00, "USD");
            System.out.println("Total amount: " + total);

            System.out.println("\nSplit into 3 equal parts:");
            Money[] equalParts = total.allocate(3);
            Money sum = new Money(0, "USD");
            for (int i = 0; i < equalParts.length; i++) {
                System.out.println("  Part " + (i + 1) + ": " + equalParts[i]);
                sum = sum.add(equalParts[i]);
            }
            System.out.println("  Sum of parts: " + sum + " (equals original: " + sum.equals(total) + ")");

            // Proportional allocation
            System.out.println("\nAllocate $100 in ratio 2:3:5:");
            int[] ratios = {2, 3, 5};
            Money[] proportionalParts = total.allocate(ratios);
            sum = new Money(0, "USD");
            for (int i = 0; i < proportionalParts.length; i++) {
                System.out.println("  Part " + (i + 1) + " (ratio " + ratios[i] + "): " + proportionalParts[i]);
                sum = sum.add(proportionalParts[i]);
            }
            System.out.println("  Sum of parts: " + sum + " (equals original: " + sum.equals(total) + ")");

            // Allocation with odd amounts
            Money oddAmount = new Money(10.00, "USD");
            System.out.println("\nSplit $10 into 3 equal parts:");
            Money[] oddParts = oddAmount.allocate(3);
            sum = new Money(0, "USD");
            for (int i = 0; i < oddParts.length; i++) {
                System.out.println("  Part " + (i + 1) + ": " + oddParts[i]);
                sum = sum.add(oddParts[i]);
            }
            System.out.println("  Sum of parts: " + sum + " (no money lost!)");

            System.out.println("Allocation successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 4: Comparison operations
     * Demonstrates comparing Money objects.
     */
    private static void demonstrateComparisons() {
        System.out.println("--- Scenario 4: Comparison Operations ---");
        try {
            Money price = new Money(50.00, "USD");
            Money budget = new Money(100.00, "USD");
            Money exact = new Money(50.00, "USD");
            Money zero = new Money(0, "USD");
            Money negative = new Money(-25.00, "USD");

            System.out.println("Price: " + price);
            System.out.println("Budget: " + budget);
            System.out.println("Exact: " + exact);

            System.out.println("\nComparisons:");
            System.out.println("Price < Budget: " + price.lessThan(budget));
            System.out.println("Price > Budget: " + price.greaterThan(budget));
            System.out.println("Price == Exact: " + price.equals(exact));
            System.out.println("Price <= Exact: " + price.lessThanOrEqual(exact));

            System.out.println("\nState checks:");
            System.out.println("Zero is zero: " + zero.isZero());
            System.out.println("Price is positive: " + price.isPositive());
            System.out.println("Negative is negative: " + negative.isNegative());

            System.out.println("\nBudget check:");
            if (price.lessThanOrEqual(budget)) {
                System.out.println("Purchase approved! Remaining: " + budget.subtract(price));
            } else {
                System.out.println("Insufficient funds!");
            }

            System.out.println("Comparison operations successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 5: Tax calculations
     * Demonstrates real-world tax calculation scenarios.
     */
    private static void demonstrateTaxCalculations() {
        System.out.println("--- Scenario 5: Tax Calculations ---");
        try {
            Money subtotal = new Money(125.00, "USD");
            double taxRate = 0.0825; // 8.25% sales tax

            System.out.println("Subtotal: " + subtotal);
            System.out.println("Tax rate: " + (taxRate * 100) + "%");

            Money tax = subtotal.multiply(taxRate);
            System.out.println("Tax amount: " + tax);

            Money total = subtotal.add(tax);
            System.out.println("Total: " + total);

            // Progressive tax calculation
            System.out.println("\nProgressive tax brackets:");
            Money income = new Money(75000, "USD");
            System.out.println("Income: " + income);

            Money taxOwed = calculateProgressiveTax(income);
            System.out.println("Tax owed: " + taxOwed);
            System.out.println("Effective rate: " +
                String.format("%.2f%%", taxOwed.getAmount().divide(income.getAmount(), 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(new BigDecimal("100")).doubleValue()));

            Money netIncome = income.subtract(taxOwed);
            System.out.println("Net income: " + netIncome);

            System.out.println("Tax calculations successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 6: Multi-currency support
     * Demonstrates handling multiple currencies.
     */
    private static void demonstrateMultiCurrency() {
        System.out.println("--- Scenario 6: Multi-Currency Support ---");
        try {
            Money usd = new Money(100.00, "USD");
            Money eur = new Money(85.00, "EUR");
            Money gbp = new Money(75.00, "GBP");
            Money jpy = new Money(11000.00, "JPY");

            System.out.println("USD: " + usd + " or " + usd.toStringWithCode());
            System.out.println("EUR: " + eur + " or " + eur.toStringWithCode());
            System.out.println("GBP: " + gbp + " or " + gbp.toStringWithCode());
            System.out.println("JPY: " + jpy + " or " + jpy.toStringWithCode());

            // Currency conversion (simplified - in real app use exchange rate service)
            System.out.println("\nCurrency conversion (USD to EUR at 0.85 rate):");
            Money converted = convertCurrency(usd, "EUR", 0.85);
            System.out.println(usd + " -> " + converted);

            // Multi-currency portfolio
            System.out.println("\nPortfolio in different currencies:");
            System.out.println("  USD holdings: " + usd);
            System.out.println("  EUR holdings: " + eur);
            System.out.println("  GBP holdings: " + gbp);

            // Convert all to USD for reporting
            Money eurInUsd = convertCurrency(eur, "USD", 1.18);
            Money gbpInUsd = convertCurrency(gbp, "USD", 1.33);
            Money totalUsd = usd.add(eurInUsd).add(gbpInUsd);
            System.out.println("Total portfolio value in USD: " + totalUsd);

            System.out.println("Multi-currency support successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 7: Shopping cart example
     * Demonstrates a realistic e-commerce shopping cart.
     */
    private static void demonstrateShoppingCart() {
        System.out.println("--- Scenario 7: Shopping Cart ---");
        try {
            List<CartItem> cart = new ArrayList<>();
            cart.add(new CartItem("Laptop", new Money(899.99, "USD"), 1));
            cart.add(new CartItem("Mouse", new Money(29.99, "USD"), 2));
            cart.add(new CartItem("Keyboard", new Money(79.99, "USD"), 1));
            cart.add(new CartItem("Monitor", new Money(249.99, "USD"), 1));

            System.out.println("Shopping Cart:");
            Money subtotal = new Money(0, "USD");
            for (CartItem item : cart) {
                Money lineTotal = item.getLineTotal();
                System.out.println("  " + item.getName() + " x" + item.getQuantity() +
                    " @ " + item.getPrice() + " = " + lineTotal);
                subtotal = subtotal.add(lineTotal);
            }

            System.out.println("\nSubtotal: " + subtotal);

            // Apply discount (10% off)
            Money discount = subtotal.multiply(0.10);
            System.out.println("Discount (10%): -" + discount);
            Money afterDiscount = subtotal.subtract(discount);

            // Shipping
            Money shipping = new Money(15.00, "USD");
            System.out.println("Shipping: " + shipping);

            // Tax (8.5%)
            Money tax = afterDiscount.multiply(0.085);
            System.out.println("Tax (8.5%): " + tax);

            // Final total
            Money total = afterDiscount.add(shipping).add(tax);
            System.out.println("\nTotal: " + total);

            System.out.println("Shopping cart successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 8: Tip splitting
     * Demonstrates splitting a restaurant bill with tip.
     */
    private static void demonstrateTipSplitting() {
        System.out.println("--- Scenario 8: Tip Splitting ---");
        try {
            Money billAmount = new Money(156.75, "USD");
            int numberOfPeople = 4;
            double tipPercentage = 0.20; // 20% tip

            System.out.println("Bill amount: " + billAmount);
            System.out.println("Number of people: " + numberOfPeople);
            System.out.println("Tip percentage: " + (tipPercentage * 100) + "%");

            Money tipAmount = billAmount.multiply(tipPercentage);
            System.out.println("\nTip amount: " + tipAmount);

            Money totalWithTip = billAmount.add(tipAmount);
            System.out.println("Total with tip: " + totalWithTip);

            Money[] splitAmounts = totalWithTip.allocate(numberOfPeople);
            System.out.println("\nSplit " + numberOfPeople + " ways:");
            Money verification = new Money(0, "USD");
            for (int i = 0; i < splitAmounts.length; i++) {
                System.out.println("  Person " + (i + 1) + " pays: " + splitAmounts[i]);
                verification = verification.add(splitAmounts[i]);
            }

            System.out.println("\nVerification: " + verification +
                " (matches total: " + verification.equals(totalWithTip) + ")");

            // Unequal split (someone had more expensive items)
            System.out.println("\nUnequal split by consumption ratio:");
            int[] consumptionRatios = {3, 2, 2, 1}; // Person 1 had more
            Money[] unequalSplit = totalWithTip.allocate(consumptionRatios);
            for (int i = 0; i < unequalSplit.length; i++) {
                System.out.println("  Person " + (i + 1) + " pays: " + unequalSplit[i]);
            }

            System.out.println("Tip splitting successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 9: Floating-point precision issues
     * Demonstrates why Money pattern is better than using doubles.
     */
    private static void demonstrateFloatingPointPrecision() {
        System.out.println("--- Scenario 9: Floating-Point Precision Issues ---");

        // Problem with doubles
        System.out.println("Using doubles (problematic):");
        double d1 = 0.1;
        double d2 = 0.2;
        double doubleSum = d1 + d2;
        System.out.println("0.1 + 0.2 = " + doubleSum);
        System.out.println("Is it 0.3? " + (doubleSum == 0.3));
        System.out.println("Actual value: " + String.format("%.20f", doubleSum));

        // Solution with Money
        System.out.println("\nUsing Money (correct):");
        Money m1 = new Money(0.1, "USD");
        Money m2 = new Money(0.2, "USD");
        Money moneySum = m1.add(m2);
        System.out.println("$0.1 + $0.2 = " + moneySum);
        Money expected = new Money(0.3, "USD");
        System.out.println("Is it $0.3? " + moneySum.equals(expected));

        // Multiple operations compound the error
        System.out.println("\nCompounding errors with repeated operations:");
        double doubleTotal = 0.0;
        Money moneyTotal = new Money(0, "USD");
        for (int i = 0; i < 10; i++) {
            doubleTotal += 0.1;
            moneyTotal = moneyTotal.add(new Money(0.1, "USD"));
        }
        System.out.println("Double: 10 x 0.1 = " + doubleTotal + " (expected 1.0)");
        System.out.println("Money: 10 x $0.1 = " + moneyTotal + " (expected $1.00)");

        System.out.println("Precision comparison successful!\n");
    }

    /**
     * Scenario 10: Financial reporting
     * Demonstrates generating financial reports with Money objects.
     */
    private static void demonstrateFinancialReporting() {
        System.out.println("--- Scenario 10: Financial Reporting ---");
        try {
            // Monthly revenue breakdown
            Money productSales = new Money(45000.00, "USD");
            Money serviceSales = new Money(23000.00, "USD");
            Money subscriptions = new Money(12000.00, "USD");

            System.out.println("REVENUE REPORT - MARCH 2024");
            System.out.println("============================");
            System.out.println("Product Sales:      " + String.format("%12s", productSales));
            System.out.println("Service Sales:      " + String.format("%12s", serviceSales));
            System.out.println("Subscriptions:      " + String.format("%12s", subscriptions));

            Money totalRevenue = productSales.add(serviceSales).add(subscriptions);
            System.out.println("                    " + "------------");
            System.out.println("Total Revenue:      " + String.format("%12s", totalRevenue));

            // Expenses
            System.out.println("\nEXPENSES");
            System.out.println("--------");
            Money salaries = new Money(35000.00, "USD");
            Money rent = new Money(5000.00, "USD");
            Money utilities = new Money(1500.00, "USD");
            Money marketing = new Money(8000.00, "USD");
            Money misc = new Money(2500.00, "USD");

            System.out.println("Salaries:           " + String.format("%12s", salaries));
            System.out.println("Rent:               " + String.format("%12s", rent));
            System.out.println("Utilities:          " + String.format("%12s", utilities));
            System.out.println("Marketing:          " + String.format("%12s", marketing));
            System.out.println("Miscellaneous:      " + String.format("%12s", misc));

            Money totalExpenses = salaries.add(rent).add(utilities).add(marketing).add(misc);
            System.out.println("                    " + "------------");
            System.out.println("Total Expenses:     " + String.format("%12s", totalExpenses));

            // Net income
            Money netIncome = totalRevenue.subtract(totalExpenses);
            System.out.println("\nNET INCOME:         " + String.format("%12s", netIncome));

            // Profit margin
            BigDecimal profitMargin = netIncome.getAmount()
                .divide(totalRevenue.getAmount(), 4, BigDecimal.ROUND_HALF_UP)
                .multiply(new BigDecimal("100"));
            System.out.println("Profit Margin:      " + String.format("%11.2f%%", profitMargin.doubleValue()));

            // Expense breakdown
            System.out.println("\nEXPENSE BREAKDOWN");
            Money[] expenseCategories = {salaries, rent, utilities, marketing, misc};
            String[] categoryNames = {"Salaries", "Rent", "Utilities", "Marketing", "Misc"};
            for (int i = 0; i < expenseCategories.length; i++) {
                BigDecimal percentage = expenseCategories[i].getAmount()
                    .divide(totalExpenses.getAmount(), 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(new BigDecimal("100"));
                System.out.println(String.format("%-15s %12s (%5.2f%%)",
                    categoryNames[i], expenseCategories[i], percentage.doubleValue()));
            }

            System.out.println("\nFinancial reporting successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    // Helper methods

    /**
     * Calculates progressive tax based on income brackets.
     */
    private static Money calculateProgressiveTax(Money income) {
        Money tax = new Money(0, income.getCurrency().getCurrencyCode());

        // Simplified tax brackets (USD)
        Money bracket1 = new Money(10000, "USD");
        Money bracket2 = new Money(40000, "USD");
        Money bracket3 = new Money(85000, "USD");

        Money remaining = income;

        // First bracket: 10%
        if (remaining.greaterThan(bracket1)) {
            tax = tax.add(bracket1.multiply(0.10));
            remaining = remaining.subtract(bracket1);
        } else {
            return tax.add(remaining.multiply(0.10));
        }

        // Second bracket: 15%
        Money bracket2Amount = bracket2.subtract(bracket1);
        if (remaining.greaterThan(bracket2Amount)) {
            tax = tax.add(bracket2Amount.multiply(0.15));
            remaining = remaining.subtract(bracket2Amount);
        } else {
            return tax.add(remaining.multiply(0.15));
        }

        // Third bracket: 25%
        Money bracket3Amount = bracket3.subtract(bracket2);
        if (remaining.greaterThan(bracket3Amount)) {
            tax = tax.add(bracket3Amount.multiply(0.25));
            remaining = remaining.subtract(bracket3Amount);
        } else {
            return tax.add(remaining.multiply(0.25));
        }

        // Remaining: 28%
        tax = tax.add(remaining.multiply(0.28));

        return tax;
    }

    /**
     * Converts money from one currency to another.
     */
    private static Money convertCurrency(Money source, String targetCurrency, double exchangeRate) {
        BigDecimal convertedAmount = source.getAmount().multiply(BigDecimal.valueOf(exchangeRate));
        return new Money(convertedAmount, targetCurrency);
    }

    /**
     * Shopping cart item helper class.
     */
    private static class CartItem {
        private final String name;
        private final Money price;
        private final int quantity;

        public CartItem(String name, Money price, int quantity) {
            this.name = name;
            this.price = price;
            this.quantity = quantity;
        }

        public String getName() {
            return name;
        }

        public Money getPrice() {
            return price;
        }

        public int getQuantity() {
            return quantity;
        }

        public Money getLineTotal() {
            return price.multiply(quantity);
        }
    }
}
