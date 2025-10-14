package Integration.CommandMessage;

import java.util.HashMap;
import java.util.Map;

/**
 * CommandMessage encapsulates a Command within a Message.
 * This pattern is used to invoke a procedure in another application.
 *
 * Key characteristics:
 * - Tells the receiver to execute a specific operation
 * - Contains command name and parameters
 * - Expects the receiver to perform an action (side effect)
 * - May or may not return a result
 */
public class CommandMessage extends Message {
    private final Command command;

    /**
     * Constructs a CommandMessage with the specified command.
     *
     * @param command The command to execute
     */
    public CommandMessage(Command command) {
        super(command);
        this.command = command;
        setHeader("messageType", "COMMAND");
        setHeader("commandName", command.getCommandName());
        setHeader("targetService", command.getTargetService());
    }

    /**
     * Constructs a CommandMessage with command and custom headers.
     *
     * @param command The command to execute
     * @param additionalHeaders Additional headers for the message
     */
    public CommandMessage(Command command, Map<String, Object> additionalHeaders) {
        super(command, additionalHeaders);
        this.command = command;
        setHeader("messageType", "COMMAND");
        setHeader("commandName", command.getCommandName());
        setHeader("targetService", command.getTargetService());
    }

    /**
     * Gets the command from this message.
     *
     * @return The command
     */
    public Command getCommand() {
        return command;
    }

    /**
     * Checks if this is a command message.
     *
     * @return true if this is a command message
     */
    public boolean isCommandMessage() {
        return "COMMAND".equals(getHeader("messageType"));
    }

    @Override
    public String toString() {
        return String.format("CommandMessage[id=%s, command=%s]",
            getMessageId(), command);
    }
}
