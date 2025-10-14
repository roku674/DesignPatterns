package Microservices.ServiceIntegrationContractTest;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Service Integration Contract Test ===\n");
        
        ContractTest test = new ContractTest();
        test.testOrderServiceContract();
        test.testPaymentServiceContract();
    }
}
