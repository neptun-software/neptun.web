import type { PossibleAiModels } from '../types/models/ai'

export const POSSIBLE_AI_MODELS: PossibleAiModels = {
  // Service not available anymore.
  /* OpenAssistant: {
    'oasst-sft-4-pythia-12b-epoch-3.5': {
      publisher: 'OpenAssistant',
      name: 'oasst-sft-4-pythia-12b-epoch-3.5',
      description: `<strong>OpenAssistant collected data from over 13'000 humans and released it to the public.</strong><br>
            Data, models, and code are publicly available.<br>
            (Apache-2.0 License)`,
      icon: 'bxs:dog',
      type: 'chat', // OpenAssistant
      configuration: (inputs: string) => {
        return {
          // https://huggingface.co/OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5
          model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
          inputs: inputs, // `<|prompter|>${prompt}<|endoftext|><|assistant|>`
          parameters: {
            max_new_tokens: 500,
            typical_p: 0.2, // higher means, more creative
            repetition_penalty: 1.1, // repetition is less likely because the model receives penalty
            truncate: 2046 - 500, // max_new_tokens of this model is 2046
            return_full_text: false,
          },
        };
      },
    },
  }, */
  'meta-llama': {
    'Meta-Llama-3-8B-Instruct': {
      publisher: 'meta-llama',
      name: 'Meta-Llama-3-8B-Instruct',
      description: `<strong>Meta Llama is a large language model trained by Meta.</strong><br>
            <strong>META LLAMA 3 COMMUNITY LICENSE AGREEMENT</strong>:<br>
            Meta Llama 3 can be used, reproduced, modified, and redistributed for free under a non-exclusive, worldwide, royalty-free license.<br>
            When redistributing, Meta must be credited, and the phrase "Built with Meta Llama 3" must be displayed.<br>
            Companies with over 700 million monthly active users must request a separate license from Meta.<br>
            Meta provides no warranties and is not liable for indirect damages.<br>
            The agreement is governed by California law, and Meta retains ownership of the original materials.<br>
            https://www.llama.com/llama3/license`,
      icon: 'bi:meta',
      type: 'instruct',
      configuration: (inputs: string) => {
        return {
          /* https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct */
          model: 'meta-llama/Meta-Llama-3-8B-Instruct',
          inputs /* <|begin_of_text|><|start_header_id|>${role}<|end_header_id|>${prompt}<|eot_id|> */,
          parameters: {
            max_new_tokens: 500,
            typical_p: 0.2, // higher means, more creative
            repetition_penalty: 1.1, // repetition is less likely because the model receives penalty
            truncate: 8000 - 500, // max_new_tokens of this model is 8000
            return_full_text: false,
          },
        }
      },
    },
  },
  // Service not available anymore.
  /* 'mistralai': {
    // mistralai/Mistral-7B-v0.3 is too large
    'Mistral-7B-Instruct-v0.1': {
      publisher: 'mistralai',
      name: 'Mistral-7B-Instruct-v0.1',
      description: `<strong>Frontier AI in your hands</strong><br>
            The open-weights models are highly efficient and available under a fully permissive Apache 2 license.<br>
            They are ideal for customization, such as fine-tuning, due to their portability, control, and fast performance.<br>
            (Apache-2.0 License)`,
      icon: 'game-icons:hummingbird',
      type: 'instruct', // Llama2
      configuration: (inputs: string) => {
        return {
          // https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1
          model: 'mistralai/Mistral-7B-Instruct-v0.1',
          inputs, // [INST]${prompt}[/INST]
          parameters: {
            max_new_tokens: 500,
            typical_p: 0.2, // higher means, more creative
            repetition_penalty: 1.1, // repetition is less likely because the model receives penalty
            truncate: 8000 - 500, // context length of this model is 7999
            return_full_text: false,
          },
        }
      },
    },
  }, */
} as const
