package Microservices.APIComposition;
public class OrderSummaryComposer {
    private final OrderService orderService;
    private final CustomerService customerService;
    private final ShippingService shippingService;
    private final PaymentService paymentService;
    public OrderSummaryComposer(OrderService orderService, CustomerService customerService, ShippingService shippingService, PaymentService paymentService) {
        this.orderService = orderService; this.customerService = customerService; this.shippingService = shippingService; this.paymentService = paymentService;
    }
    public OrderSummaryResponse composeOrderSummary(String orderId) {
        System.out.println("Composing order summary for: " + orderId);
        Order order = orderService.getOrder(orderId);
        Customer customer = customerService.getCustomer("CUST-123");
        Shipping shipping = shippingService.getShipping(orderId);
        Payment payment = paymentService.getPayment(orderId);
        return new OrderSummaryResponse(order, customer, shipping, payment);
    }
}
class OrderSummaryResponse {
    private final Order order;
    private final Customer customer;
    private final Shipping shipping;
    private final Payment payment;
    public OrderSummaryResponse(Order order, Customer customer, Shipping shipping, Payment payment) {
        this.order = order; this.customer = customer; this.shipping = shipping; this.payment = payment;
    }
    public String toString() {
        return "Order Summary:\n  " + order + "\n  " + customer + "\n  " + shipping + "\n  " + payment + "\n";
    }
}
