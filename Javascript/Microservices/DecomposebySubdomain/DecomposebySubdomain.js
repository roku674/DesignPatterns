/**
 * Decompose by Subdomain Pattern (Alternate Naming)
 *
 * Alternate implementation with focus on subdomain isolation and bounded contexts.
 * This version emphasizes practical subdomain decomposition strategies.
 */

const { SubdomainRegistry, SubdomainService, SubdomainType } = require('../DecomposeBySubdomain/DecomposeBySubdomain.js');

/**
 * Subdomain Boundary Analyzer
 * Helps identify appropriate boundaries for subdomains
 */
class SubdomainBoundaryAnalyzer {
    constructor() {
        this.subdomainInteractions = new Map();
        this.cohesionScores = new Map();
    }

    analyzeInteraction(fromSubdomain, toSubdomain, interactionType, frequency) {
        const key = `${fromSubdomain}->${toSubdomain}`;

        if (!this.subdomainInteractions.has(key)) {
            this.subdomainInteractions.set(key, []);
        }

        this.subdomainInteractions.get(key).push({
            type: interactionType,
            frequency: frequency,
            timestamp: new Date()
        });

        console.log(`Recorded interaction: ${key} (${interactionType})`);
    }

    calculateCohesion(subdomainName, entities) {
        // Simple cohesion metric based on entity relationships
        const relatedEntities = entities.length;
        const interactions = Array.from(this.subdomainInteractions.keys())
            .filter(key => key.startsWith(subdomainName)).length;

        const cohesionScore = relatedEntities / (interactions + 1);
        this.cohesionScores.set(subdomainName, cohesionScore);

        return cohesionScore;
    }

    recommendBoundaries() {
        console.log('\n=== Subdomain Boundary Recommendations ===\n');

        const highCohesion = [];
        const lowCohesion = [];

        this.cohesionScores.forEach((score, subdomain) => {
            if (score > 0.7) {
                highCohesion.push({ subdomain, score });
            } else {
                lowCohesion.push({ subdomain, score });
            }
        });

        console.log('High Cohesion Subdomains (well-defined boundaries):');
        highCohesion.forEach(item => {
            console.log(`  - ${item.subdomain}: ${item.score.toFixed(2)}`);
        });

        console.log('\nLow Cohesion Subdomains (consider restructuring):');
        lowCohesion.forEach(item => {
            console.log(`  - ${item.subdomain}: ${item.score.toFixed(2)}`);
        });

        return { highCohesion, lowCohesion };
    }

    visualizeInteractions() {
        console.log('\n=== Subdomain Interactions ===\n');

        const interactionMap = new Map();

        this.subdomainInteractions.forEach((interactions, key) => {
            const totalFrequency = interactions.reduce((sum, i) => sum + i.frequency, 0);
            interactionMap.set(key, totalFrequency);
        });

        const sorted = Array.from(interactionMap.entries())
            .sort((a, b) => b[1] - a[1]);

        sorted.forEach(([key, frequency]) => {
            console.log(`${key}: ${frequency} interactions`);
        });
    }
}

/**
 * Healthcare Domain: Patient Management Subdomain
 */
class PatientManagementService extends SubdomainService {
    constructor() {
        super('PatientManagement', SubdomainType.CORE);
        this.patients = new Map();
        this.patientIdCounter = 1;
    }

    async initialize() {
        await super.initialize();
        console.log('Patient Management Service ready');
        return this;
    }

    registerPatient(patientData) {
        this.ensureInitialized();

        if (!patientData.firstName) {
            throw new Error('Patient first name is required');
        }
        if (!patientData.lastName) {
            throw new Error('Patient last name is required');
        }

        const patientId = `PAT-${this.patientIdCounter++}`;
        const patient = {
            id: patientId,
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            dateOfBirth: patientData.dateOfBirth,
            contactInfo: patientData.contactInfo || {},
            medicalHistory: [],
            status: 'ACTIVE',
            registeredAt: new Date()
        };

        this.patients.set(patientId, patient);
        this.publishDomainEvent('PatientRegistered', patient);

        console.log(`Patient registered: ${patientId} - ${patient.firstName} ${patient.lastName}`);
        return patient;
    }

    getPatient(patientId) {
        this.ensureInitialized();

        const patient = this.patients.get(patientId);
        if (!patient) {
            throw new Error(`Patient not found: ${patientId}`);
        }
        return { ...patient };
    }

    updateMedicalHistory(patientId, entry) {
        this.ensureInitialized();

        const patient = this.patients.get(patientId);
        if (!patient) {
            throw new Error(`Patient not found: ${patientId}`);
        }

        patient.medicalHistory.push({
            ...entry,
            recordedAt: new Date()
        });

        this.publishDomainEvent('MedicalHistoryUpdated', {
            patientId,
            entry
        });

        console.log(`Medical history updated for patient ${patientId}`);
        return patient;
    }

    listPatients(filter = {}) {
        this.ensureInitialized();

        let patients = Array.from(this.patients.values());

        if (filter.status) {
            patients = patients.filter(p => p.status === filter.status);
        }

        return patients;
    }
}

/**
 * Healthcare Domain: Appointment Scheduling Subdomain
 */
class AppointmentSchedulingService extends SubdomainService {
    constructor() {
        super('AppointmentScheduling', SubdomainType.CORE);
        this.appointments = new Map();
        this.appointmentIdCounter = 1;
        this.schedule = new Map(); // doctorId -> appointments
    }

    async initialize() {
        await super.initialize();
        console.log('Appointment Scheduling Service ready');
        return this;
    }

    scheduleAppointment(appointmentData) {
        this.ensureInitialized();

        if (!appointmentData.patientId) {
            throw new Error('Patient ID is required');
        }
        if (!appointmentData.doctorId) {
            throw new Error('Doctor ID is required');
        }
        if (!appointmentData.dateTime) {
            throw new Error('Date and time are required');
        }

        // Check for conflicts
        const conflicts = this.checkScheduleConflicts(
            appointmentData.doctorId,
            appointmentData.dateTime
        );

        if (conflicts.length > 0) {
            throw new Error('Time slot not available');
        }

        const appointmentId = `APT-${this.appointmentIdCounter++}`;
        const appointment = {
            id: appointmentId,
            patientId: appointmentData.patientId,
            doctorId: appointmentData.doctorId,
            dateTime: appointmentData.dateTime,
            duration: appointmentData.duration || 30,
            type: appointmentData.type || 'GENERAL',
            status: 'SCHEDULED',
            notes: appointmentData.notes || '',
            scheduledAt: new Date()
        };

        this.appointments.set(appointmentId, appointment);

        // Add to doctor's schedule
        if (!this.schedule.has(appointmentData.doctorId)) {
            this.schedule.set(appointmentData.doctorId, []);
        }
        this.schedule.get(appointmentData.doctorId).push(appointmentId);

        this.publishDomainEvent('AppointmentScheduled', appointment);
        console.log(`Appointment scheduled: ${appointmentId}`);

        return appointment;
    }

    checkScheduleConflicts(doctorId, dateTime) {
        const doctorAppointments = this.schedule.get(doctorId) || [];
        const appointmentTime = new Date(dateTime).getTime();

        return doctorAppointments
            .map(id => this.appointments.get(id))
            .filter(apt => {
                const aptTime = new Date(apt.dateTime).getTime();
                const timeDiff = Math.abs(aptTime - appointmentTime);
                return timeDiff < (apt.duration * 60 * 1000);
            });
    }

    cancelAppointment(appointmentId, reason) {
        this.ensureInitialized();

        const appointment = this.appointments.get(appointmentId);
        if (!appointment) {
            throw new Error(`Appointment not found: ${appointmentId}`);
        }

        appointment.status = 'CANCELLED';
        appointment.cancelledAt = new Date();
        appointment.cancellationReason = reason;

        this.publishDomainEvent('AppointmentCancelled', {
            appointmentId,
            reason
        });

        console.log(`Appointment cancelled: ${appointmentId}`);
        return appointment;
    }

    getAppointmentsByPatient(patientId) {
        this.ensureInitialized();

        return Array.from(this.appointments.values())
            .filter(apt => apt.patientId === patientId);
    }

    getAppointmentsByDoctor(doctorId) {
        this.ensureInitialized();

        return Array.from(this.appointments.values())
            .filter(apt => apt.doctorId === doctorId);
    }
}

/**
 * Healthcare Domain: Billing Subdomain (Supporting)
 */
class BillingService extends SubdomainService {
    constructor() {
        super('Billing', SubdomainType.SUPPORTING);
        this.bills = new Map();
        this.payments = new Map();
        this.billIdCounter = 1;
    }

    async initialize() {
        await super.initialize();
        console.log('Billing Service ready');
        return this;
    }

    generateBill(billData) {
        this.ensureInitialized();

        if (!billData.patientId) {
            throw new Error('Patient ID is required');
        }
        if (!billData.items || billData.items.length === 0) {
            throw new Error('Bill must have at least one item');
        }

        const billId = `BILL-${this.billIdCounter++}`;
        const totalAmount = billData.items.reduce((sum, item) => sum + item.amount, 0);

        const bill = {
            id: billId,
            patientId: billData.patientId,
            appointmentId: billData.appointmentId,
            items: billData.items,
            totalAmount: totalAmount,
            status: 'UNPAID',
            generatedAt: new Date()
        };

        this.bills.set(billId, bill);
        this.publishDomainEvent('BillGenerated', bill);

        console.log(`Bill generated: ${billId} - $${totalAmount}`);
        return bill;
    }

    recordPayment(billId, paymentData) {
        this.ensureInitialized();

        const bill = this.bills.get(billId);
        if (!bill) {
            throw new Error(`Bill not found: ${billId}`);
        }

        if (bill.status === 'PAID') {
            throw new Error('Bill already paid');
        }

        const payment = {
            id: `PAY-${this.payments.size + 1}`,
            billId: billId,
            amount: paymentData.amount,
            method: paymentData.method,
            paidAt: new Date()
        };

        this.payments.set(payment.id, payment);
        bill.status = 'PAID';
        bill.paidAt = new Date();

        this.publishDomainEvent('PaymentRecorded', payment);
        console.log(`Payment recorded: ${payment.id} for bill ${billId}`);

        return payment;
    }

    getBillsByPatient(patientId) {
        this.ensureInitialized();

        return Array.from(this.bills.values())
            .filter(bill => bill.patientId === patientId);
    }
}

// Example usage
console.log('=== Decompose by Subdomain Pattern (Alternate) ===\n');

const registry = new SubdomainRegistry();

// Define healthcare subdomains
registry
    .defineSubdomain('PatientManagement', SubdomainType.CORE,
        'Manages patient registration and records')
    .defineSubdomain('AppointmentScheduling', SubdomainType.CORE,
        'Handles appointment scheduling and management')
    .defineSubdomain('Billing', SubdomainType.SUPPORTING,
        'Manages billing and payments');

// Add entities
registry
    .addDomainEntity('PatientManagement', 'Patient',
        ['id', 'firstName', 'lastName', 'medicalHistory'])
    .addDomainEntity('AppointmentScheduling', 'Appointment',
        ['id', 'patientId', 'doctorId', 'dateTime'])
    .addDomainEntity('Billing', 'Bill',
        ['id', 'patientId', 'amount', 'status']);

// Register events
registry
    .addDomainEvent('PatientManagement', 'PatientRegistered', {})
    .addDomainEvent('AppointmentScheduling', 'AppointmentScheduled', {})
    .addDomainEvent('Billing', 'BillGenerated', {});

// Create boundary analyzer
const analyzer = new SubdomainBoundaryAnalyzer();

// Analyze interactions
analyzer.analyzeInteraction('AppointmentScheduling', 'PatientManagement', 'read', 10);
analyzer.analyzeInteraction('Billing', 'PatientManagement', 'read', 5);
analyzer.analyzeInteraction('Billing', 'AppointmentScheduling', 'read', 8);

analyzer.calculateCohesion('PatientManagement', ['Patient']);
analyzer.calculateCohesion('AppointmentScheduling', ['Appointment']);
analyzer.calculateCohesion('Billing', ['Bill', 'Payment']);

registry.visualizeSubdomainArchitecture();
analyzer.visualizeInteractions();
analyzer.recommendBoundaries();

// Create services
const patientService = new PatientManagementService();
const appointmentService = new AppointmentSchedulingService();
const billingService = new BillingService();

// Demonstrate
async function demonstrateHealthcareSubdomains() {
    await patientService.initialize();
    await appointmentService.initialize();
    await billingService.initialize();

    console.log('\n--- Healthcare Subdomain Demonstration ---\n');

    // Register patient
    const patient = patientService.registerPatient({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-15',
        contactInfo: { phone: '555-1234', email: 'john@example.com' }
    });

    // Schedule appointment
    const appointment = appointmentService.scheduleAppointment({
        patientId: patient.id,
        doctorId: 'DOC-001',
        dateTime: new Date(Date.now() + 86400000), // Tomorrow
        duration: 30,
        type: 'CHECKUP'
    });

    // Generate bill
    const bill = billingService.generateBill({
        patientId: patient.id,
        appointmentId: appointment.id,
        items: [
            { description: 'Consultation', amount: 150 },
            { description: 'Lab Tests', amount: 75 }
        ]
    });

    // Record payment
    billingService.recordPayment(bill.id, {
        amount: 225,
        method: 'CREDIT_CARD'
    });

    console.log('\n--- Summary ---');
    console.log(`Patients: ${patientService.patients.size}`);
    console.log(`Appointments: ${appointmentService.appointments.size}`);
    console.log(`Bills: ${billingService.bills.size}`);
}

demonstrateHealthcareSubdomains().catch(console.error);

module.exports = {
    SubdomainBoundaryAnalyzer,
    PatientManagementService,
    AppointmentSchedulingService,
    BillingService
};
