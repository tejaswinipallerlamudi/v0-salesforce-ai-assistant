import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { workflowType, objectName, recordId, userRole } = await request.json()

    const prompt = `You are a Salesforce expert assistant helping a ${userRole} user with a ${workflowType} workflow.

Context:
- Salesforce Object: ${objectName || 'Case'}
- Record ID: ${recordId || 'Not specified'}
- Workflow Type: ${workflowType}

Generate a detailed step-by-step guide for the "${workflowType}" workflow in Salesforce. 
The response should be practical and actionable for someone working in Salesforce.

Provide your response as a JSON object with this exact structure:
{
  "workflow_type": "${workflowType}",
  "workflow_title": "Title for this workflow",
  "description": "Brief description of what this workflow accomplishes",
  "steps": [
    {
      "step_number": 1,
      "title": "Step title",
      "description": "Detailed description of what to do",
      "is_optional": false,
      "related_field": "FieldName if applicable"
    }
  ],
  "prerequisites": ["List of requirements before starting"],
  "warnings": ["Important things to watch out for"],
  "estimated_time_minutes": 10
}

Provide 4-8 clear, actionable steps. Include field names where relevant.
Return ONLY the JSON object, no additional text.`

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.3,
    })

    // Parse the JSON response
    let parsedResponse
    try {
      // Clean up the response - remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsedResponse = JSON.parse(cleanedText)
    } catch {
      // If parsing fails, return a structured error response
      return NextResponse.json({
        workflow_type: workflowType,
        workflow_title: `${workflowType.charAt(0).toUpperCase() + workflowType.slice(1)} Workflow`,
        description: 'AI-generated workflow steps',
        steps: [
          {
            step_number: 1,
            title: 'Review Current State',
            description: text.slice(0, 500),
            is_optional: false,
          }
        ],
        prerequisites: [],
        warnings: [],
        estimated_time_minutes: 10,
        source_sop: {
          source_type: 'ai_generated',
          source_id: 0,
          title: 'AI-Generated Workflow',
          relevance_score: 0.85,
        },
      })
    }

    // Add source info
    parsedResponse.source_sop = {
      source_type: 'ai_generated',
      source_id: 0,
      title: 'AI-Generated Workflow',
      relevance_score: 0.88,
    }

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error('Error generating guided steps:', error)
    return NextResponse.json(
      { error: 'Failed to generate guided steps' },
      { status: 500 }
    )
  }
}
