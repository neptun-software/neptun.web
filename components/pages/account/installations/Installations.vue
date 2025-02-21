<script lang="ts" setup>
import type { ColumnDef, ColumnFiltersState, SortingState } from '@tanstack/vue-table'
import type { GetGithubAppInstallationRepositoryEssentials as Import } from '~/lib/types/database.tables/schema'
import { NuxtImg } from '#components'
import { CaretSortIcon } from '@radix-icons/vue'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { toast } from 'vue-sonner'
import InfoBlock from '~/components/loaders/dynamic/InfoBlock.vue'
import Button from '~/components/shadcn/button/Button.vue'
import { Input } from '~/components/shadcn/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/shadcn/table'
import { valueUpdater } from '~/lib/utils'

const { user } = useUserSession()

const { data, error } = await useFetch(
  `/api/users/${user.value?.id ?? -1}/installations`,
)

/* const data = ref<Installation[]>([
  {
    id: 1,
    github_account_name: 'Jonas',
    github_account_type: 'User',
    github_account_avatar_url:
      'https://avatars.githubusercontent.com/u/121523551?v=4',
    created_at: new Date().toDateString(),
    updated_at: new Date().toDateString(),
  },
  {
    id: 2,
    github_account_name: 'Stevan',
    github_account_type: 'User',
    github_account_avatar_url:
      'https://avatars.githubusercontent.com/u/91951603?v=4',
    created_at: new Date().toDateString(),
    updated_at: new Date().toDateString(),
  },
]); */

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])

interface Installation {
  id: number
  github_account_name: string
  github_account_type: string
  github_account_avatar_url: string
  created_at: string
  updated_at: string
}

const columns: ColumnDef<Installation>[] = [
  {
    accessorKey: 'github_account_avatar_url',
    header: '',
    cell: ({ row }) =>
      h(NuxtImg, {
        src: row.original.github_account_avatar_url,
        nonce: useSsrSaveId(),
        alt: 'Avatar',
        class: 'rounded-full max-h-10 min-w-10',
      }),
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'github_account_name',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Account Name', h(CaretSortIcon, { class: 'ml-2 h-4 w-4' })],
      )
    },
    cell: ({ row }) =>
      h('div', { class: 'lowercase' }, row.getValue('github_account_name')),
  },
  {
    accessorKey: 'github_account_type',
    header: 'Account Type (User or Organization)',
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated At',
    cell: ({ row }) => new Date(row.original.updated_at).toLocaleString(),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: 'destructive',
          size: 'sm',
          onClick: () => {
            toast.error(
              `Coming Soon... Deleting installation ${row.original.id}...`,
            )
          },
        },
        () => 'Delete',
      ),
  },
]

const table = useVueTable({
  get data() {
    return (data.value as Installation[]) || []
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
const resolvedImports = ref<Import[] | null>(null)

watch(selectedInstallationId, async (newValue) => {
  if (newValue !== -1) {
    try {
      resolvedImports.value = await $fetch<Import[]>(
        `/api/users/${user.value?.id ?? -1}/installations/${newValue}/imports`,
      )
    } catch (error) {
      console.error('Failed to fetch imports:', error)
      resolvedImports.value = null
    }
  } else {
    resolvedImports.value = null
  }
})
</script>

<template>
  <div class="overflow-hidden">
    <div v-if="error">
      <InfoBlock :is-visible="true" variant="error" class="text-red-500">
        Failed to fetch imports.
      </InfoBlock>
    </div>
    <div v-else>
      <template v-if="selectedInstallationId === -1">
        <template v-if="!data || (Array.isArray(data) && data?.length === 0)">
          <InfoBlock :is-visible="true" variant="info">
            No imports found.
          </InfoBlock>
        </template>
        <template v-else>
          <div class="rounded-md border">
            <div class="flex items-center py-4">
              <Input
                class="mx-4 max-w-sm"
                placeholder="Filter by account name..."
                :model-value="
                  table
                    .getColumn('github_account_name')
                    ?.getFilterValue() as string
                "
                @update:model-value="
                  (value) => {
                    const sanitizedValue = value.toString().replace(/\s+/g, '');
                    table
                      .getColumn('github_account_name')
                      ?.setFilterValue(sanitizedValue);
                  }
                "
              />
            </div>

            <ShadcnScrollArea class="w-full">
              <Table>
                <ShadcnScrollBar orientation="horizontal" />
                <TableHeader class="w-full">
                  <TableRow
                    v-for="headerGroup in table.getHeaderGroups()"
                    :key="headerGroup.id"
                  >
                    <TableHead
                      v-for="header in headerGroup.headers"
                      :key="header.id"
                    >
                      <component
                        :is="header.isPlaceholder ? 'span' : 'div'"
                        :class="{
                          'cursor-pointer select-none':
                            header.column.getCanSort(),
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
                <TableBody class="w-full">
                  <template v-if="table.getRowModel().rows?.length > 0">
                    <TableRow
                      v-for="row in table.getRowModel().rows"
                      :key="row.id"
                      class="cursor-pointer"
                      :data-state="row.getIsSelected() ? 'selected' : undefined"
                      @click="() => (selectedInstallationId = row.original.id)"
                    >
                      <TableCell
                        v-for="cell in row.getVisibleCells()"
                        :key="cell.id"
                      >
                        <FlexRender
                          :render="cell.column.columnDef.cell"
                          :props="cell.getContext()"
                        />
                      </TableCell>
                    </TableRow>
                  </template>
                  <TableRow v-else>
                    <TableCell
                      :colspan="columns.length"
                      class="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ShadcnScrollArea>
          </div>
        </template>
      </template>
      <template v-else>
        <Imports :imports="resolvedImports ?? []" />
      </template>
    </div>
  </div>
</template>

<style scoped></style>
