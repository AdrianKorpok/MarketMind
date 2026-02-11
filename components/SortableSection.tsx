import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import MetricsGrid from './MetricsGrid';

interface SortableSectionProps {
  id: string;
  title: string;
  stats: Record<string, string>;
  keys: string[];
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

const SortableSection: React.FC<SortableSectionProps> = ({ id, title, stats, keys, isExpanded, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg mb-4 overflow-hidden">
      <div className="flex items-center justify-between bg-slate-800/30 border-b border-slate-800/50">
        
        {/* Drag Handle - Isolated */}
        <div 
            className="p-3 pr-1 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing hover:bg-slate-800/50 transition-colors border-r border-slate-800/50"
            {...attributes} 
            {...listeners}
        >
            <GripVertical className="w-5 h-5" />
        </div>

        {/* Toggle Area - Click anywhere here */}
        <div 
            onClick={() => onToggle(id)}
            className="flex-1 flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
        >
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider pl-2">{title}</h3>
            <button className="text-slate-400 hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="animate-fade-in">
           <MetricsGrid stats={stats} keys={keys} />
        </div>
      )}
    </div>
  );
};

export default SortableSection;
