import java.util.*;

class Account {
    int accNo;
    String name;
    double balance;
    ArrayList<String> history = new ArrayList<>();

    
    Account(int accNo, String name, double balance) {
        this.accNo = accNo;
        this.name = name;
        this.balance = balance;
        history.add("Account created with balance: " + balance);
    }


    void deposit(double amount) {
        balance += amount;
        history.add("Deposited: " + amount);
        System.out.println("Deposit Successful!");
    }

    
    void withdraw(double amount) {
        try {
            if (amount > balance) {
                throw new Exception("Insufficient Balance!");
            }
            balance -= amount;
            history.add("Withdrawn: " + amount);
            System.out.println("Withdrawal Successful!");
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    
    void display() {
        System.out.println("Account No: " + accNo);
        System.out.println("Name: " + name);
        System.out.println("Balance: " + balance);
    }

    
    void showHistory() {
        System.out.println("Transaction History:");
        for (String h : history) {
            System.out.println(h);
        }
    }
}


public class BankSystem {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ArrayList<Account> accounts = new ArrayList<>();

        int choice;

        do {
            System.out.println("\n1. Create Account");
            System.out.println("2. Deposit");
            System.out.println("3. Withdraw");
            System.out.println("4. Show Details");
            System.out.println("5. Transaction History");
            System.out.println("6. Exit");
            System.out.print("Enter choice: ");
            choice = sc.nextInt();

            switch (choice) {

                case 1:
                    System.out.print("Enter Account No: ");
                    int accNo = sc.nextInt();
                    sc.nextLine();

                    System.out.print("Enter Name: ");
                    String name = sc.nextLine();

                    System.out.print("Enter Initial Balance: ");
                    double bal = sc.nextDouble();

                    accounts.add(new Account(accNo, name, bal));
                    System.out.println("Account Created!");
                    break;

                case 2:
                    System.out.print("Enter Account No: ");
                    int accNo1 = sc.nextInt();

                    for (Account a : accounts) {
                        if (a.accNo == accNo1) {
                            System.out.print("Enter amount: ");
                            double amt = sc.nextDouble();
                            a.deposit(amt);
                        }
                    }
                    break;

                case 3:
                    System.out.print("Enter Account No: ");
                    int accNo2 = sc.nextInt();

                    for (Account a : accounts) {
                        if (a.accNo == accNo2) {
                            System.out.print("Enter amount: ");
                            double amt = sc.nextDouble();
                            a.withdraw(amt);
                        }
                    }
                    break;

                case 4:
                    for (Account a : accounts) {
                        a.display();
                    }
                    break;

                case 5:
                    System.out.print("Enter Account No: ");
                    int accNo3 = sc.nextInt();

                    for (Account a : accounts) {
                        if (a.accNo == accNo3) {
                            a.showHistory();
                        }
                    }
                    break;

                case 6:
                    System.out.println("Exit");
                    break;

                default:
                    System.out.println("Invalid choice");
            }

        } while (choice != 6);

        sc.close();
    }
}