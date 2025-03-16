import type {
  ProjectPromptContext,
  ReadProject,
  ReadUser,
} from '../../../lib/types/database.tables/schema'
import { and, eq } from 'drizzle-orm'
import { neptun_user_project } from '../../../lib/types/database.tables/schema'
import { neptun_user_template } from '../../../lib/types/database.tables/schema'

export async function readProjectContext(
  user_id: ReadUser['id'],
  project_id: ReadProject['id'],
): Promise<ProjectPromptContext | null> {
  const result = await db.query.neptun_user_project.findFirst({
    where: and(
      eq(neptun_user_project.neptun_user_id, user_id),
      eq(neptun_user_project.id, project_id)
    ),
    with: {
      context_imports: {
        with: {
          context_files: {
            columns: {
              title: true,
              original_path: true,
              content: true,
              file_type: true,
              category: true,
              file_size: true,
              pdf_url: true,
              language: true,
              metadata: true,
              parent_path: true,
              depth: true,
            }
          }
        },
        columns: {
          source_type: true,
          source_path: true,
          source_ref: true,
          import_status: true,
          error_message: true,
          file_tree: true,
        }
      },
      template_collections: {
        with: {
          template_collection: {
            columns: {
              name: true,
              description: true,
              is_shared: true,
              share_uuid: true,
            }
          }
        }
      }
    },
    columns: {
      name: true,
      description: true,
      type: true,
      main_language: true,
    }
  })

  if (!result) {
    return null
  }

  async function readProjectTemplateCollectionTemplates(collection_id: number) {
    return await db.query.neptun_user_template.findMany({
      where: eq(neptun_user_template.template_collection_id, collection_id),
      with: {
        neptun_user_file: {
          columns: {
            title: true,
            text: true,
            language: true,
            extension: true,
          }
        }
      },
      columns: {
        description: true,
        file_name: true,
      }
    })
  }

  const collectionsWithTemplates = await Promise.all(
    result.template_collections.map(async (collection) => {
      const templates = await readProjectTemplateCollectionTemplates(collection.template_collection_id)
      return {
        ...collection.template_collection,
        templates
      }
    })
  )

  return {
    goal: `You are an AI assistant for the ${result.type} project "${result.name}". Your goal is to help the user with their ${result.main_language} project.`,
    returnFormat: 'Provide clear, concise, and helpful responses related to the project context using markdown syntax.',
    rules: [
      'Do not make assumptions about project requirements that are not specified in the context.',
      'If you are unsure about something, ask for clarification rather than guessing.',
    ],
    project: {
      name: result.name,
      description: result.description,
      type: result.type,
      main_language: result.main_language,
    },
    resources: {
      collections: collectionsWithTemplates,
      imports: result.context_imports,
    },
    currentDate: new Date().toISOString()
  }
}

export async function updateProjectContext(
  user_id: ReadUser['id'],
  project_id: ReadProject['id'],
  context?: ProjectPromptContext,
): Promise<ProjectPromptContext | null> {
  const projectContext = context || await readProjectContext(user_id, project_id)
  if (!projectContext) {
    return null
  }

  const updatedProject = await db
    .update(neptun_user_project)
    .set({ prompt_context: projectContext })
    .where(
      and(
        eq(neptun_user_project.id, project_id),
        eq(neptun_user_project.neptun_user_id, user_id),
      ),
    )
    .returning()
    .catch((error: Error) => {
      if (LOG_BACKEND) {
        console.error('Failed to update project context:', error)
      }
      return null
    })

  if (!updatedProject || updatedProject.length === 0) {
    return null
  }

  return updatedProject[0].prompt_context as ProjectPromptContext
}

export function contextToMarkdown(context: ProjectPromptContext | null): string {
  if (!context?.resources?.collections || !context.resources.imports) {
    return ''
  }

  const sections: string[] = []

  // Project Information
  sections.push('# Project Context\n')
  sections.push('## Goal')
  sections.push(context.goal)
  sections.push('')

  // Return Format
  sections.push('## Return Format')
  sections.push(context.returnFormat)
  sections.push('')

  // Rules
  sections.push('## Rules')
  context.rules.forEach(rule => {
    sections.push(`- ${rule}`)
  })
  sections.push('')

  // Project Details
  sections.push('## Project Details')
  sections.push(`- **Name:** ${context.project.name}`)
  sections.push(`- **Description:** ${context.project.description || ''}`)
  sections.push(`- **Type:** ${context.project.type}`)
  sections.push(`- **Main Language:** ${context.project.main_language}`)
  sections.push('')

  // Template Collections
  if (context.resources.collections.length > 0) {
    sections.push('## Template Collections')
    context.resources.collections.forEach(collection => {
      sections.push(`### Collection: ${collection.name}`)
      sections.push(`- **Description:** ${collection.description || ''}`)
      sections.push(`- **Shared:** ${collection.is_shared ? 'Yes' : 'No'}`)
      sections.push(`- **Share UUID:** ${collection.share_uuid}`)

      if (collection.templates?.length > 0) {
        sections.push('\n#### Templates')
        collection.templates.forEach(template => {
          sections.push(`##### ${template.file_name}`)
          sections.push(`- **Description:** ${template.description || ''}`)
          if (template.neptun_user_file) {
            sections.push(`- **Title:** ${template.neptun_user_file.title || ''}`)
            sections.push(`- **Language:** ${template.neptun_user_file.language}`)
            sections.push(`- **Extension:** ${template.neptun_user_file.extension}`)
            sections.push('\n**Content:**')
            sections.push('```' + template.neptun_user_file.language)
            sections.push(template.neptun_user_file.text)
            sections.push('```')
          }
        })
      }
      sections.push('')
    })
  }

  // Context Imports
  if (context.resources.imports.length > 0) {
    sections.push('## Context Imports')
    context.resources.imports.forEach(importItem => {
      sections.push(`### Import Source: ${importItem.source_type}`)
      sections.push(`- **Source Path:** ${importItem.source_path}`)
      sections.push(`- **Source Reference:** ${importItem.source_ref || ''}`)
      sections.push(`- **Status:** ${importItem.import_status}`)
      sections.push(`- **Error Message:** ${importItem.error_message || ''}`)
      
      if (Object.keys(importItem.file_tree || {}).length > 0) {
        sections.push('\n#### File Tree')
        sections.push('```json')
        sections.push(JSON.stringify(importItem.file_tree, null, 2))
        sections.push('```\n')
      }

      if (importItem.context_files?.length > 0) {
        sections.push('#### Context Files')
        importItem.context_files.forEach(file => {
          sections.push(`##### ${file.title}`)
          sections.push(`- **Original Path:** ${file.original_path}`)
          sections.push(`- **Type:** ${file.file_type}`)
          sections.push(`- **Category:** ${file.category || ''}`)
          sections.push(`- **Size:** ${file.file_size !== null ? `${file.file_size} bytes` : ''}`)
          sections.push(`- **PDF URL:** ${file.pdf_url || ''}`)
          sections.push(`- **Language:** ${file.language}`)
          sections.push(`- **Parent Path:** ${file.parent_path || ''}`)
          sections.push(`- **Depth:** ${file.depth !== null ? file.depth : ''}`)
          
          if (file.metadata) {
            sections.push('\n**Metadata:**')
            sections.push('```json')
            sections.push(JSON.stringify(file.metadata, null, 2))
            sections.push('```')
          }

          sections.push('\n**Content:**')
          sections.push('```' + file.language)
          sections.push(file.content)
          sections.push('```')
        })
      }
      sections.push('')
    })
  }

  // Current Date
  sections.push('---\n')
  sections.push(`*Last Updated: ${context.currentDate}*`)

  return sections.join('\n')
}
