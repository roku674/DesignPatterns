/** Concrete State */
public class NoCoinState implements State {
    private VendingMachine machine;

    public NoCoinState(VendingMachine machine) {
        this.machine = machine;
    }

    @Override
    public void insertCoin() {
        System.out.println("Coin inserted");
        machine.setState(machine.getHasCoinState());
    }

    @Override
    public void ejectCoin() {
        System.out.println("No coin to eject");
    }

    @Override
    public void dispense() {
        System.out.println("Insert coin first");
    }
}
