import java.io.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;

/**
 * Prototype interface - declares cloning method with real serialization support
 */
public abstract class Document implements Cloneable, Serializable {

    private static final long serialVersionUID = 1L;

    protected String title;
    protected String content;
    protected List<String> tags;
    protected String author;
    protected Date createdDate;
    protected Date modifiedDate;
    protected Metadata metadata;

    public Document() {
        this.tags = new ArrayList<>();
        this.createdDate = new Date();
        this.modifiedDate = new Date();
        this.metadata = new Metadata();
    }

    /**
     * Clone method - creates a deep copy of the document using serialization
     *
     * @return a clone of this document
     */
    @Override
    public abstract Document clone();

    /**
     * Performs deep cloning using serialization
     *
     * @return a deep copy of this document
     * @throws RuntimeException if cloning fails
     */
    protected Document deepClone() {
        try {
            // Serialize the object to a byte array
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(baos);
            oos.writeObject(this);
            oos.close();

            // Deserialize to create a deep copy
            ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
            ObjectInputStream ois = new ObjectInputStream(bais);
            Document clone = (Document) ois.readObject();
            ois.close();

            // Update the cloned document's modification date
            clone.modifiedDate = new Date();

            return clone;
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException("Failed to clone document: " + e.getMessage(), e);
        }
    }

    /**
     * Displays the document information
     */
    public abstract void display();

    /**
     * Validates the document
     *
     * @return true if valid, false otherwise
     */
    public boolean validate() {
        return title != null && !title.trim().isEmpty() &&
               content != null && !content.trim().isEmpty() &&
               author != null && !author.trim().isEmpty();
    }

    /**
     * Gets document size in bytes (estimated)
     */
    public int getSize() {
        int size = 0;
        if (title != null) size += title.length() * 2;
        if (content != null) size += content.length() * 2;
        if (author != null) size += author.length() * 2;
        size += tags.size() * 20; // Estimate for tags
        return size;
    }

    // Getters and setters
    public void setTitle(String title) {
        this.title = title;
        this.modifiedDate = new Date();
    }

    public void setContent(String content) {
        this.content = content;
        this.modifiedDate = new Date();
    }

    public void addTag(String tag) {
        if (!this.tags.contains(tag)) {
            this.tags.add(tag);
            this.modifiedDate = new Date();
        }
    }

    public void removeTag(String tag) {
        this.tags.remove(tag);
        this.modifiedDate = new Date();
    }

    public void setAuthor(String author) {
        this.author = author;
        this.modifiedDate = new Date();
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public List<String> getTags() {
        return new ArrayList<>(tags); // Return defensive copy
    }

    public String getAuthor() {
        return author;
    }

    public Date getCreatedDate() {
        return new Date(createdDate.getTime()); // Return defensive copy
    }

    public Date getModifiedDate() {
        return new Date(modifiedDate.getTime()); // Return defensive copy
    }

    public Metadata getMetadata() {
        return metadata;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Document document = (Document) o;
        return Objects.equals(title, document.title) &&
               Objects.equals(content, document.content) &&
               Objects.equals(author, document.author);
    }

    @Override
    public int hashCode() {
        return Objects.hash(title, content, author);
    }

    /**
     * Inner class to hold document metadata
     */
    public static class Metadata implements Serializable {
        private static final long serialVersionUID = 1L;

        private int version;
        private String status;
        private int wordCount;

        public Metadata() {
            this.version = 1;
            this.status = "Draft";
            this.wordCount = 0;
        }

        public int getVersion() {
            return version;
        }

        public void incrementVersion() {
            this.version++;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public int getWordCount() {
            return wordCount;
        }

        public void setWordCount(int wordCount) {
            this.wordCount = wordCount;
        }

        @Override
        public String toString() {
            return String.format("Version: %d, Status: %s, Words: %d",
                version, status, wordCount);
        }
    }
}
