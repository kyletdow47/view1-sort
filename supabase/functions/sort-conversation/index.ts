/**
 * Supabase Edge Function: sort-conversation
 *
 * Brain 2 of the AI sorting system. Uses Claude API to:
 * 1. Interpret the photographer's natural-language brief
 * 2. Ask smart follow-up questions based on the batch scan summary
 * 3. Generate a structured sorting plan with custom categories
 *
 * The function never sees actual photos. It reads:
 * - The batch summary (text description of what Brain 1 found)
 * - The photographer's brief ("wedding last Saturday at a vineyard")
 * - The photographer's memory profile (learned preferences from past sorts)
 *
 * Cost: ~$0.005-0.007 per sort session (2-3 Haiku calls).
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY') ?? '',
})

interface SortConversationRequest {
  mode: 'brief' | 'followup' | 'plan'
  projectId: string
  message: string
  batchSummary?: string
  memoryProfile?: string
  previousContext?: string
}

interface SortCategory {
  name: string
  description: string
  matchLabels: string[]
  priority: number
}

interface SortPlan {
  categories: SortCategory[]
  qualityThreshold: number
  rejectCriteria: string[]
  sortWithinCategory: 'quality_desc' | 'chronological' | 'quality_asc'
}

interface BriefResponse {
  type: 'brief'
  proposedCategories: SortCategory[]
  followUpQuestions: string[]
  confidence: number
  reasoning: string
}

interface FollowUpResponse {
  type: 'followup'
  updatedCategories: SortCategory[]
  moreQuestions: string[]
  readyToSort: boolean
  reasoning: string
}

interface PlanResponse {
  type: 'plan'
  plan: SortPlan
  explanation: string
}

type ConversationResponse = BriefResponse | FollowUpResponse | PlanResponse

const SYSTEM_PROMPT = `You are an expert photography sorting assistant inside View1 Sort. Your job is to help photographers organize their photo shoots into well-structured categories.

You receive:
1. A BATCH SUMMARY describing what the AI vision system found in the uploaded photos (categories detected, quality metrics, timestamps, cameras used).
2. The PHOTOGRAPHER'S BRIEF describing the shoot and how they want it sorted.
3. Optionally, a MEMORY PROFILE with learned preferences from this photographer's past sorts.

Your responses must be valid JSON matching the schema for the requested mode.

Key principles:
- Keep categories practical. 4-10 categories is the sweet spot for most shoots.
- Category names should be short and photographer-friendly (e.g. "Getting Ready" not "Pre-ceremony preparation activities").
- The matchLabels array should contain descriptive phrases that the vision AI can match against (e.g. "a photograph of a bride getting ready").
- Ask follow-up questions ONLY when the brief is genuinely ambiguous or you spotted something in the batch summary the photographer might want separated.
- Never ask more than 2 follow-up questions.
- If the photographer's brief is clear enough, skip follow-ups and go straight to a sorting plan.
- Use the memory profile to reduce questions. If the photographer always separates "first look" from "ceremony", do that without asking.
- Set qualityThreshold between 0.5 (lenient) and 0.9 (strict) based on the photographer's preference or shoot type.
- Common rejectCriteria: "blurry", "closed eyes", "duplicate", "accidental", "test shot", "overexposed", "underexposed".`

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const body = (await req.json()) as SortConversationRequest
    const { mode, message, batchSummary, memoryProfile, previousContext } = body

    if (!message?.trim()) {
      return Response.json({ error: 'message is required' }, { status: 400 })
    }

    const result = await handleMode(mode, message, batchSummary, memoryProfile, previousContext)
    return Response.json(result, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[sort-conversation]', message)
    return Response.json({ error: message }, { status: 500 })
  }
})

async function handleMode(
  mode: string,
  message: string,
  batchSummary?: string,
  memoryProfile?: string,
  previousContext?: string
): Promise<ConversationResponse> {
  const userPromptParts: string[] = []

  if (batchSummary) {
    userPromptParts.push(`BATCH SUMMARY:\n${batchSummary}`)
  }

  if (memoryProfile) {
    userPromptParts.push(`MEMORY PROFILE:\n${memoryProfile}`)
  }

  if (previousContext) {
    userPromptParts.push(`PREVIOUS CONVERSATION:\n${previousContext}`)
  }

  switch (mode) {
    case 'brief':
      return handleBrief(message, userPromptParts)
    case 'followup':
      return handleFollowUp(message, userPromptParts)
    case 'plan':
      return handlePlan(message, userPromptParts)
    default:
      throw new Error(`Unknown mode: ${mode}`)
  }
}

async function handleBrief(brief: string, contextParts: string[]): Promise<BriefResponse> {
  const userMessage = [
    ...contextParts,
    `PHOTOGRAPHER'S BRIEF:\n${brief}`,
    '',
    'Respond with JSON matching this schema:',
    '{',
    '  "type": "brief",',
    '  "proposedCategories": [{ "name": string, "description": string, "matchLabels": string[], "priority": number }],',
    '  "followUpQuestions": string[],  // 0-2 questions, empty if brief is clear enough',
    '  "confidence": number,  // 0-1 how confident you are this plan is right',
    '  "reasoning": string  // brief explanation of your category choices',
    '}',
  ].join('\n')

  const response = await callClaude(userMessage)
  return JSON.parse(response) as BriefResponse
}

async function handleFollowUp(answers: string, contextParts: string[]): Promise<FollowUpResponse> {
  const userMessage = [
    ...contextParts,
    `PHOTOGRAPHER'S ANSWERS:\n${answers}`,
    '',
    'Respond with JSON matching this schema:',
    '{',
    '  "type": "followup",',
    '  "updatedCategories": [{ "name": string, "description": string, "matchLabels": string[], "priority": number }],',
    '  "moreQuestions": string[],  // 0-1 more questions, or empty if ready',
    '  "readyToSort": boolean,  // true if no more questions needed',
    '  "reasoning": string',
    '}',
  ].join('\n')

  const response = await callClaude(userMessage)
  return JSON.parse(response) as FollowUpResponse
}

async function handlePlan(finalInput: string, contextParts: string[]): Promise<PlanResponse> {
  const userMessage = [
    ...contextParts,
    `FINAL INPUT:\n${finalInput}`,
    '',
    'Generate the final sorting plan. Respond with JSON:',
    '{',
    '  "type": "plan",',
    '  "plan": {',
    '    "categories": [{ "name": string, "description": string, "matchLabels": string[], "priority": number }],',
    '    "qualityThreshold": number,  // 0.5-0.9',
    '    "rejectCriteria": string[],',
    '    "sortWithinCategory": "quality_desc" | "chronological" | "quality_asc"',
    '  },',
    '  "explanation": string  // brief explanation of the final plan',
    '}',
  ].join('\n')

  const response = await callClaude(userMessage)
  return JSON.parse(response) as PlanResponse
}

async function callClaude(userMessage: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  // Extract JSON from the response (Claude sometimes wraps in markdown code blocks)
  let text = textBlock.text.trim()
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    text = jsonMatch[1].trim()
  }

  return text
}
