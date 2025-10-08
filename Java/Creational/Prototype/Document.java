import java.util.ArrayList;
import java.util.List;

/**
 * Prototype interface - declares cloning method
 */
public abstract class Document implements Cloneable {

    protected String title;
    protected String content;
    protected List<String> tags;
    protected String author;

    public Document() {
        this.tags = new ArrayList<>();
    }

    /**
     * Clone method - creates a copy of the document
     *
     * @return a clone of this document
     */
    @Override
    public abstract Document clone();

    /**
     * Displays the document information
     */
    public abstract void display();

    // Getters and setters
    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void addTag(String tag) {
        this.tags.add(tag);
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public List<String> getTags() {
        return tags;
    }

    public String getAuthor() {
        return author;
    }
}
