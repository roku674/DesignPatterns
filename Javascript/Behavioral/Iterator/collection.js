/**
 * Iterator Pattern - Book Collection
 */

class Book {
  constructor(title, author, year) {
    this.title = title;
    this.author = author;
    this.year = year;
  }
}

class Iterator {
  hasNext() { throw new Error('hasNext() must be implemented'); }
  next() { throw new Error('next() must be implemented'); }
}

class BookIterator extends Iterator {
  constructor(books) {
    super();
    this.books = books;
    this.index = 0;
  }

  hasNext() {
    return this.index < this.books.length;
  }

  next() {
    return this.hasNext() ? this.books[this.index++] : null;
  }
}

class BookCollection {
  constructor() {
    this.books = [];
  }

  addBook(book) {
    this.books.push(book);
  }

  createIterator() {
    return new BookIterator(this.books);
  }
}

module.exports = { Book, BookCollection };
