const RemoteProcedureInvocation = require('./RemoteProcedureInvocation');

const pattern = new RemoteProcedureInvocation({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
