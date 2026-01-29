import React, { useState } from 'react';
import { Plus, Check, X, Circle, ListTodo, Coffee, Brain, Trash2 } from 'lucide-react';
import { Task, TimerType } from '../types';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (text: string, tag?: TimerType) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
  onCycleTag: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask, onClearCompleted, onCycleTag }) => {
  const [newTask, setNewTask] = useState('');
  const [selectedTag, setSelectedTag] = useState<TimerType>('FOCUS');
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask(newTask.trim(), selectedTag);
      setNewTask('');
      // Keep previous selection for UX consistency
    }
  };

  const hasCompletedTasks = tasks.some(t => t.completed);

  // Reset confirmation state when closing the list
  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    setIsConfirmingClear(false);
  };

  return (
    <div className={`fixed right-8 bottom-24 z-40 flex flex-col items-end transition-all duration-300 pointer-events-auto ${isOpen ? 'translate-y-0' : 'translate-y-0'}`}>
        {/* Toggle Button / Header */}
        <button 
            onClick={handleToggleOpen}
            className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-full shadow-lg transition-all border border-wove-dim/20 ${isOpen ? 'bg-wove-text text-wove-bg' : 'bg-wove-bg text-wove-text hover:scale-105'}`}
        >
            <ListTodo size={18} />
            <span className="font-display font-bold tracking-wide text-sm">Tasks</span>
            {tasks.filter(t => !t.completed).length > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isOpen ? 'bg-wove-bg text-wove-text' : 'bg-wove-text text-wove-bg'}`}>
                    {tasks.filter(t => !t.completed).length}
                </span>
            )}
        </button>

        {/* List Content */}
        {isOpen && (
            <div className="bg-wove-bg border border-wove-dim/20 rounded-2xl shadow-xl w-80 p-4 max-h-96 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200">
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a new task..."
                            className="flex-1 bg-wove-dim/10 text-wove-text placeholder-wove-dim/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wove-text transition-all"
                            autoFocus
                        />
                        <button 
                            type="submit"
                            disabled={!newTask.trim()}
                            className="bg-wove-text text-wove-bg p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-wove-text/90 transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    {/* Tag Selector */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedTag('FOCUS')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${selectedTag === 'FOCUS' ? 'bg-wove-text text-wove-bg shadow-sm' : 'bg-wove-dim/10 text-wove-dim hover:bg-wove-dim/20'}`}
                        >
                            <Brain size={12} /> Focus
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedTag('BREAK')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${selectedTag === 'BREAK' ? 'bg-wove-text text-wove-bg shadow-sm' : 'bg-wove-dim/10 text-wove-dim hover:bg-wove-dim/20'}`}
                        >
                            <Coffee size={12} /> Break
                        </button>
                    </div>
                </form>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar min-h-[100px]">
                    {tasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-wove-dim opacity-50 gap-2">
                            <ListTodo size={24} />
                            <span className="text-xs">No tasks yet</span>
                        </div>
                    )}
                    
                    {/* Active Tasks */}
                    {tasks.filter(t => !t.completed).map(task => (
                        <div key={task.id} className="group flex items-start gap-3 p-2 hover:bg-wove-dim/5 rounded-lg transition-colors group">
                            <button 
                                onClick={() => onToggleTask(task.id)}
                                className="mt-0.5 text-wove-dim hover:text-wove-text transition-colors"
                            >
                                <Circle size={18} strokeWidth={2} />
                            </button>
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                <span className="text-sm text-wove-text break-words leading-tight">{task.text}</span>
                                <button 
                                    onClick={() => onCycleTag(task.id)}
                                    className="self-start flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-wove-dim hover:text-wove-text transition-colors"
                                >
                                    {task.tag === 'FOCUS' ? <Brain size={10} /> : <Coffee size={10} />}
                                    {task.tag}
                                </button>
                            </div>
                            <button 
                                onClick={() => onDeleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-wove-dim hover:text-red-500 transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}

                    {/* Completed Tasks */}
                    {hasCompletedTasks && (
                        <>
                            <div className="border-t border-wove-dim/10 my-2 pt-2">
                                <span className="text-xs text-wove-dim font-bold uppercase tracking-wider px-2">Completed</span>
                            </div>
                            {tasks.filter(t => t.completed).map(task => (
                                <div key={task.id} className="group flex items-center gap-3 p-2 opacity-50 hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onToggleTask(task.id)}
                                        className="text-wove-text"
                                    >
                                        <Check size={18} strokeWidth={2} />
                                    </button>
                                    <span className="flex-1 text-sm text-wove-dim line-through break-words">{task.text}</span>
                                    <button 
                                        onClick={() => onDeleteTask(task.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-wove-dim hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {hasCompletedTasks && (
                    <div className="mt-4 pt-3 border-t border-wove-dim/10 flex justify-center">
                         {isConfirmingClear ? (
                            <div className="flex items-center gap-2 animate-in fade-in duration-200">
                                <span className="text-xs text-wove-dim">Delete all completed?</span>
                                <button 
                                    onClick={() => onClearCompleted()} 
                                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 font-bold"
                                >
                                    Yes
                                </button>
                                <button 
                                    onClick={() => setIsConfirmingClear(false)} 
                                    className="text-xs text-wove-dim hover:text-wove-text px-2 py-1"
                                >
                                    No
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsConfirmingClear(true)}
                                className="text-xs text-wove-dim hover:text-wove-text transition-colors flex items-center gap-1.5"
                            >
                                <Trash2 size={12} /> Clear Completed
                            </button>
                        )}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default TaskList;