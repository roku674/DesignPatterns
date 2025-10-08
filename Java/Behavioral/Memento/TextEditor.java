/** Originator - creates and restores mementos */
public class TextEditor {
    private String content;

    public void write(String text) {
        content = text;
        System.out.println("Current content: " + content);
    }

    public Memento save() {
        System.out.println("Saving state...");
        return new Memento(content);
    }

    public void restore(Memento memento) {
        content = memento.getState();
        System.out.println("Restored content: " + content);
    }

    public String getContent() {
        return content;
    }
}
