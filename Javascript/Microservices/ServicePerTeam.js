/**
 * Service Per Team Pattern
 *
 * The Service Per Team pattern organizes microservices based on team ownership.
 * Each team is responsible for their own set of services, with clear boundaries
 * and ownership. This pattern promotes autonomy, accountability, and allows teams
 * to work independently while maintaining clear service boundaries.
 *
 * Key Components:
 * - Team: Group of developers responsible for specific services
 * - Service Boundary: Clear separation between team services
 * - Team Registry: Catalog of teams and their services
 * - Governance Rules: Policies for inter-team communication
 *
 * Benefits:
 * - Clear ownership and accountability
 * - Team autonomy and independence
 * - Reduced coordination overhead
 * - Faster development cycles
 * - Better code quality through ownership
 *
 * Use Cases:
 * - Large organizations with multiple teams
 * - Domain-driven design implementations
 * - Conway's Law compliance
 * - Scaling development organizations
 */

const EventEmitter = require('events');
const http = require('http');

/**
 * Team - Represents a development team with ownership of services
 */
class Team {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.domain = config.domain;
        this.members = config.members || [];
        this.services = new Map();
        this.policies = config.policies || this.getDefaultPolicies();
        this.metadata = config.metadata || {};
        this.createdAt = new Date();
    }

    /**
     * Get default team policies
     */
    getDefaultPolicies() {
        return {
            serviceNaming: `${this.id}-*`,
            allowedDependencies: [],
            deploymentApproval: 'team-lead',
            technologiesAllowed: ['nodejs', 'javascript', 'typescript'],
            communicationProtocols: ['http', 'grpc'],
            maxServicesPerTeam: 10
        };
    }

    /**
     * Add a service to the team
     */
    addService(service) {
        if (this.services.size >= this.policies.maxServicesPerTeam) {
            throw new Error(`Team ${this.name} has reached max services limit`);
        }

        const serviceId = service.id;
        this.services.set(serviceId, {
            service,
            addedAt: new Date(),
            owner: this.id
        });

        console.log(`[Team ${this.name}] Service ${service.name} added`);
        return { success: true, serviceId };
    }

    /**
     * Remove a service from the team
     */
    removeService(serviceId) {
        if (!this.services.has(serviceId)) {
            return { success: false, error: 'Service not found' };
        }

        this.services.delete(serviceId);
        console.log(`[Team ${this.name}] Service ${serviceId} removed`);
        return { success: true };
    }

    /**
     * Get all services owned by this team
     */
    getServices() {
        const services = [];
        for (const [serviceId, data] of this.services.entries()) {
            services.push({
                serviceId,
                service: data.service,
                addedAt: data.addedAt
            });
        }
        return services;
    }

    /**
     * Check if service name follows team naming convention
     */
    validateServiceName(serviceName) {
        const pattern = this.policies.serviceNaming.replace('*', '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(serviceName);
    }

    /**
     * Add team member
     */
    addMember(member) {
        this.members.push({
            ...member,
            joinedAt: new Date()
        });
        console.log(`[Team ${this.name}] Member ${member.name} added`);
    }

    /**
     * Get team information
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            domain: this.domain,
            memberCount: this.members.length,
            serviceCount: this.services.size,
            policies: this.policies,
            metadata: this.metadata,
            createdAt: this.createdAt
        };
    }
}

/**
 * TeamService - A microservice owned by a specific team
 */
class TeamService extends EventEmitter {
    constructor(config) {
        super();
        this.id = config.id || this.generateId();
        this.name = config.name;
        this.teamId = config.teamId;
        this.port = config.port;
        this.host = config.host || 'localhost';
        this.version = config.version || '1.0.0';
        this.description = config.description || '';
        this.dependencies = config.dependencies || [];
        this.metadata = config.metadata || {};
        this.server = null;
        this.startedAt = null;
    }

    /**
     * Generate unique service ID
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
            this.server.listen(this.port, this.host, () => {
                this.startedAt = new Date();
                console.log(`[Service ${this.name}] Running on ${this.host}:${this.port}`);
                this.emit('started', this);
                resolve();
            });
        });
    }

    /**
     * Stop the service
     */
    async stop() {
        console.log(`[Service ${this.name}] Stopping...`);

        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(() => {
                    this.emit('stopped', this);
                    resolve();
                });
            });
        }

        console.log(`[Service ${this.name}] Stopped`);
    }

    /**
     * Handle incoming HTTP requests
     */
    handleRequest(req, res) {
        const url = req.url;

        if (url === '/health') {
            this.handleHealthCheck(req, res);
        } else if (url === '/info') {
            this.handleInfo(req, res);
        } else if (url === '/team') {
            this.handleTeamInfo(req, res);
        } else if (url.startsWith('/api/')) {
            this.handleApiRequest(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    }

    /**
     * Health check endpoint
     */
    handleHealthCheck(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            service: this.name,
            team: this.teamId,
            uptime: this.startedAt ? Date.now() - this.startedAt.getTime() : 0
        }));
    }

    /**
     * Service info endpoint
     */
    handleInfo(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            id: this.id,
            name: this.name,
            teamId: this.teamId,
            version: this.version,
            description: this.description,
            dependencies: this.dependencies,
            metadata: this.metadata
        }));
    }

    /**
     * Team info endpoint
     */
    handleTeamInfo(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            teamId: this.teamId,
            serviceName: this.name
        }));
    }

    /**
     * API request handler
     */
    handleApiRequest(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: `Response from ${this.name}`,
            team: this.teamId,
            path: req.url,
            timestamp: new Date()
        }));
    }

    /**
     * Add dependency on another service
     */
    addDependency(serviceName, teamId) {
        this.dependencies.push({
            serviceName,
            teamId,
            addedAt: new Date()
        });
    }

    /**
     * Get service information
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            teamId: this.teamId,
            port: this.port,
            version: this.version,
            description: this.description,
            dependencies: this.dependencies,
            startedAt: this.startedAt
        };
    }
}

/**
 * TeamRegistry - Central registry for teams and their services
 */
class TeamRegistry extends EventEmitter {
    constructor() {
        super();
        this.teams = new Map();
        this.serviceOwnership = new Map();
        this.dependencyGraph = new Map();
    }

    /**
     * Register a new team
     */
    registerTeam(team) {
        if (this.teams.has(team.id)) {
            throw new Error(`Team ${team.id} already registered`);
        }

        this.teams.set(team.id, team);
        this.emit('teamRegistered', team);

        console.log(`[Registry] Team ${team.name} registered`);
        return { success: true, teamId: team.id };
    }

    /**
     * Register a service with a team
     */
    registerService(service, teamId) {
        if (!this.teams.has(teamId)) {
            throw new Error(`Team ${teamId} not found`);
        }

        const team = this.teams.get(teamId);

        // Validate service name follows team convention
        if (!team.validateServiceName(service.name)) {
            throw new Error(`Service name ${service.name} does not follow team naming convention`);
        }

        // Add service to team
        team.addService(service);

        // Track ownership
        this.serviceOwnership.set(service.id, teamId);

        // Track dependencies
        if (service.dependencies.length > 0) {
            this.dependencyGraph.set(service.id, service.dependencies);
        }

        this.emit('serviceRegistered', { service, teamId });

        console.log(`[Registry] Service ${service.name} registered to team ${team.name}`);
        return { success: true, serviceId: service.id };
    }

    /**
     * Get team by ID
     */
    getTeam(teamId) {
        return this.teams.get(teamId);
    }

    /**
     * Get all teams
     */
    getAllTeams() {
        const teams = [];
        for (const [teamId, team] of this.teams.entries()) {
            teams.push(team.getInfo());
        }
        return teams;
    }

    /**
     * Get services by team
     */
    getServicesByTeam(teamId) {
        const team = this.teams.get(teamId);
        if (!team) {
            return [];
        }
        return team.getServices();
    }

    /**
     * Get team that owns a service
     */
    getServiceOwner(serviceId) {
        const teamId = this.serviceOwnership.get(serviceId);
        if (!teamId) {
            return null;
        }
        return this.teams.get(teamId);
    }

    /**
     * Get dependency graph
     */
    getDependencyGraph() {
        const graph = {};
        for (const [serviceId, dependencies] of this.dependencyGraph.entries()) {
            graph[serviceId] = dependencies;
        }
        return graph;
    }

    /**
     * Check if cross-team dependency is allowed
     */
    validateCrossTeamDependency(fromServiceId, toServiceId) {
        const fromTeamId = this.serviceOwnership.get(fromServiceId);
        const toTeamId = this.serviceOwnership.get(toServiceId);

        if (fromTeamId === toTeamId) {
            return { allowed: true, reason: 'Same team' };
        }

        const fromTeam = this.teams.get(fromTeamId);

        // Check if dependency is in allowed list
        if (fromTeam.policies.allowedDependencies.includes(toTeamId)) {
            return { allowed: true, reason: 'Explicitly allowed' };
        }

        return { allowed: false, reason: 'Cross-team dependency not allowed' };
    }

    /**
     * Get team statistics
     */
    getTeamStatistics(teamId) {
        const team = this.teams.get(teamId);
        if (!team) {
            return null;
        }

        const services = team.getServices();
        const totalDependencies = services.reduce((sum, s) => {
            return sum + s.service.dependencies.length;
        }, 0);

        return {
            teamId: team.id,
            teamName: team.name,
            serviceCount: services.length,
            memberCount: team.members.length,
            totalDependencies,
            domain: team.domain
        };
    }

    /**
     * Get overall statistics
     */
    getOverallStatistics() {
        const stats = {
            totalTeams: this.teams.size,
            totalServices: this.serviceOwnership.size,
            teamStats: []
        };

        for (const [teamId] of this.teams) {
            stats.teamStats.push(this.getTeamStatistics(teamId));
        }

        return stats;
    }
}

/**
 * ServiceGovernance - Enforce governance rules across teams
 */
class ServiceGovernance {
    constructor(registry) {
        this.registry = registry;
        this.rules = new Map();
        this.violations = [];
    }

    /**
     * Add governance rule
     */
    addRule(ruleName, ruleFunction) {
        this.rules.set(ruleName, ruleFunction);
        console.log(`[Governance] Rule added: ${ruleName}`);
    }

    /**
     * Validate service against all rules
     */
    validateService(service, teamId) {
        const results = {
            passed: [],
            failed: []
        };

        for (const [ruleName, ruleFunction] of this.rules.entries()) {
            try {
                const result = ruleFunction(service, teamId, this.registry);

                if (result.passed) {
                    results.passed.push(ruleName);
                } else {
                    results.failed.push({
                        rule: ruleName,
                        reason: result.reason
                    });
                }
            } catch (error) {
                results.failed.push({
                    rule: ruleName,
                    reason: error.message
                });
            }
        }

        if (results.failed.length > 0) {
            this.violations.push({
                service: service.name,
                teamId,
                timestamp: new Date(),
                failures: results.failed
            });
        }

        return results;
    }

    /**
     * Get all violations
     */
    getViolations() {
        return this.violations;
    }

    /**
     * Clear violations
     */
    clearViolations() {
        this.violations = [];
    }
}

// Demonstration
async function demonstrateServicePerTeam() {
    console.log('=== Service Per Team Pattern Demonstration ===\n');

    // Create team registry
    const registry = new TeamRegistry();

    // Create teams
    console.log('--- Creating Teams ---');

    const frontendTeam = new Team({
        id: 'frontend',
        name: 'Frontend Team',
        domain: 'user-interface',
        members: [
            { id: 'dev1', name: 'Alice', role: 'Senior Developer' },
            { id: 'dev2', name: 'Bob', role: 'Developer' }
        ],
        policies: {
            serviceNaming: 'frontend-*',
            allowedDependencies: ['backend', 'api-gateway'],
            maxServicesPerTeam: 5
        }
    });

    const backendTeam = new Team({
        id: 'backend',
        name: 'Backend Team',
        domain: 'business-logic',
        members: [
            { id: 'dev3', name: 'Charlie', role: 'Tech Lead' },
            { id: 'dev4', name: 'Diana', role: 'Developer' }
        ],
        policies: {
            serviceNaming: 'backend-*',
            allowedDependencies: ['data', 'cache'],
            maxServicesPerTeam: 8
        }
    });

    const dataTeam = new Team({
        id: 'data',
        name: 'Data Team',
        domain: 'data-persistence',
        members: [
            { id: 'dev5', name: 'Eve', role: 'Data Engineer' }
        ],
        policies: {
            serviceNaming: 'data-*',
            allowedDependencies: [],
            maxServicesPerTeam: 6
        }
    });

    // Register teams
    registry.registerTeam(frontendTeam);
    registry.registerTeam(backendTeam);
    registry.registerTeam(dataTeam);

    // Create and register services
    console.log('\n--- Creating Services ---');

    const webAppService = new TeamService({
        name: 'frontend-webapp',
        teamId: 'frontend',
        port: 5001,
        version: '2.0.0',
        description: 'Main web application',
        dependencies: [
            { serviceName: 'backend-api', teamId: 'backend' }
        ]
    });

    const apiService = new TeamService({
        name: 'backend-api',
        teamId: 'backend',
        port: 5002,
        version: '1.5.0',
        description: 'REST API service',
        dependencies: [
            { serviceName: 'data-postgres', teamId: 'data' }
        ]
    });

    const dbService = new TeamService({
        name: 'data-postgres',
        teamId: 'data',
        port: 5003,
        version: '1.0.0',
        description: 'PostgreSQL data service'
    });

    // Register services
    registry.registerService(webAppService, 'frontend');
    registry.registerService(apiService, 'backend');
    registry.registerService(dbService, 'data');

    // Start services
    console.log('\n--- Starting Services ---');
    await webAppService.start();
    await apiService.start();
    await dbService.start();

    // Query team information
    console.log('\n--- Team Information ---');
    const allTeams = registry.getAllTeams();
    allTeams.forEach(team => {
        console.log(`\nTeam: ${team.name}`);
        console.log(`  Domain: ${team.domain}`);
        console.log(`  Members: ${team.memberCount}`);
        console.log(`  Services: ${team.serviceCount}`);
    });

    // Show services by team
    console.log('\n--- Services by Team ---');
    const backendServices = registry.getServicesByTeam('backend');
    console.log(`Backend team services: ${backendServices.length}`);
    backendServices.forEach(s => {
        console.log(`  - ${s.service.name} (${s.service.version})`);
    });

    // Show dependency graph
    console.log('\n--- Dependency Graph ---');
    const dependencyGraph = registry.getDependencyGraph();
    console.log(JSON.stringify(dependencyGraph, null, 2));

    // Show statistics
    console.log('\n--- Overall Statistics ---');
    const stats = registry.getOverallStatistics();
    console.log(JSON.stringify(stats, null, 2));

    // Setup governance
    console.log('\n--- Setting up Governance ---');
    const governance = new ServiceGovernance(registry);

    governance.addRule('naming-convention', (service, teamId, registry) => {
        const team = registry.getTeam(teamId);
        return {
            passed: team.validateServiceName(service.name),
            reason: 'Service name must follow team naming convention'
        };
    });

    governance.addRule('max-dependencies', (service, teamId) => {
        const maxDeps = 5;
        return {
            passed: service.dependencies.length <= maxDeps,
            reason: `Service has too many dependencies (max: ${maxDeps})`
        };
    });

    // Validate services
    const validation = governance.validateService(apiService, 'backend');
    console.log('API Service Validation:', JSON.stringify(validation, null, 2));
}

// Export classes
module.exports = {
    Team,
    TeamService,
    TeamRegistry,
    ServiceGovernance
};

if (require.main === module) {
    demonstrateServicePerTeam().catch(console.error);
}
