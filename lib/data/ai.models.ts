import type { PossibleAiModels } from '../types/models/ai'

export const POSSIBLE_AI_MODELS: PossibleAiModels = {
  'qwen': {
    'Qwen2.5-72B-Instruct': {
      publisher: 'qwen',
      name: 'Qwen2.5-72B-Instruct',
      description: `<strong>Qwen2.5 is a state-of-the-art large language model from Alibaba Cloud</strong><br>
            72.7B parameters with 80 layers and 64 attention heads for queries.<br>
            Excels at instruction following, long text generation, and structured data handling.<br>
            (Qwen License)`,
      icon: 'simple-icons:alibabadotcom',
      type: 'instruct',
      configuration: (inputs: string) => {
        return {
          // https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
          model: 'Qwen/Qwen2.5-72B-Instruct',
          inputs,
          parameters: {
            max_new_tokens: 512,
            typical_p: 0.2,
            repetition_penalty: 1.1,
            truncate: 32767 - 500, // 131072 - 512, // Full context length of 131,072 tokens
            return_full_text: false,
          },
        }
      },
    },
    'Qwen2.5-Coder-32B-Instruct': {
      publisher: 'qwen',
      name: 'Qwen2.5-Coder-32B-Instruct',
      description: `<strong>Qwen2.5-Coder is a state-of-the-art code-specific model from Alibaba Cloud</strong><br>
            Built on Qwen2.5 with 5.5 trillion tokens of code-focused training data.<br>
            Excels in code generation, reasoning, and fixing with 131K token context support.<br>
            (Apache-2.0 License)`,
      icon: 'simple-icons:alibabadotcom',
      type: 'instruct',
      configuration: (inputs: string) => {
        return {
          // https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
          model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
          inputs,
          parameters: {
            max_new_tokens: 512,
            typical_p: 0.2,
            repetition_penalty: 1.1,
            truncate: 15999 - 500, // 131072 - 500, // Full context length of 131K tokens
            return_full_text: false,
          },
        }
      },
    },
  },
  'deepseek-ai': {
    'DeepSeek-R1-Distill-Qwen-32B': {
      publisher: 'deepseek-ai',
      name: 'DeepSeek-R1-Distill-Qwen-32B',
      description: `SLOWEST MODEL! (high demand)<br><strong>DeepSeek R1 Distill is a powerful model distilled from DeepSeek-R1</strong><br>
            Excels at math, code, and reasoning tasks with performance close to OpenAI o1-mini.<br>
            Based on Qwen2.5 with enhanced reasoning capabilities through distillation.<br>
            (MIT License)`,
      icon: 'game-icons:angler-fish',
      type: 'instruct',
      configuration: (inputs: string) => {
        return {
          // https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
          model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
          inputs,
          parameters: {
            max_new_tokens: 512,
            typical_p: 0.2,
            repetition_penalty: 1.1,
            temperature: 0.6, // Recommended temperature from model card
            truncate: 12999 - 500, // 128000 - 512, // Context length of 128K tokens
            return_full_text: false,
          },
        }
      },
    },
  },
  'mistralai': {
    'Mistral-Nemo-Instruct-2407': {
      publisher: 'mistralai',
      name: 'Mistral-Nemo-Instruct-2407',
      description: `<strong>Mistral Nemo is a powerful model jointly trained by Mistral AI and NVIDIA</strong><br>
            40-layer transformer with 5,120 hidden dimensions and 32 attention heads.<br>
            Excels at multilingual tasks with strong performance across 9 languages.<br>
            (Apache-2.0 License)`,
      icon: 'game-icons:hummingbird',
      type: 'instruct',
      configuration: (inputs: string) => {
        return {
          // https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
          model: 'mistralai/Mistral-Nemo-Instruct-2407',
          inputs,
          parameters: {
            max_new_tokens: 500,
            typical_p: 0.2,
            repetition_penalty: 1.1,
            temperature: 0.35, // Recommended lower temperature for this model
            truncate: 128000 - 500, // Context length of 128K tokens
            return_full_text: false,
          },
        }
      },
    },
    'Mistral-7B-Instruct-v0.3': {
      publisher: 'mistralai',
      name: 'Mistral-7B-Instruct-v0.3',
      description: `<strong>Latest version of Mistral's 7B instruction model with enhanced capabilities</strong><br>
            Extended 32K vocabulary, supports function calling, and uses v3 Tokenizer.<br>
            Highly efficient open-weights model with strong instruction following.<br>
            (Apache-2.0 License)`,
      icon: 'game-icons:hummingbird',
      type: 'instruct',
      configuration: (inputs: string) => {
        return {
          // https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
          model: 'mistralai/Mistral-7B-Instruct-v0.3',
          inputs,
          parameters: {
            max_new_tokens: 500,
            typical_p: 0.2,
            repetition_penalty: 1.1,
            truncate: 32768 - 500, // Extended vocabulary size
            return_full_text: false,
          },
        }
      },
    },
  },
  'google': {
    'gemma-2-27b-it': {
      publisher: 'google',
      name: 'gemma-2-27b-it',
      description: `<strong>Gemma is a family of lightweight, state-of-the-art open models from Google</strong><br>
            Built from the same research and technology used to create the Gemini models.<br>
            Well-suited for text generation tasks including question answering, summarization, and reasoning.<br>
            (Apache-2.0 License)`,
      icon: 'simple-icons:google',
      type: 'instruct',
      configuration: (inputs: string) => {
        return {
          // https://huggingface.co/google/gemma-2-27b-it
          model: 'google/gemma-2-27b-it',
          inputs,
          parameters: {
            max_new_tokens: 500,
            typical_p: 0.2,
            repetition_penalty: 1.1,
            truncate: 8192 - 500, // Context length of 8K tokens
            return_full_text: false,
          },
        }
      },
    },
  },
  'microsoft': {
    'Phi-3-mini-4k-instruct': {
      publisher: 'microsoft',
      name: 'Phi-3-mini-4k-instruct',
      description: `<strong>Phi-3 Mini is a 3.8B parameter, lightweight, state-of-the-art open model from Microsoft</strong><br>
            Trained with high-quality datasets focused on reasoning and instruction following.<br>
            Excellent performance for math, coding, and logical reasoning tasks.<br>
            (MIT License)`,
      icon: 'simple-icons:microsoft',
      type: 'instruct',
      configuration: (inputs: string) => {
        return {
          // https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
          model: 'microsoft/Phi-3-mini-4k-instruct',
          inputs,
          parameters: {
            max_new_tokens: 500,
            typical_p: 0.2,
            repetition_penalty: 1.1,
            truncate: 4096 - 500, // Context length of 4K tokens
            return_full_text: false,
          },
        }
      },
    },
  },
} as const

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
/* 'meta-llama': {
  // Model requires a Pro subscription; check out hf.co/pricing to learn more. Make sure to include your HF token in your query.
  'Llama-3.3-70B-Instruct': {
    publisher: 'meta-llama',
    name: 'Llama-3.3-70B-Instruct',
    description: `<strong>Meta Llama 3.3 is a state-of-the-art large language model trained by Meta</strong><br>
          Built from 15T+ tokens of training data with enhanced multilingual capabilities.<br>
          Supports English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai.<br>
          (Llama 3.3 Community License)`,
    icon: 'bi:meta',
    type: 'instruct',
    configuration: (inputs: string) => {
      return {
        // https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        inputs,
        parameters: {
          max_new_tokens: 500,
          typical_p: 0.2,
          repetition_penalty: 1.1,
          truncate: 128000 - 500, // Context length of 128K tokens
          return_full_text: false,
        },
      }
    },
  },
  // Errors
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
        // https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
        model: 'meta-llama/Meta-Llama-3-8B-Instruct',
        inputs,
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
}, */
