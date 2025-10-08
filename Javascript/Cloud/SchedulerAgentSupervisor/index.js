const SchedulerAgentSupervisor = require('./SchedulerAgentSupervisor');

const pattern = new SchedulerAgentSupervisor({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
