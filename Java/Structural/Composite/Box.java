import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Composite - represents a directory that can have children
 */
public class Box implements Component {
    private File directory;
    private List<Component> children = new ArrayList<>();

    public Box(String path) {
        this.directory = new File(path);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    public Box(File directory) {
        this.directory = directory;
    }

    /**
     * Adds a component (file or subdirectory)
     */
    public void add(Component component) {
        children.add(component);
    }

    /**
     * Removes a component
     */
    public void remove(Component component) {
        children.remove(component);
    }

    /**
     * Loads all files and directories from the actual file system
     */
    public void loadFromFileSystem() {
        children.clear();

        if (directory.exists() && directory.isDirectory()) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        Box subDir = new Box(file);
                        subDir.loadFromFileSystem(); // Recursively load subdirectories
                        children.add(subDir);
                    } else {
                        children.add(new Product(file));
                    }
                }
            }
        }
    }

    @Override
    public String getName() {
        return directory.getName().isEmpty() ? directory.getPath() : directory.getName();
    }

    @Override
    public long getSize() throws IOException {
        long totalSize = 0;
        for (Component child : children) {
            totalSize += child.getSize();
        }
        return totalSize;
    }

    @Override
    public void display(String indent) {
        try {
            String sizeStr = formatSize(getSize());
            System.out.println(indent + "[DIR] " + getName() + " (" + sizeStr + ")");
            for (Component child : children) {
                child.display(indent + "  ");
            }
        } catch (IOException e) {
            System.out.println(indent + "[DIR] " + getName() + " (error calculating size)");
        }
    }

    @Override
    public boolean isDirectory() {
        return true;
    }

    @Override
    public boolean delete() throws IOException {
        boolean success = true;

        // Delete all children first (depth-first deletion)
        for (Component child : children) {
            if (!child.delete()) {
                success = false;
            }
        }

        // Then delete this directory
        if (directory.exists()) {
            boolean deleted = directory.delete();
            System.out.println((deleted ? "Deleted" : "Failed to delete") + " directory: " + directory.getPath());
            return deleted && success;
        }

        return success;
    }

    /**
     * Counts total files in this directory and subdirectories
     */
    public int countFiles() {
        int count = 0;
        for (Component child : children) {
            if (child.isDirectory()) {
                count += ((Box) child).countFiles();
            } else {
                count++;
            }
        }
        return count;
    }

    /**
     * Counts total subdirectories
     */
    public int countDirectories() {
        int count = 0;
        for (Component child : children) {
            if (child.isDirectory()) {
                count++;
                count += ((Box) child).countDirectories();
            }
        }
        return count;
    }

    /**
     * Gets all children
     */
    public List<Component> getChildren() {
        return new ArrayList<>(children);
    }

    /**
     * Formats byte size to human-readable format
     */
    private String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    /**
     * Gets the actual directory object
     */
    public File getDirectory() {
        return directory;
    }
}
