import { HolderOutlined } from '@ant-design/icons'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, Table, type TableColumnsType } from 'antd'
import {
  createContext,
  type CSSProperties,
  type HTMLAttributes,
  useContext,
  useMemo,
  useState,
} from 'react'

interface RowCtx {
  setActivatorNodeRef?: (el: HTMLElement | null) => void
  listeners?: Record<string, unknown>
}
const RowContext = createContext<RowCtx>({})

function DragHandle() {
  const { setActivatorNodeRef, listeners } = useContext(RowContext)
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: 'grab', touchAction: 'none' }}
      ref={setActivatorNodeRef}
      aria-label="Sürüklə"
      {...listeners}
    />
  )
}

function Row(
  props: HTMLAttributes<HTMLTableRowElement> & { 'data-row-key': string },
) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  })
  const style: CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging
      ? { position: 'relative', zIndex: 10, background: '#fafafa' }
      : {}),
  }
  const ctx = useMemo(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  )
  return (
    <RowContext.Provider value={ctx}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  )
}

/** antd Table whose rows can be dragged to reorder; onReorder gets `[{ id, order }]`. */
export function SortableTable<T extends { _id: string }>({
  data,
  columns,
  loading,
  onReorder,
}: {
  data: T[]
  columns: TableColumnsType<T>
  loading?: boolean
  onReorder: (items: { id: string; order: number }[]) => Promise<unknown>
}) {
  // Optimistic order while the reorder request is in flight.
  const [pending, setPending] = useState<string[] | null>(null)
  const rows = pending
    ? pending
        .map((id) => data.find((d) => d._id === id))
        .filter((d): d is T => !!d)
    : data
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const ids = rows.map((r) => r._id)
    const next = arrayMove(
      ids,
      ids.indexOf(String(active.id)),
      ids.indexOf(String(over.id)),
    )
    setPending(next)
    void onReorder(next.map((id, order) => ({ id, order }))).finally(() =>
      setPending(null),
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={rows.map((r) => r._id)}
        strategy={verticalListSortingStrategy}
      >
        <Table<T>
          rowKey="_id"
          components={{ body: { row: Row } }}
          columns={[
            {
              key: 'drag',
              width: 48,
              align: 'center',
              render: () => <DragHandle />,
            },
            ...columns,
          ]}
          dataSource={rows}
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </SortableContext>
    </DndContext>
  )
}
