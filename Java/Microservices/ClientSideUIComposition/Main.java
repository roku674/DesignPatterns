package Microservices.ClientSideUIComposition;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Client-Side UI Composition Pattern ===\n");
        
        MicroFrontend header = new MicroFrontend("Header", "http://cdn.example.com/header.js");
        MicroFrontend catalog = new MicroFrontend("Catalog", "http://cdn.example.com/catalog.js");
        MicroFrontend cart = new MicroFrontend("Cart", "http://cdn.example.com/cart.js");
        
        UIComposer composer = new UIComposer();
        composer.addComponent(header);
        composer.addComponent(catalog);
        composer.addComponent(cart);
        
        composer.renderPage();
    }
}
