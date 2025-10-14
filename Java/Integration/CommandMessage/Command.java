package Integration.CommandMessage;

import java.util.HashMap;
import java.util.Map;

/**
 * Command represents an action to be executed by a receiver.
 * Command messages tell a receiver to perform a specific operation.
 */
public class Command {
    private final String commandName;
    private final Map<String, Object> parameters;
    private final String targetService;

    /**
     * Constructs a Command with the specified name.
     *
     * @param commandName The name of the command to execute
     * @param targetService The service that should execute this command
     */
    public Command(String commandName, String targetService) {
        this.commandName = commandName;
        this.targetService = targetService;
        this.parameters = new HashMap<>();
    }

    /**
     * Adds a parameter to the command.
     *
     * @param key Parameter name
     * @param value Parameter value
     * @return This Command instance for method chaining
     */
    public Command addParameter(String key, Object value) {
        parameters.put(key, value);
        return this;
    }

    /**
     * Gets the command name.
     *
     * @return The command name
     */
    public String getCommandName() {
        return commandName;
    }

    /**
     * Gets the target service that should execute this command.
     *
     * @return The target service name
     */
    public String getTargetService() {
        return targetService;
    }

    /**
     * Gets all command parameters.
     *
     * @return Map of command parameters
     */
    public Map<String, Object> getParameters() {
        return new HashMap<>(parameters);
    }

    /**
     * Gets a specific parameter value.
     *
     * @param key The parameter name
     * @return The parameter value, or null if not found
     */
    public Object getParameter(String key) {
        return parameters.get(key);
    }

    @Override
    public String toString() {
        return String.format("Command[name=%s, target=%s, parameters=%s]",
            commandName, targetService, parameters);
    }
}
