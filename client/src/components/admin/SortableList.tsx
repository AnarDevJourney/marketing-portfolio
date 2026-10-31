import { HolderOutlined } from '@ant-design/icons'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CSSProperties, ReactNode } from 'react'

/** Drag-and-drop sortable list (vertical or horizontal). Calls onChange with the new array. */
export function SortableList<T>({
  items,
  getId,
  onChange,
  renderItem,
  direction = 'vertical',
  style,
}: {
  items: T[]
  getId: (item: T) => string
  onChange: (items: T[]) => void
  renderItem: (item: T, handle: ReactNode) => ReactNode
  direction?: 'vertical' | 'horizontal'
  style?: CSSProperties
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const ids = items.map(getId)
    onChange(
      arrayMove(
        items,
        ids.indexOf(String(active.id)),
        ids.indexOf(String(over.id)),
      ),
    )
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={items.map(getId)}
        strategy={
          direction === 'vertical'
            ? verticalListSortingStrategy
            : horizontalListSortingStrategy
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: direction === 'vertical' ? 'column' : 'row',
            flexWrap: 'wrap',
            gap: 8,
            ...style,
          }}
        >
          {items.map((item) => (
            <SortableItem key={getId(item)} id={getId(item)}>
              {(handle) => renderItem(item, handle)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableItem({
  id,
  children,
}: {
  id: string
  children: (handle: ReactNode) => ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1 : undefined,
    position: 'relative',
  }
  const handle = (
    <span
      ref={setActivatorNodeRef}
      {...listeners}
      {...attributes}
      aria-label="Sürüklə"
      style={{
        cursor: 'grab',
        padding: 4,
        color: '#8c8c8c',
        display: 'inline-flex',
        touchAction: 'none',
      }}
    >
      <HolderOutlined />
    </span>
  )
  return (
    <div ref={setNodeRef} style={style}>
      {children(handle)}
    </div>
  )
}
