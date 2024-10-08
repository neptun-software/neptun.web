<script lang="ts" setup>
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/vue-table';
import { toast } from 'vue-sonner';
import { CaretSortIcon } from '@radix-icons/vue';
import type { Import } from './types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { NuxtLink } from '#components';
import { Button } from '~/components/ui/button';
import { valueUpdater } from '~/lib/utils';

const props = defineProps<{
  imports: Import[];
}>();

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);

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
        () => ['Repository Name', h(CaretSortIcon, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => row.getValue('github_repository_name'),
  },
  {
    accessorKey: 'github_repository_description',
    header: 'Description',
    cell: ({ row }) => row.getValue('github_repository_description') || 'N/A',
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
    accessorKey: 'github_repository_url',
    header: 'Repository URL',
    cell: ({ row }) => {
      const websiteUrl = row.getValue('github_repository_url');
      return h(
        NuxtLink,
        {
          to: websiteUrl || '#',
          target: websiteUrl ? '_blank' : undefined,
          external: true,
        },
        () => websiteUrl || 'N/A'
      );
    },
  },
  {
    accessorKey: 'github_repository_website_url',
    header: 'Website URL',
    cell: ({ row }) => {
      const websiteUrl = row.getValue('github_repository_website_url');
      return h(
        NuxtLink,
        {
          to: websiteUrl || '#',
          target: websiteUrl ? '_blank' : undefined,
          external: true,
        },
        () => websiteUrl || 'N/A'
      );
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
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: 'default',
          size: 'sm',
          onClick: () => {
            toast.error(
              `Coming Soon... Refreshing repository ${row.original.github_repository_id}...`
            );
          },
        },
        () => 'Refresh'
      ),
  },
];

const table = useVueTable({
  get data() {
    return (props.imports as Import[]) || [];
  },
  columns,
  getCoreRowModel: getCoreRowModel(),

  getSortedRowModel: getSortedRowModel(),
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),

  onColumnFiltersChange: (updaterOrValue) => {
    return valueUpdater(updaterOrValue, columnFilters);
  },
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
  },
});

const selectedInstallationId = useSelectedInstallation();
</script>

<template>
  <div>
    <div class="border rounded-md">
      <div class="flex items-center gap-2 p-4">
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

      <ShadcnScrollArea class="w-full max-w-[calc(100vw-4.4rem)]">
        <Table>
          <ShadcnScrollBar orientation="horizontal" />
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
      </ShadcnScrollArea>
    </div>
  </div>
</template>

<style scoped></style>
