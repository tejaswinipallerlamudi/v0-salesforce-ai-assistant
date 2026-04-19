/**
 * API Client for CSX AI Delivery Fabric Backend
 */

import type {
  SalesforceObject,
  SalesforceRecord,
  SafetyInfo,
  ExplainPageResponse,
  QuestionResponse,
  GuidedStepsResponse,
  InsightsResponse,
  HealthResponse,
  AuditLogEntry,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Health
  async getHealth(): Promise<HealthResponse> {
    return this.fetch<HealthResponse>('/health');
  }

  // Salesforce
  async getObjects(): Promise<{ objects: SalesforceObject[]; total: number }> {
    return this.fetch('/api/salesforce/objects');
  }

  async getObjectMetadata(objectName: string): Promise<SalesforceObject> {
    return this.fetch(`/api/salesforce/objects/${objectName}`);
  }

  async getRecords(
    objectName: string,
    params?: { status?: string; priority?: string; page?: number; page_size?: number }
  ): Promise<{ records: SalesforceRecord[]; total: number; page: number; page_size: number }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());
    
    const query = searchParams.toString();
    return this.fetch(`/api/salesforce/records/${objectName}${query ? `?${query}` : ''}`);
  }

  async getRecord(
    objectName: string,
    recordId: string,
    includeMetadata = false
  ): Promise<{ record: SalesforceRecord; metadata?: SalesforceObject; safety_info: SafetyInfo }> {
    return this.fetch(
      `/api/salesforce/record/${objectName}/${recordId}?include_metadata=${includeMetadata}`
    );
  }

  // AI - Salesforce Buddy
  async explainPage(
    objectName: string,
    recordId?: string,
    userRole = 'intern',
    detailLevel = 'standard'
  ): Promise<ExplainPageResponse> {
    return this.fetch('/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify({
        object_name: objectName,
        record_id: recordId,
        user_role: userRole,
        detail_level: detailLevel,
      }),
    });
  }

  async askQuestion(
    question: string,
    objectName?: string,
    recordId?: string,
    userRole = 'intern'
  ): Promise<QuestionResponse> {
    return this.fetch('/api/ai/question', {
      method: 'POST',
      body: JSON.stringify({
        question,
        object_name: objectName,
        record_id: recordId,
        user_role: userRole,
      }),
    });
  }

  async getGuidedSteps(
    workflowType: string,
    objectName?: string,
    recordId?: string,
    userRole = 'intern'
  ): Promise<GuidedStepsResponse> {
    return this.fetch('/api/ai/guided-steps', {
      method: 'POST',
      body: JSON.stringify({
        workflow_type: workflowType,
        object_name: objectName,
        record_id: recordId,
        user_role: userRole,
      }),
    });
  }

  // Project Intelligence
  async analyzeProject(
    objectName: string,
    recordId?: string,
    userRole = 'lead',
    options?: {
      include_similar_projects?: boolean;
      include_risks?: boolean;
      include_recommendations?: boolean;
      include_summary?: boolean;
    }
  ): Promise<InsightsResponse> {
    return this.fetch('/api/insights/analyze', {
      method: 'POST',
      body: JSON.stringify({
        object_name: objectName,
        record_id: recordId,
        user_role: userRole,
        ...options,
      }),
    });
  }

  // Audit
  async getAuditLogs(params?: {
    page?: number;
    page_size?: number;
    action?: string;
    user_role?: string;
  }): Promise<{ logs: AuditLogEntry[]; total: number; page: number; page_size: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());
    if (params?.action) searchParams.set('action', params.action);
    if (params?.user_role) searchParams.set('user_role', params.user_role);
    
    const query = searchParams.toString();
    return this.fetch(`/api/audit/logs${query ? `?${query}` : ''}`);
  }

  async getAuditStats(): Promise<{
    total_requests: number;
    requests_today: number;
    average_response_time_ms: number;
    total_tokens_used: number;
    error_count: number;
    error_rate: number;
  }> {
    return this.fetch('/api/audit/stats');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };
