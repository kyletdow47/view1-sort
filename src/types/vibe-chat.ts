import type { VibeStyleParams } from '@/types/vibe-presets'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface VibeChatRequest {
  messages: ChatMessage[]
  projectId?: string
}

export interface VibeChatQuestionResponse {
  kind: 'question'
  question: string
  turn: number
  source: 'claude' | 'heuristic' | 'degraded'
}

export interface VibeChatFinalizeResponse {
  kind: 'finalize'
  presetName: string
  description: string
  summary: string
  styleParams: VibeStyleParams
  source: 'claude' | 'heuristic' | 'degraded'
}

export type VibeChatResponse = VibeChatQuestionResponse | VibeChatFinalizeResponse

export const MAX_TURNS = 5
export const AVG_TURNS = 3
export const MAX_MESSAGE_LENGTH = 1000
