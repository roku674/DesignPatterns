/** Main class to demonstrate Iterator pattern */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Iterator Pattern Demo ===\n");

        BookCollection library = new BookCollection();
        library.addBook("Design Patterns");
        library.addBook("Clean Code");
        library.addBook("The Pragmatic Programmer");
        library.addBook("Refactoring");

        Iterator<String> iterator = library.createIterator();

        System.out.println("Books in the library:");
        while (iterator.hasNext()) {
            System.out.println("- " + iterator.next());
        }

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nIterator Pattern Benefits:");
        System.out.println("- Access elements without exposing internal structure");
        System.out.println("- Support multiple traversals");
        System.out.println("- Uniform interface for different collections");
    }
}
