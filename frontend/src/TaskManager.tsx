import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  date: string;
  createdAt: string;
}

interface TaskManagerProps {
  user: User;
  onLogout: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium Priority');
  const [taskStatus, setTaskStatus] = useState('Pending');
  const [taskDate, setTaskDate] = useState('');

  // Get authorization header
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Load tasks from backend
  const loadTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: getAuthHeader()
      });
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority.split(' ')[0], // Convert "Medium Priority" to "Medium"
          status: taskStatus,
          dueDate: taskDate || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        await loadTasks(); // Reload tasks from server
        // Reset form
        setTaskTitle('');
        setTaskDescription('');
        setTaskPriority('Medium Priority');
        setTaskStatus('Pending');
        setTaskDate('');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCancel = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('Medium Priority');
    setTaskStatus('Pending');
    setTaskDate('');
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      const data = await response.json();

      if (data.success) {
        await loadTasks(); // Reload tasks from server
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleTaskStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({
          status: newStatus
        })
      });

      const data = await response.json();

      if (data.success) {
        await loadTasks(); // Reload tasks from server
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Task Manager</h1>
        <div className="user-info">
          <span className="user-email">Welcome, {user.name} ({user.email})</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="dashboard">
        <div className="task-summary">
          <h2>My Tasks <span className="task-count">{tasks.length}</span></h2>
          <button 
            className="add-task-btn"
            onClick={() => document.getElementById('task-title')?.focus()}
          >
            Add Task
          </button>
          
          {/* Task Statistics */}
          <div className="task-stats">
            <div className="stat-item">
              <span className="stat-number">{tasks.filter(t => t.status === 'Pending').length}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{tasks.filter(t => t.status === 'Completed').length}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>

        <div className="task-creation">
          <h2>Create New Task</h2>
          <div className="form-group">
            <label htmlFor="task-title">Task Title</label>
            <input 
              type="text" 
              id="task-title" 
              className="form-control" 
              placeholder="Enter task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-description">Description (optional)</label>
            <textarea 
              id="task-description" 
              className="form-control" 
              rows={3}
              placeholder="Enter task description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select 
                id="task-priority" 
                className="form-control priority-select"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
              >
                <option>Low Priority</option>
                <option>Medium Priority</option>
                <option>High Priority</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select 
                id="task-status" 
                className="form-control status-select"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="task-date">Due Date</label>
            <input 
              type="date" 
              id="task-date" 
              className="form-control date-input"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-actions">
            <button className="create-btn" onClick={handleCreateTask}>
              Create Task
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* TASK LIST SECTION */}
      {tasks.length > 0 ? (
        <div className="task-list-section">
          <h2>Your Tasks ({tasks.length})</h2>
          <div className="tasks-container">
            {tasks.map(task => (
              <div key={task.id} className={`task-card ${task.status.toLowerCase()} ${task.priority.toLowerCase()}`}>
                <div className="task-header">
                  <h3 className="task-title">{task.title}</h3>
                  <div className="task-actions">
                    <button 
                      className={`status-btn ${task.status === 'Completed' ? 'completed' : ''}`}
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                    >
                      {task.status === 'Completed' ? '✓ Completed' : 'Mark Complete'}
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteTask(task.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                
                <div className="task-meta">
                  <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                    {task.priority} Priority
                  </span>
                  <span className="task-status-badge">{task.status}</span>
                  <span className="task-date">
                    {task.date ? `Due: ${new Date(task.date).toLocaleDateString()}` : 'No due date'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No tasks yet</h3>
          <p>Create your first task to get started with your productivity journey!</p>
          <button 
            className="get-started-btn"
            onClick={() => document.getElementById('task-title')?.focus()}
          >
            Get Started
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskManager;