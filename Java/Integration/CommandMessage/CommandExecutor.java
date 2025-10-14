package Integration.CommandMessage;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;

/**
 * CommandExecutor receives and executes command messages.
 * It maintains a registry of command handlers and dispatches
 * commands to the appropriate handler.
 */
public class CommandExecutor {
    private final String serviceName;
    private final Map<String, Consumer<Command>> commandHandlers;

    /**
     * Constructs a CommandExecutor for the specified service.
     *
     * @param serviceName The name of this service
     */
    public CommandExecutor(String serviceName) {
        this.serviceName = serviceName;
        this.commandHandlers = new HashMap<>();
    }

    /**
     * Registers a command handler for a specific command.
     *
     * @param commandName The command name to handle
     * @param handler The handler function
     */
    public void registerCommandHandler(String commandName, Consumer<Command> handler) {
        commandHandlers.put(commandName, handler);
        System.out.println("Registered handler for command: " + commandName);
    }

    /**
     * Executes a command message.
     *
     * @param commandMessage The command message to execute
     * @return true if the command was executed successfully
     */
    public boolean executeCommand(CommandMessage commandMessage) {
        Command command = commandMessage.getCommand();

        // Check if this command is for this service
        if (!serviceName.equals(command.getTargetService())) {
            System.out.println("Command not for this service. Target: " +
                command.getTargetService() + ", This service: " + serviceName);
            return false;
        }

        // Find and execute the command handler
        Consumer<Command> handler = commandHandlers.get(command.getCommandName());
        if (handler == null) {
            System.out.println("No handler registered for command: " + command.getCommandName());
            return false;
        }

        try {
            System.out.println("\n--- Executing Command ---");
            System.out.println("Service: " + serviceName);
            System.out.println("Command: " + command.getCommandName());
            System.out.println("Parameters: " + command.getParameters());

            handler.accept(command);

            System.out.println("Command executed successfully");
            return true;
        } catch (Exception e) {
            System.out.println("Error executing command: " + e.getMessage());
            return false;
        }
    }

    /**
     * Gets the service name.
     *
     * @return The service name
     */
    public String getServiceName() {
        return serviceName;
    }
}
