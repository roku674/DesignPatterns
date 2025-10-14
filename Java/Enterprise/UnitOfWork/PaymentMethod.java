package Enterprise.UnitOfWork;

/**
 * PaymentMethod domain entity.
 */
public class PaymentMethod implements DomainObject {
    private Long id;
    private Long customerId;
    private String type;
    private String details;

    public PaymentMethod(Long id, Long customerId, String type, String details) {
        this.id = id;
        this.customerId = customerId;
        this.type = type;
        this.details = details;
    }

    @Override
    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getType() {
        return type;
    }

    public String getDetails() {
        return details;
    }

    @Override
    public PaymentMethod clone() {
        return new PaymentMethod(this.id, this.customerId, this.type, this.details);
    }
}
