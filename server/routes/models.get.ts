import { POSSIBLE_AI_MODELS } from '~/lib/data/ai.models'

export default defineEventHandler(async () => {
  return {
    models: POSSIBLE_AI_MODELS
  }
})
