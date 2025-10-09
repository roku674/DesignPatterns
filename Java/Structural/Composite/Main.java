import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

/**
 * Main class to demonstrate the Composite pattern with real file system operations
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Composite Pattern Demo - File System Operations ===\n");

        try {
            // Create a temporary directory structure for demonstration
            String tempDir = System.getProperty("java.io.tmpdir") + "/composite_demo";
            setupDemoFileSystem(tempDir);

            // Example 1: Load and display a directory tree
            System.out.println("--- Example 1: Directory Tree Display ---");
            Box rootDir = new Box(tempDir);
            rootDir.loadFromFileSystem();
            rootDir.display("");

            // Example 2: Calculate total size
            System.out.println("\n--- Example 2: Size Calculation ---");
            long totalSize = rootDir.getSize();
            System.out.println("Total size of '" + rootDir.getName() + "': " + formatSize(totalSize));
            System.out.println("Total files: " + rootDir.countFiles());
            System.out.println("Total directories: " + rootDir.countDirectories());

            // Example 3: Treat individual file and directory uniformly
            System.out.println("\n--- Example 3: Uniform Treatment ---");
            Box docsDir = findDirectory(rootDir, "docs");
            if (docsDir != null) {
                System.out.println("\nDetails of 'docs' directory:");
                docsDir.display("");
                System.out.println("Docs folder size: " + formatSize(docsDir.getSize()));
            }

            // Example 4: Build a composite tree programmatically
            System.out.println("\n--- Example 4: Programmatic Tree Building ---");
            Box projectDir = new Box(tempDir + "/new_project");
            projectDir.getDirectory().mkdirs();

            Box srcDir = new Box(tempDir + "/new_project/src");
            srcDir.getDirectory().mkdirs();

            // Create some files
            createFile(tempDir + "/new_project/README.md", "# Project README");
            createFile(tempDir + "/new_project/src/Main.java", "public class Main {}");

            projectDir.loadFromFileSystem();
            System.out.println("\nCreated new project structure:");
            projectDir.display("");

            // Example 5: Deletion (commented out to avoid actually deleting)
            System.out.println("\n--- Example 5: Deletion (Dry Run) ---");
            System.out.println("Would delete: " + projectDir.getDirectory().getPath());
            System.out.println("Containing " + projectDir.countFiles() + " files and " +
                    projectDir.countDirectories() + " directories");

            // Cleanup
            System.out.println("\n--- Cleaning up demo files ---");
            Box cleanup = new Box(tempDir);
            cleanup.loadFromFileSystem();
            cleanup.delete();

            System.out.println("\n" + "=".repeat(50));
            System.out.println("\nComposite Pattern Benefits:");
            System.out.println("- Uniform treatment of files and directories");
            System.out.println("- Easy to add new component types (symlinks, etc.)");
            System.out.println("- Recursive operations work naturally");
            System.out.println("- Client code doesn't need to distinguish between leaf and composite");
            System.out.println("\nReal-world usage:");
            System.out.println("- File system hierarchies");
            System.out.println("- UI component trees (Swing/JavaFX)");
            System.out.println("- Organization structures");
            System.out.println("- Document object models (DOM)");

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Sets up a demo file system for testing
     */
    private static void setupDemoFileSystem(String baseDir) throws IOException {
        File base = new File(baseDir);
        if (base.exists()) {
            deleteDirectory(base);
        }
        base.mkdirs();

        // Create directory structure
        new File(baseDir + "/docs").mkdirs();
        new File(baseDir + "/src").mkdirs();
        new File(baseDir + "/src/main").mkdirs();
        new File(baseDir + "/src/test").mkdirs();

        // Create files
        createFile(baseDir + "/README.md", "# Sample Project\nThis is a demo project.");
        createFile(baseDir + "/docs/guide.txt", "User Guide\n\nThis is a sample user guide.");
        createFile(baseDir + "/docs/api.txt", "API Documentation");
        createFile(baseDir + "/src/main/App.java", "public class App { public static void main(String[] args) {} }");
        createFile(baseDir + "/src/test/AppTest.java", "public class AppTest {}");
    }

    /**
     * Creates a file with content
     */
    private static void createFile(String path, String content) throws IOException {
        FileWriter writer = new FileWriter(path);
        writer.write(content);
        writer.close();
    }

    /**
     * Recursively deletes a directory
     */
    private static void deleteDirectory(File dir) {
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    deleteDirectory(file);
                } else {
                    file.delete();
                }
            }
        }
        dir.delete();
    }

    /**
     * Finds a directory by name in the tree
     */
    private static Box findDirectory(Box root, String name) {
        if (root.getName().equals(name)) {
            return root;
        }

        for (Component child : root.getChildren()) {
            if (child.isDirectory()) {
                Box found = findDirectory((Box) child, name);
                if (found != null) {
                    return found;
                }
            }
        }

        return null;
    }

    /**
     * Formats byte size to human-readable format
     */
    private static String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
