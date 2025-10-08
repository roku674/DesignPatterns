/**
 * Template Method Pattern - Data Processing
 */

class DataProcessor {
  // Template Method
  process() {
    this.readData();
    this.processData();
    this.saveData();
  }

  readData() {
    throw new Error('readData() must be implemented');
  }

  processData() {
    throw new Error('processData() must be implemented');
  }

  saveData() {
    throw new Error('saveData() must be implemented');
  }
}

class CSVProcessor extends DataProcessor {
  readData() {
    console.log('[CSV] Reading data from CSV file');
  }

  processData() {
    console.log('[CSV] Processing CSV data');
  }

  saveData() {
    console.log('[CSV] Saving to database');
  }
}

class JSONProcessor extends DataProcessor {
  readData() {
    console.log('[JSON] Reading data from JSON file');
  }

  processData() {
    console.log('[JSON] Processing JSON data');
  }

  saveData() {
    console.log('[JSON] Saving to database');
  }
}

module.exports = { CSVProcessor, JSONProcessor };
