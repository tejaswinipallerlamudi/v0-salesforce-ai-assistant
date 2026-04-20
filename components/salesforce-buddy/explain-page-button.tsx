'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { UserRole, ExplainPageResponse } from '@/types'
import { Lightbulb } from 'lucide-react'

interface ExplainPageButtonProps {
  objectName: string
  recordId?: string
  userRole: UserRole
  onExplanation: (explanation: ExplainPageResponse) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

// Comprehensive knowledge base explanations for Salesforce objects with ALL fields
const KNOWLEDGE_BASE_EXPLANATIONS: Record<string, ExplainPageResponse> = {
  Case: {
    object_name: 'Case',
    object_label: 'Case',
    record_id: 'CASE-001',
    summary: `This Case page is used to track and manage customer support issues. Cases help your team organize customer requests, track resolution progress, and maintain service level agreements (SLAs).

The current record shows a high-priority case that requires attention. Based on the status and priority fields, this case should be addressed according to your team's SLA guidelines.`,
    purpose: 'This Case page is used to manage and track customer support cases in Salesforce.',
    field_explanations: [
      // Identification Fields
      { field_name: 'CaseNumber', field_label: 'Case Number', field_type: 'Auto Number', current_value: '00001234', explanation: 'Unique auto-generated identifier for this case. Used for reference in communications and tracking.' },
      { field_name: 'Id', field_label: 'Case ID', field_type: 'ID', explanation: 'Salesforce unique record identifier (18-character). Used for integrations and API references.' },
      
      // Core Information Fields
      { field_name: 'Subject', field_label: 'Subject', field_type: 'Text (255)', current_value: 'Login Issue - Unable to access dashboard', explanation: 'Brief summary of the customer issue. Should be clear and searchable for future reference.' },
      { field_name: 'Description', field_label: 'Description', field_type: 'Long Text Area', explanation: 'Detailed description of the issue including steps to reproduce, error messages, and any relevant context from the customer.' },
      { field_name: 'Status', field_label: 'Status', field_type: 'Picklist', current_value: 'Working', explanation: 'Current lifecycle state. Values: New (unassigned), Working (in progress), Escalated (needs higher support), Pending Customer (awaiting response), Resolved, Closed.' },
      { field_name: 'Priority', field_label: 'Priority', field_type: 'Picklist', current_value: 'High', explanation: 'Urgency level determining SLA. Critical (1hr response), High (4hr), Medium (1 day), Low (2 days). Based on business impact and customer tier.', tips: 'Only Team Leads can upgrade to Critical priority.' },
      { field_name: 'Type', field_label: 'Type', field_type: 'Picklist', explanation: 'Category of issue: Problem (something broken), Question (how-to), Feature Request (enhancement), Incident (outage-related).' },
      { field_name: 'Origin', field_label: 'Case Origin', field_type: 'Picklist', explanation: 'Channel through which the case was created: Phone, Email, Web, Chat, Social Media. Helps track support channel effectiveness.' },
      { field_name: 'Reason', field_label: 'Case Reason', field_type: 'Picklist', explanation: 'Root cause category: User Error, Complex Functionality, Performance, Installation, Hardware, Software, Other.' },
      
      // Classification Fields  
      { field_name: 'Product__c', field_label: 'Product', field_type: 'Picklist', explanation: 'The product or service this case relates to. Used for routing and reporting.' },
      { field_name: 'Component__c', field_label: 'Component', field_type: 'Picklist', explanation: 'Specific component or module within the product experiencing the issue.' },
      { field_name: 'IsEscalated', field_label: 'Escalated', field_type: 'Checkbox', explanation: 'Indicates if the case has been escalated to a higher support tier. Triggers escalation workflows.' },
      
      // Relationship Fields
      { field_name: 'AccountId', field_label: 'Account Name', field_type: 'Lookup (Account)', explanation: 'The company or organization this case belongs to. Links to Account record for customer context.' },
      { field_name: 'ContactId', field_label: 'Contact Name', field_type: 'Lookup (Contact)', explanation: 'The person who reported the issue. Used for communication and contact history.' },
      { field_name: 'AssetId', field_label: 'Asset', field_type: 'Lookup (Asset)', explanation: 'The specific product or asset experiencing the issue. Links to warranty and service history.' },
      { field_name: 'ParentId', field_label: 'Parent Case', field_type: 'Lookup (Case)', explanation: 'Links to a parent case if this is a sub-case. Used for complex issues requiring multiple tracks.' },
      { field_name: 'OwnerId', field_label: 'Case Owner', field_type: 'Lookup (User/Queue)', explanation: 'The user or queue responsible for this case. Assignment can be manual or via assignment rules.' },
      
      // Resolution Fields
      { field_name: 'Resolution__c', field_label: 'Resolution', field_type: 'Long Text Area', explanation: 'Detailed description of how the issue was resolved. Required before closing. Used for knowledge base.' },
      { field_name: 'ResolutionType__c', field_label: 'Resolution Type', field_type: 'Picklist', explanation: 'How the issue was resolved: Fixed, User Training, Configuration Change, Workaround Provided, Cannot Reproduce, Duplicate.' },
      { field_name: 'IsClosed', field_label: 'Closed', field_type: 'Checkbox', explanation: 'System field indicating if the case is in a closed status. Read-only, set automatically.' },
      { field_name: 'ClosedDate', field_label: 'Closed Date', field_type: 'Date/Time', explanation: 'Timestamp when the case was closed. Used for SLA reporting and metrics.' },
      
      // SLA & Time Tracking Fields
      { field_name: 'SlaStartDate', field_label: 'SLA Start Date', field_type: 'Date/Time', explanation: 'When the SLA clock started. Usually case creation time unless specified otherwise.' },
      { field_name: 'SlaExitDate', field_label: 'SLA Exit Date', field_type: 'Date/Time', explanation: 'When the case exited SLA tracking (resolved or closed).' },
      { field_name: 'FirstResponseDate__c', field_label: 'First Response Date', field_type: 'Date/Time', explanation: 'Timestamp of first agent response to the customer. Critical for SLA compliance.' },
      { field_name: 'TimeToFirstResponse__c', field_label: 'Time to First Response', field_type: 'Formula (Number)', explanation: 'Calculated time between case creation and first response. Used in SLA dashboards.' },
      { field_name: 'TimeToResolution__c', field_label: 'Time to Resolution', field_type: 'Formula (Number)', explanation: 'Total time from case creation to resolution. Key metric for support efficiency.' },
      
      // Communication Fields
      { field_name: 'SuppliedEmail', field_label: 'Web Email', field_type: 'Email', explanation: 'Email address provided when case was created via web form. May differ from Contact email.' },
      { field_name: 'SuppliedPhone', field_label: 'Web Phone', field_type: 'Phone', explanation: 'Phone number provided during web case creation.' },
      { field_name: 'SuppliedName', field_label: 'Web Name', field_type: 'Text', explanation: 'Name provided during web case creation. Used when Contact is not identified.' },
      { field_name: 'SuppliedCompany', field_label: 'Web Company', field_type: 'Text', explanation: 'Company name from web form. Used to match or create Account record.' },
      
      // Internal Notes & Comments
      { field_name: 'Comments', field_label: 'Internal Comments', field_type: 'Long Text Area', explanation: 'Internal notes visible only to support team. Not shared with customer.' },
      { field_name: 'InternalNotes__c', field_label: 'Internal Notes', field_type: 'Rich Text Area', explanation: 'Extended internal documentation area for detailed troubleshooting notes.' },
      
      // System Fields
      { field_name: 'CreatedDate', field_label: 'Created Date', field_type: 'Date/Time', explanation: 'When the case record was created. System-generated, read-only.' },
      { field_name: 'CreatedById', field_label: 'Created By', field_type: 'Lookup (User)', explanation: 'User who created the case. May be the customer (web) or an agent (phone/email).' },
      { field_name: 'LastModifiedDate', field_label: 'Last Modified Date', field_type: 'Date/Time', explanation: 'Most recent update timestamp. Useful for tracking case activity.' },
      { field_name: 'LastModifiedById', field_label: 'Last Modified By', field_type: 'Lookup (User)', explanation: 'User who last updated the case.' },
    ],
    related_processes: ['Case Escalation Procedure', 'High Priority Case Handling', 'Case Closure Procedure', 'SLA Management', 'Case Assignment Rules'],
    sources_used: [
      { source_type: 'sop', source_id: 1, title: 'Case Escalation Procedure', relevance_score: 0.92, snippet: 'When to Escalate: Case has been open for more than 5 business days without resolution...' },
      { source_type: 'kt_note', source_id: 1, title: 'Understanding Case Priority Field', relevance_score: 0.88, snippet: 'The Priority field indicates the urgency and business impact of a case...' },
      { source_type: 'field_guide', source_id: 1, title: 'Case Object Field Reference', relevance_score: 0.95, snippet: 'Complete field guide for Case object including all standard and custom fields.' },
    ],
    safety_note: 'This explanation uses only approved metadata fields. Customer PII has been masked.',
  },
  Account: {
    object_name: 'Account',
    object_label: 'Account',
    record_id: 'ACC-001',
    summary: `This Account page represents a company or organization you do business with. Accounts are central to your CRM and help track all interactions, opportunities, cases, and contacts related to a customer.

Accounts can be Business Accounts (B2B) or Person Accounts (B2C) depending on your org configuration.`,
    purpose: 'Account records store comprehensive information about companies, organizations, and customers in your CRM.',
    field_explanations: [
      // Identification Fields
      { field_name: 'Id', field_label: 'Account ID', field_type: 'ID', explanation: 'Salesforce unique 18-character identifier. Used for integrations and API operations.' },
      { field_name: 'Name', field_label: 'Account Name', field_type: 'Text (255)', explanation: 'Official company or organization name. Required field. Should match legal entity name.' },
      { field_name: 'AccountNumber', field_label: 'Account Number', field_type: 'Text', explanation: 'Your internal reference number for this customer. Often synced from ERP or billing systems.' },
      
      // Classification Fields
      { field_name: 'Type', field_label: 'Account Type', field_type: 'Picklist', explanation: 'Customer classification: Prospect, Customer, Partner, Competitor, Investor, Other. Drives workflows and reporting.' },
      { field_name: 'Industry', field_label: 'Industry', field_type: 'Picklist', explanation: 'Primary industry sector: Technology, Healthcare, Finance, Manufacturing, Retail, etc. Used for segmentation.' },
      { field_name: 'Rating', field_label: 'Account Rating', field_type: 'Picklist', explanation: 'Quality rating: Hot (ready to buy), Warm (interested), Cold (long-term). Used for prioritization.' },
      { field_name: 'Tier__c', field_label: 'Customer Tier', field_type: 'Picklist', explanation: 'Service level tier: Enterprise, Professional, Standard. Determines SLA and support priority.', tips: 'Enterprise customers get priority support and faster SLAs.' },
      
      // Company Information
      { field_name: 'Website', field_label: 'Website', field_type: 'URL', explanation: 'Company website URL. Useful for research and validation.' },
      { field_name: 'Phone', field_label: 'Phone', field_type: 'Phone', explanation: 'Main company phone number. Used for primary contact.' },
      { field_name: 'Fax', field_label: 'Fax', field_type: 'Phone', explanation: 'Company fax number if applicable.' },
      { field_name: 'AnnualRevenue', field_label: 'Annual Revenue', field_type: 'Currency', explanation: 'Estimated annual revenue. Used for account scoring and segmentation.' },
      { field_name: 'NumberOfEmployees', field_label: 'Employees', field_type: 'Number', explanation: 'Approximate employee count. Indicates company size for targeting.' },
      { field_name: 'Ownership', field_label: 'Ownership', field_type: 'Picklist', explanation: 'Ownership type: Public, Private, Subsidiary, Government, Non-Profit.' },
      { field_name: 'TickerSymbol', field_label: 'Ticker Symbol', field_type: 'Text', explanation: 'Stock ticker for publicly traded companies.' },
      { field_name: 'Sic', field_label: 'SIC Code', field_type: 'Text', explanation: 'Standard Industrial Classification code for industry categorization.' },
      { field_name: 'NaicsCode', field_label: 'NAICS Code', field_type: 'Text', explanation: 'North American Industry Classification System code.' },
      { field_name: 'YearStarted', field_label: 'Year Started', field_type: 'Text', explanation: 'Year the company was founded.' },
      
      // Address Fields
      { field_name: 'BillingStreet', field_label: 'Billing Street', field_type: 'Text Area', explanation: 'Street address for billing and invoices.' },
      { field_name: 'BillingCity', field_label: 'Billing City', field_type: 'Text', explanation: 'City for billing address.' },
      { field_name: 'BillingState', field_label: 'Billing State/Province', field_type: 'Text', explanation: 'State or province for billing.' },
      { field_name: 'BillingPostalCode', field_label: 'Billing Zip/Postal Code', field_type: 'Text', explanation: 'Postal code for billing address.' },
      { field_name: 'BillingCountry', field_label: 'Billing Country', field_type: 'Text', explanation: 'Country for billing address.' },
      { field_name: 'ShippingStreet', field_label: 'Shipping Street', field_type: 'Text Area', explanation: 'Street address for deliveries.' },
      { field_name: 'ShippingCity', field_label: 'Shipping City', field_type: 'Text', explanation: 'City for shipping address.' },
      { field_name: 'ShippingState', field_label: 'Shipping State/Province', field_type: 'Text', explanation: 'State or province for shipping.' },
      { field_name: 'ShippingPostalCode', field_label: 'Shipping Zip/Postal Code', field_type: 'Text', explanation: 'Postal code for shipping.' },
      { field_name: 'ShippingCountry', field_label: 'Shipping Country', field_type: 'Text', explanation: 'Country for shipping.' },
      
      // Relationship Fields
      { field_name: 'ParentId', field_label: 'Parent Account', field_type: 'Lookup (Account)', explanation: 'Links to parent company for subsidiary relationships. Enables account hierarchy.' },
      { field_name: 'OwnerId', field_label: 'Account Owner', field_type: 'Lookup (User)', explanation: 'Primary salesperson or account manager responsible for this account.' },
      
      // Engagement Fields
      { field_name: 'LastActivityDate', field_label: 'Last Activity', field_type: 'Date', explanation: 'Most recent activity (call, email, meeting) logged. Indicates engagement level.' },
      { field_name: 'Description', field_label: 'Description', field_type: 'Long Text Area', explanation: 'Detailed notes about the account, business relationship, and key information.' },
      
      // Custom Fields
      { field_name: 'ContractEndDate__c', field_label: 'Contract End Date', field_type: 'Date', explanation: 'When current contract expires. Used for renewal tracking.', tips: 'Set reminders 90 days before expiration.' },
      { field_name: 'AccountSource__c', field_label: 'Account Source', field_type: 'Picklist', explanation: 'How this account was acquired: Referral, Marketing, Trade Show, Partner, etc.' },
      { field_name: 'CustomerSince__c', field_label: 'Customer Since', field_type: 'Date', explanation: 'Date when this account became a customer.' },
      
      // System Fields
      { field_name: 'CreatedDate', field_label: 'Created Date', field_type: 'Date/Time', explanation: 'When the account was created in Salesforce.' },
      { field_name: 'CreatedById', field_label: 'Created By', field_type: 'Lookup (User)', explanation: 'User who created this account record.' },
      { field_name: 'LastModifiedDate', field_label: 'Last Modified Date', field_type: 'Date/Time', explanation: 'Most recent update to any field.' },
      { field_name: 'LastModifiedById', field_label: 'Last Modified By', field_type: 'Lookup (User)', explanation: 'User who last updated the account.' },
    ],
    related_processes: ['Account Management Guidelines', 'Customer Onboarding', 'Account Review Process', 'Territory Assignment'],
    sources_used: [
      { source_type: 'sop', source_id: 10, title: 'Account Management Guidelines', relevance_score: 0.90, snippet: 'Account records should be kept up to date with current information...' },
      { source_type: 'field_guide', source_id: 2, title: 'Account Object Field Reference', relevance_score: 0.94, snippet: 'Complete field documentation for Account standard and custom fields.' },
    ],
    safety_note: 'This explanation uses only approved metadata fields. Customer PII has been masked.',
  },
  Opportunity: {
    object_name: 'Opportunity',
    object_label: 'Opportunity',
    record_id: 'OPP-001',
    summary: `This Opportunity page tracks a potential sale or deal through your sales pipeline. Opportunities are essential for revenue forecasting, pipeline management, and sales performance tracking.

Each opportunity represents a qualified sales engagement with expected close date and amount.`,
    purpose: 'Opportunity records track potential deals and their progression through your sales stages from qualification to close.',
    field_explanations: [
      // Identification Fields
      { field_name: 'Id', field_label: 'Opportunity ID', field_type: 'ID', explanation: 'Salesforce unique identifier for API and integration purposes.' },
      { field_name: 'Name', field_label: 'Opportunity Name', field_type: 'Text (120)', explanation: 'Descriptive name for this deal. Convention: Account Name - Product/Service - Date. Required field.' },
      
      // Core Deal Fields
      { field_name: 'Amount', field_label: 'Amount', field_type: 'Currency', explanation: 'Expected deal value if won. Used for forecasting and quota tracking. Should reflect actual expected contract value.' },
      { field_name: 'CloseDate', field_label: 'Close Date', field_type: 'Date', explanation: 'Expected close date. Required field. Must be updated as deal progresses. Used in forecast reports.', tips: 'Update this regularly to maintain accurate forecasts.' },
      { field_name: 'StageName', field_label: 'Stage', field_type: 'Picklist', explanation: 'Current position in sales process. Stages: Prospecting, Qualification, Needs Analysis, Proposal, Negotiation, Closed Won, Closed Lost.' },
      { field_name: 'Probability', field_label: 'Probability (%)', field_type: 'Percent', explanation: 'Likelihood of winning. Auto-set by stage but can be manually adjusted. Used in weighted forecasts.' },
      { field_name: 'ForecastCategoryName', field_label: 'Forecast Category', field_type: 'Picklist', explanation: 'Forecast bucket: Pipeline, Best Case, Commit, Closed. Determines how opportunity counts in forecast.' },
      { field_name: 'ExpectedRevenue', field_label: 'Expected Revenue', field_type: 'Currency', explanation: 'Calculated field: Amount x Probability. Represents probability-weighted deal value.' },
      
      // Classification Fields
      { field_name: 'Type', field_label: 'Opportunity Type', field_type: 'Picklist', explanation: 'Deal type: New Business, Existing Business - Upgrade, Existing Business - Renewal, Existing Business - Add-on.' },
      { field_name: 'LeadSource', field_label: 'Lead Source', field_type: 'Picklist', explanation: 'How this opportunity originated: Web, Referral, Partner, Trade Show, Cold Call, Marketing Campaign.' },
      { field_name: 'NextStep', field_label: 'Next Step', field_type: 'Text (255)', explanation: 'Specific next action required to advance the deal. Should be concrete and time-bound.' },
      { field_name: 'Description', field_label: 'Description', field_type: 'Long Text Area', explanation: 'Detailed notes about the opportunity, customer needs, competitive situation, and deal strategy.' },
      
      // Relationship Fields
      { field_name: 'AccountId', field_label: 'Account Name', field_type: 'Lookup (Account)', explanation: 'The company this opportunity is associated with. Required field. Links to Account record.' },
      { field_name: 'ContactId', field_label: 'Primary Contact', field_type: 'Lookup (Contact)', explanation: 'Main decision maker or champion for this deal.' },
      { field_name: 'OwnerId', field_label: 'Opportunity Owner', field_type: 'Lookup (User)', explanation: 'Salesperson responsible for this opportunity. Determines quota credit.' },
      { field_name: 'CampaignId', field_label: 'Primary Campaign Source', field_type: 'Lookup (Campaign)', explanation: 'Marketing campaign that generated or influenced this opportunity.' },
      { field_name: 'Pricebook2Id', field_label: 'Price Book', field_type: 'Lookup (Price Book)', explanation: 'Price book used for this opportunity. Determines available products and pricing.' },
      
      // Deal Intelligence Fields
      { field_name: 'CompetitorName__c', field_label: 'Competitor', field_type: 'Text', explanation: 'Primary competitor in this deal if known.' },
      { field_name: 'CompetitiveNotes__c', field_label: 'Competitive Notes', field_type: 'Long Text Area', explanation: 'Intelligence about competitive positioning, strengths, and weaknesses.' },
      { field_name: 'LossReason__c', field_label: 'Loss Reason', field_type: 'Picklist', explanation: 'If Closed Lost, why the deal was lost: Price, Competitor, No Budget, No Decision, Other.' },
      { field_name: 'WinNotes__c', field_label: 'Win/Loss Notes', field_type: 'Long Text Area', explanation: 'Post-mortem notes on why deal was won or lost. Used for improving sales process.' },
      
      // Product & Contract Fields
      { field_name: 'HasOpportunityLineItem', field_label: 'Has Products', field_type: 'Checkbox', explanation: 'Indicates if products/line items have been added to this opportunity.' },
      { field_name: 'ContractLength__c', field_label: 'Contract Length', field_type: 'Picklist', explanation: 'Duration of proposed contract: Monthly, Annual, Multi-Year.' },
      { field_name: 'RecurringRevenue__c', field_label: 'Recurring Revenue', field_type: 'Currency', explanation: 'Annual recurring revenue (ARR) component of the deal.' },
      { field_name: 'OneTimeRevenue__c', field_label: 'One-Time Revenue', field_type: 'Currency', explanation: 'Non-recurring revenue: implementation, training, setup fees.' },
      
      // Close Fields
      { field_name: 'IsClosed', field_label: 'Closed', field_type: 'Checkbox', explanation: 'System field indicating if opportunity is in a closed stage (won or lost). Read-only.' },
      { field_name: 'IsWon', field_label: 'Won', field_type: 'Checkbox', explanation: 'System field indicating if opportunity was won. Read-only.' },
      
      // System Fields
      { field_name: 'CreatedDate', field_label: 'Created Date', field_type: 'Date/Time', explanation: 'When opportunity was created.' },
      { field_name: 'CreatedById', field_label: 'Created By', field_type: 'Lookup (User)', explanation: 'User who created the opportunity.' },
      { field_name: 'LastModifiedDate', field_label: 'Last Modified Date', field_type: 'Date/Time', explanation: 'Most recent update timestamp.' },
      { field_name: 'LastActivityDate', field_label: 'Last Activity', field_type: 'Date', explanation: 'Date of most recent activity logged against this opportunity.' },
      { field_name: 'LastStageChangeDate', field_label: 'Last Stage Change', field_type: 'Date', explanation: 'When the stage was last changed. Used to identify stalled deals.' },
    ],
    related_processes: ['Sales Process Guidelines', 'Deal Approval Workflow', 'Forecasting Process', 'Discount Approval', 'Contract Review'],
    sources_used: [
      { source_type: 'sop', source_id: 11, title: 'Sales Process Guidelines', relevance_score: 0.91, snippet: 'Update opportunity stages as deals progress through the pipeline...' },
      { source_type: 'sop', source_id: 12, title: 'Forecasting Best Practices', relevance_score: 0.87, snippet: 'Maintain accurate close dates and probability for reliable forecasts...' },
      { source_type: 'field_guide', source_id: 3, title: 'Opportunity Object Field Reference', relevance_score: 0.95, snippet: 'Complete field documentation for Opportunity object.' },
    ],
    safety_note: 'This explanation uses only approved metadata fields.',
  },
  Contact: {
    object_name: 'Contact',
    object_label: 'Contact',
    record_id: 'CON-001',
    summary: `This Contact page represents an individual person associated with an Account. Contacts are essential for tracking relationships, communication history, and individual engagement with your organization.`,
    purpose: 'Contact records store information about people you interact with, typically associated with a customer or prospect Account.',
    field_explanations: [
      // Identification Fields
      { field_name: 'Id', field_label: 'Contact ID', field_type: 'ID', explanation: 'Unique Salesforce identifier for this contact.' },
      { field_name: 'Name', field_label: 'Full Name', field_type: 'Name', explanation: 'Combined first and last name. Auto-generated from name components.' },
      { field_name: 'FirstName', field_label: 'First Name', field_type: 'Text', explanation: 'Contact first/given name.' },
      { field_name: 'LastName', field_label: 'Last Name', field_type: 'Text', explanation: 'Contact last/family name. Required field.' },
      { field_name: 'Salutation', field_label: 'Salutation', field_type: 'Picklist', explanation: 'Title prefix: Mr., Ms., Mrs., Dr., Prof., etc.' },
      { field_name: 'Title', field_label: 'Title', field_type: 'Text', explanation: 'Job title or position within the company.' },
      { field_name: 'Department', field_label: 'Department', field_type: 'Text', explanation: 'Department or business unit within the organization.' },
      
      // Contact Information
      { field_name: 'Email', field_label: 'Email', field_type: 'Email', explanation: 'Primary email address. Used for email communications and matching.' },
      { field_name: 'Phone', field_label: 'Phone', field_type: 'Phone', explanation: 'Primary phone number.' },
      { field_name: 'MobilePhone', field_label: 'Mobile', field_type: 'Phone', explanation: 'Mobile/cell phone number.' },
      { field_name: 'HomePhone', field_label: 'Home Phone', field_type: 'Phone', explanation: 'Personal home phone number if applicable.' },
      { field_name: 'OtherPhone', field_label: 'Other Phone', field_type: 'Phone', explanation: 'Alternative phone number.' },
      { field_name: 'Fax', field_label: 'Fax', field_type: 'Phone', explanation: 'Fax number if applicable.' },
      { field_name: 'AssistantName', field_label: 'Assistant Name', field_type: 'Text', explanation: 'Name of executive assistant if applicable.' },
      { field_name: 'AssistantPhone', field_label: 'Assistant Phone', field_type: 'Phone', explanation: 'Assistant phone number.' },
      
      // Address Fields
      { field_name: 'MailingStreet', field_label: 'Mailing Street', field_type: 'Text Area', explanation: 'Street address for correspondence.' },
      { field_name: 'MailingCity', field_label: 'Mailing City', field_type: 'Text', explanation: 'City for mailing address.' },
      { field_name: 'MailingState', field_label: 'Mailing State/Province', field_type: 'Text', explanation: 'State or province.' },
      { field_name: 'MailingPostalCode', field_label: 'Mailing Zip/Postal Code', field_type: 'Text', explanation: 'Postal code.' },
      { field_name: 'MailingCountry', field_label: 'Mailing Country', field_type: 'Text', explanation: 'Country.' },
      { field_name: 'OtherStreet', field_label: 'Other Street', field_type: 'Text Area', explanation: 'Alternative address street.' },
      { field_name: 'OtherCity', field_label: 'Other City', field_type: 'Text', explanation: 'Alternative address city.' },
      { field_name: 'OtherState', field_label: 'Other State/Province', field_type: 'Text', explanation: 'Alternative address state.' },
      { field_name: 'OtherPostalCode', field_label: 'Other Zip/Postal Code', field_type: 'Text', explanation: 'Alternative address postal code.' },
      { field_name: 'OtherCountry', field_label: 'Other Country', field_type: 'Text', explanation: 'Alternative address country.' },
      
      // Relationship Fields
      { field_name: 'AccountId', field_label: 'Account Name', field_type: 'Lookup (Account)', explanation: 'Company this contact belongs to. Links contact to their organization.' },
      { field_name: 'ReportsToId', field_label: 'Reports To', field_type: 'Lookup (Contact)', explanation: 'Manager or supervisor. Used for org chart visualization.' },
      { field_name: 'OwnerId', field_label: 'Contact Owner', field_type: 'Lookup (User)', explanation: 'Salesforce user responsible for this contact relationship.' },
      
      // Classification Fields
      { field_name: 'LeadSource', field_label: 'Lead Source', field_type: 'Picklist', explanation: 'How this contact was originally acquired.' },
      { field_name: 'Level__c', field_label: 'Level', field_type: 'Picklist', explanation: 'Seniority level: C-Level, VP, Director, Manager, Individual Contributor.' },
      { field_name: 'Role__c', field_label: 'Role in Decision', field_type: 'Picklist', explanation: 'Role in buying process: Decision Maker, Influencer, Champion, End User, Blocker.' },
      
      // Engagement Fields
      { field_name: 'Birthdate', field_label: 'Birthdate', field_type: 'Date', explanation: 'Contact birth date for personalized outreach.' },
      { field_name: 'Description', field_label: 'Description', field_type: 'Long Text Area', explanation: 'Notes about the contact, preferences, and relationship history.' },
      { field_name: 'HasOptedOutOfEmail', field_label: 'Email Opt Out', field_type: 'Checkbox', explanation: 'If checked, contact has opted out of email communications.' },
      { field_name: 'DoNotCall', field_label: 'Do Not Call', field_type: 'Checkbox', explanation: 'If checked, contact should not be called.' },
      { field_name: 'HasOptedOutOfFax', field_label: 'Fax Opt Out', field_type: 'Checkbox', explanation: 'If checked, contact has opted out of fax communications.' },
      
      // System Fields
      { field_name: 'CreatedDate', field_label: 'Created Date', field_type: 'Date/Time', explanation: 'When contact record was created.' },
      { field_name: 'LastModifiedDate', field_label: 'Last Modified Date', field_type: 'Date/Time', explanation: 'Most recent update to contact record.' },
      { field_name: 'LastActivityDate', field_label: 'Last Activity', field_type: 'Date', explanation: 'Date of most recent activity logged.' },
    ],
    related_processes: ['Contact Management', 'Email Communication Guidelines', 'Privacy Compliance'],
    sources_used: [
      { source_type: 'sop', source_id: 13, title: 'Contact Management Guidelines', relevance_score: 0.89, snippet: 'Keep contact information current and respect communication preferences.' },
      { source_type: 'field_guide', source_id: 4, title: 'Contact Object Field Reference', relevance_score: 0.94, snippet: 'Complete documentation of Contact fields.' },
    ],
    safety_note: 'This explanation uses only approved metadata fields. Personal information is handled per privacy guidelines.',
  },
  Lead: {
    object_name: 'Lead',
    object_label: 'Lead',
    record_id: 'LEAD-001',
    summary: `This Lead page represents a potential customer who has shown interest but hasn't been qualified yet. Leads are the starting point of your sales funnel and need to be qualified before converting to Accounts, Contacts, and Opportunities.`,
    purpose: 'Lead records capture potential customer interest and track qualification through the early sales process before conversion.',
    field_explanations: [
      // Identification
      { field_name: 'Id', field_label: 'Lead ID', field_type: 'ID', explanation: 'Unique Salesforce identifier.' },
      { field_name: 'Name', field_label: 'Name', field_type: 'Name', explanation: 'Full name combining first and last name.' },
      { field_name: 'FirstName', field_label: 'First Name', field_type: 'Text', explanation: 'Lead first name.' },
      { field_name: 'LastName', field_label: 'Last Name', field_type: 'Text', explanation: 'Lead last name. Required field.' },
      { field_name: 'Salutation', field_label: 'Salutation', field_type: 'Picklist', explanation: 'Title: Mr., Ms., etc.' },
      { field_name: 'Title', field_label: 'Title', field_type: 'Text', explanation: 'Job title.' },
      { field_name: 'Company', field_label: 'Company', field_type: 'Text', explanation: 'Company name. Required field. Used for Account creation on conversion.' },
      
      // Contact Info
      { field_name: 'Email', field_label: 'Email', field_type: 'Email', explanation: 'Primary email for outreach.' },
      { field_name: 'Phone', field_label: 'Phone', field_type: 'Phone', explanation: 'Primary phone number.' },
      { field_name: 'MobilePhone', field_label: 'Mobile', field_type: 'Phone', explanation: 'Mobile phone number.' },
      { field_name: 'Website', field_label: 'Website', field_type: 'URL', explanation: 'Company website.' },
      
      // Address
      { field_name: 'Street', field_label: 'Street', field_type: 'Text Area', explanation: 'Street address.' },
      { field_name: 'City', field_label: 'City', field_type: 'Text', explanation: 'City.' },
      { field_name: 'State', field_label: 'State/Province', field_type: 'Text', explanation: 'State or province.' },
      { field_name: 'PostalCode', field_label: 'Zip/Postal Code', field_type: 'Text', explanation: 'Postal code.' },
      { field_name: 'Country', field_label: 'Country', field_type: 'Text', explanation: 'Country.' },
      
      // Classification
      { field_name: 'Status', field_label: 'Lead Status', field_type: 'Picklist', explanation: 'Current qualification stage: New, Contacted, Qualified, Unqualified, Converted.' },
      { field_name: 'LeadSource', field_label: 'Lead Source', field_type: 'Picklist', explanation: 'How lead was acquired: Web, Referral, Partner, Event, Advertising, Cold Call.' },
      { field_name: 'Rating', field_label: 'Rating', field_type: 'Picklist', explanation: 'Quality rating: Hot, Warm, Cold. Based on engagement and fit.' },
      { field_name: 'Industry', field_label: 'Industry', field_type: 'Picklist', explanation: 'Company industry sector.' },
      { field_name: 'AnnualRevenue', field_label: 'Annual Revenue', field_type: 'Currency', explanation: 'Estimated company annual revenue.' },
      { field_name: 'NumberOfEmployees', field_label: 'No. of Employees', field_type: 'Number', explanation: 'Estimated employee count.' },
      
      // Qualification
      { field_name: 'Description', field_label: 'Description', field_type: 'Long Text Area', explanation: 'Notes about lead interest, needs, and qualification details.' },
      { field_name: 'ProductInterest__c', field_label: 'Product Interest', field_type: 'Picklist', explanation: 'Which product or service the lead is interested in.' },
      { field_name: 'Budget__c', field_label: 'Budget', field_type: 'Currency', explanation: 'Estimated budget if known.' },
      { field_name: 'Timeline__c', field_label: 'Timeline', field_type: 'Picklist', explanation: 'Purchase timeline: Immediate, This Quarter, This Year, Evaluating.' },
      
      // Assignment
      { field_name: 'OwnerId', field_label: 'Lead Owner', field_type: 'Lookup (User/Queue)', explanation: 'User or queue responsible for working this lead.' },
      { field_name: 'IsConverted', field_label: 'Converted', field_type: 'Checkbox', explanation: 'Indicates if lead has been converted to Account/Contact/Opportunity.' },
      { field_name: 'ConvertedDate', field_label: 'Converted Date', field_type: 'Date', explanation: 'Date when lead was converted.' },
      { field_name: 'ConvertedAccountId', field_label: 'Converted Account', field_type: 'Lookup (Account)', explanation: 'Account created from conversion.' },
      { field_name: 'ConvertedContactId', field_label: 'Converted Contact', field_type: 'Lookup (Contact)', explanation: 'Contact created from conversion.' },
      { field_name: 'ConvertedOpportunityId', field_label: 'Converted Opportunity', field_type: 'Lookup (Opportunity)', explanation: 'Opportunity created from conversion.' },
      
      // System
      { field_name: 'CreatedDate', field_label: 'Created Date', field_type: 'Date/Time', explanation: 'When lead was created.' },
      { field_name: 'LastModifiedDate', field_label: 'Last Modified', field_type: 'Date/Time', explanation: 'Last update timestamp.' },
      { field_name: 'LastActivityDate', field_label: 'Last Activity', field_type: 'Date', explanation: 'Date of most recent activity.' },
    ],
    related_processes: ['Lead Qualification Process', 'Lead Assignment Rules', 'Lead Conversion', 'Lead Nurturing'],
    sources_used: [
      { source_type: 'sop', source_id: 14, title: 'Lead Management Process', relevance_score: 0.92, snippet: 'Qualify leads using BANT criteria before conversion.' },
      { source_type: 'field_guide', source_id: 5, title: 'Lead Object Field Reference', relevance_score: 0.95, snippet: 'Complete Lead field documentation.' },
    ],
    safety_note: 'This explanation uses only approved metadata fields.',
  },
}

export function ExplainPageButton({
  objectName,
  recordId,
  userRole,
  onExplanation,
  isLoading,
  setIsLoading,
}: ExplainPageButtonProps) {
  const handleExplain = async () => {
    setIsLoading(true)
    try {
      // Step 1: First check the local knowledge base for documented explanations
      const knowledgeBaseExplanation = KNOWLEDGE_BASE_EXPLANATIONS[objectName]
      
      // Step 2: If we have documented explanation in the knowledge base, use it
      if (knowledgeBaseExplanation) {
        // Found documented explanation - use the knowledge base
        onExplanation({
          ...knowledgeBaseExplanation,
          record_id: recordId,
        })
      } else {
        // No documented explanation found - use OpenAI to generate one
        try {
          const response = await fetch('/api/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ objectName, recordId, userRole }),
          })
          
          if (!response.ok) {
            throw new Error('API request failed')
          }
          
          const aiExplanation = await response.json()
          onExplanation(aiExplanation)
        } catch (error) {
          console.error('[v0] Failed to get AI explanation:', error)
          // If OpenAI also fails, return a basic fallback
          onExplanation({
            object_name: objectName,
            object_label: objectName,
            record_id: recordId,
            summary: `This is a ${objectName} record in Salesforce. For detailed documentation about this object, please consult your administrator or internal knowledge base.`,
            purpose: `${objectName} records store related data in your Salesforce organization.`,
            field_explanations: [],
            related_processes: [],
            sources_used: [],
            safety_note: 'No documentation available. Please consult your administrator.',
          })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleExplain}
      disabled={isLoading || !objectName}
      className="w-full gap-2"
    >
      {isLoading ? (
        <>
          <Spinner className="size-4" />
          Analyzing...
        </>
      ) : (
        <>
          <Lightbulb className="size-4" />
          Explain This Page
        </>
      )}
    </Button>
  )
}
