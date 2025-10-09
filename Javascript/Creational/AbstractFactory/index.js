/**
 * Abstract Factory Pattern - Production Demo
 * Demonstrates real cloud platform API clients (AWS, Azure, GCP)
 */

const {
  AWSFactory,
  AzureFactory,
  GCPFactory
} = require('./ui-factory');

async function main() {
  console.log('=== Abstract Factory Pattern - Production Implementation ===\n');

  // Example 1: Using AWS Cloud Services
  console.log('--- Example 1: AWS Cloud Platform ---\n');

  const awsFactory = new AWSFactory({
    accessKeyId: 'AWS_ACCESS_KEY_ID',
    secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
    region: 'us-east-1'
  });

  console.log(`Platform: ${awsFactory.getPlatform()}\n`);

  // Create AWS clients
  const awsStorage = awsFactory.createStorageClient();
  const awsCompute = awsFactory.createComputeClient();
  const awsDatabase = awsFactory.createDatabaseClient();

  // Use AWS Storage
  const uploadResult = await awsStorage.uploadFile(
    'my-bucket',
    'documents/report.pdf',
    Buffer.from('Sample PDF content')
  );
  console.log('AWS S3 Upload:', uploadResult);

  // Use AWS Compute
  const instance = await awsCompute.createInstance({
    instanceType: 't2.micro'
  });
  console.log('\nAWS EC2 Instance Created:', instance);

  // Use AWS Database
  const dbQuery = await awsDatabase.query('users_db', 'SELECT * FROM users LIMIT 10');
  console.log('\nAWS RDS Query:', dbQuery);

  // Example 2: Using Azure Cloud Services
  console.log('\n\n--- Example 2: Azure Cloud Platform ---\n');

  const azureFactory = new AzureFactory({
    subscriptionId: 'azure-subscription-id',
    resourceGroup: 'my-resource-group',
    accountName: 'mystorageaccount',
    accountKey: 'storage-account-key'
  });

  console.log(`Platform: ${azureFactory.getPlatform()}\n`);

  // Create Azure clients
  const azureStorage = azureFactory.createStorageClient();
  const azureCompute = azureFactory.createComputeClient();
  const azureDatabase = azureFactory.createDatabaseClient();

  // Use Azure Storage
  const azureUpload = await azureStorage.uploadFile(
    'documents',
    'presentation.pptx',
    Buffer.from('Sample presentation content')
  );
  console.log('Azure Blob Upload:', azureUpload);

  // Use Azure Compute
  const azureVm = await azureCompute.createInstance({
    name: 'web-server-vm',
    vmSize: 'Standard_B1s'
  });
  console.log('\nAzure VM Created:', azureVm);

  // Use Azure Database
  const azureQuery = await azureDatabase.query('orders_db', 'SELECT COUNT(*) FROM orders');
  console.log('\nAzure SQL Query:', azureQuery);

  // Example 3: Using GCP Cloud Services
  console.log('\n\n--- Example 3: Google Cloud Platform ---\n');

  const gcpFactory = new GCPFactory({
    projectId: 'my-gcp-project',
    keyFilename: 'service-account-key.json',
    zone: 'us-central1-a'
  });

  console.log(`Platform: ${gcpFactory.getPlatform()}\n`);

  // Create GCP clients
  const gcpStorage = gcpFactory.createStorageClient();
  const gcpCompute = gcpFactory.createComputeClient();
  const gcpDatabase = gcpFactory.createDatabaseClient();

  // Use GCP Storage
  const gcpUpload = await gcpStorage.uploadFile(
    'backups',
    'database-backup.sql',
    Buffer.from('Sample database backup')
  );
  console.log('GCP Cloud Storage Upload:', gcpUpload);

  // Use GCP Compute
  const gcpInstance = await gcpCompute.createInstance({
    name: 'app-server',
    machineType: 'n1-standard-1'
  });
  console.log('\nGCP Compute Engine Instance:', gcpInstance);

  // Use GCP Database
  const gcpQuery = await gcpDatabase.query('analytics_db', 'SELECT AVG(views) FROM pages');
  console.log('\nGCP Cloud SQL Query:', gcpQuery);

  // Example 4: Cloud Agnostic Application
  console.log('\n\n--- Example 4: Cloud-Agnostic Application ---\n');

  async function deployApplication(cloudFactory, appName) {
    console.log(`Deploying ${appName} on ${cloudFactory.getPlatform()}...`);

    // Same code works with any cloud provider
    const storage = cloudFactory.createStorageClient();
    const compute = cloudFactory.createComputeClient();
    const database = cloudFactory.createDatabaseClient();

    // Upload application files
    await storage.uploadFile('apps', `${appName}/app.zip`, Buffer.from('App package'));
    console.log(`  - Application files uploaded`);

    // Create compute instance
    const instance = await compute.createInstance({ name: appName });
    console.log(`  - Compute instance created: ${instance.instanceId || instance.name}`);

    // Create database
    const db = await database.createDatabase(`${appName}_db`, { engine: 'postgres' });
    console.log(`  - Database created: ${db.name}`);

    console.log(`Deployment complete on ${cloudFactory.getPlatform()}\n`);
  }

  // Deploy to all cloud providers with the same code
  await deployApplication(awsFactory, 'my-app');
  await deployApplication(azureFactory, 'my-app');
  await deployApplication(gcpFactory, 'my-app');

  // Example 5: Multi-Cloud Strategy
  console.log('\n--- Example 5: Multi-Cloud Strategy ---\n');

  async function multiCloudBackup(data) {
    console.log('Backing up data to multiple cloud providers...\n');

    const factories = [awsFactory, azureFactory, gcpFactory];
    const results = [];

    for (const factory of factories) {
      const storage = factory.createStorageClient();
      const result = await storage.uploadFile(
        'backups',
        'critical-data.backup',
        data
      );
      results.push({
        platform: factory.getPlatform(),
        success: true,
        url: result.url
      });
      console.log(`  ${factory.getPlatform()}: Backup successful`);
    }

    return results;
  }

  const backupData = Buffer.from('Critical application data');
  const backupResults = await multiCloudBackup(backupData);
  console.log('\nBackup Summary:', backupResults.map(r => r.platform).join(', '));

  // Example 6: Pattern Benefits
  console.log('\n\n--- Example 6: Pattern Benefits ---\n');

  console.log('Benefits of Abstract Factory Pattern:');
  console.log('  1. Platform Independence: Same code works across AWS, Azure, GCP');
  console.log('  2. Consistency: All related objects (storage, compute, database) from same platform');
  console.log('  3. Easy Switching: Change cloud provider by swapping factory');
  console.log('  4. Encapsulation: Platform-specific implementation details hidden');
  console.log('  5. Multi-Cloud: Easy to support multiple cloud providers simultaneously');

  console.log('\n=== Demo Complete ===');
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
