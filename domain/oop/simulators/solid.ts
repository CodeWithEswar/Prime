/**
 * Laboratory 9: SOLID Refactoring Studio
 * Invariants: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion before/after models.
 */

export interface SolidScenario {
  id: string;
  name: string;
  shortCode: "SRP" | "OCP" | "LSP" | "ISP" | "DIP";
  principleDescription: string;
  violationTitle: string;
  violationSnippet: string;
  violationProblem: string;
  refactoredTitle: string;
  refactoredSnippet: string;
  tradeOffs: string[];
  interviewDefense: string;
}

export const SOLID_SCENARIOS: SolidScenario[] = [
  {
    id: "solid-srp",
    name: "Single Responsibility Principle",
    shortCode: "SRP",
    principleDescription: "A class should have one, and only one, reason to change (it should be responsible to only one actor).",
    violationTitle: "God Class Handling Data, Printing & Persistence",
    violationSnippet: `class Invoice {
    private double amount;
    public void calculateTax() { /* tax math */ }
    public void printInvoice() { /* formatting & console I/O */ }
    public void saveToDatabase() { /* SQL connection & execution */ }
}`,
    violationProblem: "Invoice has three separate actors: Accounting (tax calculations), Design (printing/formatting), and DBA (database schema). Changes to one actor risk breaking the others.",
    refactoredTitle: "Decoupled Domain, Formatter & Repository",
    refactoredSnippet: `class Invoice {
    private double amount;
    public double calculateTotal() { /* pure domain logic */ }
}
class InvoicePrinter {
    public void print(Invoice invoice) { /* printing only */ }
}
class InvoiceRepository {
    public void save(Invoice invoice) { /* persistence only */ }
}`,
    tradeOffs: [
      "More classes and interfaces created in the project.",
      "Clear boundaries make unit testing trivial with mock repositories.",
      "Modifications to SQL persistence do not touch tax calculations.",
    ],
    interviewDefense: "Explain that SRP prevents cross-cutting bugs: changes in reporting or database drivers cannot accidentally destabilize financial calculations.",
  },
  {
    id: "solid-ocp",
    name: "Open/Closed Principle",
    shortCode: "OCP",
    principleDescription: "Software entities should be open for extension, but closed for modification.",
    violationTitle: "Cascading If-Else on Customer Types",
    violationSnippet: `class DiscountService {
    public double applyDiscount(CustomerType type, double amount) {
        if (type == CustomerType.REGULAR) return amount * 0.95;
        else if (type == CustomerType.VIP) return amount * 0.85;
        else if (type == CustomerType.STUDENT) return amount * 0.90;
        throw new IllegalArgumentException();
    }
}`,
    violationProblem: "Every time marketing adds a new discount tier (e.g. SENIOR, BLACK_FRIDAY), DiscountService must be edited and re-tested, risking regression bugs in existing tiers.",
    refactoredTitle: "Polymorphic Strategy Hierarchy",
    refactoredSnippet: `interface DiscountStrategy {
    double apply(double amount);
}
class RegularDiscount implements DiscountStrategy {
    public double apply(double amount) { return amount * 0.95; }
}
class VipDiscount implements DiscountStrategy {
    public double apply(double amount) { return amount * 0.85; }
}
class DiscountService {
    public double applyDiscount(DiscountStrategy strategy, double amount) {
        return strategy.apply(amount);
    }
}`,
    tradeOffs: [
      "Requires injecting strategy instances or using a lookup factory.",
      "Adding a new discount tier requires zero edits to existing discount code.",
    ],
    interviewDefense: "Show how polymorphism allows you to extend system capabilities by authoring new classes rather than editing established, battle-tested code.",
  },
  {
    id: "solid-lsp",
    name: "Liskov Substitution Principle",
    shortCode: "LSP",
    principleDescription: "Subtypes must be substitutable for their base types without altering program correctness or violating preconditions/postconditions.",
    violationTitle: "Square Extends Rectangle Geometric Trap",
    violationSnippet: `class Rectangle {
    protected int width, height;
    public void setWidth(int w) { this.width = w; }
    public void setHeight(int h) { this.height = h; }
    public int getArea() { return width * height; }
}
class Square extends Rectangle {
    public void setWidth(int w) { this.width = w; this.height = w; }
    public void setHeight(int h) { this.width = h; this.height = h; }
}`,
    violationProblem: "A client method expecting a Rectangle assumes setting width leaves height untouched. Passing a Square silently modifies height, producing incorrect area calculations.",
    refactoredTitle: "Separate Shape Contracts Without False Subtyping",
    refactoredSnippet: `interface Shape {
    int getArea();
}
class Rectangle implements Shape {
    private final int width, height;
    public Rectangle(int w, int h) { this.width = w; this.height = h; }
    public int getArea() { return width * height; }
}
class Square implements Shape {
    private final int side;
    public Square(int side) { this.side = side; }
    public int getArea() { return side * side; }
}`,
    tradeOffs: [
      "Square and Rectangle no longer share mutators; they only share read-only Shape contracts.",
      "Eliminates subtle bugs where subtype side effects violate caller expectations.",
    ],
    interviewDefense: "Highlight that real-world mathematics ('a square is a rectangle') does not always map to inheritance when state mutations are involved.",
  },
  {
    id: "solid-isp",
    name: "Interface Segregation Principle",
    shortCode: "ISP",
    principleDescription: "Clients should not be forced to depend on methods they do not use (prefer small, role-specific interfaces over fat interfaces).",
    violationTitle: "Fat Worker Interface with Dummy Methods",
    violationSnippet: `interface Worker {
    void work();
    void eat();
    void sleep();
}
class RobotWorker implements Worker {
    public void work() { /* working */ }
    public void eat() { throw new UnsupportedOperationException(); }
    public void sleep() { throw new UnsupportedOperationException(); }
}`,
    violationProblem: "RobotWorker is forced to implement eat() and sleep() which make no sense for a machine, polluting the class with throwing stub methods.",
    refactoredTitle: "Segregated Role Interfaces",
    refactoredSnippet: `interface Workable {
    void work();
}
interface Feedable {
    void eat();
}
class HumanWorker implements Workable, Feedable {
    public void work() { /* working */ }
    public void eat() { /* eating */ }
}
class RobotWorker implements Workable {
    public void work() { /* working */ }
}`,
    tradeOffs: [
      "Interfaces become highly granular (single or dual methods).",
      "Clients only depend on what they consume; changes to dining facilities do not recompile RobotWorker.",
    ],
    interviewDefense: "Explain that ISP keeps client boundaries clean and prevents subclasses from throwing UnsupportedOperationException.",
  },
  {
    id: "solid-dip",
    name: "Dependency Inversion Principle",
    shortCode: "DIP",
    principleDescription: "High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.",
    violationTitle: "High-Level OrderService Hardcoded to Concrete MySQL",
    violationSnippet: `class MySqlDatabase {
    public void insert(String data) { /* concrete SQL */ }
}
class OrderService {
    private MySqlDatabase database = new MySqlDatabase();
    public void completeOrder(Order order) {
        database.insert(order.toJson());
    }
}`,
    violationProblem: "OrderService (business logic) is tightly coupled to MySqlDatabase. It cannot be unit-tested without a live MySQL instance, and swapping to PostgreSQL or MongoDB requires editing OrderService.",
    refactoredTitle: "Inverted Dependency with Injected Repository",
    refactoredSnippet: `interface OrderRepository {
    void save(Order order);
}
class MySqlOrderRepository implements OrderRepository {
    public void save(Order order) { /* SQL */ }
}
class OrderService {
    private final OrderRepository repository;
    public OrderService(OrderRepository repo) {
        this.repository = repo; // Injected
    }
    public void completeOrder(Order order) {
        repository.save(order);
    }
}`,
    tradeOffs: [
      "Requires an IoC container (e.g. Spring) or manual constructor dependency wiring.",
      "Enables effortless mock testing (`InMemoryOrderRepository`) in 5 milliseconds.",
    ],
    interviewDefense: "Contrast DIP (the architectural rule) with Dependency Injection (the technique of passing dependencies into constructors).",
  },
];

