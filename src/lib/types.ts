export type Provider = "aws" | "azure" | "gcp";
export type FindingStatus = "PASS" | "FAIL" | "CANNOT_SCAN";
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export interface Finding {
  id: string;
  scan_id: string;
  check_id: string;
  title: string;
  provider: Provider;
  account_id: string;
  region: string | null;
  resource_id: string | null;
  status: FindingStatus;
  severity: Severity;
  details: string;
}
export interface Counts {
  PASS: number;
  FAIL: number;
  CANNOT_SCAN: number;
}
export interface Scan {
  id: string;
  status: "RUNNING" | "COMPLETED" | "FAILED";
  started_at: string;
  finished_at: string | null;
  account_ids: string[];
  score: number | null;
  counts: Counts;
  fail_counts_by_severity: Record<Severity, number>;
  account_scores: Record<string, number | null>;
  error_message?: string | null;
}
export interface FindingsPage {
  items: Finding[];
  total: number;
  page: number;
  page_size: number;
}
export interface Filters {
  status: string;
  severity: string;
  provider: string;
  account_id: string;
}
export interface Activity {
  id: string;
  method: "GET" | "POST";
  path: string;
  params?: unknown;
  startedAt: string;
  duration?: number;
  status?: number;
  error?: string;
}
export const accounts: { id: string; name: string; provider: Provider }[] = [
  { id: "123456789012", name: "example-corp-prod", provider: "aws" },
  { id: "210987654321", name: "example-corp-dev", provider: "aws" },
  {
    id: "8f14e45f-ceea-4e7a-9d3b-2f6c1a0b7d21",
    name: "example-corp-azure",
    provider: "azure",
  },
  { id: "example-corp-gcp", name: "example-corp-gcp", provider: "gcp" },
];
export const providerNames: Record<Provider, string> = {
  aws: "Amazon Web Services",
  azure: "Microsoft Azure",
  gcp: "Google Cloud",
};
export const emptyFilters: Filters = {
  status: "",
  severity: "",
  provider: "",
  account_id: "",
};

export interface SecurityCheck {
  check_id: string;
  title: string;
  provider: Provider;
  severity: Severity;
  collection: string;
  resource_id_field: string;
}
