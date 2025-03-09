import type { InferSelectModel } from 'drizzle-orm'
import type {
  neptun_context_import,
  ProjectPromptContext,
  ReadContextFile,
  ReadProject,
  ReadUser,
  ReadUserFile,
} from '../../../lib/types/database.tables/schema'
import { and, eq } from 'drizzle-orm'
import { neptun_user_project } from '../../../lib/types/database.tables/schema'
import { readAllProjectTemplateCollections } from './projectTemplateCollections'
import { readAllProjectUserFiles } from './projectUserFiles'
import { readProject } from './userProjects'

type ProjectWithResources = InferSelectModel<typeof neptun_user_project> & {
  user_files: { user_file: ReadUserFile }[]
  template_collections: {
    template_collection: {
      templates: {
        id: number
        file_name: string
        description: string | null
        neptun_user_file: { text: string } | null
      }[]
    }
  }[]
  context_imports: (InferSelectModel<typeof neptun_context_import> & {
    context_files: ReadContextFile[]
  })[]
}

function createProjectContext(
  project: ReadProject,
  files: ReadUserFile[] = [],
  templates: { id: number, name: string, description: string | null, content?: string }[] = [],
  contextImports: ProjectWithResources['context_imports'] = [],
): ProjectPromptContext {
  const resources = {
    files: [
      ...files.map(file => ({
        id: file.id,
        title: file.title ?? 'Untitled',
        language: file.language,
        extension: file.extension,
        content: file.text,
        summary: '',
      })),
      ...contextImports.flatMap(imp => imp.context_files.map(file => ({
        id: file.id,
        title: file.title,
        language: file.language,
        extension: file.file_type.split('.').pop() || '',
        content: file.content,
        summary: '', // TODO
        original_path: file.original_path,
        parent_path: file.parent_path,
        depth: file.depth,
        import_id: file.import_id,
      }))),
    ],
    templates: templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description ?? undefined,
      content: template.content,
    })),
    imports: contextImports.map(imp => ({
      id: imp.id,
      source_type: imp.source_type,
      source_path: imp.source_path,
      source_ref: imp.source_ref,
      import_status: imp.import_status,
      file_tree: imp.file_tree,
    })),
  }

  return {
    identity: {
      name: `${project.name} Assistant`,
      creator: 'Neptun AI', // TODO
    },
    goal: `You are an AI assistant for the ${project.type} project "${project.name}". Your goal is to help the user with their ${project.main_language} project.`,
    returnFormat: 'Provide clear, concise, and helpful responses related to the project context using markdown syntax.',
    rules: [
      'Do not make assumptions about project requirements that are not specified in the context.',
      'If you are unsure about something, ask for clarification rather than guessing.',
    ],
    project: {
      name: project.name,
      description: project.description ?? undefined,
      type: project.type,
      main_language: project.main_language,
      created_at: project.created_at?.toISOString() ?? new Date().toISOString(),
      updated_at: project.updated_at?.toISOString() ?? new Date().toISOString(),
    },
    resources,
    currentDate: new Date().toISOString(),
  }
}

export async function generateProjectContext(
  user_id: ReadUser['id'],
  project_id: ReadProject['id'],
) {
  const project = await readProject(user_id, project_id)
  if (!project) {
    throw new Error('Project not found')
  }

  const files = await readAllProjectUserFiles(project_id)
  const templates = await readAllProjectTemplateCollections(project_id)

  return createProjectContext(project, files || [], templates || [])
}

export async function readProjectContext(
  user_id: ReadUser['id'],
  project_id: ReadProject['id'],
): Promise<ProjectPromptContext | null> {
  const result = await db.query.neptun_user_project.findFirst({
    where: and(
      eq(neptun_user_project.id, project_id),
      eq(neptun_user_project.neptun_user_id, user_id),
    ),
    with: {
      user_files: {
        with: {
          user_file: true,
        },
      },
      template_collections: {
        with: {
          template_collection: {
            with: {
              templates: {
                with: {
                  neptun_user_file: true,
                },
              },
            },
          },
        },
      },
      context_imports: {
        with: {
          context_files: true,
        },
      },
    },
  })

  if (!result) {
    return null
  }

  const files = result.user_files.map(puf => puf.user_file)
  const templates = result.template_collections
    .flatMap(ptc => ptc.template_collection.templates
      .map(template => ({
        id: template.id,
        name: template.file_name,
        description: template.description,
        content: template.neptun_user_file?.text,
      })))
  const contextImports = result.context_imports.map(imp => ({
    id: imp.id,
    created_at: imp.created_at,
    updated_at: imp.updated_at,
    neptun_user_id: imp.neptun_user_id,
    project_id: imp.project_id,
    source_type: imp.source_type,
    source_path: imp.source_path,
    source_ref: imp.source_ref,
    import_status: imp.import_status,
    error_message: imp.error_message,
    file_tree: imp.file_tree,
    context_files: imp.context_files,
  }))

  return createProjectContext(
    result,
    files,
    templates,
    contextImports,
  )
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
  if (!context) {
    return ''
  }

  const sections: string[] = []

  // Identity Section
  sections.push(`# ${context.identity.name}`)
  sections.push(`Created by ${context.identity.creator}`)
  sections.push('')

  // Goal Section
  sections.push('## Goal')
  sections.push(context.goal)
  sections.push('')

  // Project Details Section
  sections.push('## Project Details')
  sections.push(`- **Name:** ${context.project.name}`)
  if (context.project.description) {
    sections.push(`- **Description:** ${context.project.description}`)
  }
  sections.push(`- **Type:** ${context.project.type}`)
  sections.push(`- **Main Language:** ${context.project.main_language}`)
  sections.push(`- **Created:** ${new Date(context.project.created_at).toLocaleString()}`)
  sections.push(`- **Last Updated:** ${new Date(context.project.updated_at).toLocaleString()}`)
  sections.push('')

  // Rules Section
  sections.push('## Rules')
  context.rules.forEach((rule) => {
    sections.push(`- ${rule}`)
  })
  sections.push('')

  // Resources Section
  sections.push('## Resources')

  // Imports
  const imports = context.resources.imports || []
  if (imports.length > 0) {
    sections.push('### Imports')
    imports.forEach((imp) => {
      sections.push(`#### ${imp.source_type} Import`)
      sections.push(`- **Path:** ${imp.source_path}`)
      if (imp.source_ref) {
        sections.push(`- **Reference:** ${imp.source_ref}`)
      }
      sections.push(`- **Status:** ${imp.import_status}`)
      if (imp.file_tree) {
        sections.push('- **File Tree:**')
        sections.push('```json')
        sections.push(JSON.stringify(imp.file_tree, null, 2))
        sections.push('```')
      }
      sections.push('')
    })
  }

  // Files
  const files = context.resources.files || []
  if (files.length > 0) {
    sections.push('### Files')
    files.forEach((file) => {
      sections.push(`#### ${file.title} (${file.language}, .${file.extension})`)
      if (file.original_path) {
        sections.push(`Original Path: ${file.original_path}`)
      }
      if (file.parent_path) {
        sections.push(`Parent Path: ${file.parent_path}`)
      }
      if (file.depth !== undefined) {
        sections.push(`Depth: ${file.depth}`)
      }
      if (file.import_id !== undefined) {
        sections.push(`Import ID: ${file.import_id}`)
      }
      if (file.summary) {
        sections.push(file.summary)
      }
      sections.push('')
    })
  }

  // Templates
  const templates = context.resources.templates || []
  if (templates.length > 0) {
    sections.push('### Templates')
    templates.forEach((template) => {
      sections.push(`#### ${template.name}`)
      if (template.description) {
        sections.push(template.description)
      }
      sections.push('')
    })
  }

  // Return Format
  sections.push('## Response Format')
  sections.push(context.returnFormat)
  sections.push('')

  // Current Date
  sections.push(`*Generated on ${new Date(context.currentDate).toLocaleString()}*`)

  return sections.join('\n')
}
