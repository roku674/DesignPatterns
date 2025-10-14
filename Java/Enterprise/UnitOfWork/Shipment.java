package Enterprise.UnitOfWork;

import java.time.LocalDateTime;

/**
 * Shipment domain entity.
 */
public class Shipment implements DomainObject {
    private Long id;
    private Long orderId;
    private String method;
    private LocalDateTime estimatedDelivery;

    public Shipment(Long id, Long orderId, String method, LocalDateTime estimatedDelivery) {
        this.id = id;
        this.orderId = orderId;
        this.method = method;
        this.estimatedDelivery = estimatedDelivery;
    }

    @Override
    public Long getId() {
        return id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getMethod() {
        return method;
    }

    public LocalDateTime getEstimatedDelivery() {
        return estimatedDelivery;
    }

    @Override
    public Shipment clone() {
        return new Shipment(this.id, this.orderId, this.method, this.estimatedDelivery);
    }
}
