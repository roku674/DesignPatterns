import java.util.ArrayList;
import java.util.List;

/**
 * Client - manages Tree objects
 */
public class Forest {
    private List<Tree> trees = new ArrayList<>();

    public void plantTree(int x, int y, String name, String color, String texture) {
        TreeType type = TreeFactory.getTreeType(name, color, texture);
        Tree tree = new Tree(x, y, type);
        trees.add(tree);
    }

    public void draw() {
        System.out.println("\nDrawing forest with " + trees.size() + " trees:");
        for (Tree tree : trees) {
            tree.draw();
        }
    }

    public int getTreeCount() {
        return trees.size();
    }
}
