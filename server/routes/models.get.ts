import { POSSIBLE_AI_MODELS } from '~/lib/data/ai.models'

export default defineEventHandler(async () => {
  return POSSIBLE_AI_MODELS
})
