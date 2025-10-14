package Integration.DocumentMessage;

import java.util.HashMap;
import java.util.Map;
import java.time.Instant;

/**
 * Document represents a structured data object for transfer between applications.
 * Documents contain business data like invoices, orders, customer records, etc.
 */
public class Document {
    private final String documentType;
    private final String documentId;
    private final Instant createdAt;
    private final Map<String, Object> fields;
    private String version;

    /**
     * Constructs a Document with the specified type and ID.
     *
     * @param documentType The type of document (Invoice, Order, Customer, etc.)
     * @param documentId Unique identifier for this document
     */
    public Document(String documentType, String documentId) {
        this.documentType = documentType;
        this.documentId = documentId;
        this.createdAt = Instant.now();
        this.fields = new HashMap<>();
        this.version = "1.0";
    }

    /**
     * Sets a field in the document.
     *
     * @param fieldName The field name
     * @param value The field value
     * @return This Document instance for method chaining
     */
    public Document setField(String fieldName, Object value) {
        fields.put(fieldName, value);
        return this;
    }

    /**
     * Gets a field value from the document.
     *
     * @param fieldName The field name
     * @return The field value, or null if not found
     */
    public Object getField(String fieldName) {
        return fields.get(fieldName);
    }

    /**
     * Gets all fields in the document.
     *
     * @return Map of all document fields
     */
    public Map<String, Object> getAllFields() {
        return new HashMap<>(fields);
    }

    /**
     * Gets the document type.
     *
     * @return The document type
     */
    public String getDocumentType() {
        return documentType;
    }

    /**
     * Gets the document ID.
     *
     * @return The document ID
     */
    public String getDocumentId() {
        return documentId;
    }

    /**
     * Gets when the document was created.
     *
     * @return The creation timestamp
     */
    public Instant getCreatedAt() {
        return createdAt;
    }

    /**
     * Gets the document version.
     *
     * @return The document version
     */
    public String getVersion() {
        return version;
    }

    /**
     * Sets the document version.
     *
     * @param version The version string
     */
    public void setVersion(String version) {
        this.version = version;
    }

    /**
     * Validates that all required fields are present.
     *
     * @param requiredFields Array of required field names
     * @return true if all required fields are present
     */
    public boolean validateRequiredFields(String... requiredFields) {
        for (String field : requiredFields) {
            if (!fields.containsKey(field) || fields.get(field) == null) {
                return false;
            }
        }
        return true;
    }

    @Override
    public String toString() {
        return String.format("Document[type=%s, id=%s, version=%s, fields=%s]",
            documentType, documentId, version, fields);
    }
}
