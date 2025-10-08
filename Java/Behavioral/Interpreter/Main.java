/** Main class to demonstrate Interpreter pattern */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Interpreter Pattern Demo ===\n");

        // Build expression: (5 + 10) - 3
        Expression five = new NumberExpression(5);
        Expression ten = new NumberExpression(10);
        Expression three = new NumberExpression(3);

        Expression addition = new AddExpression(five, ten);
        Expression subtraction = new SubtractExpression(addition, three);

        System.out.println("Expression: (5 + 10) - 3");
        System.out.println("Result: " + subtraction.interpret());

        // Build expression: 20 - (8 + 2)
        Expression twenty = new NumberExpression(20);
        Expression eight = new NumberExpression(8);
        Expression two = new NumberExpression(2);

        Expression add2 = new AddExpression(eight, two);
        Expression subtract2 = new SubtractExpression(twenty, add2);

        System.out.println("\nExpression: 20 - (8 + 2)");
        System.out.println("Result: " + subtract2.interpret());

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nInterpreter Pattern Benefits:");
        System.out.println("- Easy to change and extend grammar");
        System.out.println("- Each grammar rule is a separate class");
    }
}
