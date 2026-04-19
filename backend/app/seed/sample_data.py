"""
Sample seed data for SOPs, KT notes, project histories.
"""

SAMPLE_SOPS = [
    {
        "title": "Case Escalation Procedure",
        "category": "escalation",
        "content": """
# Case Escalation Procedure

## When to Escalate
- Case has been open for more than 5 business days without resolution
- Customer has requested escalation
- Priority is Critical and no progress in 24 hours
- Technical issue requires specialized team involvement

## Escalation Steps
1. Review the case history and document all troubleshooting steps taken
2. Update the case Status to "Escalated"
3. Add escalation notes explaining the reason
4. Notify the escalation team via the designated channel
5. Update the customer about the escalation

## Priority Guidelines
- Critical: Response within 2 hours, escalate after 24 hours if unresolved
- High: Response within 8 hours, escalate after 3 days if unresolved
- Medium: Response within 24 hours, escalate after 5 days if unresolved
- Low: Response within 48 hours, escalate after 7 days if unresolved

## Post-Escalation
- Monitor for escalation team response
- Keep customer updated on progress
- Document resolution for knowledge base
        """,
        "tags": ["escalation", "case", "priority", "procedure"],
        "applies_to_objects": ["Case"],
    },
    {
        "title": "Case Closure Procedure",
        "category": "case_handling",
        "content": """
# Case Closure Procedure

## Prerequisites for Closure
- Issue has been resolved
- Customer has confirmed resolution OR no response for 3 business days after solution provided
- All required documentation is complete
- Root cause has been identified (if applicable)

## Closure Steps
1. Verify all case activities are documented
2. Update the Status to "Closed"
3. Set appropriate Closed Reason
4. Send closure notification to customer
5. Update knowledge base if new solution was found

## Customer Satisfaction
- Request feedback if not already received
- Document any improvement suggestions
- Flag cases with negative feedback for review

## Re-opening Cases
- Cases can be re-opened within 7 days if issue recurs
- After 7 days, create a new case and link to the original
        """,
        "tags": ["closure", "case", "procedure", "documentation"],
        "applies_to_objects": ["Case"],
    },
    {
        "title": "Opportunity Stage Progression",
        "category": "sales",
        "content": """
# Opportunity Stage Progression Guide

## Stage Definitions

### Prospecting
- Initial contact made
- Need identified
- No commitment yet

### Qualification
- Budget confirmed
- Decision maker identified
- Timeline established
- Pain points documented

### Proposal
- Solution presented
- Pricing discussed
- ROI documented

### Negotiation
- Contract terms being discussed
- Final pricing agreed
- Legal review in progress

### Closed Won/Lost
- Deal finalized
- Document win/loss reasons
- Update forecasts

## Best Practices
- Update stage within 24 hours of any change
- Add notes explaining stage changes
- Keep close date accurate
- Update probability based on stage
        """,
        "tags": ["opportunity", "sales", "stages", "progression"],
        "applies_to_objects": ["Opportunity"],
    },
    {
        "title": "High Priority Case Handling",
        "category": "case_handling",
        "content": """
# High Priority Case Handling

## Definition
High Priority cases involve:
- Production system outages
- Critical business process blocked
- Security incidents
- Data integrity issues

## Response Requirements
- Initial response within 2 hours
- Status update every 4 hours
- Escalate if no progress in 8 hours

## Documentation
- Document all troubleshooting steps
- Capture error messages and logs
- Track timeline of events
- Note workarounds provided

## Communication
- Notify manager immediately
- CC stakeholders on updates
- Prepare executive summary if needed
        """,
        "tags": ["high-priority", "case", "urgent", "procedure"],
        "applies_to_objects": ["Case"],
    },
]

SAMPLE_KT_NOTES = [
    {
        "source_type": "kt_note",
        "title": "Understanding Case Priority Field",
        "content": """
# Case Priority Field Explained

The Priority field indicates the urgency and business impact of a case.

## Values
- **Critical**: Major business impact, production down, affects multiple users
- **High**: Significant impact, workaround may exist, affects key users
- **Medium**: Moderate impact, workaround available, limited user impact
- **Low**: Minor impact, cosmetic issues, feature requests

## Impact on SLA
Priority directly affects response and resolution SLA targets:
- Critical: 2-hour response, 24-hour resolution
- High: 8-hour response, 3-day resolution
- Medium: 24-hour response, 5-day resolution
- Low: 48-hour response, 7-day resolution

## Best Practices
- Set priority based on business impact, not customer emotion
- Re-evaluate priority as understanding improves
- Document reasoning for priority changes
        """,
        "category": "field_guide",
        "tags": ["priority", "case", "field", "sla"],
        "related_object": "Case",
        "related_field": "Priority",
    },
    {
        "source_type": "kt_note",
        "title": "Case Status Values Explained",
        "content": """
# Case Status Field Explained

The Status field tracks where a case is in its lifecycle.

## Values
- **New**: Just created, not yet assigned
- **Working**: Actively being investigated
- **Escalated**: Escalated to specialized team
- **Waiting on Customer**: Awaiting customer response
- **Closed**: Issue resolved

## Workflow Rules
- New cases auto-assign based on queue rules
- Status changes trigger notifications
- Closed status requires resolution notes

## Tips
- Update status promptly to reflect reality
- Add notes when changing status
- Don't close without customer confirmation or timeout
        """,
        "category": "field_guide",
        "tags": ["status", "case", "field", "workflow"],
        "related_object": "Case",
        "related_field": "Status",
    },
    {
        "source_type": "kt_note",
        "title": "Opportunity Stage Best Practices",
        "content": """
# Understanding Opportunity Stages

Stages represent where a deal is in the sales process.

## Key Principles
1. Stages should reflect reality, not optimism
2. Update within 24 hours of any change
3. Document reasons for stage changes
4. Use probability guidance for forecasting

## Common Mistakes
- Moving to late stages without verified criteria
- Not updating close dates
- Skipping stages
- No documentation of stage changes

## Stage Verification
Each stage has entry criteria. Verify before advancing:
- Do we have budget confirmation?
- Have we met the decision maker?
- Is there a defined timeline?
        """,
        "category": "field_guide",
        "tags": ["opportunity", "stage", "sales", "best-practices"],
        "related_object": "Opportunity",
        "related_field": "StageName",
    },
]

SAMPLE_PROJECT_HISTORIES = [
    {
        "project_name": "Enterprise CRM Implementation - Financial Services",
        "description": "Full Salesforce implementation for a regional bank including Service Cloud, custom objects, and integration with legacy systems.",
        "client_industry": "Financial Services",
        "project_type": "Implementation",
        "duration_days": 180,
        "outcome": "completed",
        "lessons_learned": "Integration with legacy mainframe systems required more time than estimated. Should allocate 50% more time for data migration in financial services projects. Custom objects for compliance tracking were very well received.",
        "risks_encountered": ["Data migration delays", "Integration complexity", "Regulatory compliance requirements"],
        "solutions_applied": ["Phased migration approach", "Dedicated integration team", "Weekly compliance reviews"],
        "tags": ["implementation", "financial", "service-cloud", "integration"],
    },
    {
        "project_name": "Healthcare Provider Case Management",
        "description": "Service Cloud optimization for healthcare provider focusing on patient case management and HIPAA compliance.",
        "client_industry": "Healthcare",
        "project_type": "Optimization",
        "duration_days": 90,
        "outcome": "completed",
        "lessons_learned": "HIPAA compliance requirements significantly impacted data visibility rules. Created reusable permission sets for healthcare clients. Patient satisfaction surveys integrated well with case closure process.",
        "risks_encountered": ["HIPAA compliance complexity", "User adoption resistance", "Integration with EHR system"],
        "solutions_applied": ["Pre-built HIPAA templates", "Change management workshops", "API-first integration approach"],
        "tags": ["healthcare", "hipaa", "service-cloud", "compliance"],
    },
    {
        "project_name": "Retail Sales Cloud Rollout",
        "description": "Sales Cloud implementation for multi-location retail chain with focus on opportunity management and forecasting.",
        "client_industry": "Retail",
        "project_type": "Implementation",
        "duration_days": 120,
        "outcome": "completed",
        "lessons_learned": "Multi-location hierarchies require careful planning. Territory management was more complex than anticipated. Mobile adoption was key success factor for field sales team.",
        "risks_encountered": ["Territory assignment conflicts", "Mobile connectivity issues", "Data quality from legacy system"],
        "solutions_applied": ["Automated territory rules", "Offline mobile capability", "Data cleansing sprint"],
        "tags": ["retail", "sales-cloud", "mobile", "forecasting"],
    },
    {
        "project_name": "Manufacturing Service Optimization",
        "description": "Service Cloud optimization for manufacturing company to improve case resolution times and implement knowledge base.",
        "client_industry": "Manufacturing",
        "project_type": "Optimization",
        "duration_days": 60,
        "outcome": "escalated",
        "lessons_learned": "Knowledge base implementation required more content than available. Should assess content readiness before committing to KB timeline. Escalation led to extended timeline and additional resources.",
        "risks_encountered": ["Content creation delays", "User resistance to KB usage", "Complex product hierarchy"],
        "solutions_applied": ["Content creation workshops", "Gamification of KB usage", "Simplified product categorization"],
        "tags": ["manufacturing", "knowledge-base", "service-cloud", "escalated"],
    },
]

SAMPLE_TEMPLATES = [
    {
        "source_type": "template",
        "title": "Case Summary Template",
        "content": """
# Case Summary Template

## Issue Overview
[Brief description of the issue reported]

## Customer Impact
- Business Impact: [Critical/High/Medium/Low]
- Users Affected: [Number/Scope]
- Workaround Available: [Yes/No]

## Investigation
- Root Cause: [Description]
- Troubleshooting Steps Taken:
  1. [Step 1]
  2. [Step 2]

## Resolution
- Solution Applied: [Description]
- Date Resolved: [Date]
- Verified By: [Name]

## Follow-up
- Knowledge Base Article: [Yes/No - Link if Yes]
- Process Improvement: [If applicable]
        """,
        "category": "documentation",
        "tags": ["template", "case", "summary", "documentation"],
    },
    {
        "source_type": "template",
        "title": "Escalation Request Template",
        "content": """
# Escalation Request

## Case Information
- Case Number: [Number]
- Priority: [Priority]
- Days Open: [Number]

## Escalation Reason
[Select one or more]
- [ ] SLA breach imminent
- [ ] Customer requested
- [ ] Technical complexity
- [ ] Business critical impact

## Summary
[Brief description of issue and current state]

## Troubleshooting Completed
1. [Step taken]
2. [Step taken]

## Requested Action
[What do you need from the escalation team?]
        """,
        "category": "escalation",
        "tags": ["template", "escalation", "request"],
    },
]


async def seed_database(db):
    """Seed the database with sample data."""
    from app.services.knowledge_service import KnowledgeService
    
    service = KnowledgeService()
    
    # Seed SOPs
    for sop_data in SAMPLE_SOPS:
        await service.add_sop_document(
            db=db,
            title=sop_data["title"],
            category=sop_data["category"],
            content=sop_data["content"],
            tags=sop_data["tags"],
            applies_to_objects=sop_data["applies_to_objects"],
        )
    
    # Seed KT notes
    for kt_data in SAMPLE_KT_NOTES:
        await service.add_knowledge_source(
            db=db,
            source_type=kt_data["source_type"],
            title=kt_data["title"],
            content=kt_data["content"],
            category=kt_data.get("category"),
            tags=kt_data["tags"],
            related_object=kt_data.get("related_object"),
            related_field=kt_data.get("related_field"),
        )
    
    # Seed project histories
    for proj_data in SAMPLE_PROJECT_HISTORIES:
        await service.add_project_history(
            db=db,
            project_name=proj_data["project_name"],
            description=proj_data["description"],
            client_industry=proj_data.get("client_industry"),
            project_type=proj_data.get("project_type"),
            duration_days=proj_data.get("duration_days"),
            outcome=proj_data["outcome"],
            lessons_learned=proj_data["lessons_learned"],
            risks_encountered=proj_data.get("risks_encountered"),
            solutions_applied=proj_data.get("solutions_applied"),
            tags=proj_data["tags"],
        )
    
    # Seed templates
    for template_data in SAMPLE_TEMPLATES:
        await service.add_knowledge_source(
            db=db,
            source_type=template_data["source_type"],
            title=template_data["title"],
            content=template_data["content"],
            category=template_data.get("category"),
            tags=template_data["tags"],
        )
    
    print("Database seeded with sample data.")
