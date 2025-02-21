<script lang="ts" setup>
import type { ColumnDef, ColumnFiltersState, SortingState } from '@tanstack/vue-table'
import type { GetGithubAppInstallationRepositoryEssentials as Import } from '~/lib/types/database.tables/schema'
import { NuxtLink } from '#components'
import { CaretSortIcon } from '@radix-icons/vue'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { Button } from '~/components/shadcn/button'
import { ScrollArea, ScrollBar } from '~/components/shadcn/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/shadcn/table'
import { valueUpdater } from '~/lib/utils'

const props = defineProps<{
  imports: Import[]
}>()

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])

const columns: ColumnDef<Import>[] = [
  {
    accessorKey: 'github_repository_name',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Repository Name', h(CaretSortIcon, { class: 'ml-2 h-4 w-4' })],
      )
    },
    cell: ({ row }) => {
      const repositoryName = row.getValue('github_repository_name') as string
      const repositoryUrl = props.imports[row.index].github_repository_url

      return h(
        NuxtLink,
        {
          to: repositoryUrl || '#',
          target: repositoryUrl ? '_blank' : undefined,
          external: true,
        },
        () => repositoryName || 'N/A',
      )
    },
  },
  {
    accessorKey: 'github_repository_description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('github_repository_description') || 'N/A'
      return h('div', { class: 'truncate-description' }, description as any)
    },
  },
  {
    accessorKey: 'github_repository_size',
    header: 'Size (KB)',
    cell: ({ row }) => row.getValue('github_repository_size'),
  },
  {
    accessorKey: 'github_repository_language',
    header: 'Language',
    cell: ({ row }) => row.getValue('github_repository_language') || 'Unknown',
  },
  {
    accessorKey: 'github_repository_license',
    header: 'License',
    cell: ({ row }) => row.getValue('github_repository_license') || 'None',
  },
  {
    accessorKey: 'github_repository_website_url',
    header: 'Website URL',
    cell: ({ row }) => {
      const websiteUrl = row.getValue('github_repository_website_url') as string
      const cleanedUrl = websiteUrl ? websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'N/A'
      return h(
        NuxtLink,
        {
          to: websiteUrl || '#',
          target: websiteUrl ? '_blank' : undefined,
          external: true,
        },
        () => cleanedUrl || 'N/A',
      )
    },
  },
  {
    accessorKey: 'github_repository_is_private',
    header: 'Private',
    cell: ({ row }) =>
      row.getValue('github_repository_is_private') ? 'Yes' : 'No',
  },
  {
    accessorKey: 'github_repository_is_fork',
    header: 'Fork',
    cell: ({ row }) =>
      row.getValue('github_repository_is_fork') ? 'Yes' : 'No',
  },
  {
    accessorKey: 'github_repository_is_template',
    header: 'Template',
    cell: ({ row }) =>
      row.getValue('github_repository_is_template') ? 'Yes' : 'No',
  },
  {
    accessorKey: 'github_repository_is_archived',
    header: 'Archived',
    cell: ({ row }) =>
      row.getValue('github_repository_is_archived') ? 'Yes' : 'No',
  },
]

const table = useVueTable({
  get data() {
    return (props.imports as Import[]) || []
  },
  columns,
  getCoreRowModel: getCoreRowModel(),

  getSortedRowModel: getSortedRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),

  onColumnFiltersChange: (updaterOrValue) => {
    return valueUpdater(updaterOrValue, columnFilters)
  },
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    },
  },
})

const selectedInstallationId = useSelectedInstallation()
</script>

<template>
  <div>
    <div class="rounded-md border">
      <div class="flex gap-2 items-center p-4">
        <ShadcnButton @click="() => (selectedInstallationId = -1)">
          Back To Overview
        </ShadcnButton>
        <ShadcnInput
          class="max-w-sm"
          placeholder="Filter by repository name..."
          :model-value="
            table
              .getColumn('github_repository_name')
              ?.getFilterValue() as string
          "
          @update:model-value="
            (value) => {
              const sanitizedValue = value.toString().replace(/\s+/g, '');
              table
                .getColumn('github_repository_name')
                ?.setFilterValue(sanitizedValue);
            }
          "
        />
      </div>

      <ScrollArea class="w-full whitespace-nowrap">
        <div class="w-max min-w-full">
          <Table>
            <TableHeader>
              <TableRow
                v-for="headerGroup in table.getHeaderGroups()"
                :key="headerGroup.id"
              >
                <TableHead v-for="header in headerGroup.headers" :key="header.id">
                  <component
                    :is="header.isPlaceholder ? 'span' : 'div'"
                    :class="{
                      'cursor-pointer select-none': header.column.getCanSort(),
                    }"
                    @click="header.column.getToggleSortingHandler()"
                  >
                    <FlexRender
                      :render="header.column.columnDef.header"
                      :props="header.getContext()"
                    />
                  </component>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="table.getRowModel().rows?.length > 0">
                <TableRow
                  v-for="row in table.getRowModel().rows"
                  :key="row.id"
                  :data-state="row.getIsSelected() ? 'selected' : undefined"
                >
                  <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                    <FlexRender
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </TableCell>
                </TableRow>
              </template>
              <TableRow v-else>
                <TableCell :colspan="columns.length" class="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" :always="true" />
      </ScrollArea>
    </div>
  </div>
</template>

<style scoped>
.truncate-description {
  display: inline-block;
  max-width: 20ch; /* Limit to 20 characters */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
