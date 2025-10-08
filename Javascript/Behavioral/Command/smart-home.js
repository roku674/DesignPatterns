/**
 * Command Pattern - Smart Home Automation
 */

class Light {
  on() { console.log('[Light] Turned ON'); }
  off() { console.log('[Light] Turned OFF'); }
  dim(level) { console.log(`[Light] Dimmed to ${level}%`); }
}

class Thermostat {
  setTemperature(temp) { console.log(`[Thermostat] Set to ${temp}°F`); }
}

class Command {
  execute() { throw new Error('execute() must be implemented'); }
  undo() { throw new Error('undo() must be implemented'); }
}

class LightOnCommand extends Command {
  constructor(light) { super(); this.light = light; }
  execute() { this.light.on(); }
  undo() { this.light.off(); }
}

class LightOffCommand extends Command {
  constructor(light) { super(); this.light = light; }
  execute() { this.light.off(); }
  undo() { this.light.on(); }
}

class DimLightCommand extends Command {
  constructor(light, level) {
    super();
    this.light = light;
    this.level = level;
    this.previousLevel = 100;
  }
  execute() { this.light.dim(this.level); }
  undo() { this.light.dim(this.previousLevel); }
}

class SetTemperatureCommand extends Command {
  constructor(thermostat, temperature) {
    super();
    this.thermostat = thermostat;
    this.temperature = temperature;
    this.previousTemp = 72;
  }
  execute() { this.thermostat.setTemperature(this.temperature); }
  undo() { this.thermostat.setTemperature(this.previousTemp); }
}

class RemoteControl {
  constructor() {
    this.history = [];
  }

  submit(command) {
    command.execute();
    this.history.push(command);
  }

  undo() {
    if (this.history.length > 0) {
      const command = this.history.pop();
      command.undo();
    }
  }
}

module.exports = { Light, Thermostat, LightOnCommand, LightOffCommand, DimLightCommand, SetTemperatureCommand, RemoteControl };
