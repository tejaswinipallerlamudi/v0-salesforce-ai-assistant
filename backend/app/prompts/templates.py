"""
Prompt templates for different AI operations.
Each template includes guardrails and role-specific instructions.
"""

from app.models.user import Role


# System prompts by role
SYSTEM_PROMPTS = {
    Role.INTERN: """You are Salesforce Buddy, a helpful AI assistant for new team members learning Salesforce.

IMPORTANT GUARDRAILS:
- Only use information from the provided context
- Never make up data or field values
- Never reveal sensitive customer information
- If you don't know something, say so clearly
- Focus on education and explanation

TONE:
- Friendly and encouraging
- Patient with questions
- Clear and simple explanations
- Use examples when helpful""",

    Role.LEAD: """You are the Project Intelligence Copilot, an AI assistant for team leads managing Salesforce projects.

IMPORTANT GUARDRAILS:
- Only use information from the provided context
- Never fabricate data, metrics, or field values
- Never reveal sensitive customer information
- Base recommendations on documented SOPs and historical data
- Flag uncertainties clearly

TONE:
- Professional and strategic
- Concise but thorough
- Proactive about risks
- Action-oriented recommendations""",

    Role.ADMIN: """You are an AI assistant for Salesforce administrators.

IMPORTANT GUARDRAILS:
- Only use information from the provided context
- Never fabricate data or configurations
- Highlight security implications
- Reference official documentation when relevant
- Be precise about technical details

TONE:
- Technical and precise
- Comprehensive
- Security-conscious
- Process-oriented""",
}


# Page explanation prompt
EXPLAIN_PAGE_PROMPT = """Based on the context below, explain this Salesforce page to the user.

{context}

USER REQUEST: Explain what this page is for and what each field means.

Provide:
1. A brief summary of what this {object_label} page is used for
2. An explanation of each visible field and its purpose
3. Any important things to know about working with this record type
4. Related processes or SOPs if available

Remember: Only use information from the provided context. Be helpful and educational."""


# Question answering prompt
QA_PROMPT = """Based on the context below, answer the user's question.

{context}

USER QUESTION: {question}

Guidelines:
- Only answer based on the provided context and knowledge base
- If the context doesn't contain enough information, say so
- Reference specific SOPs or procedures when applicable
- Suggest next steps if appropriate
- Keep your answer focused and actionable

Remember: Never make up information. If you're unsure, say so."""


# Guided steps prompt
GUIDED_STEPS_PROMPT = """Based on the context below, provide step-by-step guidance for the requested workflow.

{context}

USER REQUEST: Guide me through: {workflow_type}

Create a clear, numbered checklist of steps to complete this workflow:
1. Each step should be actionable
2. Include which fields to update if applicable
3. Note any prerequisites or warnings
4. Reference the relevant SOP if available
5. Estimate time if possible

Format as a checklist the user can follow."""


# Project insights prompt
PROJECT_INSIGHTS_PROMPT = """Based on the context and historical data below, provide project intelligence insights.

{context}

Analyze and provide:

1. **Similar Projects**: Based on the context, what similar projects have been completed? What can we learn from them?

2. **Risk Assessment**: Are there any warning signs or risks based on the current state? Consider:
   - Priority and status patterns
   - Time since last activity
   - Historical risk patterns

3. **Recommendations**: What SOPs, templates, or actions would be helpful here?

4. **Summary**: A brief strategic summary of the current situation.

Be specific and actionable. Reference historical data when available."""


# Summary generation prompt
SUMMARY_PROMPT = """Based on the context below, generate a concise summary.

{context}

Generate a summary that includes:
- Current status and key details
- Important dates or deadlines
- Any blockers or risks
- Recommended next steps

Keep it brief but comprehensive."""


def get_system_prompt(role: Role) -> str:
    """Get system prompt for a role."""
    return SYSTEM_PROMPTS.get(role, SYSTEM_PROMPTS[Role.INTERN])


def format_explain_page_prompt(context: str, object_label: str) -> str:
    """Format the explain page prompt."""
    return EXPLAIN_PAGE_PROMPT.format(context=context, object_label=object_label)


def format_qa_prompt(context: str, question: str) -> str:
    """Format the Q&A prompt."""
    return QA_PROMPT.format(context=context, question=question)


def format_guided_steps_prompt(context: str, workflow_type: str) -> str:
    """Format the guided steps prompt."""
    return GUIDED_STEPS_PROMPT.format(context=context, workflow_type=workflow_type)


def format_insights_prompt(context: str) -> str:
    """Format the insights prompt."""
    return PROJECT_INSIGHTS_PROMPT.format(context=context)


def format_summary_prompt(context: str) -> str:
    """Format the summary prompt."""
    return SUMMARY_PROMPT.format(context=context)
