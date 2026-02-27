import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Eye, EyeOff } from 'lucide-react';
import { DashboardWidget } from '../../../types';

interface SortableWidgetProps {
  widget: DashboardWidget;
  children: React.ReactNode;
  onToggleVisibility?: (id: string) => void;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({
  widget,
  children,
  onToggleVisibility
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 lg:col-span-1',
    large: 'col-span-1 lg:col-span-2',
    full: 'col-span-1 lg:col-span-3'
  };

  if (!widget.visible) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`widget-container relative group ${sizeClasses[widget.size]}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="widget-drag-handle absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-[#2a2a3e]/80 backdrop-blur-sm cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={14} className="text-gray-500" />
      </div>

      {/* Widget Content */}
      {children}
    </div>
  );
};

interface WidgetContainerProps {
  widgets: DashboardWidget[];
  onReorder: (widgets: DashboardWidget[]) => void;
  renderWidget: (widget: DashboardWidget) => React.ReactNode;
}

const STORAGE_KEY = 'admin-dashboard-layout';

const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widgets,
  onReorder,
  renderWidget
}) => {
  const [items, setItems] = useState(widgets);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8 // Minimum drag distance before activation
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Sync with props
  useEffect(() => {
    setItems(widgets);
  }, [widgets]);

  // Load saved layout from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem(STORAGE_KEY);
    if (savedLayout) {
      try {
        const savedOrder = JSON.parse(savedLayout) as string[];
        const reordered = savedOrder
          .map(id => widgets.find(w => w.id === id))
          .filter(Boolean) as DashboardWidget[];

        // Add any new widgets that weren't in saved layout
        widgets.forEach(w => {
          if (!reordered.find(r => r.id === w.id)) {
            reordered.push(w);
          }
        });

        setItems(reordered);
      } catch (e) {
        console.error('Failed to load saved layout:', e);
      }
    }
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex(item => item.id === active.id);
        const newIndex = prevItems.findIndex(item => item.id === over.id);
        const newItems = arrayMove(prevItems, oldIndex, newIndex);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems.map(w => w.id)));

        // Notify parent
        onReorder(newItems);

        return newItems;
      });
    }
  };

  const handleToggleVisibility = (id: string) => {
    setItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === id ? { ...item, visible: !item.visible } : item
      );
      onReorder(newItems);
      return newItems;
    });
  };

  const handleResetLayout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems(widgets.map(w => ({ ...w, visible: true })));
    onReorder(widgets.map(w => ({ ...w, visible: true })));
  };

  const visibleItems = items.filter(item => item.visible);

  return (
    <div className="space-y-4">
      {/* Layout Controls */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleResetLayout}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-[#2a2a3e]"
        >
          Varsayılana Sıfırla
        </button>
      </div>

      {/* Widgets Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleItems.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleItems.map((widget: DashboardWidget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                onToggleVisibility={handleToggleVisibility}
              >
                {renderWidget(widget)}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default WidgetContainer;
