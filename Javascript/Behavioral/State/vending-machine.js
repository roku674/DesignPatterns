/**
 * State Pattern - Vending Machine
 */

class State {
  insertCoin() { throw new Error('insertCoin() must be implemented'); }
  ejectCoin() { throw new Error('ejectCoin() must be implemented'); }
  dispense() { throw new Error('dispense() must be implemented'); }
}

class NoCoinState extends State {
  constructor(machine) {
    super();
    this.machine = machine;
  }

  insertCoin() {
    console.log('Coin inserted');
    this.machine.setState(this.machine.hasCoinState);
  }

  ejectCoin() {
    console.log('No coin to eject');
  }

  dispense() {
    console.log('Insert coin first');
  }
}

class HasCoinState extends State {
  constructor(machine) {
    super();
    this.machine = machine;
  }

  insertCoin() {
    console.log('Coin already inserted');
  }

  ejectCoin() {
    console.log('Coin returned');
    this.machine.setState(this.machine.noCoinState);
  }

  dispense() {
    console.log('Dispensing item...');
    this.machine.setState(this.machine.noCoinState);
  }
}

class VendingMachine {
  constructor() {
    this.noCoinState = new NoCoinState(this);
    this.hasCoinState = new HasCoinState(this);
    this.state = this.noCoinState;
  }

  setState(state) {
    this.state = state;
  }

  insertCoin() {
    this.state.insertCoin();
  }

  ejectCoin() {
    this.state.ejectCoin();
  }

  dispense() {
    this.state.dispense();
  }
}

module.exports = { VendingMachine };
