import type { User } from '#auth-utils'
import type { EventHandlerRequest, H3Event } from 'h3'
import type { ZodError } from 'zod'
import { z } from 'zod'
import { primaryIdSchema, programming_language, project_type } from '~/lib/types/database.tables/schema'
import {
  AllowedAiModelNamesEnum,
  AllowedAiModelPublishersEnum,
} from '~/lib/types/models/ai'
import {
  type ChatConversationKeys,
  type OrderByDirection,
  possibleOrderByColumns,
  possibleOrderByDirections,
} from '~/lib/types/models/chat'
import { emailSchema } from '~/lib/validation/user/email'

/* ROUTE PARAMETER SCHEMAs */
export const UserIdSchema = z.object({
  user_id: primaryIdSchema,
})

type UserIdType = z.infer<typeof UserIdSchema>

export const UserEmailSchema = z.object({
  email: emailSchema,
})

type UserEmailType = z.infer<typeof UserEmailSchema>

export const ChatIdSchema = z.object({
  user_id: primaryIdSchema,
  chat_id: primaryIdSchema,
})

type ChatIdType = z.infer<typeof ChatIdSchema>

export const InstallationIdSchema = z.object({
  user_id: primaryIdSchema,
  installation_id: primaryIdSchema,
})

type InstallationIdType = z.infer<typeof InstallationIdSchema>

export const ShareIdSchema = z.object({
  user_id: primaryIdSchema,
  chat_id: primaryIdSchema,
  share_id: primaryIdSchema,
})

type ShareIdType = z.infer<typeof ShareIdSchema>

export const ChatMessageIdSchema = z.object({
  user_id: primaryIdSchema,
  chat_id: primaryIdSchema,
  message_id: primaryIdSchema,
})

type ChatMessageIdType = z.infer<typeof ChatMessageIdSchema>

/**
 * **INFO**: Doesn't use the z.url() because it doesn't allow URLs in the format of encodeURIComponent
 */
export const UrlSchema = z.object({
  url: z.string().trim(),
})

type UrlType = z.infer<typeof UrlSchema>

export const ModelSchema = z.object({
  model_publisher: z.nativeEnum(AllowedAiModelPublishersEnum),
  model_name: z.nativeEnum(AllowedAiModelNamesEnum),
})

type ModelType = z.infer<typeof ModelSchema>

export const CollectionUuidSchema = z.object({
  user_id: primaryIdSchema,
  uuid: z.string().uuid(),
})

type CollectionUuidType = z.infer<typeof CollectionUuidSchema>

export const TemplateIdSchema = z.object({
  user_id: primaryIdSchema,
  uuid: z.string().uuid(),
  id: primaryIdSchema,
})

type TemplateIdType = z.infer<typeof TemplateIdSchema>

export const UuidSchema = z.object({
  uuid: z.string().uuid(),
})

type UuidType = z.infer<typeof UuidSchema>

export const ProjectIdSchema = z.object({
  user_id: primaryIdSchema,
  project_id: primaryIdSchema,
})

type ProjectIdType = z.infer<typeof ProjectIdSchema>

export const ResourceTypeEnumSchema = z.enum(['user-files', 'template-collections', 'github-installations', 'chat-conversations'])

export const ResourceTypeSchema = z.object({
  user_id: primaryIdSchema,
  project_id: primaryIdSchema,
  resource_type: ResourceTypeEnumSchema,
})

type ResourceTypeType = z.infer<typeof ResourceTypeSchema>

export const ResourceIdSchema = z.object({
  user_id: primaryIdSchema,
  project_id: primaryIdSchema,
  resource_type: ResourceTypeEnumSchema,
  resource_id: primaryIdSchema,
})

type ResourceIdType = z.infer<typeof ResourceIdSchema>

/* QUERY SCHEMAs */

/**
 * **NOTE**: can be -1, if none selected
 */
export const ChatIdQuerySchema = z.object({
  chat_id: z.number().int(),
  is_playground: z.boolean().optional(),
})

type ChatIdQueryType = z.infer<typeof ChatIdQuerySchema>

const OrderByQuerySchema = z.object({
  order_by: z
    .string()
    .refine(
      (value) => {
        const parts = value.split(',')
        return parts.every((part) => {
          const [column, direction] = part.split(':')
          return (
            possibleOrderByColumns.includes(column as ChatConversationKeys)
            && possibleOrderByDirections.includes(direction as OrderByDirection)
          )
        })
      },
      {
        message: 'order_by must be a comma-separated list of \'column:direction\' pairs',
      },
    )
    .optional(),
})

export type OrderByQueryType = z.infer<typeof OrderByQuerySchema>

export const IsSharedQuerySchema = z.object({
  is_shared: z.boolean().optional().or(z.null()),
})

type IsSharedQueryType = z.infer<typeof IsSharedQuerySchema>

export const CollectionNameQuerySchema = z.object({
  name: z.string().trim().min(1).optional().or(z.null()),
})

type CollectionNameQueryType = z.infer<typeof CollectionNameQuerySchema>

export const ProjectQuerySchema = z.object({
  project_type: z.enum(project_type.enumValues).optional().or(z.null()),
  programming_language: z.enum(programming_language.enumValues).optional().or(z.null()),
})

type ProjectQueryType = z.infer<typeof ProjectQuerySchema>

/* BODY SCHEMAs */

// Inside of schema.ts

/* VALIDATION FUNCTIONS */

/* EVENT HANDLER */

interface ValidationSuccess<T> {
  statusCode: 200
  statusMessage: string
  message: string
  data: T
}

interface ValidationError<T> {
  statusCode: 400 | 401
  statusMessage: string
  message: string
  data: ZodError<T> | null
}

type ValidationResult<S, E = S> = ValidationSuccess<S> | ValidationError<E>

async function validateParams<S, E = S>(
  event: H3Event<EventHandlerRequest>,
  parseFunction: () => Promise<{
    success: boolean
    data?: S
    error?: ZodError<E>
  }>,
  validationSuccessMessage: string,
  validationErrorMessage: string,
  logData?: any,
  unauthorizedCheck?: (user: User, data: S) => boolean,
  secondValidationStep?: (data: S) => {
    validationErrorMessage: string
    data: S | null
    success: boolean
  },
): Promise<ValidationResult<S, E>> {
  const maybeValidatedParams = await parseFunction()

  if (!maybeValidatedParams.success) {
    return {
      statusCode: 400,
      statusMessage: 'Bad Request.',
      message: validationErrorMessage,
      data: maybeValidatedParams.error || null,
    }
  }

  const {
    validationErrorMessage: secondValidationErrorMessage,
    data,
    success,
  } = secondValidationStep
      ? secondValidationStep(maybeValidatedParams.data!)
      : { success: true, data: null, validationErrorMessage: '' }
  if (secondValidationStep) {
    if (!success || !data) {
      return {
        statusCode: 400,
        statusMessage: 'Bad Request.',
        message: secondValidationErrorMessage,
        data: null,
      }
    }

    return {
      statusCode: 200,
      statusMessage: 'Successfully validated.',
      message: validationSuccessMessage,
      data,
    }
  }

  if (LOG_BACKEND) {
    console.info('event.context?.params', event.context?.params)
  }
  if (LOG_BACKEND) {
    console.info(
      'event.context.validated.params',
      event.context.validated.params,
    )
  }
  if (LOG_BACKEND) {
    console.info(
      'event.context.validated.query',
      event.context.validated.query,
    )
  }
  if (logData && LOG_BACKEND) {
    console.info(logData, maybeValidatedParams.data)
  }

  if (
    unauthorizedCheck
    && unauthorizedCheck(event.context.user, maybeValidatedParams.data!)
  ) {
    return {
      statusCode: 401,
      statusMessage: 'Unauthorized.',
      message: 'You do not have access to view the information.',
      data: null,
    }
  }

  return {
    statusCode: 200,
    statusMessage: 'Successfully validated.',
    message: validationSuccessMessage,
    data: maybeValidatedParams.data!,
  }
}

/* VALIDATE QUERY PARAMS */
/* VALIDATE QUERY PARAMS(chat_id, is_playground) */
export async function validateQueryChatId(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<ChatIdQueryType>> {
  return validateParams<ChatIdQueryType>(
    event,
    async () => {
      const result = await getValidatedQuery(event, (params) => {
        // @ts-expect-error
        const chat_id = Number(params?.chat_id)
        event.context.validated.query.chat_id = chat_id
        // @ts-expect-error
        const is_playground = Boolean(params?.is_playground)
        event.context.validated.query.is_playground = is_playground

        return ChatIdQuerySchema.safeParse({ chat_id, is_playground })
      })
      if (result.success) {
        return { success: true, data: { chat_id: result.data.chat_id, is_playground: result.data.is_playground } }
      } else {
        return result
      }
    },
    'Successfully validated queryParams(chat_id, is_playground).',
    'Invalid queryParams(chat_id, is_playground).',
    'queryParams(chat_id, is_playground):',
  )
}

export async function validateQueryIsShared(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<IsSharedQueryType>> {
  return validateParams<IsSharedQueryType>(
    event,
    async () => {
      const result = await getValidatedQuery(event, (params) => {
        // @ts-expect-error
        const is_shared = Boolean(params?.is_shared)
        event.context.validated.query.is_shared = is_shared

        return IsSharedQuerySchema.safeParse({ is_shared })
      })
      if (result.success) {
        return { success: true, data: { is_shared: result.data.is_shared } }
      } else {
        return result
      }
    },
    'Successfully validated queryParams(is_shared).',
    'Invalid queryParams(is_shared).',
    'queryParams(is_shared):',
  )
}

export async function validateQueryCollectionName(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<CollectionNameQueryType>> {
  return validateParams<CollectionNameQueryType>(
    event,
    async () => {
      const query = getQuery(event)
      const result = CollectionNameQuerySchema.safeParse({
        name: query.name,
      })

      if (!result.success) {
        return result
      }

      event.context.validated.query.name = result.data.name
      return { success: true, data: { name: result.data.name } }
    },
    `Successfully validated queryParams(name=<collection_name>).`,
    `Invalid queryParams(name=<collection_name>).`,
    'queryParams(name):',
  )
}

/* VALIDATE QUERY PARAMS(order_by) */
export async function validateQueryOrderBy(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<OrderByQueryType>> {
  const orderByColumnsString = possibleOrderByColumns.join(', ')
  const orderByDirectionsString = possibleOrderByDirections.join(', ')

  return validateParams<OrderByQueryType>(
    event,
    async () => {
      const result = await getValidatedQuery(event, (params) => {
        // @ts-expect-error
        const order_by = params?.order_by
        event.context.validated.query.order_by = order_by

        return OrderByQuerySchema.safeParse({ order_by })
      })
      if (result.success) {
        return { success: true, data: { order_by: result.data.order_by } }
      } else {
        return result
      }
    },
    `Successfully validated queryParams(order_by=<column(${orderByColumnsString}):direction(${orderByDirectionsString})>).`,
    `Invalid queryParams(order_by=<column(${orderByColumnsString}):direction(${orderByDirectionsString})>).`,
    'queryParams(order_by):',
  )
}

/* VALIDATE QUERY PARAMS(type, main_language) */
export async function validateQueryProject(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<ProjectQueryType>> {
  return validateParams<ProjectQueryType>(
    event,
    async () => {
      const result = await getValidatedQuery(event, (query) => {
        // @ts-expect-error
        const type = query.project_type
        event.context.validated.query.project_type = type
        // @ts-expect-error
        const main_language = query.programming_language
        event.context.validated.query.programming_language = main_language

        return ProjectQuerySchema.safeParse({
          project_type: type,
          programming_language: main_language,
        })
      })
      if (result.success) {
        return { success: true, data: { project_type: result.data.project_type, programming_language: result.data.programming_language } }
      } else {
        return result
      }
    },
    `Successfully validated queryParams(project_type=<${project_type.enumValues.join(', ')}>, programming_language=<${programming_language.enumValues.join(', ')}>).`,
    `Invalid queryParams(project_type=<${project_type.enumValues.join(', ')}>, programming_language=<${programming_language.enumValues.join(', ')}>).`,
    'queryParams(project_type, programming_language):',
  )
}

/* VALIDATE ROUTE PARAMS */
/* VALIDATE ROUTE PARAMS(url) */
export async function validateParamUrl(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<{ url: URL }, UrlType>> {
  const maybeValidatedParams = await getValidatedRouterParams(
    event,
    params => UrlSchema.safeParse(params),
  )

  if (!maybeValidatedParams.success) {
    return {
      statusCode: 400,
      statusMessage: 'Bad Request.',
      message: 'Invalid routeParams(url).',
      data: maybeValidatedParams.error,
    }
  }

  if (LOG_BACKEND) {
    console.info('url:', maybeValidatedParams.data.url)
  }
  const decodedUrl = decodeURIComponent(maybeValidatedParams.data.url)
  if (LOG_BACKEND) {
    console.info('decoded url:', decodedUrl)
  }

  try {
    const url = new URL(decodedUrl)

    return {
      statusCode: 200,
      statusMessage: 'Successfully validated.',
      message: 'Successfully validated routeParams(user_id).',
      data: {
        url,
      },
    }
  } catch {
    return {
      statusCode: 400,
      statusMessage: 'Bad Request.',
      message:
        'Invalid routeParams(url). URL is not conform to official URL format.',
      data: null,
    }
  }

  // TODO: improve typing, so that the short-form can be used:
  /* return validateParams<{ url: URL }, UrlType>(
    event,
    async () => await getValidatedRouterParams(event, UrlSchema.safeParse),
    'Successfully validated routeParams(url).',
    'Invalid routeParams(url).',
    "url:",
    undefined,
    (data) => {
      try {
        const url = new URL(decodeURIComponent(String(data.url)));
        return {
          success: true,
          validationErrorMessage: '',
          data: url,
        };
      } catch {
        return {
          success: false,
          validationErrorMessage: 'URL is not conform to official URL format.',
          data: null,
        };
      }
    }
  ); */
}

/* VALIDATE ROUTE PARAMS(user_id) */
export async function validateParamUserId(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<UserIdType>> {
  return validateParams<UserIdType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(event, (params) => {
        // @ts-expect-error
        const user_id = Number(params?.user_id) // => NaN if not a number, not present
        event.context.validated.params.user_id = user_id

        // check if user_id is a valid user_id
        return UserIdSchema.safeParse({ user_id })
      })
      if (result.success) {
        return { success: true, data: { user_id: result.data.user_id } }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(user_id).',
    'Invalid routeParams(user_id).',
    'queryParams(user_id):',
    (user, data) => user.id !== data.user_id, // check if user has access to user information (TODO: extend in the future, to allow multiple accounts connected to one account)
  )
}

/* VALIDATE ROUTE PARAMS(email) */
export async function validateParamEmail(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<UserEmailType>> {
  return validateParams<UserEmailType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(
        event,
        params => UserEmailSchema.safeParse(params),
      )

      event.context.validated.params.email = result?.data?.email || null

      if (result.success) {
        return {
          success: true,
          data: { email: result.data.email },
        }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(email).',
    'Invalid routeParams(email).',
    'queryParams(email):',
  )
}

/* VALIDATE ROUTE PARAMS(user_id, chat_id) */
export async function validateParamChatId(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<ChatIdType>> {
  return validateParams<ChatIdType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(event, (params) => {
        // @ts-expect-error
        const user_id = Number(params?.user_id) // => NaN if not a number, not present
        // @ts-expect-error
        const chat_id = Number(params?.chat_id)
        event.context.validated.params.user_id = user_id
        event.context.validated.params.chat_id = chat_id

        return ChatIdSchema.safeParse({ user_id, chat_id })
      })
      if (result.success) {
        return {
          success: true,
          data: { user_id: result.data.user_id, chat_id: result.data.chat_id },
        }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(user_id, chat_id).',
    `Invalid routeParams(user_id, chat_id). You (user_id=${event.context.validated.params.user_id}) do not have access to view the user information of routeParams(user_id=${event.context.validated.params.user_id}, chat_id=${event.context.validated.params.chat_id}).`,
    'queryParams(user_id, chat_id):',
    (user, data) => user.id !== data.user_id, // check if user has access to user information (TODO: extend in the future, to allow multiple accounts connected to one account)
  )
}

/* VALIDATE ROUTE PARAMS(user_id, installation_id) */
export async function validateParamInstallationId(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<InstallationIdType>> {
  return validateParams<InstallationIdType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(event, (params) => {
        // @ts-expect-error
        const user_id = Number(params?.user_id) // => NaN if not a number, not present
        // @ts-expect-error
        const installation_id = Number(params?.installation_id)
        event.context.validated.params.user_id = user_id
        event.context.validated.params.installation_id = installation_id

        return InstallationIdSchema.safeParse({ user_id, installation_id })
      })
      if (result.success) {
        return {
          success: true,
          data: {
            user_id: result.data.user_id,
            installation_id: result.data.installation_id,
          },
        }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(user_id, installation_id).',
    'Invalid routeParams(user_id, installation_id).',
    'queryParams(user_id, installation_id):',
    (user, data) => user.id !== data.user_id, // check if user has access to user information (TODO: extend in the future, to allow multiple accounts connected to one account)
  )
}

/* VALIDATE ROUTE PARAMS(user_id, chat_id, share_id) */
export async function validateParamShareId(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<ShareIdType>> {
  return validateParams<ShareIdType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(event, (params) => {
        // @ts-expect-error
        const user_id = Number(params?.user_id) // => NaN if not a number, not present
        // @ts-expect-error
        const chat_id = Number(params?.chat_id)
        // @ts-expect-error
        const share_id = Number(params?.share_id)
        event.context.validated.params.user_id = user_id
        event.context.validated.params.chat_id = chat_id
        event.context.validated.params.share_id = share_id

        return ShareIdSchema.safeParse({ user_id, chat_id, share_id })
      })
      if (result.success) {
        return {
          success: true,
          data: {
            user_id: result.data.user_id,
            chat_id: result.data.chat_id,
            share_id: result.data.share_id,
          },
        }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(user_id, chat_id, share_id).',
    `Invalid routeParams(user_id, chat_id, share_id). You (user_id=${event.context.validated.params.user_id}) do not have access to view the user information of routeParams(user_id=${event.context.validated.params.user_id}, chat_id=${event.context.validated.params.chat_id}, share_id=${event.context.validated.params.share_id}).`,
    'queryParams(user_id, chat_id, share_id):',
    (user, data) => user.id !== data.user_id, // check if user has access to user information (TODO: extend in the future, to allow multiple accounts connected to one account)
  )
}

/* VALIDATE ROUTE PARAMS(user_id, chat_id, message_id) */
export async function validateParamMessageId(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<ChatMessageIdType>> {
  return validateParams<ChatMessageIdType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(event, (params) => {
        // @ts-expect-error
        const user_id = Number(params?.user_id) // => NaN if not a number, not present
        // @ts-expect-error
        const chat_id = Number(params?.chat_id)
        // @ts-expect-error
        const message_id = Number(params?.message_id)
        event.context.validated.params.user_id = user_id
        event.context.validated.params.chat_id = chat_id
        event.context.validated.params.message_id = message_id

        return ChatMessageIdSchema.safeParse({ user_id, chat_id, message_id })
      })
      if (result.success) {
        return {
          success: true,
          data: {
            user_id: result.data.user_id,
            chat_id: result.data.chat_id,
            message_id: result.data.message_id,
          },
        }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(user_id, chat_id, message_id).',
    `Invalid routeParams(user_id, chat_id, message_id). You (user_id=${event.context.validated.params.user_id}) do not have access to view the user information of routeParams(user_id=${event.context.validated.params.user_id}, chat_id=${event.context.validated.params.chat_id}).`,
    'queryParams(user_id, chat_id, message_id):',
    (user, data) => user.id !== data.user_id, // check if user has access to user information (TODO: extend in the future, to allow multiple accounts connected to one account)
  )
}

/* VALIDATE ROUTE PARAMS(model_publisher, model_name) */
/**
 * User access validation has to be checked before this!!! (user_id is fetched from query params)
 */
export async function validateParamAiModelName(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<ModelType>> {
  return validateParams<ModelType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(event, (params) => {
        // @ts-expect-error
        const model_publisher = params?.model_publisher
        // @ts-expect-error
        const model_name = params?.model_name
        event.context.validated.params.model_publisher = model_publisher
        event.context.validated.params.model_name = model_name

        return ModelSchema.safeParse({ model_publisher, model_name })
      })
      if (result.success) {
        return {
          success: true,
          data: {
            model_publisher: result.data.model_publisher,
            model_name: result.data.model_name,
          },
        }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(model_publisher, model_name).',
    `Invalid routeParams(model_publisher, model_name).`,
    'queryParams(model_publisher, model_name):',
  )
}

/* VALIDATE ROUTE PARAMS(user_id, uuid) */
export async function validateParamCollectionUuid(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<CollectionUuidType>> {
  return validateParams<CollectionUuidType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(event, (params) => {
        // @ts-expect-error
        const user_id = Number(params?.user_id)
        // @ts-expect-error
        const uuid = params?.uuid

        event.context.validated.params.user_id = user_id
        event.context.validated.params.uuid = uuid

        return CollectionUuidSchema.safeParse({ user_id, uuid })
      })

      if (result.success) {
        return {
          success: true,
          data: {
            user_id: result.data.user_id,
            uuid: result.data.uuid,
          },
        }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(user_id, uuid).',
    `Invalid routeParams(user_id, uuid). The resource with uuid=${event.context.validated.params.uuid} does not exist or you do not have access to it.`,
    'queryParams(user_id, uuid):',
    (user, data) => user.id !== data.user_id, // check if user has access to user information (TODO: extend in the future, to allow multiple accounts connected to one account)
  )
}

/* VALIDATE ROUTE PARAMS(user_id, uuid, id) */
export async function validateParamTemplateId(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<TemplateIdType>> {
  return validateParams<TemplateIdType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(event, (params) => {
        // @ts-expect-error
        const user_id = Number(params?.user_id)
        // @ts-expect-error
        const id = Number(params?.id)
        // @ts-expect-error
        const uuid = params?.uuid

        event.context.validated.params.user_id = user_id
        event.context.validated.params.uuid = uuid
        event.context.validated.params.id = id

        return TemplateIdSchema.safeParse({ user_id, uuid, id })
      })

      if (result.success) {
        return {
          success: true,
          data: {
            user_id: result.data.user_id,
            uuid: result.data.uuid,
            id: result.data.id,
          },
        }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(user_id, uuid, id).',
    `Invalid routeParams(user_id, uuid, id). The resource with id=${event.context.validated.params.id} does not exist or you do not have access to it.`,
    'queryParams(user_id, uuid, id):',
    (user, data) => user.id !== data.user_id, // check if user has access to user information (TODO: extend in the future, to allow multiple accounts connected to one account)
  )
}

/* VALIDATE ROUTE PARAMS(uuid) */
export async function validateParamUuid(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<UuidType>> {
  return validateParams<UuidType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(
        event,
        params => UuidSchema.safeParse(params),
      )

      event.context.validated.params.uuid = result?.data?.uuid || null

      if (result.success) {
        return {
          success: true,
          data: { uuid: result.data.uuid },
        }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(uuid).',
    `Invalid routeParams(uuid). The resource with uuid=${event.context.validated.params.uuid} does not exist or you do not have access to it.`,
    'queryParams(uuid):',
  )
}

/* VALIDATE ROUTE PARAMS(user_id, project_id) */
export async function validateParamProjectId(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<ProjectIdType>> {
  return validateParams<ProjectIdType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(event, (params) => {
        // @ts-expect-error
        const user_id = Number(params?.user_id)
        // @ts-expect-error
        const project_id = Number(params?.project_id)

        event.context.validated.params.user_id = user_id
        event.context.validated.params.project_id = project_id

        return ProjectIdSchema.safeParse({ user_id, project_id })
      })

      if (result.success) {
        return {
          success: true,
          data: { 
            user_id: result.data.user_id,
            project_id: result.data.project_id 
          },
        }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(user_id, project_id).',
    `Invalid routeParams(user_id, project_id). The project with id=${event.context.validated.params.project_id} for user=${event.context.validated.params.user_id} does not exist or you do not have access to it.`,
    'routeParams(user_id, project_id):',
    (user, data) => user.id !== data.user_id, // check if user has access to project information
  )
}

/* VALIDATE ROUTE PARAMS(user_id, project_id, resource_type) */
export async function validateParamResourceType(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<ResourceTypeType>> {
  return validateParams<ResourceTypeType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(event, (params) => {
        // @ts-expect-error
        const user_id = Number(params?.user_id)
        // @ts-expect-error
        const project_id = Number(params?.project_id)
        // @ts-expect-error
        const resource_type = params?.resource_type

        event.context.validated.params.user_id = user_id
        event.context.validated.params.project_id = project_id
        event.context.validated.params.resource_type = resource_type

        return ResourceTypeSchema.safeParse({ 
          user_id, 
          project_id,
          resource_type,
        })
      })

      if (result.success) {
        return {
          success: true,
          data: { 
            user_id: result.data.user_id,
            project_id: result.data.project_id,
            resource_type: result.data.resource_type
          },
        }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(user_id, project_id, resource_type).',
    `Invalid routeParams(user_id, project_id, resource_type). The resource type=${event.context.validated.params.resource_type} for project=${event.context.validated.params.project_id} and user=${event.context.validated.params.user_id} does not exist or you do not have access to it.`,
    'routeParams(user_id, project_id, resource_type):',
    (user, data) => user.id !== data.user_id,
  )
}

/* VALIDATE ROUTE PARAMS(user_id, project_id, resource_type, resource_id) */
export async function validateParamResourceId(
  event: H3Event<EventHandlerRequest>,
): Promise<ValidationResult<ResourceIdType>> {
  return validateParams<ResourceIdType>(
    event,
    async () => {
      const result = await getValidatedRouterParams(event, (params) => {
        // @ts-expect-error
        const user_id = Number(params?.user_id)
        // @ts-expect-error
        const project_id = Number(params?.project_id)
        // @ts-expect-error
        const resource_type = params?.resource_type
        // @ts-expect-error
        const resource_id = Number(params?.resource_id)

        event.context.validated.params.user_id = user_id
        event.context.validated.params.project_id = project_id
        event.context.validated.params.resource_type = resource_type
        event.context.validated.params.resource_id = resource_id

        return ResourceIdSchema.safeParse({ 
          user_id, 
          project_id,
          resource_type,
          resource_id 
        })
      })

      if (result.success) {
        return {
          success: true,
          data: { 
            user_id: result.data.user_id,
            project_id: result.data.project_id,
            resource_type: result.data.resource_type,
            resource_id: result.data.resource_id
          },
        }
      } else {
        return result
      }
    },
    'Successfully validated routeParams(user_id, project_id, resource_type, resource_id).',
    `Invalid routeParams(user_id, project_id, resource_type, resource_id). The resource with id=${event.context.validated.params.resource_id} of type=${event.context.validated.params.resource_type} for project=${event.context.validated.params.project_id} and user=${event.context.validated.params.user_id} does not exist or you do not have access to it.`,
    'routeParams(user_id, project_id, resource_type, resource_id):',
    (user, data) => user.id !== data.user_id,
  )
}
