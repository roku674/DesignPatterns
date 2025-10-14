package Microservices.ServerSidePageFragmentComposition;
import java.util.*;
public class PageComposer {
    private List<FragmentService> fragments = new ArrayList<>();
    
    public void addFragment(FragmentService fragment) {
        fragments.add(fragment);
    }
    
    public String composePage() {
        System.out.println("Composing page from fragments...");
        StringBuilder page = new StringBuilder();
        page.append("<html><body>\n");
        
        for (FragmentService fragment : fragments) {
            String html = fragment.renderFragment();
            page.append("  ").append(html).append("\n");
        }
        
        page.append("</body></html>");
        return page.toString();
    }
}
