/** Concrete State */
public class HasCoinState implements State {
    private VendingMachine machine;

    public HasCoinState(VendingMachine machine) {
        this.machine = machine;
    }

    @Override
    public void insertCoin() {
        System.out.println("Coin already inserted");
    }

    @Override
    public void ejectCoin() {
        System.out.println("Coin ejected");
        machine.setState(machine.getNoCoinState());
    }

    @Override
    public void dispense() {
        System.out.println("Dispensing product...");
        machine.setState(machine.getNoCoinState());
    }
}
