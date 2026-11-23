import type { DataEngineeringInterviewQuestion } from "./types";

export const DATA_ENGINEERING_TOPIC_NAMES: Record<string, string> = {
  "python-data-loading": "Python Data Extraction & Ingestion",
  "python-fundamentals-oop": "Python OOP & Memory Architecture",
  "sql-fundamentals-joins": "SQL Relational Algebra & Joins",
  "sql-window-functions-ctes": "SQL Window Functions & Recursive CTEs",
  "linux-cli-fundamentals": "Linux CLI & POSIX System Streams",
  "bash-scripting-core": "Bash Scripting & Shell Pipeline Automation",
  "bash-etl-crontab": "Bash ETL Workflows & Cron Orchestration",
  "git-version-control": "Git Version Control & PR Workflows",
  "dimensional-modeling-idempotency": "Dimensional Modeling & Idempotency",
  "dimensional-modeling-101": "Kimball Facts, Dimensions & Conformed Schemas",
  "uber-data-model-case-study": "Production Schema Architecture (Uber Case Study)",
  "snowflake-masterclass": "Snowflake Multi-Cluster Shared Architecture",
  "snowflake-architecture-20min": "Snowflake Micro-Partitioning & Pruning",
  "bigquery-architecture": "BigQuery Serverless Slots & Dremel Engine",
  "bigquery-sql-bootcamp": "BigQuery Partitioning & Clustering Best Practices",
  "redshift-mpp-architecture": "Amazon Redshift MPP & Distribution Keys",
  "data-lake-foundations": "Data Lake Storage, Parquet & Arrow",
  "data-modeling-3layer": "Medallion Lakehouse (Bronze / Silver / Gold)",
  "iceberg-101-dremio": "Apache Iceberg Open Table Architecture",
  "iceberg-2026-edition": "Iceberg Snapshot Manifest Lists & Hidden Partitioning",
  "delta-lake-deep-dive": "Delta Lake Transaction Log & ACID Merge",
  "delta-lake-uniform": "Delta Lake UniForm Multi-Engine Read",
  "delta-lakehouse-training": "Production Lakehouse Operations & Compaction",
  "apache-hudi-cmu": "Apache Hudi Log-Structured Storage & Upserts",
  "apache-hudi-explained": "Apache Hudi Copy-on-Write vs Merge-on-Read",
  "spark-distributed-architecture": "Apache Spark Cluster Architecture & Executors",
  "lambda-vs-kappa-architecture": "Lambda vs Kappa Streaming Architecture",
  "pyspark-full-course": "PySpark DataFrame API, Catalyst & Tungsten",
  "spark-deep-dive-optimization": "Spark Shuffle Spill, Skew & Memory Tuning",
  "spark-performance-techniques": "Spark Broadcast Joins & Adaptive Query Execution",
  "what-is-airflow": "Apache Airflow Core Concepts & DAG Graphs",
  "airflow-beginners-walkthrough": "Airflow Operators, Hooks & Connections",
  "airflow-deep-dive-spotlight": "Airflow Scheduler Architecture & Celery/K8s Executors",
  "dagster-crash-course": "Dagster Software-Defined Assets & Lineage",
  "dagster-core-concepts": "Dagster IO Managers & Declarative Pipelines",
  "prefect-workflow-orchestration": "Prefect Dynamic Flows, Deployments & Retries",
  "kafka-for-beginners": "Apache Kafka Pub/Sub, Brokers & Partitions",
  "kafka-masterclass-3hr": "Kafka Consumer Groups, Rebalances & Compaction",
  "apache-flink-full-course": "Apache Flink Stateful Stream Processing",
  "apache-flink-architecture": "Flink Chandy-Lamport Checkpoints & Watermarks",
  "dbt-snowflake-full-course": "dbt Core, Jinja Templating & Materializations",
  "dbt-incremental-models": "dbt Incremental Merge Strategies & Idempotency",
  "great-expectations-tutorial": "Great Expectations Data Quality Assertions",
  "data-quality-monitoring-system": "Production Data Quality Gates & Slack Alerting",
  "aws-masterclass-darshil": "AWS Cloud Data Stack (S3, Glue, Athena, EMR)",
  "uber-end-to-end-project": "End-to-End Enterprise Data Pipeline Capstone",
  "terraform-data-engineering": "Terraform Infrastructure as Code for Cloud Warehouses",
  "terraform-dev-stage-prod": "Terraform Multi-Environment Workspaces & CI/CD",
  "docker-for-data-engineering": "Docker & Compose for Local Data Stack Testing",
  "docker-tutorial-data": "Containerizing Python Extractors & Custom Base Images",
  "devops-data-engineering-ibm": "DataOps CI/CD Pipelines with GitHub Actions",
  "dataops-best-practices": "SQLFluff Linting, Automated Tests & Slim CI",
  "datahub-governance-demo": "Modern Data Catalogs & Ingestion Recipes",
  "datahub-lineage-101": "Automated Column-Level Lineage & Impact Analysis",
};

export const DATA_ENGINEERING_STAGES_CURRICULUM = [
  { dayNumber: 1, title: "Programming & Linux Fundamentals", estimatedMinutes: 840 },
  { dayNumber: 2, title: "Data Modeling, Warehouses & Storage", estimatedMinutes: 620 },
  { dayNumber: 3, title: "Data Lakes, Lakehouses & Modern Table Formats", estimatedMinutes: 480 },
  { dayNumber: 4, title: "Distributed Computing & Batch Processing", estimatedMinutes: 520 },
  { dayNumber: 5, title: "Data Orchestration & Pipelines", estimatedMinutes: 450 },
  { dayNumber: 6, title: "Real-Time Streaming & Message Queues", estimatedMinutes: 510 },
  { dayNumber: 7, title: "Transformation & Data Quality", estimatedMinutes: 360 },
  { dayNumber: 8, title: "Cloud, Infrastructure as Code & DataOps", estimatedMinutes: 680 },
];

export const DATA_ENGINEERING_STAGE_INTERVIEWS: Record<
  number,
  DataEngineeringInterviewQuestion[]
> = {
  1: [
    {
      id: "de-stage1-q1",
      question: "How do ROW_NUMBER(), RANK(), and DENSE_RANK() differ in analytical SQL?",
      answer:
        "All three assign ranks within a window partition ordered by an expression. ROW_NUMBER assigns distinct consecutive integers (1, 2, 3, 4) regardless of ties. RANK assigns equal rank to ties and skips subsequent numbers (1, 2, 2, 4). DENSE_RANK assigns equal rank to ties without skipping numbers (1, 2, 2, 3). In data engineering, DENSE_RANK or ROW_NUMBER is preferred for deduplication and top-N ranking.",
      importance: "Critical",
      category: "SQL",
    },
    {
      id: "de-stage1-q2",
      question: "Why are Python generators critical when processing large ETL files?",
      answer:
        "Generators utilize lazy evaluation (`yield`) to produce items one at a time on demand rather than loading an entire dataset into RAM. When reading a 50GB CSV or streaming NDJSON, a generator maintains constant O(1) memory footprint rather than triggering OOM (Out Of Memory) crashes.",
      importance: "Critical",
      category: "Python",
    },
    {
      id: "de-stage1-q3",
      question: "What does `set -euo pipefail` do in Bash scripts, and why is it mandatory for ETL?",
      answer:
        "`-e` exits immediately if any command returns a non-zero exit code. `-u` treats unset variables as an error and aborts. `-o pipefail` ensures that a pipeline command (`cmd1 | cmd2`) fails if *any* stage in the pipeline fails, rather than only reporting the exit status of the final command. This prevents silent corruptions where an extractor crashes but downstream compressors write empty files.",
      importance: "High",
      category: "Linux & Bash",
    },
  ],
  2: [
    {
      id: "de-stage2-q1",
      question: "Explain the difference between Kimball Star Schema and Snowflake Schema.",
      answer:
        "In a Kimball Star Schema, a centralized Fact table contains numerical metrics and foreign keys referencing denormalized Dimension tables, optimizing query performance by minimizing joins. In a Snowflake Schema, Dimension tables are normalized into hierarchies (e.g. Product -> Category -> Department), reducing storage redundancy but increasing join complexity and query latency. Modern cloud data warehouses heavily favor Star Schemas due to cheap columnar storage and optimized join engines.",
      importance: "Critical",
      category: "Data Modeling",
    },
    {
      id: "de-stage2-q2",
      question: "How does Slowly Changing Dimension (SCD) Type 2 work, and how is it implemented?",
      answer:
        "SCD Type 2 preserves complete historical audit trails by creating a new record whenever an attribute changes. The table schema includes surrogate key (`dim_sk`), business key (`user_id`), attributes, `effective_from_ts`, `effective_to_ts` (or NULL/infinity for the current record), and an `is_current` boolean flag. Queries for historical facts join on `fact.event_ts BETWEEN dim.effective_from_ts AND dim.effective_to_ts`.",
      importance: "Critical",
      category: "Data Modeling",
    },
    {
      id: "de-stage2-q3",
      question: "How does Snowflake's architecture separate compute from storage?",
      answer:
        "Snowflake utilizes a multi-cluster shared data architecture with 3 decoupled layers: 1) Centralized Cloud Storage (Amazon S3 / Google Cloud Storage / Azure Blob) where data is stored in proprietary encrypted micro-partitions; 2) Virtual Warehouses (independent compute clusters) that execute queries concurrently without resource contention; and 3) Cloud Services layer handling authentication, metadata management, transaction coordination, and query optimization.",
      importance: "High",
      category: "Warehouses",
    },
  ],
  3: [
    {
      id: "de-stage3-q1",
      question: "What problems do Modern Open Table Formats (Iceberg, Delta Lake) solve over raw Parquet on S3?",
      answer:
        "Raw Parquet on S3 lacks ACID transactions, atomic multi-file commits, schema evolution without rewriting, and snapshot isolation. Open Table Formats provide: 1) ACID transactions using metadata manifest files; 2) Time Travel queries across historical snapshots; 3) Safe concurrent reads and writes; 4) Hidden partitioning and partition evolution without changing folder hierarchies; and 5) Efficient file pruning via column min/max statistics.",
      importance: "Critical",
      category: "Lakehouses",
    },
    {
      id: "de-stage3-q2",
      question: "How does Apache Iceberg achieve Hidden Partitioning and Partition Evolution?",
      answer:
        "Iceberg abstracts partition values behind transform functions (e.g., `days(timestamp)`, `bucket(16, id)`). Users query on the raw timestamp column (`WHERE event_time > '2026-01-01'`) without knowing the physical layout, and Iceberg automatically derives partition pruning. Partition Evolution allows altering the partition scheme (e.g., changing from day to hour) for new writes without having to rewrite older data.",
      importance: "High",
      category: "Apache Iceberg",
    },
  ],
  4: [
    {
      id: "de-stage4-q1",
      question: "Explain the difference between Narrow and Wide transformations in Apache Spark.",
      answer:
        "Narrow transformations (e.g. `map`, `filter`, `select`) do not require data exchange across cluster nodes; each partition of the parent RDD is used by at most one partition of the child RDD. Wide transformations (e.g. `groupBy`, `join`, `distinct`, `repartition`) require a Shuffle operation, redistributing data across executors over the network, which introduces disk I/O, network serialization, and potential partition skew.",
      importance: "Critical",
      category: "Apache Spark",
    },
    {
      id: "de-stage4-q2",
      question: "How do you detect and fix Spark Shuffle Spill and Data Skew?",
      answer:
        "Shuffle Spill occurs when an executor's memory is insufficient to hold sorted/aggregated shuffle partitions, forcing Spark to spill data to disk. Data Skew happens when one partition has disproportionately more rows (e.g., NULL keys or popular customer IDs). Solutions: 1) Key Salting (appending random integer suffixes `key_0..N` to distribute load, then joining and stripping); 2) Broadcast Hash Joins for dimension tables smaller than 10MB (`spark.sql.autoBroadcastJoinThreshold`); 3) Enabling Adaptive Query Execution (`spark.sql.adaptive.skewJoin.enabled = true`).",
      importance: "Critical",
      category: "Spark Optimization",
    },
  ],
  5: [
    {
      id: "de-stage5-q1",
      question: "What does pipeline Idempotency mean, and why is it essential in Data Orchestration?",
      answer:
        "An idempotent pipeline produces the exact same final state regardless of how many times it is executed with the same input parameters. In Apache Airflow, DAGs must rely on the execution date / logical date rather than `datetime.now()`, and writing data must utilize overwrite partitions or MERGE/upsert statements rather than blind APPENDs, allowing safe automatic retries on network failures without duplicating records.",
      importance: "Critical",
      category: "Orchestration",
    },
    {
      id: "de-stage5-q2",
      question: "How do Dagster's Software-Defined Assets differ from Airflow's Task-Centric DAGs?",
      answer:
        "Airflow is task-centric: a DAG coordinates execution dependencies between actions (`extract -> transform -> load`), but the orchestrator does not inherently understand *what* data artifacts are produced. Dagster is asset-centric: developers declare the data assets that should exist, their schemas, and code to compute them (`@asset`). Dagster handles lineage, caching, and upstream/downstream materialization dependencies automatically.",
      importance: "High",
      category: "Dagster",
    },
  ],
  6: [
    {
      id: "de-stage6-q1",
      question: "How does Apache Kafka guarantee message ordering, and what are its limits?",
      answer:
        "Kafka guarantees strict message ordering *only within a single partition* of a topic. Messages with the same key are hashed to the same partition and written to an immutable append-only commit log. Across different partitions, there is no total ordering. To achieve global ordering, a topic must have exactly 1 partition, which eliminates parallel throughput.",
      importance: "Critical",
      category: "Kafka",
    },
    {
      id: "de-stage6-q2",
      question: "How does Apache Flink handle late-arriving out-of-order streaming events?",
      answer:
        "Flink uses Watermarks—a metric of progress in event time that tells the engine no events older than time `T` should be expected. When an event arrives with a timestamp prior to the watermark, Flink can either: 1) Drop the record; 2) Emit it to a Side Output stream for dead-letter processing; or 3) Update the window if allowed lateness (`allowedLateness(Time)`) is configured.",
      importance: "High",
      category: "Stream Processing",
    },
  ],
  7: [
    {
      id: "de-stage7-q1",
      question: "How does dbt handle incremental models, and what are the merge strategies?",
      answer:
        "A dbt incremental model compiles SQL wrapped in an `{% if is_incremental() %}` Jinja conditional block. On initial run, it builds a full table. On subsequent runs, it queries only records newer than `MAX(updated_at) FROM {{ this }}`. dbt executes this using either a `delete+insert` strategy or an atomic `merge` statement guided by `unique_key` and optional `incremental_predicates` for partition pruning.",
      importance: "Critical",
      category: "dbt",
    },
    {
      id: "de-stage7-q2",
      question: "What is the difference between Schema Tests and Data Observability in production pipelines?",
      answer:
        "Schema tests (e.g. dbt generic tests: `not_null`, `unique`, `relationships`, `accepted_values`) validate static structural constraints at build time. Data Observability monitors runtime health: freshness (did the data arrive on time?), volume anomalies (is row count +/- 50% from baseline?), schema drift, and distributional shifts, raising automated alerts before corrupted data reaches dashboards.",
      importance: "High",
      category: "Data Quality",
    },
  ],
  8: [
    {
      id: "de-stage8-q1",
      question: "What is 'Slim CI' in DataOps, and how does it reduce warehouse compute costs?",
      answer:
        "In traditional CI, every pull request executes all downstream dbt models and tests, wasting thousands of warehouse credits. Slim CI compares the PR branch against the production manifest (`manifest.json` from the latest production run) and builds/tests *only* modified models and their immediate downstream dependents (`state:modified+`), cutting build times and cloud spend by up to 90%.",
      importance: "Critical",
      category: "DataOps",
    },
    {
      id: "de-stage8-q2",
      question: "Why is column-level data lineage crucial for enterprise data governance?",
      answer:
        "Column-level lineage traces the precise origin, transformations, and destinations of individual fields (e.g. `ssn`, `email`, `revenue_usd`). It enables: 1) Automated compliance auditing (GDPR right-to-be-forgotten and HIPAA PII isolation); 2) Impact analysis: determining which BI dashboards break before renaming a warehouse column; and 3) Root cause diagnosis: tracing faulty metric calculation back to upstream ingestion bugs.",
      importance: "High",
      category: "Governance & Lineage",
    },
  ],
};
