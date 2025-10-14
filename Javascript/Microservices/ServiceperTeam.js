/**
 * Service per Team Pattern (Alternative Implementation)
 *
 * This is an alternative implementation of the Service Per Team pattern that focuses
 * on team-based service isolation with emphasis on autonomous deployment, resource
 * management, and team-specific infrastructure. This pattern allows each team to
 * have complete control over their service lifecycle, technology choices, and
 * deployment strategies.
 *
 * Key Components:
 * - TeamServiceCluster: Manages all services for a single team
 * - ResourceQuota: Controls resource allocation per team
 * - DeploymentPipeline: Team-specific CI/CD pipeline
 * - TeamAPIGateway: Team-owned API gateway
 *
 * Benefits:
 * - Complete team autonomy
 * - Independent deployment cycles
 * - Technology freedom per team
 * - Resource isolation and quota management
 * - Team-specific monitoring and logging
 *
 * Use Cases:
 * - Organizations practicing Conway's Law
 * - Multi-tenant platforms
 * - Large-scale enterprise systems
 * - Teams with different technology stacks
 */

const EventEmitter = require('events');
const http = require('http');

/**
 * ResourceQuota - Manages resource allocation for a team
 */
class ResourceQuota {
    constructor(config) {
        this.teamId = config.teamId;
        this.limits = {
            maxServices: config.maxServices || 10,
            maxCPU: config.maxCPU || 16, // CPU cores
            maxMemory: config.maxMemory || 32768, // MB
            maxStorage: config.maxStorage || 102400, // MB
            maxInstances: config.maxInstances || 50
        };
        this.usage = {
            services: 0,
            cpu: 0,
            memory: 0,
            storage: 0,
            instances: 0
        };
    }

    /**
     * Check if resource allocation is within limits
     */
    canAllocate(resource) {
        if (this.usage.services >= this.limits.maxServices) {
            return { allowed: false, reason: 'Max services limit reached' };
        }

        const requiredCPU = resource.cpu || 0;
        const requiredMemory = resource.memory || 0;
        const requiredStorage = resource.storage || 0;

        if (this.usage.cpu + requiredCPU > this.limits.maxCPU) {
            return { allowed: false, reason: 'Insufficient CPU quota' };
        }

        if (this.usage.memory + requiredMemory > this.limits.maxMemory) {
            return { allowed: false, reason: 'Insufficient memory quota' };
        }

        if (this.usage.storage + requiredStorage > this.limits.maxStorage) {
            return { allowed: false, reason: 'Insufficient storage quota' };
        }

        return { allowed: true };
    }

    /**
     * Allocate resources
     */
    allocate(resource) {
        this.usage.services += 1;
        this.usage.cpu += resource.cpu || 0;
        this.usage.memory += resource.memory || 0;
        this.usage.storage += resource.storage || 0;
        this.usage.instances += resource.instances || 1;
    }

    /**
     * Release resources
     */
    release(resource) {
        this.usage.services -= 1;
        this.usage.cpu -= resource.cpu || 0;
        this.usage.memory -= resource.memory || 0;
        this.usage.storage -= resource.storage || 0;
        this.usage.instances -= resource.instances || 1;
    }

    /**
     * Get quota utilization percentage
     */
    getUtilization() {
        return {
            services: (this.usage.services / this.limits.maxServices) * 100,
            cpu: (this.usage.cpu / this.limits.maxCPU) * 100,
            memory: (this.usage.memory / this.limits.maxMemory) * 100,
            storage: (this.usage.storage / this.limits.maxStorage) * 100
        };
    }

    /**
     * Get quota information
     */
    getInfo() {
        return {
            teamId: this.teamId,
            limits: this.limits,
            usage: this.usage,
            utilization: this.getUtilization()
        };
    }
}

/**
 * DeploymentPipeline - Team-specific deployment pipeline
 */
class DeploymentPipeline extends EventEmitter {
    constructor(config) {
        super();
        this.teamId = config.teamId;
        this.stages = config.stages || ['build', 'test', 'deploy'];
        this.deploymentHistory = [];
        this.approvers = config.approvers || [];
    }

    /**
     * Execute deployment pipeline
     */
    async deploy(service, version) {
        const deploymentId = this.generateDeploymentId();

        console.log(`[Pipeline ${this.teamId}] Starting deployment ${deploymentId}`);

        const deployment = {
            id: deploymentId,
            service: service.name,
            version: version,
            teamId: this.teamId,
            status: 'in-progress',
            stages: [],
            startedAt: new Date()
        };

        this.deploymentHistory.push(deployment);
        this.emit('deploymentStarted', deployment);

        // Execute each stage
        for (const stageName of this.stages) {
            const stageResult = await this.executeStage(stageName, service, version);

            deployment.stages.push(stageResult);

            if (!stageResult.passed) {
                deployment.status = 'failed';
                deployment.completedAt = new Date();
                this.emit('deploymentFailed', deployment);
                return deployment;
            }
        }

        deployment.status = 'success';
        deployment.completedAt = new Date();
        this.emit('deploymentSuccess', deployment);

        console.log(`[Pipeline ${this.teamId}] Deployment ${deploymentId} completed`);

        return deployment;
    }

    /**
     * Execute a single pipeline stage
     */
    async executeStage(stageName, service, version) {
        console.log(`[Pipeline ${this.teamId}] Executing stage: ${stageName}`);

        const stage = {
            name: stageName,
            startedAt: new Date(),
            passed: true,
            output: ''
        };

        // Simulate stage execution
        await new Promise(resolve => setTimeout(resolve, 100));

        // Simulate occasional failures
        if (Math.random() < 0.05) { // 5% failure rate
            stage.passed = false;
            stage.output = `Stage ${stageName} failed`;
        } else {
            stage.output = `Stage ${stageName} completed successfully`;
        }

        stage.completedAt = new Date();

        return stage;
    }

    /**
     * Generate deployment ID
     */
    generateDeploymentId() {
        return `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get deployment history
     */
    getHistory(limit = 10) {
        return this.deploymentHistory.slice(-limit);
    }

    /**
     * Get deployment statistics
     */
    getStatistics() {
        const total = this.deploymentHistory.length;
        const successful = this.deploymentHistory.filter(d => d.status === 'success').length;
        const failed = this.deploymentHistory.filter(d => d.status === 'failed').length;

        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? (successful / total) * 100 : 0
        };
    }
}

/**
 * TeamAPIGateway - Team-owned API gateway
 */
class TeamAPIGateway extends EventEmitter {
    constructor(config) {
        super();
        this.teamId = config.teamId;
        this.port = config.port;
        this.host = config.host || 'localhost';
        this.routes = new Map();
        this.middleware = [];
        this.server = null;
    }

    /**
     * Register a route to a service
     */
    registerRoute(path, serviceUrl, methods = ['GET']) {
        this.routes.set(path, {
            serviceUrl,
            methods,
            registeredAt: new Date()
        });

        console.log(`[Gateway ${this.teamId}] Route registered: ${path} -> ${serviceUrl}`);
    }

    /**
     * Add middleware
     */
    use(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * Start the gateway
     */
    async start() {
        console.log(`[Gateway ${this.teamId}] Starting on ${this.host}:${this.port}`);

        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        await new Promise((resolve) => {
            this.server.listen(this.port, this.host, () => {
                console.log(`[Gateway ${this.teamId}] Listening on ${this.host}:${this.port}`);
                resolve();
            });
        });
    }

    /**
     * Stop the gateway
     */
    async stop() {
        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(resolve);
            });
        }
        console.log(`[Gateway ${this.teamId}] Stopped`);
    }

    /**
     * Handle incoming requests
     */
    async handleRequest(req, res) {
        const path = req.url;

        // Apply middleware
        for (const middleware of this.middleware) {
            await middleware(req, res);
        }

        // Find matching route
        const route = this.routes.get(path);

        if (!route) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Route not found' }));
            return;
        }

        // Check method
        if (!route.methods.includes(req.method)) {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
        }

        // Forward request to service
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: `Request forwarded to ${route.serviceUrl}`,
            team: this.teamId,
            timestamp: new Date()
        }));
    }

    /**
     * Get gateway statistics
     */
    getStatistics() {
        return {
            teamId: this.teamId,
            routeCount: this.routes.size,
            middlewareCount: this.middleware.length
        };
    }
}

/**
 * TeamService - Service within a team cluster
 */
class TeamService {
    constructor(config) {
        this.id = config.id || this.generateId();
        this.name = config.name;
        this.teamId = config.teamId;
        this.version = config.version || '1.0.0';
        this.port = config.port;
        this.resources = config.resources || { cpu: 1, memory: 512, storage: 1024 };
        this.technology = config.technology || 'nodejs';
        this.metadata = config.metadata || {};
        this.server = null;
        this.status = 'stopped';
    }

    /**
     * Generate service ID
     */
    generateId() {
        return `svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Start the service
     */
    async start() {
        console.log(`[Service ${this.name}] Starting (Team: ${this.teamId})...`);

        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        await new Promise((resolve) => {
            this.server.listen(this.port, () => {
                this.status = 'running';
                console.log(`[Service ${this.name}] Running on port ${this.port}`);
                resolve();
            });
        });
    }

    /**
     * Stop the service
     */
    async stop() {
        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(() => {
                    this.status = 'stopped';
                    resolve();
                });
            });
        }
        console.log(`[Service ${this.name}] Stopped`);
    }

    /**
     * Handle HTTP requests
     */
    handleRequest(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            service: this.name,
            team: this.teamId,
            version: this.version,
            timestamp: new Date()
        }));
    }

    /**
     * Get service information
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            teamId: this.teamId,
            version: this.version,
            port: this.port,
            resources: this.resources,
            technology: this.technology,
            status: this.status,
            metadata: this.metadata
        };
    }
}

/**
 * TeamServiceCluster - Manages all services for a team
 */
class TeamServiceCluster extends EventEmitter {
    constructor(config) {
        super();
        this.teamId = config.teamId;
        this.teamName = config.teamName;
        this.services = new Map();
        this.quota = new ResourceQuota({
            teamId: this.teamId,
            ...config.quota
        });
        this.pipeline = new DeploymentPipeline({
            teamId: this.teamId,
            ...config.pipeline
        });
        this.gateway = new TeamAPIGateway({
            teamId: this.teamId,
            port: config.gatewayPort
        });
        this.policies = config.policies || {};
    }

    /**
     * Add a service to the cluster
     */
    async addService(serviceConfig) {
        const service = new TeamService({
            ...serviceConfig,
            teamId: this.teamId
        });

        // Check resource quota
        const canAllocate = this.quota.canAllocate(service.resources);

        if (!canAllocate.allowed) {
            throw new Error(`Cannot add service: ${canAllocate.reason}`);
        }

        // Allocate resources
        this.quota.allocate(service.resources);

        // Add to cluster
        this.services.set(service.id, service);

        // Register route in gateway
        this.gateway.registerRoute(`/${service.name}`, `http://localhost:${service.port}`);

        console.log(`[Cluster ${this.teamId}] Service ${service.name} added`);
        this.emit('serviceAdded', service);

        return service;
    }

    /**
     * Remove a service from the cluster
     */
    async removeService(serviceId) {
        const service = this.services.get(serviceId);

        if (!service) {
            throw new Error('Service not found');
        }

        // Stop service if running
        if (service.status === 'running') {
            await service.stop();
        }

        // Release resources
        this.quota.release(service.resources);

        // Remove from cluster
        this.services.delete(serviceId);

        console.log(`[Cluster ${this.teamId}] Service ${service.name} removed`);
        this.emit('serviceRemoved', service);
    }

    /**
     * Deploy a service
     */
    async deployService(serviceId, version) {
        const service = this.services.get(serviceId);

        if (!service) {
            throw new Error('Service not found');
        }

        // Execute deployment pipeline
        const deployment = await this.pipeline.deploy(service, version);

        if (deployment.status === 'success') {
            service.version = version;
            await service.start();
        }

        return deployment;
    }

    /**
     * Start the cluster
     */
    async start() {
        console.log(`[Cluster ${this.teamId}] Starting cluster for team ${this.teamName}`);

        // Start gateway
        await this.gateway.start();

        // Start all services
        for (const [serviceId, service] of this.services.entries()) {
            if (service.status === 'stopped') {
                await service.start();
            }
        }

        console.log(`[Cluster ${this.teamId}] Cluster started with ${this.services.size} services`);
    }

    /**
     * Stop the cluster
     */
    async stop() {
        console.log(`[Cluster ${this.teamId}] Stopping cluster`);

        // Stop all services
        for (const [serviceId, service] of this.services.entries()) {
            if (service.status === 'running') {
                await service.stop();
            }
        }

        // Stop gateway
        await this.gateway.stop();

        console.log(`[Cluster ${this.teamId}] Cluster stopped`);
    }

    /**
     * Get cluster information
     */
    getInfo() {
        const services = [];
        for (const [serviceId, service] of this.services.entries()) {
            services.push(service.getInfo());
        }

        return {
            teamId: this.teamId,
            teamName: this.teamName,
            serviceCount: this.services.size,
            services,
            quota: this.quota.getInfo(),
            gateway: this.gateway.getStatistics(),
            deploymentStats: this.pipeline.getStatistics()
        };
    }

    /**
     * Get cluster health
     */
    getHealth() {
        const health = {
            status: 'healthy',
            services: []
        };

        for (const [serviceId, service] of this.services.entries()) {
            health.services.push({
                id: serviceId,
                name: service.name,
                status: service.status
            });

            if (service.status !== 'running') {
                health.status = 'degraded';
            }
        }

        return health;
    }
}

// Demonstration
async function demonstrateServiceperTeam() {
    console.log('=== Service per Team Pattern (Alternative) Demonstration ===\n');

    // Create team clusters
    console.log('--- Creating Team Clusters ---');

    const paymentsCluster = new TeamServiceCluster({
        teamId: 'payments',
        teamName: 'Payments Team',
        gatewayPort: 6001,
        quota: {
            maxServices: 5,
            maxCPU: 8,
            maxMemory: 16384,
            maxStorage: 51200
        },
        pipeline: {
            stages: ['build', 'test', 'security-scan', 'deploy']
        }
    });

    const analyticsCluster = new TeamServiceCluster({
        teamId: 'analytics',
        teamName: 'Analytics Team',
        gatewayPort: 6002,
        quota: {
            maxServices: 3,
            maxCPU: 4,
            maxMemory: 8192,
            maxStorage: 25600
        }
    });

    // Add services to clusters
    console.log('\n--- Adding Services to Clusters ---');

    const paymentService = await paymentsCluster.addService({
        name: 'payment-processor',
        port: 7001,
        version: '2.1.0',
        resources: { cpu: 2, memory: 4096, storage: 10240 },
        technology: 'nodejs'
    });

    const billingService = await paymentsCluster.addService({
        name: 'billing-service',
        port: 7002,
        version: '1.8.0',
        resources: { cpu: 1, memory: 2048, storage: 5120 }
    });

    const analyticsService = await analyticsCluster.addService({
        name: 'data-analytics',
        port: 7003,
        version: '3.0.0',
        resources: { cpu: 2, memory: 4096, storage: 20480 },
        technology: 'python'
    });

    // Start clusters
    console.log('\n--- Starting Clusters ---');
    await paymentsCluster.start();
    await analyticsCluster.start();

    // Deploy services
    console.log('\n--- Deploying Services ---');
    const deployment1 = await paymentsCluster.deployService(paymentService.id, '2.2.0');
    console.log(`Deployment result: ${deployment1.status}`);

    // Show cluster information
    console.log('\n--- Payments Cluster Information ---');
    const paymentsInfo = paymentsCluster.getInfo();
    console.log(JSON.stringify(paymentsInfo, null, 2));

    // Show cluster health
    console.log('\n--- Cluster Health ---');
    const paymentsHealth = paymentsCluster.getHealth();
    console.log(JSON.stringify(paymentsHealth, null, 2));

    // Show quota utilization
    console.log('\n--- Resource Quota Utilization ---');
    const quotaInfo = paymentsCluster.quota.getInfo();
    console.log(JSON.stringify(quotaInfo.utilization, null, 2));
}

// Export classes
module.exports = {
    ResourceQuota,
    DeploymentPipeline,
    TeamAPIGateway,
    TeamService,
    TeamServiceCluster
};

if (require.main === module) {
    demonstrateServiceperTeam().catch(console.error);
}
