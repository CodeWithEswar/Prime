/**
 * Laboratory 10: Design Pattern Explorer
 * Invariants: UML relationships, structural contracts, and step traces for Factory, Strategy, Observer, Builder, and Singleton.
 */

export interface PatternDefinition {
  id: string;
  name: string;
  category: "Creational" | "Behavioral" | "Structural";
  intent: string;
  umlNodes: Array<{ id: string; label: string; kind: "interface" | "class" | "abstract" }>;
  umlEdges: Array<{ from: string; to: string; relationship: "implements" | "extends" | "uses" | "creates" }>;
  codeSnippet: string;
  executionSteps: string[];
  whenToUse: string;
  pitfalls: string;
}

export const DESIGN_PATTERNS: Record<string, PatternDefinition> = {
  factory: {
    id: "factory",
    name: "Factory Method",
    category: "Creational",
    intent: "Define an interface for creating an object, but let subclasses or factory logic decide which class to instantiate.",
    umlNodes: [
      { id: "Notification", label: "«interface» Notification", kind: "interface" },
      { id: "EmailNotification", label: "EmailNotification", kind: "class" },
      { id: "SmsNotification", label: "SmsNotification", kind: "class" },
      { id: "NotificationFactory", label: "NotificationFactory", kind: "class" },
    ],
    umlEdges: [
      { from: "EmailNotification", to: "Notification", relationship: "implements" },
      { from: "SmsNotification", to: "Notification", relationship: "implements" },
      { from: "NotificationFactory", to: "Notification", relationship: "creates" },
    ],
    codeSnippet: `public class NotificationFactory {
    public static Notification create(String channel) {
        if ("EMAIL".equalsIgnoreCase(channel)) return new EmailNotification();
        if ("SMS".equalsIgnoreCase(channel)) return new SmsNotification();
        throw new IllegalArgumentException("Unknown channel: " + channel);
    }
}`,
    executionSteps: [
      "Client requests notification for channel 'EMAIL'.",
      "NotificationFactory.create('EMAIL') executes.",
      "Factory instantiates concrete EmailNotification on heap.",
      "Returns Notification interface reference to caller, hiding concrete class details.",
    ],
    whenToUse: "When a class cannot anticipate the exact class of objects it must create, or to centralize instantiation logic.",
    pitfalls: "Can proliferate classes if applied to trivial objects that rarely change.",
  },
  strategy: {
    id: "strategy",
    name: "Strategy Pattern",
    category: "Behavioral",
    intent: "Define a family of algorithms, encapsulate each one, and make them interchangeable at runtime.",
    umlNodes: [
      { id: "PaymentStrategy", label: "«interface» PaymentStrategy", kind: "interface" },
      { id: "CardStrategy", label: "CardStrategy", kind: "class" },
      { id: "UpiStrategy", label: "UpiStrategy", kind: "class" },
      { id: "ShoppingCart", label: "ShoppingCart", kind: "class" },
    ],
    umlEdges: [
      { from: "CardStrategy", to: "PaymentStrategy", relationship: "implements" },
      { from: "UpiStrategy", to: "PaymentStrategy", relationship: "implements" },
      { from: "ShoppingCart", to: "PaymentStrategy", relationship: "uses" },
    ],
    codeSnippet: `public class ShoppingCart {
    private PaymentStrategy strategy;
    public void setPaymentStrategy(PaymentStrategy s) { this.strategy = s; }
    public void checkout(double amount) {
        strategy.pay(amount);
    }
}`,
    executionSteps: [
      "Client sets ShoppingCart payment strategy to UpiStrategy.",
      "User clicks checkout($150).",
      "ShoppingCart delegates to strategy.pay(150.00).",
      "Runtime dynamic dispatch executes UpiStrategy without cart knowing payment specifics.",
    ],
    whenToUse: "When you have multiple variants of an algorithm (e.g. sorting, compression, pricing) that must be swapped dynamically.",
    pitfalls: "Clients must be aware of strategies to choose the appropriate one.",
  },
  observer: {
    id: "observer",
    name: "Observer Pattern",
    category: "Behavioral",
    intent: "Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically.",
    umlNodes: [
      { id: "Subject", label: "«interface» Subject", kind: "interface" },
      { id: "StockMarket", label: "StockMarket", kind: "class" },
      { id: "Observer", label: "«interface» Observer", kind: "interface" },
      { id: "MobileAppDisplay", label: "MobileAppDisplay", kind: "class" },
    ],
    umlEdges: [
      { from: "StockMarket", to: "Subject", relationship: "implements" },
      { from: "MobileAppDisplay", to: "Observer", relationship: "implements" },
      { from: "Subject", to: "Observer", relationship: "uses" },
    ],
    codeSnippet: `public class StockMarket implements Subject {
    private List<Observer> observers = new ArrayList<>();
    public void register(Observer o) { observers.add(o); }
    public void setPrice(double price) {
        for (Observer o : observers) o.update(price);
    }
}`,
    executionSteps: [
      "MobileAppDisplay registers itself with StockMarket.",
      "StockMarket updates price from $100 to $105.",
      "StockMarket iterates through registered observers list.",
      "Calls o.update(105) on all listeners, updating live UI displays.",
    ],
    whenToUse: "Event handling, pub-sub architectures, and reactive UI models.",
    pitfalls: "Can cause memory leaks ('Lapsed Listener problem') if observers fail to unregister before destruction.",
  },
  builder: {
    id: "builder",
    name: "Builder Pattern",
    category: "Creational",
    intent: "Separate the construction of a complex object from its representation, allowing the same construction process to create diverse representations.",
    umlNodes: [
      { id: "User", label: "User (Immutable)", kind: "class" },
      { id: "UserBuilder", label: "User.Builder", kind: "class" },
    ],
    umlEdges: [
      { from: "UserBuilder", to: "User", relationship: "creates" },
    ],
    codeSnippet: `public class User {
    private final String username; // required
    private final String email;    // optional
    private User(Builder b) { this.username = b.username; this.email = b.email; }
    public static class Builder {
        private String username;
        private String email;
        public Builder(String u) { this.username = u; }
        public Builder email(String e) { this.email = e; return this; }
        public User build() { return new User(this); }
    }
}`,
    executionSteps: [
      "Client invokes new User.Builder('alex').",
      "Calls chained method .email('alex@prime.io').",
      "Calls .build() which executes private constructor with validation.",
      "Returns fully immutable, verified User object.",
    ],
    whenToUse: "When constructors have more than 4 parameters (avoiding telescoping constructors) or when creating immutable objects.",
    pitfalls: "Requires writing verbose boilerplate builder classes.",
  },
  singleton: {
    id: "singleton",
    name: "Singleton Pattern",
    category: "Creational",
    intent: "Ensure a class only has one instance, and provide a global point of access to it.",
    umlNodes: [
      { id: "DatabasePool", label: "DatabasePool (Singleton)", kind: "class" },
    ],
    umlEdges: [],
    codeSnippet: `public class DatabasePool {
    private static volatile DatabasePool instance;
    private DatabasePool() {} // Private constructor
    public static DatabasePool getInstance() {
        if (instance == null) {
            synchronized (DatabasePool.class) {
                if (instance == null) instance = new DatabasePool();
            }
        }
        return instance;
    }
}`,
    executionSteps: [
      "Thread A calls DatabasePool.getInstance().",
      "First check sees instance == null, acquires synchronized class lock.",
      "Second check confirms instance == null, allocates heap object into volatile instance variable.",
      "Thread B calls getInstance() and returns cached pointer without entering lock.",
    ],
    whenToUse: "For shared resources where multiple instances cause logical or physical conflict (e.g. connection pools, hardware drivers).",
    pitfalls: "Can introduce hidden state coupling and make unit testing difficult if abused as a global variable.",
  },
};

