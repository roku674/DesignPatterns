/**
 * Command interface - declares method for executing a command
 */
public interface Command {
    void execute();
    void undo();
}
