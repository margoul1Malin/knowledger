'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface DataTableProps {
  data: any[]
  columns: {
    field: string
    header: string
    render?: (value: any) => React.ReactNode
  }[]
  onDelete: (ids: string[]) => void
  editUrl: (item: any) => string
}

export default function DataTable({ data, columns, onDelete, editUrl }: DataTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  
  const handleSelectAll = () => {
    if (selectedItems.length === data.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(data.map(item => item.id))
    }
  }

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedItems.length} élément(s) ?`)) {
      onDelete(selectedItems)
      setSelectedItems([])
    }
  }

  return (
    <div className="space-y-4">
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedItems.length} élément(s) sélectionné(s)
          </span>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
          >
            <TrashIcon className="h-4 w-4" />
            Supprimer la sélection
          </button>
        </div>
      )}

      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 text-left">
                <Checkbox
                  checked={selectedItems.length === data.length}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              {columns.map((column) => (
                <th key={column.field} className="p-4 text-left font-medium">
                  {column.header}
                </th>
              ))}
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr 
                key={item.id}
                className={`border-t ${index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}`}
              >
                <td className="p-4">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleSelectItem(item.id)}
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.field} className="p-4">
                    {column.render 
                      ? column.render(item[column.field])
                      : item[column.field]}
                  </td>
                ))}
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={editUrl(item)}
                      className="p-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDelete([item.id])}
                      className="p-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 