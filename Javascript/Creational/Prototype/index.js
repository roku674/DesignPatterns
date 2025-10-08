/**
 * Prototype Pattern - Demo
 * Demonstrates cloning documents instead of creating from scratch
 */

const {
  Document,
  ReportDocument,
  TemplateDocument,
  DocumentRegistry
} = require('./document-prototype');

console.log('=== Prototype Pattern Demo ===\n');

// Example 1: Simple document cloning
console.log('--- Example 1: Basic Document Cloning ---\n');

const originalDoc = new Document(
  'Project Proposal',
  'This is a comprehensive proposal for our new project...',
  {
    author: 'John Doe',
    tags: ['proposal', 'project', 'planning']
  }
);

console.log('Original Document:');
console.log(originalDoc.display());

// Clone the document
const clonedDoc = originalDoc.clone();
clonedDoc.title = 'Project Proposal - Copy';
clonedDoc.addTag('draft');

console.log('\nCloned Document (modified):');
console.log(clonedDoc.display());

console.log('\nOriginal remains unchanged:');
console.log(originalDoc.display());

// Example 2: Cloning complex report documents
console.log('\n\n--- Example 2: Cloning Report Documents ---\n');

const quarterlyReport = new ReportDocument(
  'Q4 2024 Financial Report',
  'Executive summary of Q4 financial performance...',
  {
    author: 'Jane Smith',
    tags: ['financial', 'quarterly', '2024'],
    confidential: true
  }
);

quarterlyReport.addSection('Revenue', { total: 5000000, growth: '15%' });
quarterlyReport.addSection('Expenses', { total: 3500000, growth: '8%' });
quarterlyReport.addChart('bar', { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [4M, 4.2M, 4.5M, 5M] });

console.log('Original Report:');
console.log(quarterlyReport.display());

// Clone and modify for next quarter
const nextQuarterReport = quarterlyReport.clone();
nextQuarterReport.title = 'Q1 2025 Financial Report';
nextQuarterReport.sections = []; // Reset sections for new quarter
nextQuarterReport.addSection('Revenue', { total: 5200000, growth: '4%' });

console.log('\nCloned Report (modified for Q1 2025):');
console.log(nextQuarterReport.display());

// Example 3: Using templates with placeholders
console.log('\n\n--- Example 3: Document Templates ---\n');

const emailTemplate = new TemplateDocument(
  'Welcome Email Template',
  'Dear {{name}},\n\nWelcome to {{company}}! We are excited to have you on board.\n\nYour employee ID is: {{employeeId}}\n\nBest regards,\n{{hrManager}}',
  {
    author: 'HR Department',
    tags: ['email', 'template', 'onboarding'],
    placeholders: ['name', 'company', 'employeeId', 'hrManager'],
    category: 'HR'
  }
);

console.log('Email Template:');
console.log(emailTemplate.display());

// Clone and fill for different employees
const employee1Email = emailTemplate.clone();
const filledContent1 = employee1Email.fillPlaceholders({
  name: 'Alice Johnson',
  company: 'Tech Corp',
  employeeId: 'TC-2024-001',
  hrManager: 'Sarah Williams'
});

console.log('\nFilled Email for Employee 1:');
console.log(filledContent1);

const employee2Email = emailTemplate.clone();
const filledContent2 = employee2Email.fillPlaceholders({
  name: 'Bob Martinez',
  company: 'Tech Corp',
  employeeId: 'TC-2024-002',
  hrManager: 'Sarah Williams'
});

console.log('\nFilled Email for Employee 2:');
console.log(filledContent2);

// Example 4: Using Prototype Registry
console.log('\n\n--- Example 4: Prototype Registry ---\n');

const registry = new DocumentRegistry();

// Register various document prototypes
registry.register('standard-proposal', new Document(
  'Proposal Template',
  'Template content for proposals...',
  { author: 'Template Library', tags: ['proposal', 'template'] }
));

registry.register('financial-report', new ReportDocument(
  'Financial Report Template',
  'Template for financial reports...',
  { author: 'Finance Team', tags: ['finance', 'template'], confidential: true }
));

registry.register('welcome-email', emailTemplate);

console.log('Registered prototypes:');
console.log(registry.list());

// Create documents from registry
console.log('\nCreating documents from registry:');

const newProposal = registry.create('standard-proposal');
newProposal.title = 'New Client Proposal';
console.log('\n' + newProposal.display());

const newReport = registry.create('financial-report');
newReport.title = 'Monthly Financial Report - March 2025';
console.log('\n' + newReport.display());

// Example 5: Performance comparison
console.log('\n\n--- Example 5: Performance Comparison ---\n');

console.time('Creating 1000 documents from scratch');
for (let i = 0; i < 1000; i++) {
  new ReportDocument(
    'Report ' + i,
    'Content for report ' + i,
    { author: 'System', tags: ['auto-generated'], confidential: false }
  );
}
console.timeEnd('Creating 1000 documents from scratch');

const prototypeReport = new ReportDocument(
  'Prototype Report',
  'Prototype content',
  { author: 'System', tags: ['auto-generated'], confidential: false }
);

console.time('Cloning 1000 documents from prototype');
for (let i = 0; i < 1000; i++) {
  const clone = prototypeReport.clone();
  clone.title = 'Report ' + i;
}
console.timeEnd('Cloning 1000 documents from prototype');

console.log('\nCloning is typically faster for complex objects!');
