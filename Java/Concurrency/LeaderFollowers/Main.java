package Concurrency.LeaderFollowers;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== LeaderFollowers Pattern Demo ===\n");
        LeaderFollowersImpl impl = new LeaderFollowersImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
