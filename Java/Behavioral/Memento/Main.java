/** Main class to demonstrate Memento pattern */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Memento Pattern Demo ===\n");

        TextEditor editor = new TextEditor();
        History history = new History();

        editor.write("Version 1");
        history.push(editor.save());

        editor.write("Version 2");
        history.push(editor.save());

        editor.write("Version 3");

        System.out.println("\n--- Undoing changes ---");
        editor.restore(history.pop());
        editor.restore(history.pop());

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nMemento Pattern Benefits:");
        System.out.println("- Preserves encapsulation");
        System.out.println("- Simplifies Originator");
        System.out.println("- Provides undo/redo capability");
    }
}
