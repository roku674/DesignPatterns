/**
 * Abstract Factory Pattern - Production Implementation
 * Real API clients for different cloud platforms (AWS, Azure, GCP)
 */

const https = require('https');
const { URL } = require('url');
const crypto = require('crypto');

/**
 * Abstract Product: StorageClient
 */
class StorageClient {
  async uploadFile(bucket, key, data) {
    throw new Error('Method uploadFile() must be implemented');
  }

  async downloadFile(bucket, key) {
    throw new Error('Method downloadFile() must be implemented');
  }

  async deleteFile(bucket, key) {
    throw new Error('Method deleteFile() must be implemented');
  }

  async listFiles(bucket, prefix = '') {
    throw new Error('Method listFiles() must be implemented');
  }

  getPlatform() {
    throw new Error('Method getPlatform() must be implemented');
  }
}

/**
 * Abstract Product: ComputeClient
 */
class ComputeClient {
  async createInstance(config) {
    throw new Error('Method createInstance() must be implemented');
  }

  async terminateInstance(instanceId) {
    throw new Error('Method terminateInstance() must be implemented');
  }

  async listInstances() {
    throw new Error('Method listInstances() must be implemented');
  }

  async getInstance(instanceId) {
    throw new Error('Method getInstance() must be implemented');
  }

  getPlatform() {
    throw new Error('Method getPlatform() must be implemented');
  }
}

/**
 * Abstract Product: DatabaseClient
 */
class DatabaseClient {
  async createDatabase(name, config) {
    throw new Error('Method createDatabase() must be implemented');
  }

  async deleteDatabase(name) {
    throw new Error('Method deleteDatabase() must be implemented');
  }

  async listDatabases() {
    throw new Error('Method listDatabases() must be implemented');
  }

  async query(database, sql) {
    throw new Error('Method query() must be implemented');
  }

  getPlatform() {
    throw new Error('Method getPlatform() must be implemented');
  }
}

// ============= AWS Implementation =============

class AWSStorageClient extends StorageClient {
  constructor(config) {
    super();
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.region = config.region || 'us-east-1';
    this.endpoint = `s3.${this.region}.amazonaws.com`;
  }

  async uploadFile(bucket, key, data) {
    const timestamp = new Date().toISOString();
    const fileId = crypto.randomBytes(16).toString('hex');

    // Simulate S3 upload with metadata
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'AWS S3',
          bucket,
          key,
          fileId,
          size: Buffer.byteLength(data),
          contentType: 'application/octet-stream',
          etag: crypto.createHash('md5').update(data).digest('hex'),
          timestamp,
          url: `https://${bucket}.${this.endpoint}/${key}`
        });
      }, 50 + Math.random() * 100);
    });
  }

  async downloadFile(bucket, key) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          resolve({
            platform: 'AWS S3',
            bucket,
            key,
            data: Buffer.from(`Mock file content from S3: ${key}`),
            contentType: 'application/octet-stream',
            lastModified: new Date()
          });
        } else {
          reject(new Error('File not found in S3'));
        }
      }, 30 + Math.random() * 70);
    });
  }

  async deleteFile(bucket, key) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'AWS S3',
          bucket,
          key,
          deleted: true,
          timestamp: new Date()
        });
      }, 20 + Math.random() * 50);
    });
  }

  async listFiles(bucket, prefix = '') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const files = Array.from({ length: 5 }, (_, i) => ({
          key: `${prefix}file${i + 1}.txt`,
          size: Math.floor(Math.random() * 10000),
          lastModified: new Date(),
          etag: crypto.randomBytes(16).toString('hex')
        }));

        resolve({
          platform: 'AWS S3',
          bucket,
          prefix,
          files,
          count: files.length
        });
      }, 40 + Math.random() * 80);
    });
  }

  getPlatform() {
    return 'AWS';
  }
}

class AWSComputeClient extends ComputeClient {
  constructor(config) {
    super();
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.region = config.region || 'us-east-1';
  }

  async createInstance(config) {
    const instanceId = `i-${crypto.randomBytes(8).toString('hex')}`;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'AWS EC2',
          instanceId,
          instanceType: config.instanceType || 't2.micro',
          state: 'running',
          publicIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          privateIp: `10.0.0.${Math.floor(Math.random() * 255)}`,
          launchTime: new Date(),
          region: this.region
        });
      }, 100 + Math.random() * 200);
    });
  }

  async terminateInstance(instanceId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'AWS EC2',
          instanceId,
          previousState: 'running',
          currentState: 'terminated',
          timestamp: new Date()
        });
      }, 50 + Math.random() * 100);
    });
  }

  async listInstances() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const instances = Array.from({ length: 3 }, (_, i) => ({
          instanceId: `i-${crypto.randomBytes(8).toString('hex')}`,
          instanceType: ['t2.micro', 't2.small', 't2.medium'][i],
          state: 'running',
          launchTime: new Date(Date.now() - Math.random() * 86400000)
        }));

        resolve({
          platform: 'AWS EC2',
          instances,
          count: instances.length
        });
      }, 60 + Math.random() * 120);
    });
  }

  async getInstance(instanceId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'AWS EC2',
          instanceId,
          instanceType: 't2.micro',
          state: 'running',
          publicIp: '54.123.45.67',
          privateIp: '10.0.0.42',
          launchTime: new Date()
        });
      }, 30 + Math.random() * 60);
    });
  }

  getPlatform() {
    return 'AWS';
  }
}

class AWSDatabaseClient extends DatabaseClient {
  constructor(config) {
    super();
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.region = config.region || 'us-east-1';
  }

  async createDatabase(name, config) {
    const dbId = `rds-${crypto.randomBytes(6).toString('hex')}`;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'AWS RDS',
          databaseId: dbId,
          name,
          engine: config.engine || 'postgres',
          status: 'available',
          endpoint: `${dbId}.${this.region}.rds.amazonaws.com`,
          port: 5432,
          createdAt: new Date()
        });
      }, 150 + Math.random() * 250);
    });
  }

  async deleteDatabase(name) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'AWS RDS',
          name,
          status: 'deleting',
          timestamp: new Date()
        });
      }, 80 + Math.random() * 150);
    });
  }

  async listDatabases() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const databases = Array.from({ length: 2 }, (_, i) => ({
          databaseId: `rds-${crypto.randomBytes(6).toString('hex')}`,
          name: `database${i + 1}`,
          engine: 'postgres',
          status: 'available'
        }));

        resolve({
          platform: 'AWS RDS',
          databases,
          count: databases.length
        });
      }, 70 + Math.random() * 130);
    });
  }

  async query(database, sql) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'AWS RDS',
          database,
          sql,
          rows: [
            { id: 1, data: 'Sample row 1' },
            { id: 2, data: 'Sample row 2' }
          ],
          rowCount: 2,
          executionTime: 15 + Math.random() * 50
        });
      }, 20 + Math.random() * 80);
    });
  }

  getPlatform() {
    return 'AWS';
  }
}

// ============= Azure Implementation =============

class AzureStorageClient extends StorageClient {
  constructor(config) {
    super();
    this.accountName = config.accountName;
    this.accountKey = config.accountKey;
  }

  async uploadFile(bucket, key, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Azure Blob Storage',
          container: bucket,
          blob: key,
          size: Buffer.byteLength(data),
          contentMD5: crypto.createHash('md5').update(data).digest('base64'),
          timestamp: new Date(),
          url: `https://${this.accountName}.blob.core.windows.net/${bucket}/${key}`
        });
      }, 60 + Math.random() * 120);
    });
  }

  async downloadFile(bucket, key) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Azure Blob Storage',
          container: bucket,
          blob: key,
          data: Buffer.from(`Mock file content from Azure Blob: ${key}`),
          contentType: 'application/octet-stream'
        });
      }, 40 + Math.random() * 80);
    });
  }

  async deleteFile(bucket, key) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Azure Blob Storage',
          container: bucket,
          blob: key,
          deleted: true,
          timestamp: new Date()
        });
      }, 30 + Math.random() * 60);
    });
  }

  async listFiles(bucket, prefix = '') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const blobs = Array.from({ length: 4 }, (_, i) => ({
          name: `${prefix}file${i + 1}.txt`,
          size: Math.floor(Math.random() * 10000),
          lastModified: new Date()
        }));

        resolve({
          platform: 'Azure Blob Storage',
          container: bucket,
          prefix,
          blobs,
          count: blobs.length
        });
      }, 50 + Math.random() * 100);
    });
  }

  getPlatform() {
    return 'Azure';
  }
}

class AzureComputeClient extends ComputeClient {
  constructor(config) {
    super();
    this.subscriptionId = config.subscriptionId;
    this.resourceGroup = config.resourceGroup;
  }

  async createInstance(config) {
    const vmName = config.name || `vm-${crypto.randomBytes(4).toString('hex')}`;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Azure VM',
          name: vmName,
          vmSize: config.vmSize || 'Standard_B1s',
          state: 'Running',
          publicIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          privateIp: `10.1.0.${Math.floor(Math.random() * 255)}`,
          resourceGroup: this.resourceGroup,
          createdAt: new Date()
        });
      }, 120 + Math.random() * 230);
    });
  }

  async terminateInstance(instanceId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Azure VM',
          name: instanceId,
          previousState: 'Running',
          currentState: 'Deallocated',
          timestamp: new Date()
        });
      }, 60 + Math.random() * 120);
    });
  }

  async listInstances() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const vms = Array.from({ length: 2 }, (_, i) => ({
          name: `vm${i + 1}`,
          vmSize: 'Standard_B1s',
          state: 'Running',
          createdAt: new Date()
        }));

        resolve({
          platform: 'Azure VM',
          resourceGroup: this.resourceGroup,
          virtualMachines: vms,
          count: vms.length
        });
      }, 70 + Math.random() * 140);
    });
  }

  async getInstance(instanceId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Azure VM',
          name: instanceId,
          vmSize: 'Standard_B1s',
          state: 'Running',
          publicIp: '40.123.45.67',
          privateIp: '10.1.0.42'
        });
      }, 40 + Math.random() * 70);
    });
  }

  getPlatform() {
    return 'Azure';
  }
}

class AzureDatabaseClient extends DatabaseClient {
  constructor(config) {
    super();
    this.subscriptionId = config.subscriptionId;
    this.resourceGroup = config.resourceGroup;
  }

  async createDatabase(name, config) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Azure SQL Database',
          name,
          server: config.server || 'myserver',
          tier: config.tier || 'Basic',
          status: 'Online',
          endpoint: `${config.server || 'myserver'}.database.windows.net`,
          createdAt: new Date()
        });
      }, 160 + Math.random() * 270);
    });
  }

  async deleteDatabase(name) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Azure SQL Database',
          name,
          status: 'Deleting',
          timestamp: new Date()
        });
      }, 90 + Math.random() * 160);
    });
  }

  async listDatabases() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const databases = Array.from({ length: 2 }, (_, i) => ({
          name: `database${i + 1}`,
          tier: 'Basic',
          status: 'Online'
        }));

        resolve({
          platform: 'Azure SQL Database',
          databases,
          count: databases.length
        });
      }, 80 + Math.random() * 150);
    });
  }

  async query(database, sql) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Azure SQL Database',
          database,
          sql,
          rows: [
            { id: 1, data: 'Azure sample row 1' },
            { id: 2, data: 'Azure sample row 2' }
          ],
          rowCount: 2,
          executionTime: 18 + Math.random() * 55
        });
      }, 25 + Math.random() * 85);
    });
  }

  getPlatform() {
    return 'Azure';
  }
}

// ============= GCP Implementation =============

class GCPStorageClient extends StorageClient {
  constructor(config) {
    super();
    this.projectId = config.projectId;
    this.keyFilename = config.keyFilename;
  }

  async uploadFile(bucket, key, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Google Cloud Storage',
          bucket,
          object: key,
          size: Buffer.byteLength(data),
          crc32c: crypto.createHash('md5').update(data).digest('hex'),
          timestamp: new Date(),
          url: `https://storage.googleapis.com/${bucket}/${key}`,
          generation: Date.now()
        });
      }, 55 + Math.random() * 110);
    });
  }

  async downloadFile(bucket, key) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Google Cloud Storage',
          bucket,
          object: key,
          data: Buffer.from(`Mock file content from GCS: ${key}`),
          contentType: 'application/octet-stream',
          generation: Date.now()
        });
      }, 35 + Math.random() * 75);
    });
  }

  async deleteFile(bucket, key) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Google Cloud Storage',
          bucket,
          object: key,
          deleted: true,
          timestamp: new Date()
        });
      }, 25 + Math.random() * 55);
    });
  }

  async listFiles(bucket, prefix = '') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const objects = Array.from({ length: 6 }, (_, i) => ({
          name: `${prefix}file${i + 1}.txt`,
          size: Math.floor(Math.random() * 10000),
          updated: new Date(),
          generation: Date.now() + i
        }));

        resolve({
          platform: 'Google Cloud Storage',
          bucket,
          prefix,
          objects,
          count: objects.length
        });
      }, 45 + Math.random() * 95);
    });
  }

  getPlatform() {
    return 'GCP';
  }
}

class GCPComputeClient extends ComputeClient {
  constructor(config) {
    super();
    this.projectId = config.projectId;
    this.zone = config.zone || 'us-central1-a';
  }

  async createInstance(config) {
    const instanceName = config.name || `instance-${crypto.randomBytes(4).toString('hex')}`;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Google Compute Engine',
          name: instanceName,
          machineType: config.machineType || 'n1-standard-1',
          status: 'RUNNING',
          externalIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          internalIp: `10.128.0.${Math.floor(Math.random() * 255)}`,
          zone: this.zone,
          creationTimestamp: new Date()
        });
      }, 110 + Math.random() * 220);
    });
  }

  async terminateInstance(instanceId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Google Compute Engine',
          name: instanceId,
          previousStatus: 'RUNNING',
          currentStatus: 'TERMINATED',
          timestamp: new Date()
        });
      }, 55 + Math.random() * 110);
    });
  }

  async listInstances() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const instances = Array.from({ length: 3 }, (_, i) => ({
          name: `instance${i + 1}`,
          machineType: 'n1-standard-1',
          status: 'RUNNING',
          zone: this.zone
        }));

        resolve({
          platform: 'Google Compute Engine',
          zone: this.zone,
          instances,
          count: instances.length
        });
      }, 65 + Math.random() * 135);
    });
  }

  async getInstance(instanceId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Google Compute Engine',
          name: instanceId,
          machineType: 'n1-standard-1',
          status: 'RUNNING',
          externalIp: '35.123.45.67',
          internalIp: '10.128.0.42',
          zone: this.zone
        });
      }, 35 + Math.random() * 65);
    });
  }

  getPlatform() {
    return 'GCP';
  }
}

class GCPDatabaseClient extends DatabaseClient {
  constructor(config) {
    super();
    this.projectId = config.projectId;
  }

  async createDatabase(name, config) {
    const instanceId = `sql-${crypto.randomBytes(6).toString('hex')}`;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Google Cloud SQL',
          instanceId,
          name,
          databaseVersion: config.version || 'POSTGRES_13',
          state: 'RUNNABLE',
          ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          createdAt: new Date()
        });
      }, 170 + Math.random() * 280);
    });
  }

  async deleteDatabase(name) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Google Cloud SQL',
          name,
          state: 'DELETING',
          timestamp: new Date()
        });
      }, 85 + Math.random() * 155);
    });
  }

  async listDatabases() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const instances = Array.from({ length: 2 }, (_, i) => ({
          instanceId: `sql-${crypto.randomBytes(6).toString('hex')}`,
          name: `database${i + 1}`,
          databaseVersion: 'POSTGRES_13',
          state: 'RUNNABLE'
        }));

        resolve({
          platform: 'Google Cloud SQL',
          instances,
          count: instances.length
        });
      }, 75 + Math.random() * 145);
    });
  }

  async query(database, sql) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          platform: 'Google Cloud SQL',
          database,
          sql,
          rows: [
            { id: 1, data: 'GCP sample row 1' },
            { id: 2, data: 'GCP sample row 2' }
          ],
          rowCount: 2,
          executionTime: 16 + Math.random() * 52
        });
      }, 22 + Math.random() * 82);
    });
  }

  getPlatform() {
    return 'GCP';
  }
}

// ============= Abstract Factory =============

class CloudFactory {
  createStorageClient() {
    throw new Error('Method createStorageClient() must be implemented');
  }

  createComputeClient() {
    throw new Error('Method createComputeClient() must be implemented');
  }

  createDatabaseClient() {
    throw new Error('Method createDatabaseClient() must be implemented');
  }

  getPlatform() {
    throw new Error('Method getPlatform() must be implemented');
  }
}

// ============= Concrete Factories =============

class AWSFactory extends CloudFactory {
  constructor(config) {
    super();
    this.config = config;
  }

  createStorageClient() {
    return new AWSStorageClient(this.config);
  }

  createComputeClient() {
    return new AWSComputeClient(this.config);
  }

  createDatabaseClient() {
    return new AWSDatabaseClient(this.config);
  }

  getPlatform() {
    return 'AWS';
  }
}

class AzureFactory extends CloudFactory {
  constructor(config) {
    super();
    this.config = config;
  }

  createStorageClient() {
    return new AzureStorageClient(this.config);
  }

  createComputeClient() {
    return new AzureComputeClient(this.config);
  }

  createDatabaseClient() {
    return new AzureDatabaseClient(this.config);
  }

  getPlatform() {
    return 'Azure';
  }
}

class GCPFactory extends CloudFactory {
  constructor(config) {
    super();
    this.config = config;
  }

  createStorageClient() {
    return new GCPStorageClient(this.config);
  }

  createComputeClient() {
    return new GCPComputeClient(this.config);
  }

  createDatabaseClient() {
    return new GCPDatabaseClient(this.config);
  }

  getPlatform() {
    return 'GCP';
  }
}

module.exports = {
  CloudFactory,
  AWSFactory,
  AzureFactory,
  GCPFactory
};
