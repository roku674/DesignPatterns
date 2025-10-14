/**
 * Decompose By Subdomain Pattern
 *
 * The Decompose by Subdomain pattern uses Domain-Driven Design (DDD) principles
 * to decompose applications into microservices based on subdomains.
 * A subdomain is a part of the overall business domain.
 *
 * Key Concepts:
 * 1. Core Domain: The primary value-generating subdomain
 * 2. Supporting Subdomain: Supports the core domain
 * 3. Generic Subdomain: General purpose functionality
 * 4. Bounded Context: Service boundaries aligned with subdomains
 * 5. Ubiquitous Language: Consistent terminology within each subdomain
 *
 * Benefits:
 * - Aligns services with business domains
 * - Clear boundaries and responsibilities
 * - Independent evolution of subdomains
 * - Better domain modeling
 * - Reduced complexity through separation
 *
 * Use Cases:
 * - Complex enterprise applications
 * - Systems with multiple business domains
 * - Applications requiring domain expertise
 * - Large-scale systems with distinct functional areas
 */

/**
 * Subdomain Types
 */
const SubdomainType = {
    CORE: 'CORE',           // Core business differentiator
    SUPPORTING: 'SUPPORTING', // Supports core domain
    GENERIC: 'GENERIC'       // Generic functionality
};

/**
 * Subdomain Registry
 * Manages subdomain definitions and their services
 */
class SubdomainRegistry {
    constructor() {
        this.subdomains = new Map();
        this.boundedContexts = new Map();
        this.domainEvents = [];
    }

    defineSubdomain(name, type, description) {
        if (!name) {
            throw new Error('Subdomain name is required');
        }
        if (!Object.values(SubdomainType).includes(type)) {
            throw new Error(`Invalid subdomain type: ${type}`);
        }

        this.subdomains.set(name, {
            name: name,
            type: type,
            description: description,
            entities: [],
            valueObjects: [],
            aggregates: [],
            services: [],
            repositories: [],
            domainEvents: []
        });

        console.log(`Defined ${type} subdomain: ${name}`);
        return this;
    }

    defineBoundedContext(subdomainName, contextName, entities) {
        const subdomain = this.subdomains.get(subdomainName);
        if (!subdomain) {
            throw new Error(`Subdomain not found: ${subdomainName}`);
        }

        const context = {
            name: contextName,
            subdomain: subdomainName,
            entities: entities,
            ubiquitousLanguage: new Map()
        };

        this.boundedContexts.set(contextName, context);
        console.log(`Defined bounded context: ${contextName} for ${subdomainName}`);

        return this;
    }

    addDomainEntity(subdomainName, entityName, attributes) {
        const subdomain = this.subdomains.get(subdomainName);
        if (!subdomain) {
            throw new Error(`Subdomain not found: ${subdomainName}`);
        }

        subdomain.entities.push({ name: entityName, attributes: attributes });
        console.log(`Added entity ${entityName} to ${subdomainName}`);

        return this;
    }

    addDomainEvent(subdomainName, eventName, payload) {
        const subdomain = this.subdomains.get(subdomainName);
        if (!subdomain) {
            throw new Error(`Subdomain not found: ${subdomainName}`);
        }

        const event = {
            name: eventName,
            subdomain: subdomainName,
            payload: payload,
            timestamp: new Date()
        };

        subdomain.domainEvents.push(eventName);
        this.domainEvents.push(event);

        console.log(`Registered domain event: ${eventName} for ${subdomainName}`);
        return this;
    }

    getSubdomain(name) {
        const subdomain = this.subdomains.get(name);
        if (!subdomain) {
            throw new Error(`Subdomain not found: ${name}`);
        }
        return subdomain;
    }

    listSubdomains(type = null) {
        const subdomains = Array.from(this.subdomains.values());
        if (type) {
            return subdomains.filter(s => s.type === type);
        }
        return subdomains;
    }

    visualizeSubdomainArchitecture() {
        console.log('\n=== Subdomain Architecture ===\n');

        Object.values(SubdomainType).forEach(type => {
            const subdomains = this.listSubdomains(type);
            if (subdomains.length > 0) {
                console.log(`${type} Subdomains:`);
                subdomains.forEach(s => {
                    console.log(`  [${s.name}] - ${s.description}`);
                    console.log(`    Entities: ${s.entities.map(e => e.name).join(', ')}`);
                    console.log(`    Domain Events: ${s.domainEvents.join(', ')}`);
                });
                console.log('');
            }
        });
    }
}

/**
 * Base Subdomain Service
 */
class SubdomainService {
    constructor(subdomainName, subdomainType) {
        if (!subdomainName) {
            throw new Error('Subdomain name is required');
        }
        this.subdomainName = subdomainName;
        this.subdomainType = subdomainType;
        this.eventBus = [];
        this.isInitialized = false;
    }

    async initialize() {
        console.log(`Initializing ${this.subdomainType} subdomain: ${this.subdomainName}`);
        this.isInitialized = true;
        return this;
    }

    ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error(`Subdomain service ${this.subdomainName} not initialized`);
        }
    }

    publishDomainEvent(eventName, data) {
        const event = {
            name: eventName,
            subdomain: this.subdomainName,
            data: data,
            timestamp: new Date()
        };

        this.eventBus.push(event);
        console.log(`Domain event published: ${eventName} from ${this.subdomainName}`);

        return event;
    }

    subscribeToDomainEvent(eventName, handler) {
        // In a real implementation, this would subscribe to an event bus
        console.log(`Subscribed to ${eventName} in ${this.subdomainName}`);
    }
}

/**
 * E-Learning Core Subdomain: Course Management
 */
class CourseManagementService extends SubdomainService {
    constructor() {
        super('CourseManagement', SubdomainType.CORE);
        this.courses = new Map();
        this.courseIdCounter = 1;
    }

    async initialize() {
        await super.initialize();
        console.log('Course Management Service ready');
        return this;
    }

    createCourse(courseData) {
        this.ensureInitialized();

        if (!courseData.title) {
            throw new Error('Course title is required');
        }
        if (!courseData.instructorId) {
            throw new Error('Instructor ID is required');
        }

        const courseId = `COURSE-${this.courseIdCounter++}`;
        const course = {
            id: courseId,
            title: courseData.title,
            description: courseData.description || '',
            instructorId: courseData.instructorId,
            duration: courseData.duration || 0,
            level: courseData.level || 'Beginner',
            status: 'DRAFT',
            modules: [],
            createdAt: new Date()
        };

        this.courses.set(courseId, course);
        this.publishDomainEvent('CourseCreated', course);

        console.log(`Course created: ${courseId} - ${course.title}`);
        return course;
    }

    addModuleToCourse(courseId, moduleData) {
        this.ensureInitialized();

        const course = this.courses.get(courseId);
        if (!course) {
            throw new Error(`Course not found: ${courseId}`);
        }

        const module = {
            id: `MOD-${course.modules.length + 1}`,
            title: moduleData.title,
            content: moduleData.content,
            lessons: moduleData.lessons || [],
            orderIndex: course.modules.length
        };

        course.modules.push(module);
        this.publishDomainEvent('ModuleAdded', { courseId, module });

        console.log(`Module added to course ${courseId}: ${module.title}`);
        return module;
    }

    publishCourse(courseId) {
        this.ensureInitialized();

        const course = this.courses.get(courseId);
        if (!course) {
            throw new Error(`Course not found: ${courseId}`);
        }

        if (course.modules.length === 0) {
            throw new Error('Cannot publish course without modules');
        }

        course.status = 'PUBLISHED';
        course.publishedAt = new Date();

        this.publishDomainEvent('CoursePublished', course);
        console.log(`Course published: ${courseId}`);

        return course;
    }

    getCourse(courseId) {
        this.ensureInitialized();

        const course = this.courses.get(courseId);
        if (!course) {
            throw new Error(`Course not found: ${courseId}`);
        }
        return { ...course };
    }

    listCourses(filter = {}) {
        this.ensureInitialized();

        let courses = Array.from(this.courses.values());

        if (filter.status) {
            courses = courses.filter(c => c.status === filter.status);
        }

        if (filter.instructorId) {
            courses = courses.filter(c => c.instructorId === filter.instructorId);
        }

        return courses;
    }
}

/**
 * E-Learning Core Subdomain: Enrollment Management
 */
class EnrollmentManagementService extends SubdomainService {
    constructor() {
        super('EnrollmentManagement', SubdomainType.CORE);
        this.enrollments = new Map();
        this.enrollmentIdCounter = 1;
    }

    async initialize() {
        await super.initialize();
        console.log('Enrollment Management Service ready');
        return this;
    }

    enrollStudent(studentId, courseId) {
        this.ensureInitialized();

        if (!studentId) {
            throw new Error('Student ID is required');
        }
        if (!courseId) {
            throw new Error('Course ID is required');
        }

        // Check for duplicate enrollment
        const existing = Array.from(this.enrollments.values())
            .find(e => e.studentId === studentId && e.courseId === courseId);

        if (existing) {
            throw new Error('Student already enrolled in this course');
        }

        const enrollmentId = `ENROLL-${this.enrollmentIdCounter++}`;
        const enrollment = {
            id: enrollmentId,
            studentId: studentId,
            courseId: courseId,
            status: 'ACTIVE',
            progress: 0,
            startedAt: new Date(),
            completedModules: []
        };

        this.enrollments.set(enrollmentId, enrollment);
        this.publishDomainEvent('StudentEnrolled', enrollment);

        console.log(`Student ${studentId} enrolled in course ${courseId}`);
        return enrollment;
    }

    updateProgress(enrollmentId, moduleId) {
        this.ensureInitialized();

        const enrollment = this.enrollments.get(enrollmentId);
        if (!enrollment) {
            throw new Error(`Enrollment not found: ${enrollmentId}`);
        }

        if (!enrollment.completedModules.includes(moduleId)) {
            enrollment.completedModules.push(moduleId);
            enrollment.updatedAt = new Date();

            this.publishDomainEvent('ProgressUpdated', {
                enrollmentId,
                moduleId,
                completedModules: enrollment.completedModules.length
            });

            console.log(`Progress updated for enrollment ${enrollmentId}`);
        }

        return enrollment;
    }

    completeCourse(enrollmentId) {
        this.ensureInitialized();

        const enrollment = this.enrollments.get(enrollmentId);
        if (!enrollment) {
            throw new Error(`Enrollment not found: ${enrollmentId}`);
        }

        enrollment.status = 'COMPLETED';
        enrollment.completedAt = new Date();
        enrollment.progress = 100;

        this.publishDomainEvent('CourseCompleted', enrollment);
        console.log(`Course completed for enrollment ${enrollmentId}`);

        return enrollment;
    }

    getEnrollmentsByStudent(studentId) {
        this.ensureInitialized();

        return Array.from(this.enrollments.values())
            .filter(e => e.studentId === studentId);
    }

    getEnrollmentsByCourse(courseId) {
        this.ensureInitialized();

        return Array.from(this.enrollments.values())
            .filter(e => e.courseId === courseId);
    }
}

/**
 * Supporting Subdomain: Certificate Management
 */
class CertificateManagementService extends SubdomainService {
    constructor() {
        super('CertificateManagement', SubdomainType.SUPPORTING);
        this.certificates = new Map();
        this.certificateIdCounter = 1;
    }

    async initialize() {
        await super.initialize();
        console.log('Certificate Management Service ready');
        return this;
    }

    issueCertificate(studentId, courseId, courseName) {
        this.ensureInitialized();

        if (!studentId) {
            throw new Error('Student ID is required');
        }
        if (!courseId) {
            throw new Error('Course ID is required');
        }

        const certificateId = `CERT-${this.certificateIdCounter++}`;
        const certificate = {
            id: certificateId,
            studentId: studentId,
            courseId: courseId,
            courseName: courseName,
            issueDate: new Date(),
            verificationCode: this.generateVerificationCode()
        };

        this.certificates.set(certificateId, certificate);
        this.publishDomainEvent('CertificateIssued', certificate);

        console.log(`Certificate issued: ${certificateId} for student ${studentId}`);
        return certificate;
    }

    verifyCertificate(verificationCode) {
        this.ensureInitialized();

        const certificate = Array.from(this.certificates.values())
            .find(c => c.verificationCode === verificationCode);

        if (!certificate) {
            return { valid: false, message: 'Certificate not found' };
        }

        return {
            valid: true,
            certificate: certificate
        };
    }

    getCertificatesByStudent(studentId) {
        this.ensureInitialized();

        return Array.from(this.certificates.values())
            .filter(c => c.studentId === studentId);
    }

    generateVerificationCode() {
        return `VERIFY-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    }
}

// Example usage demonstrating the Decompose By Subdomain pattern
console.log('=== Decompose By Subdomain Pattern Demo ===\n');

// Create subdomain registry
const registry = new SubdomainRegistry();

// Define subdomains
registry
    .defineSubdomain('CourseManagement', SubdomainType.CORE,
        'Manages course creation and content')
    .defineSubdomain('EnrollmentManagement', SubdomainType.CORE,
        'Handles student enrollments and progress')
    .defineSubdomain('CertificateManagement', SubdomainType.SUPPORTING,
        'Issues and verifies certificates');

// Add domain entities
registry
    .addDomainEntity('CourseManagement', 'Course',
        ['id', 'title', 'description', 'modules'])
    .addDomainEntity('EnrollmentManagement', 'Enrollment',
        ['id', 'studentId', 'courseId', 'progress']);

// Register domain events
registry
    .addDomainEvent('CourseManagement', 'CourseCreated', {})
    .addDomainEvent('CourseManagement', 'CoursePublished', {})
    .addDomainEvent('EnrollmentManagement', 'StudentEnrolled', {})
    .addDomainEvent('EnrollmentManagement', 'CourseCompleted', {})
    .addDomainEvent('CertificateManagement', 'CertificateIssued', {});

// Visualize architecture
registry.visualizeSubdomainArchitecture();

// Create service instances
const courseService = new CourseManagementService();
const enrollmentService = new EnrollmentManagementService();
const certificateService = new CertificateManagementService();

// Demonstrate subdomain interactions
async function demonstrateSubdomains() {
    await courseService.initialize();
    await enrollmentService.initialize();
    await certificateService.initialize();

    console.log('\n--- Subdomain Interaction Demonstration ---\n');

    // Create a course
    const course = courseService.createCourse({
        title: 'Advanced JavaScript Patterns',
        description: 'Learn advanced design patterns in JavaScript',
        instructorId: 'INST-001',
        duration: 40,
        level: 'Advanced'
    });

    // Add modules
    courseService.addModuleToCourse(course.id, {
        title: 'Introduction to Patterns',
        content: 'Overview of design patterns',
        lessons: ['What are patterns?', 'Why use patterns?']
    });

    courseService.addModuleToCourse(course.id, {
        title: 'Creational Patterns',
        content: 'Factory, Singleton, Builder',
        lessons: ['Factory Pattern', 'Singleton Pattern']
    });

    // Publish course
    courseService.publishCourse(course.id);
    console.log('');

    // Enroll student
    const enrollment = enrollmentService.enrollStudent('STU-001', course.id);
    console.log('');

    // Update progress
    enrollmentService.updateProgress(enrollment.id, 'MOD-1');
    enrollmentService.updateProgress(enrollment.id, 'MOD-2');
    console.log('');

    // Complete course
    enrollmentService.completeCourse(enrollment.id);
    console.log('');

    // Issue certificate
    const certificate = certificateService.issueCertificate(
        'STU-001',
        course.id,
        course.title
    );

    console.log(`\nVerification Code: ${certificate.verificationCode}`);

    // Verify certificate
    const verification = certificateService.verifyCertificate(certificate.verificationCode);
    console.log(`Certificate Valid: ${verification.valid}\n`);

    console.log('--- Subdomain Summary ---');
    console.log(`Courses Created: ${courseService.courses.size}`);
    console.log(`Active Enrollments: ${enrollmentService.enrollments.size}`);
    console.log(`Certificates Issued: ${certificateService.certificates.size}`);
}

demonstrateSubdomains().catch(console.error);

module.exports = {
    SubdomainRegistry,
    SubdomainService,
    SubdomainType,
    CourseManagementService,
    EnrollmentManagementService,
    CertificateManagementService
};
