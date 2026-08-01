import java.util.*;

class Student {
    private String name;
    private int id;
    private double marks;

    public Student(String name, int id, double marks) {
        this.name = name;
        this.id = id;
        this.marks = marks;
    }

    public int getId() {
        return id;
    }

    public double getMarks() {
        return marks;
    }

    public void display() {
        System.out.println("Name: " + name + ", ID: " + id + ", Marks: " + marks);
    }
}

public class StudentManager {

    static void addStudent(ArrayList<Student> list, Scanner sc) {
        sc.nextLine();

        System.out.print("Enter Name: ");
        String name = sc.nextLine();

        System.out.print("Enter ID: ");
        int id = sc.nextInt();

        System.out.print("Enter Marks: ");
        double marks = sc.nextDouble();

        list.add(new Student(name, id, marks));
        System.out.println("Student Added!");
    }

    static void displayStudents(ArrayList<Student> list) {
        if (list.isEmpty()) {
            System.out.println("No students found!");
            return;
        }

        for (Student s : list) {
            s.display();
        }
    }

    static void searchStudent(ArrayList<Student> list, Scanner sc) {
        System.out.print("Enter ID: ");
        int id = sc.nextInt();

        for (Student s : list) {
            if (s.getId() == id) {
                s.display();
                return;
            }
        }

        System.out.println("Student not found!");
    }

    static void averageMarks(ArrayList<Student> list) {
        if (list.isEmpty()) {
            System.out.println("No students available!");
            return;
        }

        double sum = 0;
        for (Student s : list) {
            sum += s.getMarks();
        }

        double avg = sum / list.size();
        System.out.println("Average Marks: " + avg);
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ArrayList<Student> list = new ArrayList<>();

        int choice;

        do {
            System.out.println("\n===== MENU =====");
            System.out.println("1. Add Student");
            System.out.println("2. Display Students");
            System.out.println("3. Search by ID");
            System.out.println("4. Average Marks");
            System.out.println("5. Exit");
            System.out.print("Choose: ");

            choice = sc.nextInt();

            switch (choice) {
                case 1:
                    addStudent(list, sc);
                    break;
                case 2:
                    displayStudents(list);
                    break;
                case 3:
                    searchStudent(list, sc);
                    break;
                case 4:
                    averageMarks(list);
                    break;
                case 5:
                    System.out.println("Exiting...");
                    break;
                default:
                    System.out.println("Invalid choice!");
            }
        } while (choice != 5);
    }
}