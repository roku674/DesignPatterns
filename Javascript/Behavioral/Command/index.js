const { Light, Thermostat, LightOnCommand, LightOffCommand, DimLightCommand, SetTemperatureCommand, RemoteControl } = require('./smart-home');

console.log('=== Command Pattern Demo ===\n');

const light = new Light();
const thermostat = new Thermostat();
const remote = new RemoteControl();

console.log('Executing commands:');
remote.submit(new LightOnCommand(light));
remote.submit(new SetTemperatureCommand(thermostat, 75));
remote.submit(new DimLightCommand(light, 50));

console.log('\nUndo last command:');
remote.undo();

console.log('\nUndo again:');
remote.undo();

console.log('\n=== Demo Complete ===');
