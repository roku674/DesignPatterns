package Microservices.ClientSideUIComposition;
import java.util.*;
public class UIComposer {
    private List<MicroFrontend> components = new ArrayList<>();
    
    public void addComponent(MicroFrontend component) {
        components.add(component);
        System.out.println("Added component: " + component.getName());
    }
    
    public void renderPage() {
        System.out.println("\nComposing page in browser:");
        components.forEach(MicroFrontend::render);
        System.out.println("Page rendered successfully!");
    }
}
