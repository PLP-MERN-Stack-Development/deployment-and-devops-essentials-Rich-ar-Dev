import React, { useState } from 'react';
import { Task } from '../types';
import { tasksAPI } from '../services/api';
import TaskForm from './TaskForm';

interface TaskItemProps {
  task: Task;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onTaskUpdated, onTaskDeleted }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: Task['status']) => {
    setLoading(true);
    try {
      const updatedTask = await tasksAPI.updateTask(task._id, { status: newStatus });
      onTaskUpdated(updatedTask);
    } catch (error) {
      alert('Error updating task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    setLoading(true);
    try {
      await tasksAPI.deleteTask(task._id);
      onTaskDeleted(task._id);
    } catch (error) {
      alert('Error deleting task');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44ff44';
      default: return '#cccccc';
    }
  };

  if (showEdit) {
    return (
      <TaskForm
        initialTask={task}
        onTaskCreated={onTaskUpdated}
        onCancel={() => setShowEdit(false)}
      />
    );
  }

  return (
    <div className="task-item" style={{ opacity: loading ? 0.6 : 1 }}>
      <div className="task-header">
        <h4>{task.title}</h4>
        <span 
          className="priority-dot"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
          title={`${task.priority} priority`}
        />
      </div>
      
      {task.description && <p>{task.description}</p>}
      
      {task.dueDate && (
        <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
      )}
      
      <div className="task-actions">
        <select 
          value={task.status} 
          onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
          disabled={loading}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        
        <button onClick={() => setShowEdit(true)} disabled={loading}>
          Edit
        </button>
        <button onClick={handleDelete} disabled={loading}>
          Delete
        </button>
      </div>
      
      <div className="task-meta">
        Created: {new Date(task.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default TaskItem;