import { POSSIBLE_AI_MODELS } from '~/lib/data/ai.models'

function convertConfigToJSON(config: typeof POSSIBLE_AI_MODELS) {
  return Object.entries(config).reduce((acc, [publisher, models]) => {
    acc[publisher] = Object.entries(models).reduce((modelAcc, [modelName, modelConfig]) => {
      const configOutput = modelConfig.configuration('')

      // Create the serialized config without the function
      const serializedConfig = {
        ...modelConfig,

        // Replace the configuration function with its output parameters
        configuration: {
          model: configOutput.model,
          parameters: configOutput.parameters,
        },
      }

      modelAcc[modelName] = serializedConfig
      return modelAcc
    }, {} as Record<string, any>)

    return acc
  }, {} as Record<string, any>)
}

export default defineEventHandler(async () => {
  return convertConfigToJSON(POSSIBLE_AI_MODELS)
})
