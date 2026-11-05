import type { DBMSDaySchedule } from "./types";

export const DBMS_TOPIC_NAMES: Record<string, string> = {
  "dbms-fundamentals": "DBMS Fundamentals & Architecture",
  "data-models": "Data Models & Schemas",
  "relational-model": "Relational Data Model & Keys",
  "relational-algebra": "Relational Algebra & Set Theory",
  "er-modeling": "ER Modeling & Relational Mapping",
  "sql-ddl": "SQL DDL & Integrity Constraints",
  "sql-dml-aggregations": "SQL DML, Joins & Aggregations",
  "advanced-sql": "Advanced SQL, Subqueries & Window Functions",
  "normalization": "Functional Dependencies & Normalization",
  "transactions-concurrency": "Transactions & Concurrency Control",
  "indexing-btrees": "Storage, Indexing & B+ Trees",
  "mysql-practicals-capstone": "MySQL Practicals & Interview Capstone",
};

export const DBMS_DAYS_CURRICULUM: DBMSDaySchedule[] = [
  {
    dayNumber: 1,
    title: "DBMS Fundamentals & 3-Tier Architecture",
    subtitle: "File Systems vs DBMS, Abstraction Levels & Data Independence",
    summary:
      "Understand why modern software relies on database management systems. Master 3-schema architecture, data abstraction, and the critical distinction between physical and logical data independence.",
    focus: "Foundation, Architecture & Data Independence",
    estimatedMinutes: 120,
    videoPositions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    learningOutcomes: [
      "Articulate precise differences between traditional File Systems and DBMS (redundancy, consistency, concurrency).",
      "Diagram the 3-Schema Architecture: External/View, Conceptual/Logical, and Internal/Physical levels.",
      "Explain Physical Data Independence vs Logical Data Independence with concrete schema migration examples.",
      "Differentiate DDL, DML, DCL, and TCL commands and their operational execution contexts.",
    ],
    practicalAssignment: {
      title: "Architecture & Data Independence Proof",
      description:
        "Draft a clean diagram illustrating the 3-schema architecture for an e-commerce platform. Detail how adding an index at the internal level preserves external application code (Physical Data Independence), and how adding a new table column preserves existing user views (Logical Data Independence).",
      submissionType: "checkbox",
    },
    interviewQuestions: [
      {
        id: "d1-q1",
        question: "Why do we use a DBMS instead of an OS File System?",
        answer:
          "File systems suffer from data redundancy, inconsistency, difficulty in accessing data without rewriting code, lack of concurrent multi-user isolation, lack of atomic transactions, and rudimentary security. A DBMS provides ACID compliance, declarative querying (SQL), declarative integrity constraints, automated concurrency control, and crash recovery.",
        importance: "Critical",
        category: "Architecture",
      },
      {
        id: "d1-q2",
        question: "What is the difference between Logical and Physical Data Independence?",
        answer:
          "Logical Data Independence is the capacity to change the conceptual schema without altering external schemas or application programs (e.g., adding an attribute or splitting a table with views preserving the old interface). Physical Data Independence is the ability to change the internal schema (storage format, file organization, B-tree indexes, compression) without changing the conceptual or external schemas. Physical independence is easier to achieve and far more common.",
        importance: "Critical",
        category: "Architecture",
      },
      {
        id: "d1-q3",
        question: "What is the difference between Schema and Instance?",
        answer:
          "The schema is the overall design, structural definition, types, and constraints of the database (rarely changes, analogous to variable types in code). An instance (or state) is the actual collection of data residing in the database at a specific snapshot in time (frequently changes with inserts/updates/deletes).",
        importance: "High",
        category: "Architecture",
      },
    ],
  },
  {
    dayNumber: 2,
    title: "Relational Model & Key Constraints",
    subtitle: "Tuples, Relations, Super Keys, Candidate Keys & Foreign Keys",
    summary:
      "Deep dive into Codd's Relational Model. Formalize tables as mathematical relations and master the hierarchy of keys: Super Keys, Candidate Keys, Primary Keys, Alternate Keys, and Foreign Keys with Referential Integrity.",
    focus: "Relational Theory, Key Hierarchy & Constraints",
    estimatedMinutes: 145,
    videoPositions: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    learningOutcomes: [
      "Define relations as subsets of Cartesian products with tuple uniqueness and attribute domain integrity.",
      "Distinguish Super Keys from Candidate Keys using minimality criteria.",
      "Formulate Foreign Key referential integrity rules and explain ON DELETE CASCADE vs RESTRICT vs SET NULL.",
      "Identify all Candidate Keys for a given relational schema given functional dependencies.",
    ],
    practicalAssignment: {
      title: "Key Hierarchy Identification",
      description:
        "Given a relation Student(RollNo, RegNo, Email, Name, DeptId), identify all possible Super Keys, Candidate Keys, choose an optimal Primary Key, and write the SQL foreign key constraint referencing Department(DeptId) with ON DELETE CASCADE.",
      submissionType: "checkbox",
    },
    interviewQuestions: [
      {
        id: "d2-q1",
        question: "What is the formal difference between a Super Key and a Candidate Key?",
        answer:
          "A Super Key is any set of attributes that uniquely identifies a tuple within a relation. A Candidate Key is a minimal Super Key—meaning no proper subset of its attributes is a Super Key. Removing even one attribute destroys uniqueness.",
        importance: "Critical",
        category: "Keys",
      },
      {
        id: "d2-q2",
        question: "Can a Primary Key have NULL values? What about Unique Key?",
        answer:
          "A Primary Key enforces Entity Integrity and can NEVER contain NULL values (neither single-column nor any attribute in a composite key). A Unique Key permits NULL values (in standard SQL, multiple NULLs are typically allowed because NULL != NULL in three-valued logic, though some RDBMS engines like SQL Server enforce single NULL uniqueness).",
        importance: "Critical",
        category: "Keys",
      },
      {
        id: "d2-q3",
        question: "What is Referential Integrity and what does ON DELETE CASCADE do?",
        answer:
          "Referential Integrity dictates that a Foreign Key value in a referencing relation must either match a valid Primary/Unique Key value in the referenced relation, or be NULL. ON DELETE CASCADE specifies that when a parent row in the referenced table is deleted, all dependent child rows containing that foreign key are automatically deleted by the database engine.",
        importance: "High",
        category: "Integrity",
      },
    ],
  },
  {
    dayNumber: 3,
    title: "Relational Algebra: Core Operations & Set Theory",
    subtitle: "Selection, Projection, Cartesian Product & Set Operations",
    summary:
      "Master the theoretical procedural query language foundational to SQL query planning and optimization. Learn selection (σ), projection (π), set union (∪), intersection (∩), difference (−), and Cartesian product (×).",
    focus: "Formal Procedural Algebra & Set Operations",
    estimatedMinutes: 125,
    videoPositions: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
    learningOutcomes: [
      "Write formal algebraic expressions using σ (Select) and π (Project) for complex multi-predicate filters.",
      "Define Union Compatibility conditions (same arity and matching attribute domains).",
      "Formulate Set Difference (A - B) expressions to find anti-join patterns.",
      "Calculate tuple counts and degree for Cartesian Product (R × S).",
    ],
    practicalAssignment: {
      title: "Relational Algebra Formal Query Formulation",
      description:
        "Given schemas Employee(EmpId, Name, Salary, DeptId) and Department(DeptId, DeptName), write formal relational algebra expressions for: (1) Employees in 'Engineering' earning > 80000, (2) Employees who do NOT belong to any department.",
      submissionType: "checkbox",
    },
    interviewQuestions: [
      {
        id: "d3-q1",
        question: "What conditions must hold for two relations to be Union Compatible?",
        answer:
          "1. They must have the same degree (arity)—the exact same number of attributes. 2. The domains (data types) of corresponding attributes (from left to right) must be type-compatible. Attribute names do not need to match.",
        importance: "High",
        category: "Relational Algebra",
      },
      {
        id: "d3-q2",
        question: "Why is Relational Algebra procedural while SQL is declarative?",
        answer:
          "Relational Algebra specifies both WHAT data to retrieve and the STEP-BY-STEP operational sequence (e.g., project after join, or select before join). SQL is declarative: it specifies WHAT data is needed, leaving the operational evaluation plan (join ordering, index scans, filter pushdowns) to the RDBMS query optimizer.",
        importance: "Critical",
        category: "Theory",
      },
    ],
  },
  {
    dayNumber: 4,
    title: "Relational Algebra: Joins, Division & Completeness",
    subtitle: "Theta Join, Natural Join, Outer Joins & Division Operator",
    summary:
      "Advance through complex relational operators. Master Theta Joins, Natural Joins (⋈), Left/Right/Full Outer Joins, and the Division operator (÷) used for 'for all' relational queries.",
    focus: "Join Mechanics, Outer Joins & Division",
    estimatedMinutes: 155,
    videoPositions: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    learningOutcomes: [
      "Compute Natural Join outcomes and explain attribute deduplication compared to Equi-Join.",
      "Solve Universal Quantification ('contains all') queries using the Relational Division operator (÷).",
      "Explain how Left Outer Join preserves non-matching left tuples with padded NULLs.",
      "Understand Relational Completeness and equivalence between Relational Algebra and Relational Calculus.",
    ],
    practicalAssignment: {
      title: "Relational Division Challenge",
      description:
        "Using relations StudentCourse(StudentId, CourseId) and MandatoryCourses(CourseId), write out the algebraic derivation of the Division operator (R ÷ S) using projection, cartesian product, and set difference to find students who took ALL mandatory courses.",
      submissionType: "checkbox",
    },
    interviewQuestions: [
      {
        id: "d4-q1",
        question: "How does Natural Join differ from Equi-Join and Cartesian Product?",
        answer:
          "Cartesian Product combines every row of R with every row of S. Equi-Join filters Cartesian Product by an explicit equality condition on specified attributes, retaining both columns. Natural Join automatically equates all attributes sharing identical names across both relations and eliminates duplicate columns in the projection.",
        importance: "High",
        category: "Joins",
      },
      {
        id: "d4-q2",
        question: "When is the Relational Division operator (R ÷ S) used?",
        answer:
          "It is used for universal quantification queries of the form 'Find entities that are associated with ALL elements in set S'. For example, 'Find customers who purchased ALL products in category electronics'. In SQL, division is typically implemented via NOT EXISTS (anti-joins) or GROUP BY with HAVING COUNT(DISTINCT).",
        importance: "Critical",
        category: "Relational Algebra",
      },
    ],
  },
  {
    dayNumber: 5,
    title: "Entity-Relationship (ER) Modeling & Schema Translation",
    subtitle: "Entities, Relationships, Cardinality & Minimal Table Mapping",
    summary:
      "Master high-level conceptual database design with Entity-Relationship (ER) diagrams. Cover Strong and Weak Entity Sets, Cardinality Ratios, Participation Constraints, and the mathematical rules for converting ER models into minimal relational tables.",
    focus: "Conceptual Design, ER Diagrams & Table Reduction",
    estimatedMinutes: 180,
    videoPositions: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61],
    learningOutcomes: [
      "Identify Entities, Attributes (Single-valued, Multi-valued, Composite, Derived), and Relationships.",
      "Model Weak Entity sets with Partial Keys (Discriminators) and identifying relationships.",
      "Apply 1:1, 1:N, and M:N Cardinality Ratios with Total vs Partial participation.",
      "Convert ER diagrams into the exact minimum number of relational tables without data anomalies.",
    ],
    practicalAssignment: {
      title: "Hospital ER Design & Table Minimization",
      description:
        "Design an ER diagram for a Hospital Management System (Doctors, Patients, Appointments, Prescriptions, Medications). Account for multi-valued phone numbers and a weak entity PrescriptionItem. Convert the ER model into minimal normalized relational tables, annotating all primary and foreign keys.",
      submissionType: "checkbox",
    },
    interviewQuestions: [
      {
        id: "d5-q1",
        question: "What is a Weak Entity Set and how is it converted to a relational table?",
        answer:
          "A Weak Entity Set is an entity that does not possess sufficient attributes to form a primary key on its own. It depends on an identifying (strong) entity set via an identifying relationship. In relational mapping, the weak entity table includes its partial key (discriminator) along with the primary key of the identifying owner entity as a composite primary key and foreign key.",
        importance: "Critical",
        category: "ER Modeling",
      },
      {
        id: "d5-q2",
        question: "How many relational tables are required for a 1:N relationship with total participation?",
        answer:
          "Only 2 tables. The relationship does not require a separate 3rd table; instead, the primary key of the '1' side is placed as a foreign key into the 'N' side table, and because of total participation, that foreign key column can be constrained with NOT NULL.",
        importance: "High",
        category: "ER Modeling",
      },
    ],
  },
  {
    dayNumber: 6,
    title: "SQL Fundamentals: DDL, Schema Definition & Constraints",
    subtitle: "CREATE, ALTER, DROP, TRUNCATE & Integrity Rules",
    summary:
      "Transition from theory to code. Write clean, production-grade Data Definition Language (DDL) schemas. Implement column types, PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE, NOT NULL, and DEFAULT constraints.",
    focus: "DDL Syntax, Table Modification & Schema Constraints",
    estimatedMinutes: 110,
    videoPositions: [62, 63, 64, 65, 66, 67, 68, 69],
    learningOutcomes: [
      "Write resilient SQL DDL scripts to create relational tables with composite keys and default values.",
      "Alter table schemas safely using ADD COLUMN, DROP COLUMN, and MODIFY/ALTER TYPE.",
      "Differentiate the exact locking, logging, and rollback behaviors of DROP vs TRUNCATE vs DELETE.",
      "Enforce business rules using CHECK constraints and UNIQUE composite indices.",
    ],
    practicalAssignment: {
      title: "SQL Schema DDL Migration",
      description:
        "Complete SQLBolt Lessons 13, 14, and 15. Then write a complete PostgreSQL DDL script creating Users, Orders, and OrderItems tables with foreign keys, ON DELETE CASCADE, CHECK (quantity > 0), and an updated_at timestamp trigger.",
      submissionType: "checkbox",
    },
    interviewQuestions: [
      {
        id: "d6-q1",
        question: "What is the difference between TRUNCATE, DELETE, and DROP?",
        answer:
          "DELETE is a DML statement that removes rows one by one (or in batches) while firing triggers and generating full undo/transaction log records for every deleted row (can be rolled back). TRUNCATE is a DDL statement that deallocates entire data pages, resets identity counters, fires no triggers, is faster, and produces minimal logging. DROP is a DDL statement that removes the entire table structure, indexes, and privileges from the database catalog entirely.",
        importance: "Critical",
        category: "SQL",
      },
      {
        id: "d6-q2",
        question: "Can TRUNCATE be rolled back?",
        answer:
          "In modern RDBMS systems like PostgreSQL, Microsoft SQL Server, and Oracle, TRUNCATE executed inside a transaction block (BEGIN...TRUNCATE...ROLLBACK) CAN be rolled back. In MySQL/InnoDB, however, TRUNCATE causes an implicit commit and cannot be rolled back.",
        importance: "Medium",
        category: "SQL",
      },
    ],
  },
  {
    dayNumber: 7,
    title: "SQL Queries: DML, Aggregations, Grouping & Joins",
    subtitle: "SELECT, WHERE, GROUP BY, HAVING, and Multi-Table Joins",
    summary:
      "Master expressive query retrieval. Dive into the relational query lifecycle: FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. Solve complex multi-table joins and aggregation challenges.",
    focus: "DML Queries, Aggregation Functions & Join Patterns",
    estimatedMinutes: 135,
    videoPositions: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79],
    learningOutcomes: [
      "Trace the exact logical query processing order of SQL execution.",
      "Use GROUP BY with aggregate functions (COUNT, SUM, AVG, MIN, MAX) and filter groups with HAVING.",
      "Formulate INNER, LEFT, RIGHT, and FULL OUTER joins to retrieve correlated data sets.",
      "Differentiate COUNT(*), COUNT(column), and COUNT(DISTINCT column).",
    ],
    practicalAssignment: {
      title: "SQL Bolt Practice & Multi-Table Joins",
      description:
        "Complete SQLBolt Lessons 1-12. Then solve LeetCode 175 (Combine Two Tables) and LeetCode 181 (Employees Earning More Than Their Managers) without looking at solutions.",
      submissionType: "checkbox",
    },
    interviewQuestions: [
      {
        id: "d7-q1",
        question: "What is the difference between WHERE and HAVING clauses?",
        answer:
          "WHERE filters individual rows BEFORE aggregation occurs and cannot use aggregate functions (e.g. WHERE SUM(val) > 10 is illegal). HAVING filters aggregated groups AFTER GROUP BY aggregation has been computed and evaluates aggregate expressions.",
        importance: "Critical",
        category: "SQL",
      },
      {
        id: "d7-q2",
        question: "What is the difference between COUNT(*), COUNT(column), and COUNT(1)?",
        answer:
          "COUNT(*) counts all rows in the result set including rows with NULL values. COUNT(column) counts only rows where the specified column is NOT NULL. COUNT(1) passes the literal 1 for every row; query optimizers treat COUNT(1) and COUNT(*) identically with no performance difference.",
        importance: "High",
        category: "SQL",
      },
    ],
  },
  {
    dayNumber: 8,
    title: "Advanced SQL: Nested Subqueries & Views",
    subtitle: "Correlated Subqueries, EXISTS, IN, ANY/ALL & Database Views",
    summary:
      "Deep dive into advanced querying techniques. Master scalar subqueries, correlated subqueries, set comparison operators (IN, NOT IN, ANY, ALL, EXISTS, NOT EXISTS), and virtual relations (Views).",
    focus: "Subquery Optimization, Correlated Logic & Views",
    estimatedMinutes: 150,
    videoPositions: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
    learningOutcomes: [
      "Distinguish independent subqueries evaluated once from correlated subqueries evaluated per candidate row.",
      "Apply EXISTS and NOT EXISTS for optimal semi-join and anti-join execution.",
      "Identify the NULL trap in NOT IN queries and explain why NOT EXISTS is safer.",
      "Create and utilize SQL Views for security encapsulation and query simplification.",
    ],
    practicalAssignment: {
      title: "Correlated Subqueries & Anti-Join Patterns",
      description:
        "Solve LeetCode 184 (Department Highest Salary) and LeetCode 178 (Rank Scores). Implement a query to find all customers who have never placed an order using both NOT EXISTS and LEFT JOIN ... WHERE ... IS NULL, comparing execution plans.",
      submissionType: "checkbox",
    },
    interviewQuestions: [
      {
        id: "d8-q1",
        question: "Why can 'NOT IN (subquery)' return empty results unexpectedly?",
        answer:
          "If the subquery returns even a single row with a NULL value, NOT IN evaluates to UNKNOWN for all rows because in SQL three-valued logic, comparison with NULL is NULL. Consequently, the entire NOT IN predicate evaluates to false/unknown, returning 0 rows. NOT EXISTS is null-safe and does not exhibit this failure mode.",
        importance: "Critical",
        category: "SQL",
      },
      {
        id: "d8-q2",
        question: "What is a Correlated Subquery and why can it be slow?",
        answer:
          "A correlated subquery references columns from the outer query. It cannot be executed independently once; logically, the database engine must execute the subquery once for every candidate row evaluated by the outer query (O(N×M) complexity). Modern query optimizers often attempt to unnest or decorrelate these into joins.",
        importance: "High",
        category: "SQL",
      },
    ],
  },
  {
    dayNumber: 9,
    title: "Functional Dependencies & Database Normalization",
    subtitle: "1NF, 2NF, 3NF, BCNF, Attribute Closures & Lossless Joins",
    summary:
      "Master the mathematical theory of relational database normalization. Analyze data anomalies, compute attribute closures with Armstrong's Axioms, determine candidate keys, and decompose schemas into 1NF, 2NF, 3NF, and BCNF.",
    focus: "Anomalies, Closures, Normal Forms & Decomposition",
    estimatedMinutes: 160,
    videoPositions: [],
    supplementaryVideoIds: ["GFQaEYEc8_8", "5GDTIUVlHB8", "qn5neFBpU40", "bSdvM_0hzgc", "mf_PbWPo7VM", "Sabwow_e2-M"],
    learningOutcomes: [
      "Identify Insertion, Update, and Deletion anomalies in unnormalized schemas.",
      "Compute attribute closure (X+) using Armstrong's Axioms (Reflexivity, Augmentation, Transitivity).",
      "Find all Candidate Keys algorithmically from a given set of Functional Dependencies.",
      "Verify whether a decomposition satisfies Lossless Join and Dependency Preservation properties.",
      "Decompose any relation into 3NF (using synthesis) and BCNF.",
    ],
    practicalAssignment: {
      title: "Closure & Normal Form Decomposition Analysis",
      description:
        "Given relation R(A, B, C, D, E) with FDs { AB → C, C → D, D → E, E → A }: (1) Find all candidate keys of R. (2) Determine the highest normal form of R. (3) Decompose R into BCNF step-by-step and check for dependency preservation.",
      submissionType: "checkbox",
    },
    interviewQuestions: [
      {
        id: "d9-q1",
        question: "What is the difference between 3NF and BCNF?",
        answer:
          "In 3NF, for every functional dependency X → Y, either X is a super key, or Y is a prime attribute (part of any candidate key). In BCNF (Boyce-Codd Normal Form), for every non-trivial functional dependency X → Y, X MUST be a super key. BCNF strictly eliminates all anomalies caused by functional dependencies, but unlike 3NF, BCNF cannot always guarantee dependency preservation.",
        importance: "Critical",
        category: "Normalization",
      },
      {
        id: "d9-q2",
        question: "When would you intentionally denormalize a database in production?",
        answer:
          "In read-heavy, high-throughput systems (such as analytics warehouses, reporting dashboards, or high-scale microservices) where multi-table joins cause unacceptable CPU and disk I/O latency. Denormalization trades redundant storage and write overhead for faster single-table reads.",
        importance: "Critical",
        category: "System Design",
      },
    ],
  },
  {
    dayNumber: 10,
    title: "Transactions, Concurrency Control & ACID Properties",
    subtitle: "ACID, Conflict Serializability, Precedence Graphs & 2-Phase Locking",
    summary:
      "Understand how databases guarantee data integrity under concurrent execution and system crashes. Cover ACID properties, schedules, read/write anomalies (dirty read, non-repeatable read, phantom read), conflict serializability, and 2-Phase Locking (2PL).",
    focus: "ACID, Serializability, Isolation Levels & 2PL",
    estimatedMinutes: 155,
    videoPositions: [],
    supplementaryVideoIds: ["t5hsV9lC1rU", "-GS0OxFJsYQ", "oP8yLMjmszE", "s8QlJoL1G6w", "94C0V7f2zm4"],
    learningOutcomes: [
      "Define Atomicity, Consistency, Isolation, and Durability with write-ahead logging (WAL) and recovery concepts.",
      "Construct Precedence Graphs (Serialization Graphs) to test for Conflict Serializability.",
      "Map SQL ANSI Isolation Levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) to their prevented read anomalies.",
      "Explain Two-Phase Locking (2PL), Strict 2PL, Rigorous 2PL, and Deadlock resolution.",
    ],
    practicalAssignment: {
      title: "Precedence Graph & Conflict Serializability Verification",
      description:
        "Given schedule S: R1(A), W2(A), R2(B), W1(B), R3(A), W3(C), construct the precedence conflict graph between T1, T2, and T3. Determine if S is conflict serializable and state the equivalent serial order or identify cycles.",
      submissionType: "checkbox",
    },
    interviewQuestions: [
      {
        id: "d10-q1",
        question: "Explain the 4 ANSI SQL Transaction Isolation Levels and their anomalies.",
        answer:
          "1. Read Uncommitted: Permits Dirty Reads (reading uncommitted writes). 2. Read Committed: Prevents Dirty Reads, permits Non-Repeatable Reads. 3. Repeatable Read: Prevents Dirty and Non-Repeatable Reads, permits Phantom Reads. 4. Serializable: Prevents all anomalies including Phantoms using range locks or Snapshot Isolation with write conflict detection.",
        importance: "Critical",
        category: "Transactions",
      },
      {
        id: "d10-q2",
        question: "What is Two-Phase Locking (2PL) and does it prevent deadlocks?",
        answer:
          "2PL is a concurrency protocol where every transaction has a Growing Phase (acquiring locks without releasing any) and a Shrinking Phase (releasing locks without acquiring any). 2PL guarantees Conflict Serializability, but it does NOT prevent deadlocks. Deadlocks must be handled via wait-for graph cycle detection or lock timeouts.",
        importance: "Critical",
        category: "Concurrency",
      },
    ],
  },
  {
    dayNumber: 11,
    title: "Storage Engines, Indexing & B+ Trees",
    subtitle: "Clustered vs Secondary Indexes, B-Tree Math & Query Optimization",
    summary:
      "Demystify database internal physical storage. Learn page layouts, heap files, clustered vs secondary indexes, and the mathematics of B-Trees and B+ Trees for range scan optimization.",
    focus: "Physical Storage, B+ Tree Indexes & Query Plans",
    estimatedMinutes: 140,
    videoPositions: [],
    supplementaryVideoIds: ["aZjYr87r1b8"],
    learningOutcomes: [
      "Compare Clustered Indexes (data stored in index leaves) vs Non-Clustered / Secondary Indexes.",
      "Calculate the order, fanout, node capacity, and tree height for a B+ tree given disk block size.",
      "Explain why B+ Trees are preferred over Hash Indexes and Binary Search Trees for relational databases.",
      "Analyze query performance using EXPLAIN execution plans (Index Scan vs Index Only Scan vs Sequential Scan).",
    ],
    practicalAssignment: {
      title: "B+ Tree Fanout & Capacity Calculation",
      description:
        "A database block size is 4KB (4096 bytes). Pointer size is 8 bytes. Key size is 16 bytes. Calculate: (1) Maximum order of internal node, (2) Maximum number of record pointers in a 3-level B+ Tree, (3) Disk I/O operations required to locate a single random row.",
      submissionType: "checkbox",
    },
    interviewQuestions: [
      {
        id: "d11-q1",
        question: "Why do databases use B+ Trees instead of Binary Search Trees or Hash Tables for indexing?",
        answer:
          "Binary Search Trees have a low fanout (2 children per node), leading to excessive tree depth and high random disk I/O seek latency. Hash Tables have O(1) lookups for point queries but cannot perform range queries (e.g. WHERE age BETWEEN 20 AND 30). B+ Trees have high fanout (hundreds of keys per 4KB/8KB node), low height (3-4 levels for billions of rows), and linked leaf nodes that enable blazingly fast sequential range scans.",
        importance: "Critical",
        category: "Indexing",
      },
      {
        id: "d11-q2",
        question: "What is a Covering Index (Index-Only Scan)?",
        answer:
          "A Covering Index is an index that contains all the columns required by a query (both the columns in WHERE and the columns in SELECT). The database engine can satisfy the query entirely from the B+ Tree leaf nodes without performing a secondary lookup to fetch rows from the table heap (zero table random I/O).",
        importance: "High",
        category: "Optimization",
      },
    ],
  },
  {
    dayNumber: 12,
    title: "MySQL Practicals, Production Capstone & Mock Interview",
    subtitle: "Hands-on Console Queries, Production Schema Design & Final Readiness",
    summary:
      "Synthesize your full 12-day journey. Watch Neso Academy Video 91 (MySQL Practicals), design a production database schema from scratch, and test your knowledge against comprehensive interview scenarios.",
    focus: "Live SQL Execution, Capstone Schema Design & Mock Interview",
    estimatedMinutes: 175,
    videoPositions: [91],
    supplementaryVideoIds: [],
    learningOutcomes: [
      "Follow Video 91 to execute real-world MySQL DDL, DML, and multi-table queries.",
      "Design a scalable, normalized schema for a real-world system (e.g., E-Commerce or Ride-Sharing) with appropriate indexes.",
      "Diagnose and remediate query bottlenecks using EXPLAIN ANALYZE.",
      "Ace senior-level database interview questions across architecture, SQL, normalization, and concurrency.",
    ],
    practicalAssignment: {
      title: "Production System Schema Design Capstone",
      description:
        "Draft the production relational schema for a multi-vendor E-Commerce marketplace (Users, Stores, Products, ProductVariants, Inventory, Orders, Payments). Include appropriate B+ tree indexes for frequent queries, foreign key cascading constraints, and a short write-up on your indexing and partitioning strategy.",
      submissionType: "checkbox",
    },
    interviewQuestions: [
      {
        id: "d12-q1",
        question: "How would you handle high write throughput in a relational database?",
        answer:
          "Strategies include: 1. Connection pooling (PgBouncer/HikariCP). 2. Tuning write-ahead log (WAL) buffer and batch commits. 3. Partitioning large tables (range/hash partitioning). 4. Sharding across multiple database nodes with consistent hashing. 5. Offloading high-frequency append logs to message queues (Kafka) for asynchronous batch ingestion. 6. Removing non-essential secondary indexes that slow down write operations.",
        importance: "Critical",
        category: "System Design",
      },
      {
        id: "d12-q2",
        question: "Explain Database Sharding vs Read Replicas.",
        answer:
          "Read Replicas replicate the primary database asynchronously/synchronously to handle read-heavy workloads; all writes still hit the single primary. Sharding horizontally partitions rows across multiple distinct database instances, distributing both read AND write traffic, but introduces complexities such as cross-shard joins and distributed two-phase commits.",
        importance: "Critical",
        category: "System Design",
      },
    ],
  },
];

