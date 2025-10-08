import java.util.HashMap;
import java.util.Map;

/**
 * Prototype Registry - manages prototype instances
 *
 * This class stores pre-configured document templates that can be cloned
 * to create new documents quickly without going through the initialization process.
 */
public class DocumentRegistry {

    private Map<String, Document> prototypes = new HashMap<>();

    /**
     * Adds a prototype to the registry
     *
     * @param key the key to identify the prototype
     * @param prototype the prototype document
     */
    public void addPrototype(String key, Document prototype) {
        prototypes.put(key, prototype);
    }

    /**
     * Gets a clone of the prototype
     *
     * @param key the key identifying the prototype
     * @return a clone of the prototype, or null if not found
     */
    public Document getPrototype(String key) {
        Document prototype = prototypes.get(key);
        if (prototype != null) {
            return prototype.clone();
        }
        return null;
    }

    /**
     * Checks if a prototype exists
     *
     * @param key the key to check
     * @return true if the prototype exists
     */
    public boolean hasPrototype(String key) {
        return prototypes.containsKey(key);
    }

    /**
     * Removes a prototype from the registry
     *
     * @param key the key of the prototype to remove
     */
    public void removePrototype(String key) {
        prototypes.remove(key);
    }
}
