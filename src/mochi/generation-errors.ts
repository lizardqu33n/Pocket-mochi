import { temporaryFailure as existingTemporaryFailure } from './scheduling.js'

/** Mochi-only diagnostics: fixed labels, never upstream messages, causes or content. */
export const GENERATION_ERROR_MESSAGES = {
  provider: 'The AI connection reported an error. Check the connection or provider settings.',
  connection: 'The AI connection is missing, unavailable or not authorized for your account. Choose a connection in Room settings.',
  empty_output: 'The AI returned an empty response.',
  malformed_json: "The AI returned a response that Mochi couldn't read as valid message JSON.",
  suspected_plain_text: "The AI appears to have returned ordinary text instead of Mochi's expected structured message format.",
  output_limit: 'The AI response reached its output limit before a complete message could be received.',
  invalid_schema: "The AI returned JSON that doesn't match Mochi's message format or limits.",
  ineligible_speaker: "The AI returned a message from a character who isn't eligible to respond in this conversation.",
} as const
export type GenerationErrorCategory = keyof typeof GENERATION_ERROR_MESSAGES

export class MochiGenerationError extends Error {
  constructor(readonly category: GenerationErrorCategory, readonly temporary = false) {
    super(GENERATION_ERROR_MESSAGES[category])
    this.name = 'MochiGenerationError'
  }
}

/** Authorization uses numeric status; the legacy scheduler policy is reduced to a boolean. */
export function providerFailure(error: unknown): MochiGenerationError {
  const e = error as { status?: unknown; statusCode?: unknown; response?: { status?: unknown } } | null
  let unauthorized = false
  let temporary = false
  try {
    unauthorized = [e?.status, e?.statusCode, e?.response?.status].some(status => status === 401 || status === 403)
    // Preserve the existing scheduler decision as an ephemeral boolean, never its input.
    temporary = !unauthorized && existingTemporaryFailure(error)
  }
  catch { /* Even an exceptional property accessor must not escape this boundary. */ }
  return new MochiGenerationError(unauthorized ? 'connection' : 'provider', temporary)
}

export function publicGenerationFailure(error: unknown) {
  if (error instanceof MochiGenerationError && Object.hasOwn(GENERATION_ERROR_MESSAGES, error.category)) {
    const category = error.category
    return {
      message: GENERATION_ERROR_MESSAGES[category],
      diagnostic: {
        category,
        ...(category === 'suspected_plain_text' ? { heuristic: true as const } : {}),
        ...(category === 'output_limit' ? { finishReason: 'length' as const } : {}),
      },
    }
  }
  return { message: "Mochi couldn't complete the reply. Your saved messages are preserved." }
}
