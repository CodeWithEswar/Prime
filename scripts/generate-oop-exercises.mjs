import fs from "fs";

const outputPredictionQuestions = [
  {
    id: "pred-01",
    title: "Constructor Chaining & Super Calling",
    day: 2,
    topic: "constructors",
    difficulty: "medium",
    javaVersion: "Java 17+",
    snippet: `class Parent {
    Parent() {
        System.out.print("P1 ");
    }
    Parent(String msg) {
        System.out.print("P2:" + msg + " ");
    }
}
class Child extends Parent {
    Child() {
        this("init");
        System.out.print("C1 ");
    }
    Child(String msg) {
        super(msg);
        System.out.print("C2:" + msg + " ");
    }
}
public class Test {
    public static void main(String[] args) {
        new Child();
    }
}`,
    expectedOutput: "P2:init C2:init C1",
    explanation: "When `new Child()` runs, it calls `this(\"init\")` in Child. The single-argument Child constructor calls `super(\"init\")`, executing `Parent(String msg)` which prints 'P2:init '. Control returns to `Child(String msg)`, which prints 'C2:init '. Finally, control returns to `Child()`, which prints 'C1 '.",
    misconceptionTags: ["constructor-chaining", "this-super-ordering"]
  },
  {
    id: "pred-02",
    title: "Static Field Hiding vs Overriding",
    day: 3,
    topic: "static-members",
    difficulty: "medium",
    javaVersion: "Java 17+",
    snippet: `class Alpha {
    static void printMessage() {
        System.out.print("AlphaStatic ");
    }
    void show() {
        System.out.print("AlphaInstance ");
    }
}
class Beta extends Alpha {
    static void printMessage() {
        System.out.print("BetaStatic ");
    }
    void show() {
        System.out.print("BetaInstance ");
    }
}
public class StaticTest {
    public static void main(String[] args) {
        Alpha obj = new Beta();
        obj.printMessage();
        obj.show();
    }
}`,
    expectedOutput: "AlphaStatic BetaInstance",
    explanation: "Static methods cannot be overridden; they are hidden (method hiding). The call `obj.printMessage()` resolves at compile-time based on the declared reference type `Alpha`, executing `Alpha.printMessage()`. In contrast, instance method `obj.show()` uses dynamic method dispatch and resolves at runtime based on the actual object on heap (`Beta`), executing `Beta.show()`.",
    misconceptionTags: ["static-hiding", "dynamic-dispatch-vs-static"]
  },
  {
    id: "pred-03",
    title: "Polymorphism with Overloaded vs Overridden Methods",
    day: 5,
    topic: "polymorphism",
    difficulty: "hard",
    javaVersion: "Java 17+",
    snippet: `class Base {
    void process(Object obj) {
        System.out.print("Base(Object) ");
    }
    void process(String str) {
        System.out.print("Base(String) ");
    }
}
class Derived extends Base {
    void process(Object obj) {
        System.out.print("Derived(Object) ");
    }
    void process(String str) {
        System.out.print("Derived(String) ");
    }
}
public class PolyTest {
    public static void main(String[] args) {
        Base b = new Derived();
        Object text = "PRIME";
        b.process(text);
    }
}`,
    expectedOutput: "Derived(Object)",
    explanation: "Method overloading is resolved at compile time based on the declared type of the argument (`text` has declared type `Object`). At compile time, the compiler selects signature `process(Object)`. At runtime, dynamic method dispatch selects the overriding implementation in `Derived`, printing 'Derived(Object) ' despite the runtime instance being a String.",
    misconceptionTags: ["compile-time-overload-resolution", "runtime-dispatch"]
  },
  {
    id: "pred-04",
    title: "Initialization Order: Static Blocks, Instance Blocks, Constructors",
    day: 3,
    topic: "initialization-order",
    difficulty: "hard",
    javaVersion: "Java 17+",
    snippet: `class InitOrder {
    static { System.out.print("S1 "); }
    { System.out.print("I1 "); }
    InitOrder() { System.out.print("C1 "); }
    static { System.out.print("S2 "); }
    { System.out.print("I2 "); }
}
public class Runner {
    public static void main(String[] args) {
        System.out.print("M ");
        new InitOrder();
        new InitOrder();
    }
}`,
    expectedOutput: "M S1 S2 I1 I2 C1 I1 I2 C1",
    explanation: "Class `Runner` executes `main`, printing 'M '. Next, `InitOrder` is loaded for the first time: static blocks execute in textual order ('S1 S2 '). Then instance blocks and constructors execute for the first object ('I1 I2 C1 '). For the second object, static blocks do NOT execute again; only instance blocks and constructor execute ('I1 I2 C1 ').",
    misconceptionTags: ["static-init-once", "instance-init-per-object"]
  },
  {
    id: "pred-05",
    title: "Pass-by-Value with Object References",
    day: 2,
    topic: "references-memory",
    difficulty: "medium",
    javaVersion: "Java 17+",
    snippet: `class Person {
    String name;
    Person(String name) { this.name = name; }
}
public class PassByValueTest {
    static void modify(Person p) {
        p.name = "Alice";
        p = new Person("Bob");
    }
    public static void main(String[] args) {
        Person dev = new Person("Charlie");
        modify(dev);
        System.out.println(dev.name);
    }
}`,
    expectedOutput: "Alice",
    explanation: "Java is strictly pass-by-value. When `dev` is passed into `modify(Person p)`, a copy of the reference pointer is passed. `p.name = \"Alice\"` mutates the object on the heap that `dev` points to. However, `p = new Person(\"Bob\")` merely reassigns the local parameter copy `p`; it does NOT reassign `dev` in `main`. Therefore `dev.name` remains 'Alice'.",
    misconceptionTags: ["pass-by-value", "reference-aliasing"]
  },
  {
    id: "pred-06",
    title: "Protected Access Across Packages via Superclass Reference",
    day: 7,
    topic: "access-modifiers",
    difficulty: "hard",
    javaVersion: "Java 17+",
    snippet: `// Package: pkgA
package pkgA;
public class Account {
    protected int balance = 1000;
}

// Package: pkgB
package pkgB;
import pkgA.Account;

public class PremiumAccount extends Account {
    void check(Account other) {
        System.out.print(this.balance + " "); // Line 1
        // System.out.print(other.balance);   // Line 2
    }
    public static void main(String[] args) {
        PremiumAccount pa = new PremiumAccount();
        pa.check(new Account());
    }
}`,
    expectedOutput: "1000",
    explanation: "Line 1 compiles because `PremiumAccount` accesses its inherited protected member `this.balance`. If Line 2 were uncommented, it would cause a compile-time error! In Java (JLS §6.6.2), a subclass in a different package cannot access a protected member of the superclass through an arbitrary superclass reference (`other.balance`); it can only access protected members through references of its own subtype or sub-subtypes.",
    misconceptionTags: ["protected-receiver-rule", "cross-package-protected"]
  },
  {
    id: "pred-07",
    title: "String Literal Pool vs Heap new String()",
    day: 7,
    topic: "equality-contract",
    difficulty: "easy",
    javaVersion: "Java 17+",
    snippet: `public class StringEquality {
    public static void main(String[] args) {
        String s1 = "prime";
        String s2 = "prime";
        String s3 = new String("prime");
        
        System.out.print((s1 == s2) + " ");
        System.out.print((s1 == s3) + " ");
        System.out.print(s1.equals(s3));
    }
}`,
    expectedOutput: "true false true",
    explanation: "`s1` and `s2` refer to the same literal in the String Constant Pool, so `s1 == s2` is true. `s3` is explicitly created on the heap with `new`, so `s1 == s3` is false (distinct memory addresses). `s1.equals(s3)` compares character sequence content and evaluates to true.",
    misconceptionTags: ["identity-vs-equality", "string-constant-pool"]
  },
  {
    id: "pred-08",
    title: "HashMap Key Mutation & equals/hashCode Agreement",
    day: 10,
    topic: "hashmap-internals",
    difficulty: "hard",
    javaVersion: "Java 17+",
    snippet: `import java.util.*;

class Key {
    int id;
    Key(int id) { this.id = id; }
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Key)) return false;
        return id == ((Key) o).id;
    }
    public int hashCode() {
        return id;
    }
}
public class MapTest {
    public static void main(String[] args) {
        Map<Key, String> map = new HashMap<>();
        Key k = new Key(10);
        map.put(k, "DATA");
        k.id = 20; // Mutate key
        System.out.print(map.get(k) + " " + map.size());
    }
}`,
    expectedOutput: "null 1",
    explanation: "When `map.put(k, \"DATA\")` was called, the key was placed in bucket `10 % capacity`. After `k.id = 20;`, calling `map.get(k)` calculates hash `20` and searches bucket `20 % capacity`, finding nothing (`null`). Even though the entry is still physically stored in the map (`size() == 1`), it has become an unretrievable orphan. Keys in HashMaps must be immutable!",
    misconceptionTags: ["mutable-hashmap-keys", "hashcode-bucket-orphan"]
  },
  {
    id: "pred-09",
    title: "try-catch-finally with return Statements",
    day: 9,
    topic: "exceptions",
    difficulty: "medium",
    javaVersion: "Java 17+",
    snippet: `public class ExceptionFlow {
    static int calculate() {
        try {
            int a = 10 / 0;
            return 1;
        } catch (ArithmeticException e) {
            return 2;
        } finally {
            return 3;
        }
    }
    public static void main(String[] args) {
        System.out.println(calculate());
    }
}`,
    expectedOutput: "3",
    explanation: "The `try` block throws `ArithmeticException`. The `catch` block catches it and prepares to return `2`. However, before returning, the `finally` block must execute. Since the `finally` block executes `return 3;`, it overrides any pending return value from the catch block, returning 3.",
    misconceptionTags: ["finally-overrides-return", "exception-unwinding"]
  },
  {
    id: "pred-10",
    title: "Interface Default Method Resolution & Diamond Problem",
    day: 8,
    topic: "interfaces",
    difficulty: "hard",
    javaVersion: "Java 17+",
    snippet: `interface Left {
    default void log() { System.out.print("Left "); }
}
interface Right {
    default void log() { System.out.print("Right "); }
}
class Center implements Left, Right {
    public void log() {
        Left.super.log();
        System.out.print("Center");
    }
}
public class DiamondTest {
    public static void main(String[] args) {
        new Center().log();
    }
}`,
    expectedOutput: "Left Center",
    explanation: "If a class implements two interfaces that both supply a default method with the identical signature (`log()`), the compiler requires the implementing class to resolve the conflict by overriding the method. In `Center`, `log()` explicitly delegates to `Left.super.log()` and prints 'Center', yielding 'Left Center'.",
    misconceptionTags: ["default-method-diamond", "interface-super-syntax"]
  }
];

const lldCases = [
  {
    id: "lld-parking-lot",
    caseNumber: 1,
    title: "Design a Multi-Floor Parking Lot System",
    day: 11,
    difficulty: "hard",
    interviewFrequency: "Very High",
    summary: "Design an extensible object-oriented architecture for a multi-floor parking lot accommodating diverse vehicle sizes (Motorcycle, Car, Truck, EV) with dynamic spot allocation and multiple payment strategies.",
    entities: ["ParkingLot", "ParkingFloor", "ParkingSpot", "Vehicle", "Ticket", "Payment", "PricingStrategy"],
    relationships: [
      "ParkingLot has-a List<ParkingFloor> (Composition)",
      "ParkingFloor has-a Map<SpotType, List<ParkingSpot>> (Composition)",
      "ParkingSpot has-a nullable Vehicle (Aggregation)",
      "Vehicle is-a abstract base class with Car, Truck, Motorcycle subclasses",
      "Ticket has-a ParkingSpot, Vehicle, and entry timestamp",
      "Payment delegates to PricingStrategy interface"
    ],
    constraints: [
      "Support multiple entry and exit panels concurrently.",
      "EV spots have active charging stations with kWh metering.",
      "Dynamic pricing based on vehicle type and duration (First hour flat, subsequent hours hourly).",
      "Thread-safe spot assignment to prevent double-booking under race conditions."
    ],
    extensionPoints: [
      "Add handicap / reserved VIP spots without modifying core spot allocator (Open/Closed Principle).",
      "Introduce surge pricing during peak hours via Strategy Pattern."
    ],
    evaluationRubric: [
      "Single Responsibility: Are spot search, payment calculation, and display logic decoupled?",
      "Design Patterns: Is Strategy pattern utilized for pricing? Is Factory pattern used for spot/ticket generation?",
      "Concurrency: Are atomic locks or concurrent collections considered for spot assignment?"
    ]
  },
  {
    id: "lld-library-management",
    caseNumber: 2,
    title: "Design a Library Management System",
    day: 11,
    difficulty: "medium",
    interviewFrequency: "High",
    summary: "Model a public library lending system with books, physical book copies (BookItem with barcode), members, librarians, reservation queues, and fine calculations for overdue returns.",
    entities: ["Library", "Book", "BookItem", "Member", "Librarian", "BookLending", "Fine"],
    relationships: [
      "Book has-many BookItem copies (1 Book metadata -> N physical copies)",
      "Member has-many active BookLending records (Max 5 active borrows)",
      "BookItem has-a BookStatus (AVAILABLE, RESERVED, LOANED, LOST)",
      "Library has-a Catalog with inverted search index by title, author, subject"
    ],
    constraints: [
      "Members cannot borrow more than 5 books concurrently.",
      "Books can be reserved if all physical items are currently loaned.",
      "Fines compound daily after a 14-day checkout window."
    ],
    extensionPoints: [
      "Digital eBooks with auto-expiring checkout licenses.",
      "Notification system on reservation availability via Observer Pattern."
    ],
    evaluationRubric: [
      "Separation between Book (metadata) and BookItem (physical copy).",
      "State Pattern for BookItem lifecycle transitions.",
      "Clean encapsulation of fine calculator."
    ]
  },
  {
    id: "lld-atm-system",
    caseNumber: 3,
    title: "Design an Automated Teller Machine (ATM)",
    day: 11,
    difficulty: "hard",
    interviewFrequency: "High",
    summary: "Architect an ATM hardware/software interface handling states (Idle, CardInserted, PINEntered, TransactionSelection), cash dispensers using Chain of Responsibility for denominations, and banking core integrations.",
    entities: ["ATM", "CardReader", "CashDispenser", "Keypad", "Screen", "BankService", "Account", "Transaction"],
    relationships: [
      "ATM uses State Pattern (IdleState, HasCardState, PinVerifiedState, DispensingState)",
      "CashDispenser uses Chain of Responsibility ($100 Dispenser -> $50 -> $20 -> $10)",
      "Transaction is-a abstract base (Withdrawal, Deposit, BalanceInquiry)"
    ],
    constraints: [
      "Reject operations if ATM physical cash reserve is insufficient.",
      "Lock card after 3 consecutive invalid PIN entries.",
      "ACID transactional atomicity: account debited only after cash successfully dispensed."
    ],
    extensionPoints: [
      "Support contactless NFC card reading.",
      "Multi-currency conversion provider."
    ],
    evaluationRubric: [
      "State pattern cleanliness and transition validation.",
      "Chain of responsibility for denomination dispensing.",
      "Hardware error compensation handling."
    ]
  },
  {
    id: "lld-elevator-system",
    caseNumber: 4,
    title: "Design an Elevator Control System",
    day: 11,
    difficulty: "hard",
    interviewFrequency: "Very High",
    summary: "Design an elevator dispatcher controlling a bank of elevators across N floors using scheduling algorithms (SCAN / LOOK / FCFS), handling internal floor buttons and external hall call requests.",
    entities: ["ElevatorController", "ElevatorCar", "Door", "HallButton", "CarButton", "DispatchStrategy"],
    relationships: [
      "ElevatorController manages List<ElevatorCar>",
      "ElevatorCar has-a Direction (UP, DOWN, IDLE) and State (MOVING, STOPPED, DOOR_OPEN)",
      "ElevatorCar has-a TreeSet<Integer> floorRequests",
      "ElevatorController delegates hall request assignment to DispatchStrategy"
    ],
    constraints: [
      "Prevent door closing if obstruction sensor detects presence.",
      "Weight capacity sensor prevents movement if overweight threshold exceeded.",
      "Elevator should serve requests in current direction of travel before reversing (SCAN/LOOK)."
    ],
    extensionPoints: [
      "VIP / Emergency fire service override mode.",
      "Energy-conserving idle floor positioning."
    ],
    evaluationRubric: [
      "Separation of external dispatcher from internal car mechanics.",
      "Correct state modeling for doors and directional queues.",
      "Strategy pattern for dispatch algorithm swapping."
    ]
  },
  {
    id: "lld-vending-machine",
    caseNumber: 5,
    title: "Design a Vending Machine",
    day: 11,
    difficulty: "medium",
    interviewFrequency: "High",
    summary: "Create a vending machine that accepts coins/bills/cards, dispenses snacks/drinks, returns exact change, and tracks inventory across row/column slots using the State Pattern.",
    entities: ["VendingMachine", "Inventory", "ItemSlot", "Item", "CoinInventory", "VendingState"],
    relationships: [
      "VendingMachine delegates actions to VendingState (IdleState, CoinInsertedState, DispenseState, ReturnChangeState)",
      "Inventory has-a Map<String, ItemSlot>",
      "ItemSlot has-a Item and count"
    ],
    constraints: [
      "Return inserted money if user cancels or item is out of stock.",
      "Greedy change-making algorithm handles exact coin availability.",
      "Item dropped only after balance is deducted."
    ],
    extensionPoints: [
      "Card / UPI contactless payment reader integration.",
      "Dynamic refrigeration temperature monitoring."
    ],
    evaluationRubric: [
      "Strict application of State Pattern without large switch-case conditionals.",
      "Inventory isolation and change computation safety."
    ]
  },
  {
    id: "lld-notification-service",
    caseNumber: 6,
    title: "Design a Multi-Channel Notification Service",
    day: 11,
    difficulty: "medium",
    interviewFrequency: "High",
    summary: "Model a decoupled notification distribution service delivering messages across SMS, Email, Push, and Webhook channels with priority queues, rate-limiting, and template rendering.",
    entities: ["NotificationService", "NotificationRequest", "ChannelProvider", "TemplateEngine", "RateLimiter"],
    relationships: [
      "ChannelProvider interface implemented by SmsProvider (Twilio), EmailProvider (SendGrid), PushProvider (FCM)",
      "NotificationService uses Factory Pattern to instantiate providers",
      "TemplateEngine formats dynamic variables in message templates"
    ],
    constraints: [
      "Fallback provider cascade if primary channel fails.",
      "User channel preferences and opt-out unsubscribe lists.",
      "Asynchronous non-blocking dispatch with message idempotency keys."
    ],
    extensionPoints: [
      "Batch digest notification delivery (daily/weekly).",
      "A/B testing message variants."
    ],
    evaluationRubric: [
      "Factory and Strategy patterns for channel isolation.",
      "Interface segregation for SMS vs Email vs Push requirements."
    ]
  },
  {
    id: "lld-payment-gateway",
    caseNumber: 7,
    title: "Design a Payment Gateway System",
    day: 11,
    difficulty: "hard",
    interviewFrequency: "Very High",
    summary: "Design an extensible payment processing architecture supporting multiple instruments (Card, UPI, NetBanking, Crypto) and third-party gateways (Stripe, Razorpay, PayPal) with retry logic and webhooks.",
    entities: ["PaymentGateway", "PaymentProcessor", "PaymentMethod", "Transaction", "WebhookHandler", "RefundService"],
    relationships: [
      "PaymentProcessor interface implemented by StripeAdapter, RazorpayAdapter, PayPalAdapter (Adapter Pattern)",
      "PaymentMethod is-a abstract class with CardPayment, UpiPayment",
      "Transaction records lifecycle: INITIATED -> PENDING -> AUTHORIZED -> CAPTURED -> FAILED"
    ],
    constraints: [
      "Zero double-charging: strict idempotency key on all capture calls.",
      "PCI-DSS compliance: sensitive card PAN tokens never stored in plaintext.",
      "Automatic reconciliation of async webhook callbacks."
    ],
    extensionPoints: [
      "Multi-split payout to multiple marketplace sellers.",
      "Fraud risk scoring engine before authorization."
    ],
    evaluationRubric: [
      "Adapter Pattern for unifying disparate third-party gateway APIs.",
      "State machine integrity for payment lifecycle.",
      "Idempotency and retry policies."
    ]
  },
  {
    id: "lld-inventory-management",
    caseNumber: 8,
    title: "Design an E-Commerce Warehouse Inventory System",
    day: 11,
    difficulty: "hard",
    interviewFrequency: "Medium",
    summary: "Architect an inventory management system handling SKU cataloging, warehouse bin location mapping, order reservations, stock replenishment, and low-inventory alerts.",
    entities: ["Warehouse", "InventoryManager", "ProductSKU", "BinLocation", "StockReservation", "ReplenishmentOrder"],
    relationships: [
      "Warehouse has-many BinLocations",
      "ProductSKU has-many physical Units distributed across bins",
      "InventoryManager coordinates stock reservations with 15-minute lock expiration"
    ],
    constraints: [
      "Atomic stock decrement to prevent overselling flash-sale items.",
      "FIFO/LIFO stock rotation for perishable items.",
      "Reorder alert triggered when available stock drops below threshold."
    ],
    extensionPoints: [
      "Multi-warehouse nearest-fulfillment routing strategy.",
      "Automated automated guided vehicle (AGV) picking paths."
    ],
    evaluationRubric: [
      "Distinction between catalog product and warehouse physical stock unit.",
      "Observer pattern for low-stock replenishment events."
    ]
  },
  {
    id: "lld-movie-ticket-booking",
    caseNumber: 9,
    title: "Design a Movie Ticket Booking System (BookMyShow)",
    day: 12,
    difficulty: "hard",
    interviewFrequency: "Very High",
    summary: "Design a movie ticket booking platform supporting theaters, auditoriums, screen layouts (Platinum, Gold, Silver), shows, seat reservation locks, and concurrent booking resolution.",
    entities: ["Theater", "CinemaHall", "Show", "Movie", "Seat", "ShowSeat", "Booking", "Payment"],
    relationships: [
      "Theater has-many CinemaHalls",
      "CinemaHall has-many Seats (Physical blueprint)",
      "Show references Movie, CinemaHall, and startTime",
      "ShowSeat ties physical Seat to specific Show with ShowSeatStatus (AVAILABLE, TEMPORARILY_LOCKED, BOOKED)",
      "Booking has-many ShowSeats"
    ],
    constraints: [
      "Seat lock expires automatically after 10 minutes if payment is not confirmed.",
      "Prevent two users from booking the same seat simultaneously under high concurrency.",
      "Different pricing tiers for weekend vs weekday and seat tiers."
    ],
    extensionPoints: [
      "Food and beverage add-on basket integration.",
      "Coupon discount promotion engine."
    ],
    evaluationRubric: [
      "Crucial separation between physical Seat and show-specific ShowSeat.",
      "Temporary lock expiration and transactional booking integrity.",
      "Strategy pattern for pricing."
    ]
  },
  {
    id: "lld-car-rental-system",
    caseNumber: 10,
    title: "Design a Car Rental System (Zoomcar)",
    day: 12,
    difficulty: "medium",
    interviewFrequency: "High",
    summary: "Architect a self-drive car rental platform with vehicles across car types, pickup stations, reservations, insurance add-ons, dynamic rental pricing, and return damage inspection.",
    entities: ["RentalSystem", "Vehicle", "RentalLocation", "Reservation", "RentalContract", "InsurancePolicy", "VehicleInspection"],
    relationships: [
      "RentalLocation has-many Vehicles",
      "Vehicle has-a CarType (Sedan, SUV, Hatchback) and VehicleStatus",
      "Reservation ties Customer, Vehicle, pickupDate, returnDate",
      "RentalContract calculates total cost based on base rate + insurance + fuel adjustment"
    ],
    constraints: [
      "Vehicle cannot be reserved for overlapping date ranges.",
      "Driver license validity verification before contract issuance.",
      "Late return penalty fee computation."
    ],
    extensionPoints: [
      "Keyless Bluetooth vehicle unlocking via mobile app.",
      "Dynamic pricing based on localized demand and vehicle availability."
    ],
    evaluationRubric: [
      "Vehicle availability scheduling and range query validation.",
      "Decorator Pattern for optional add-ons (insurance, GPS, child seat).",
      "Payment and security deposit management."
    ]
  }
];

const exercisesPayload = {
  outputPredictions: outputPredictionQuestions,
  lldCases: lldCases
};

fs.writeFileSync("content/oop/oop-exercises.json", JSON.stringify(exercisesPayload, null, 2) + "\n", "utf8");
fs.writeFileSync("content/fundamentals/oop/oop-exercises.json", JSON.stringify(exercisesPayload, null, 2) + "\n", "utf8");
console.log(`Generated content/oop/oop-exercises.json (${outputPredictionQuestions.length} predictions, ${lldCases.length} LLD cases)`);

