const { Book, BookCollection } = require('./collection');

console.log('=== Iterator Pattern Demo ===\n');

const collection = new BookCollection();
collection.addBook(new Book('1984', 'George Orwell', 1949));
collection.addBook(new Book('To Kill a Mockingbird', 'Harper Lee', 1960));
collection.addBook(new Book('The Great Gatsby', 'F. Scott Fitzgerald', 1925));

const iterator = collection.createIterator();

console.log('Iterating through books:');
while (iterator.hasNext()) {
  const book = iterator.next();
  console.log(`- ${book.title} by ${book.author} (${book.year})`);
}

console.log('\n=== Demo Complete ===');
