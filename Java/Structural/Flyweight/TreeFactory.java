import java.util.HashMap;
import java.util.Map;

/**
 * Flyweight Factory - creates and manages flyweight objects
 */
public class TreeFactory {
    private static Map<String, TreeType> treeTypes = new HashMap<>();

    public static TreeType getTreeType(String name, String color, String texture) {
        String key = name + "-" + color + "-" + texture;
        TreeType type = treeTypes.get(key);

        if (type == null) {
            type = new TreeType(name, color, texture);
            treeTypes.put(key, type);
            System.out.println("Creating new TreeType: " + key);
        }

        return type;
    }

    public static int getTreeTypeCount() {
        return treeTypes.size();
    }
}
