import {
  InsertProjectChatConversationSchema,
  InsertProjectGithubInstallationSchema,
  InsertProjectTemplateCollectionSchema,
  InsertProjectUserFileSchema,
} from '~/lib/types/database.tables/schema'
import { createResource } from '~/server/database/repositories/projectResources'
import { validateParamResourceType } from '~/server/utils/validate'

type ResourceType = 'user-files' | 'template-collections' | 'github-installations' | 'chat-conversations'

interface ResourceData {
  chat_conversation_id?: number
  github_installation_id?: number
  template_collection_id?: number
  user_file_id?: number
}

function getResourceId(data: ResourceData) {
  return data.chat_conversation_id ?? data.github_installation_id ?? data.template_collection_id ?? data.user_file_id
}

export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeResourceType = await validateParamResourceType(event)
  if (maybeResourceType.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeResourceType.statusCode,
        statusMessage: maybeResourceType.statusMessage,
        data: maybeResourceType.data,
      }),
    )
  }
  const { project_id, resource_type } = maybeResourceType.data

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    switch (resource_type) {
      case 'user-files':
        return InsertProjectUserFileSchema.safeParse(body)
      case 'template-collections':
        return InsertProjectTemplateCollectionSchema.safeParse(body)
      case 'github-installations':
        return InsertProjectGithubInstallationSchema.safeParse(body)
      case 'chat-conversations':
        return InsertProjectChatConversationSchema.safeParse(body)
      default:
        throw new Error(`Invalid resource type: ${resource_type as ResourceType}`)
    }
  })
  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: `Invalid body for resource type: ${resource_type as ResourceType}`,
        data: body.error,
      }),
    )
  }

  const resource_id = getResourceId(body.data)

  if (!resource_id) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: `Invalid body for resource type: ${resource_type as ResourceType}`,
        data: body.error,
      }),
    )
  }

  /* CREATE RESOURCE */
  try {
    const resource = await createResource(project_id, resource_type, resource_id)

    if (!resource) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error. Failed to create resource.',
        }),
      )
    }

    return resource
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error.',
        message: 'Failed to create resource.',
        data: error,
      }),
    )
  }
})
