package Enterprise.Concurrency;

/**
 * Document with version control for tracking changes
 */
public class VersionedDocument {
    private final Long id;
    private final String title;
    private String content;
    private int version;

    public VersionedDocument(Long id, String title, String content) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.version = 1;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public int getVersion() {
        return version;
    }

    public void updateContent(String newContent) {
        if (newContent == null || newContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be empty");
        }
        this.content = newContent;
        this.version++;
    }

    @Override
    public String toString() {
        return "Document{id=" + id + ", title='" + title + "', version=" + version + "}";
    }
}
