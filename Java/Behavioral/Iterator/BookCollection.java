import java.util.ArrayList;
import java.util.List;

/** Concrete Collection */
public class BookCollection implements Collection<String> {
    private List<String> books = new ArrayList<>();

    public void addBook(String book) {
        books.add(book);
    }

    @Override
    public Iterator<String> createIterator() {
        return new BookIterator(books);
    }

    private class BookIterator implements Iterator<String> {
        private List<String> books;
        private int position = 0;

        public BookIterator(List<String> books) {
            this.books = books;
        }

        @Override
        public boolean hasNext() {
            return position < books.size();
        }

        @Override
        public String next() {
            if (hasNext()) {
                return books.get(position++);
            }
            return null;
        }
    }
}
