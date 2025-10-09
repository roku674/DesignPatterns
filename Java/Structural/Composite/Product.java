import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

/**
 * Leaf - represents a file (cannot have children)
 */
public class Product implements Component {
    private File file;

    public Product(String path) {
        this.file = new File(path);
    }

    public Product(File file) {
        this.file = file;
    }

    @Override
    public String getName() {
        return file.getName();
    }

    @Override
    public long getSize() throws IOException {
        if (file.exists() && file.isFile()) {
            return file.length();
        }
        return 0;
    }

    @Override
    public void display(String indent) {
        try {
            String sizeStr = formatSize(getSize());
            System.out.println(indent + "[FILE] " + getName() + " (" + sizeStr + ")");
        } catch (IOException e) {
            System.out.println(indent + "[FILE] " + getName() + " (error reading size)");
        }
    }

    @Override
    public boolean isDirectory() {
        return false;
    }

    @Override
    public boolean delete() throws IOException {
        if (file.exists()) {
            boolean deleted = file.delete();
            System.out.println((deleted ? "Deleted" : "Failed to delete") + " file: " + file.getPath());
            return deleted;
        }
        return false;
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
     * Gets the actual file object
     */
    public File getFile() {
        return file;
    }
}
