/**
 * TypeScript types for CSX AI Delivery Fabric
 */

// User & Auth
export type UserRole = 'intern' | 'lead' | 'admin';

// Salesforce Types
export interface SalesforceField {
  name: string;
  label: string;
  type: string;
  is_required?: boolean;
  is_updateable?: boolean;
  picklist_values?: string[];
  help_text?: string;
}

export interface SalesforceObject {
  name: string;
  label: string;
  label_plural: string;
  description?: string;
  fields: SalesforceField[];
  allowed_field_count: number;
}

export interface SalesforceRecord {
  id: string;
  object_name: string;
  fields: Record<string, unknown>;
  record_type?: string;
  created_date?: string;
  last_modified_date?: string;
}

export interface SafetyInfo {
  fields_filtered: number;
  pii_masked: number;
  allowed_fields_only: boolean;
  masking_applied: boolean;
}

// Context Types
export interface RetrievedSource {
  source_type: string;
  source_id: number;
  title: string;
  relevance_score: number;
  snippet?: string;
}

export interface PageContext {
  object_name: string;
  object_label: string;
  record_id?: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    value?: unknown;
  }>;
  status?: string;
  priority?: string;
  record_type?: string;
  created_date?: string;
  last_modified_date?: string;
}

// AI Response Types
export interface FieldExplanation {
  field_name: string;
  field_label: string;
  field_type: string;
  current_value?: string;
  explanation: string;
  tips?: string;
}

export interface ExplainPageResponse {
  object_name: string;
  object_label: string;
  record_id?: string;
  summary: string;
  purpose: string;
  field_explanations: FieldExplanation[];
  related_processes: string[];
  sources_used: RetrievedSource[];
  safety_note: string;
}

export interface QuestionResponse {
  question: string;
  answer: string;
  confidence: number;
  sources_used: RetrievedSource[];
  suggested_actions: string[];
  limitations?: string;
  safety_note: string;
}

export interface GuidedStep {
  step_number: number;
  title: string;
  description: string;
  is_optional: boolean;
  tips?: string;
  related_field?: string;
}

export interface GuidedStepsResponse {
  workflow_type: string;
  workflow_title: string;
  description: string;
  steps: GuidedStep[];
  prerequisites: string[];
  warnings: string[];
  source_sop?: RetrievedSource;
  estimated_time_minutes?: number;
}

// Insights Types
export interface SimilarProject {
  project_id: number;
  project_name: string;
  similarity_score: number;
  matching_factors: string[];
  outcome: string;
  duration_days?: number;
  lessons_summary?: string;
  solutions_applied: string[];
}

export interface RiskIndicator {
  risk_id: string;
  risk_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  trigger: string;
  recommended_actions: string[];
  related_sop?: string;
}

export interface Recommendation {
  recommendation_type: string;
  title: string;
  description: string;
  relevance_score: number;
  resource_id?: number;
  resource_type?: string;
}

export interface ProjectSummary {
  summary: string;
  key_points: string[];
  current_status: string;
  next_steps: string[];
  blockers: string[];
}

export interface InsightsResponse {
  object_name: string;
  record_id?: string;
  similar_projects: SimilarProject[];
  risks: RiskIndicator[];
  risk_summary?: string;
  recommendations: Recommendation[];
  summary?: ProjectSummary;
  analysis_timestamp: string;
  confidence_score: number;
}

// Audit Types
export interface AuditLogEntry {
  id: number;
  timestamp: string;
  user_id?: number;
  user_role: string;
  action: string;
  endpoint: string;
  request_context: Record<string, unknown>;
  retrieved_sources: Array<Record<string, unknown>>;
  response_summary: string;
  success: boolean;
  error_message?: string;
  response_time_ms?: number;
  tokens_used?: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  detail?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  database_connected: boolean;
  salesforce_connected: boolean;
}
