package Microservices.ServerSidePageFragmentComposition;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Server-Side Page Fragment Composition ===\n");
        
        FragmentService headerService = new FragmentService("Header", "<header>Site Header</header>");
        FragmentService catalogService = new FragmentService("Catalog", "<div>Product Catalog</div>");
        FragmentService footerService = new FragmentService("Footer", "<footer>Site Footer</footer>");
        
        PageComposer composer = new PageComposer();
        composer.addFragment(headerService);
        composer.addFragment(catalogService);
        composer.addFragment(footerService);
        
        String page = composer.composePage();
        System.out.println("\n=== Composed Page ===");
        System.out.println(page);
    }
}
