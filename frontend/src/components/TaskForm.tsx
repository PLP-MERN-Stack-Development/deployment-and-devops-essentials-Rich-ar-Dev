import React, { useState } from 'react';
import { Task } from '../types';
import { tasksAPI } from '../services/api';

interface TaskFormProps {
  onTaskCreated: (task: Task) => void;
  onCancel: () => void;
  initialTask?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated, onCancel, initialTask }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialTask?.priority || 'medium');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>(initialTask?.status || 'pending');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status, // Add the missing status field
        dueDate: dueDate || undefined,
      };

      const newTask = await tasksAPI.createTask(taskData);
      onTaskCreated(newTask);
    } catch (error) {
      alert('Error creating task: ' + (error as any).response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form">
      <h3>{initialTask ? 'Edit Task' : 'Create New Task'}</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        <div className="form-row">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (initialTask ? 'Update Task' : 'Create Task')}
          </button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;