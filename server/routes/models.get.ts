import { POSSIBLE_AI_MODELS } from '~/lib/data/ai.models'
import { allowedModelsConst } from '~/lib/types/models/ai'

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

/**
 * Automatically generates API endpoints for the supported providers
 * @returns An object with supported endpoints and their corresponding model paths
 */
function generateAllEndpoints(): Record<string, string[]> {
  const endpoints: Record<string, string[]> = {
    huggingface: [],
    cloudflare: [],
    openrouter: [],
    ollama: []
  };
  
  allowedModelsConst.forEach(model => {
    const [provider, modelName] = model.split('/');
    
    let endpoint: string;
    
    switch (provider) {
      case 'cloudflare':
        endpoint = 'cloudflare';
        break;
      case 'openrouter':
        endpoint = 'openrouter';
        break;
      case 'ollama':
        endpoint = 'ollama';
        break;
      default:
        endpoint = 'huggingface';
        break;
    }
    
    endpoints[endpoint].push(`/api/ai/${endpoint}/${modelName}/chat`);
  });
  
  return endpoints;
}

export default defineEventHandler(async () => {
  return {
    configurations: convertConfigToJSON(POSSIBLE_AI_MODELS),
    models: allowedModelsConst,
    endpoints: generateAllEndpoints()
  }
})
