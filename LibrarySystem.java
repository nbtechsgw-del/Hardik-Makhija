import java.util.*;

class Book {
    int id;
    String name;
    boolean isIssued;
    String dueDate;

    Book(int id, String name) {
        this.id = id;
        this.name = name;
        this.isIssued = false;
        this.dueDate = "Not Issued";
    }

    void display() {
        System.out.println("ID: " + id + ", Name: " + name +
                ", Issued: " + isIssued + ", Due Date: " + dueDate);
    }
}

class Library {
    ArrayList<Book> books = new ArrayList<>();

    void addBook(int id, String name) {
        books.add(new Book(id, name));
        System.out.println("Book added successfully!");
    }

    void showBooks() {
        for (Book b : books) {
            b.display();
        }
    }

    void issueBook(int id, String dueDate) {
        for (Book b : books) {
            if (b.id == id && !b.isIssued) {
                b.isIssued = true;
                b.dueDate = dueDate;
                System.out.println("Book issued successfully!");
                return;
            }
        }
        System.out.println("Book not available!");
    }

    void returnBook(int id) {
        for (Book b : books) {
            if (b.id == id && b.isIssued) {
                b.isIssued = false;
                b.dueDate = "Not Issued";
                System.out.println("Book returned successfully!");
                return;
            }
        }
        System.out.println("Invalid return!");
    }
}

public class LibrarySystem {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Library lib = new Library();

        while (true) {
            System.out.println("\n1. Add Book");
            System.out.println("2. Show Books");
            System.out.println("3. Issue Book");
            System.out.println("4. Return Book");
            System.out.println("5. Exit");

            System.out.print("Enter choice: ");
            int ch = sc.nextInt();

            switch (ch) {
                case 1:
                    System.out.print("Enter Book ID: ");
                    int id = sc.nextInt();
                    sc.nextLine();
                    System.out.print("Enter Book Name: ");
                    String name = sc.nextLine();
                    lib.addBook(id, name);
                    break;

                case 2:
                    lib.showBooks();
                    break;

                case 3:
                    System.out.print("Enter Book ID: ");
                    int issueId = sc.nextInt();
                    sc.nextLine();
                    System.out.print("Enter Due Date (DD/MM/YYYY): ");
                    String due = sc.nextLine();
                    lib.issueBook(issueId, due);
                    break;

                case 4:
                    System.out.print("Enter Book ID: ");
                    int returnId = sc.nextInt();
                    lib.returnBook(returnId);
                    break;

                case 5:
                    System.exit(0);

                default:
                    System.out.println("Invalid choice!");
            }
        }
    }
}