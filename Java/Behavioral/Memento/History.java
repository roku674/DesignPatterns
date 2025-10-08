import java.util.Stack;

/** Caretaker - manages mementos */
public class History {
    private Stack<Memento> history = new Stack<>();

    public void push(Memento memento) {
        history.push(memento);
    }

    public Memento pop() {
        if (!history.isEmpty()) {
            return history.pop();
        }
        return null;
    }
}
