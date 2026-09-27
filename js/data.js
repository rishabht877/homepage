// data.js
// Project data for the gallery. Each project carries enough structure that the
// gallery can render a real architecture diagram for it rather than a
// placeholder image: `pipeline` drives the generated SVG, `highlights` and
// `metrics` drive the detail dialog.

export const projects = [
  {
    id: "securecheck",
    name: "SecureCheck",
    tagline: "CI/CD security gate that blocks risky merges",
    org: "Northeastern University",
    year: 2026,
    accent: "#f97316",
    featured: 1,
    summary:
      "A CI/CD security gate that automatically scans every GitHub pull request for vulnerabilities and blocks merges on HIGH severity findings.",
    detail:
      "API Gateway and Lambda receive and validate GitHub webhooks, SQS buffers scan jobs with automatic retry via a dead letter queue, and an EC2 instance in a private subnet runs the Semgrep SAST scanner in Docker. Scan results are stored in DynamoDB and full reports in S3, with findings posted directly as PR comments via the GitHub API.",
    highlights: [
      "Full AWS infrastructure provisioned with Terraform: VPC with public and private subnets, security groups, Lambda, SQS, API Gateway, and an Auto Scaling Group for automatic EC2 recovery.",
      "SQS buffers scan jobs and retries failures automatically, with a dead letter queue catching poison messages.",
      "Semgrep runs containerized on EC2 inside a private subnet, so scanner workloads never touch the public internet.",
      "React and Node.js analytics dashboard visualizes vulnerability trends, severity breakdowns, and PR scan history across repositories.",
    ],
    pipeline: ["PR", "API GW", "Lambda", "SQS", "Semgrep", "DynamoDB"],
    metrics: [
      { label: "Blocks on", value: "HIGH" },
      { label: "Scanner", value: "Semgrep" },
      { label: "IaC", value: "Terraform" },
    ],
    tags: ["AWS", "Terraform", "Docker", "Security", "React", "Node.js"],
    url: "https://github.com/rishabht877/securecheck",
  },
  {
    id: "transactiq",
    name: "TransactIQ",
    tagline: "Kafka payment pipeline with effectively-once processing",
    org: "Personal project",
    year: 2025,
    accent: "#3ad07a",
    featured: 2,
    summary:
      "Kafka payment pipeline with a transactional outbox and idempotent consumers for effectively-once processing, plus an LLM-assisted fraud-triage service.",
    detail:
      "Payments are written to the database and an outbox table in one transaction, then relayed to Kafka so a broker outage can never lose an event. Consumers deduplicate on an idempotency key, which makes redelivery safe and turns at-least-once delivery into effectively-once processing.",
    highlights: [
      "Transactional outbox keeps the database write and the Kafka publish atomic without a distributed transaction.",
      "Idempotent consumers deduplicate on a payment key, so Kafka redelivery never double-charges.",
      "Fraud triage pairs deterministic rules with an LLM, so cheap rules short-circuit before any model call.",
      "Runs on Kubernetes with Redis caching hot account state.",
    ],
    pipeline: ["API", "Outbox", "Kafka", "Consumer", "Fraud", "Ledger"],
    metrics: [
      { label: "Delivery", value: "Effectively-once" },
      { label: "Broker", value: "Kafka" },
      { label: "Runtime", value: "Kubernetes" },
    ],
    tags: ["Java", "Kafka", "Kubernetes", "Redis", "Docker"],
    url: "https://github.com/rishabht877/TransactIQ",
  },
  {
    id: "promptrelay",
    name: "PromptRelay",
    tagline: "OpenAI-compatible gateway with a semantic cache",
    org: "Personal project",
    year: 2025,
    accent: "#38bdf8",
    featured: 3,
    summary:
      "OpenAI-compatible Go gateway fronting multiple LLM providers with fallback, a semantic response cache over Redis, and Prometheus/Grafana observability.",
    detail:
      "Clients keep using the OpenAI SDK while the gateway routes requests across providers. A semantic cache over Redis matches on embedding similarity rather than exact string equality, so paraphrased prompts still hit cache and cut both spend and latency.",
    highlights: [
      "Drop-in OpenAI-compatible API, so existing clients need no code changes.",
      "Semantic cache keyed on embedding similarity rather than exact text, catching paraphrased repeats.",
      "Automatic provider fallback when an upstream returns errors or rate limits.",
      "Prometheus metrics and Grafana dashboards for latency, cache hit rate, and per-provider cost.",
    ],
    pipeline: ["Client", "Gateway", "Cache", "Router", "Provider", "Metrics"],
    metrics: [
      { label: "Language", value: "Go" },
      { label: "Cache", value: "Semantic" },
      { label: "Observability", value: "Prometheus" },
    ],
    tags: ["Go", "Redis", "Docker", "Prometheus"],
    url: "https://github.com/rishabht877/PromptRelay",
  },
  {
    id: "helmwarden",
    name: "HelmWarden",
    tagline: "Kubernetes operator that auto-rolls-back bad releases",
    org: "Personal project",
    year: 2025,
    accent: "#a78bfa",
    featured: 4,
    summary:
      "Kubernetes operator in Go that reconciles Helm releases to desired state, auto-rolls-back failed rollouts, and blocks vulnerable images in CI.",
    detail:
      "The operator runs a standard reconcile loop over a custom resource describing the desired Helm release. When a rollout fails its health checks it rolls back to the last good revision automatically, and a validating admission webhook rejects images that fail a Trivy scan before they ever reach the cluster.",
    highlights: [
      "Reconcile loop continuously drives Helm releases toward the declared desired state.",
      "Failed rollouts roll back to the last healthy revision without operator intervention.",
      "Validating admission webhook blocks images that fail a Trivy vulnerability scan.",
      "CI pipeline scans every image before publish, keeping the registry clean.",
    ],
    pipeline: ["CRD", "Reconcile", "Helm", "Health", "Rollback", "Webhook"],
    metrics: [
      { label: "Pattern", value: "Operator" },
      { label: "Scanner", value: "Trivy" },
      { label: "Language", value: "Go" },
    ],
    tags: ["Go", "Kubernetes", "Docker", "Security"],
    url: "https://github.com/rishabht877/HelmWarden",
  },
];
