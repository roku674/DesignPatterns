/**
 * Composite Pattern - Demo
 */

const { File, Directory } = require('./file-system');

console.log('=== Composite Pattern Demo ===\n');

// Example 1: Building a file system tree
console.log('=== Example 1: Building File System ===\n');

// Create root directory
const root = new Directory('root');

// Create documents directory with files
const documents = new Directory('documents');
documents
  .add(new File('report.pdf', 2048000))
  .add(new File('presentation.pptx', 5120000))
  .add(new File('notes.txt', 1024));

// Create work subdirectory
const work = new Directory('work');
work
  .add(new File('project.docx', 512000))
  .add(new File('budget.xlsx', 256000));

documents.add(work);

// Create photos directory
const photos = new Directory('photos');
photos
  .add(new File('vacation.jpg', 3072000))
  .add(new File('family.jpg', 2560000))
  .add(new File('sunset.jpg', 4096000));

// Create code directory
const code = new Directory('code');
code
  .add(new File('main.js', 8192))
  .add(new File('utils.js', 4096))
  .add(new File('README.md', 2048));

const src = new Directory('src');
src
  .add(new File('index.js', 16384))
  .add(new File('app.js', 32768));

code.add(src);

// Add all to root
root
  .add(documents)
  .add(photos)
  .add(code);

// Print entire tree structure
console.log('File System Structure:');
root.print();

// Example 2: Calculating sizes
console.log('\n=== Example 2: Calculating Sizes ===\n');

console.log(`Total size of root: ${(root.getSize() / (1024 * 1024)).toFixed(2)} MB`);
console.log(`Size of documents: ${(documents.getSize() / (1024 * 1024)).toFixed(2)} MB`);
console.log(`Size of photos: ${(photos.getSize() / (1024 * 1024)).toFixed(2)} MB`);
console.log(`Size of code: ${(code.getSize() / 1024).toFixed(2)} KB`);

// Example 3: Counting files and directories
console.log('\n=== Example 3: Counting Files and Directories ===\n');

console.log(`Total files: ${root.getFileCount()}`);
console.log(`Total directories: ${root.getDirectoryCount()}`);
console.log(`Files in documents: ${documents.getFileCount()}`);
console.log(`Files in photos: ${photos.getFileCount()}`);

// Example 4: Searching by extension
console.log('\n=== Example 4: Finding Files by Extension ===\n');

const jsFiles = root.findByExtension('js');
console.log(`Found ${jsFiles.length} JavaScript files:`);
jsFiles.forEach(file => console.log(`  - ${file.getName()}`));

const imageFiles = root.findByExtension('jpg');
console.log(`\nFound ${imageFiles.length} JPG files:`);
imageFiles.forEach(file => console.log(`  - ${file.getName()}`));

// Example 5: Finding large files
console.log('\n=== Example 5: Finding Large Files (> 1 MB) ===\n');

const largeFiles = root.findLargeFiles(1024 * 1024);
console.log(`Found ${largeFiles.length} large files:`);
largeFiles.forEach(file => {
  console.log(`  - ${file.getName()}: ${(file.getSize() / (1024 * 1024)).toFixed(2)} MB`);
});

// Example 6: Treating leaves and composites uniformly
console.log('\n=== Example 6: Uniform Treatment ===\n');

function printNodeInfo(node) {
  console.log(`Name: ${node.getName()}`);
  console.log(`Size: ${(node.getSize() / 1024).toFixed(2)} KB`);
  console.log(`Type: ${node.constructor.name}`);
  console.log();
}

console.log('--- File (Leaf) ---');
const singleFile = new File('example.txt', 1024);
printNodeInfo(singleFile);

console.log('--- Directory (Composite) ---');
printNodeInfo(documents);

// Example 7: Modifying the tree
console.log('=== Example 7: Modifying the Tree ===\n');

console.log('Adding new files to photos directory:');
photos.add(new File('birthday.jpg', 2048000));
photos.add(new File('wedding.jpg', 3584000));

console.log('\nUpdated photos directory:');
photos.print();

console.log(`\nNew size: ${(photos.getSize() / (1024 * 1024)).toFixed(2)} MB`);

// Example 8: Practical use case - backup size calculator
console.log('\n=== Example 8: Backup Size Calculator ===\n');

function calculateBackupSize(directories) {
  const totalSize = directories.reduce((sum, dir) => sum + dir.getSize(), 0);
  const totalFiles = directories.reduce((sum, dir) => sum + dir.getFileCount(), 0);

  return {
    size: totalSize,
    files: totalFiles,
    formattedSize: (totalSize / (1024 * 1024)).toFixed(2) + ' MB'
  };
}

const backupDirs = [documents, photos];
const backupInfo = calculateBackupSize(backupDirs);

console.log('Backup Plan: Documents + Photos');
console.log(`Total size: ${backupInfo.formattedSize}`);
console.log(`Total files: ${backupInfo.files}`);

console.log('\n=== Demo Complete ===');
