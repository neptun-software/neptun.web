import type { ReadTemplate, ReadTemplateCollection, ReadUserFile } from '~/lib/types/database.tables/schema'

export type FileTemplate = Omit<ReadTemplate & ReadUserFile, 'neptun_user_id'>
export type TemplateCollectionWithTemplates = Omit<
  ReadTemplateCollection,
  'neptun_user_id' | 'description'
> & {
  description: string
  templates: FileTemplate[]
}
export type TemplateCollectionWithTemplatesWithoutIds = Omit<TemplateCollectionWithTemplates, 'templates'> & {
  templates: Omit<
    FileTemplate,
    'template_collection_id' | 'user_file_id'>[]
}

export type ImportedTemplateData = Omit<
  TemplateCollectionWithTemplatesWithoutIds,
  'id' | 'created_at' | 'updated_at' | 'share_uuid' | 'is_shared' | 'description' | 'templates'
> & {
  templates: Array<Omit<
    TemplateCollectionWithTemplatesWithoutIds['templates'][number],
    'id' | 'created_at' | 'updated_at' | 'description'
  >>
}
