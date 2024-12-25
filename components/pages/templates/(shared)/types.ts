import type { ReadTemplate, ReadTemplateCollection, ReadUserFile } from '~/lib/types/database.tables/schema'

export type FileTemplate = Omit<ReadTemplate & ReadUserFile, 'neptun_user_id'>
export type TemplateCollectionWithTemplates = Omit<
  ReadTemplateCollection,
  'neptun_user_id' | 'description'
> & {
  description: string
  templates: FileTemplate[]
}
