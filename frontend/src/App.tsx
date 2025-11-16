import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';

// Auth Context
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Task Interface
interface Task {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
  createdAt: string;
}

// Login Component
const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Enter your name"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="form-control"
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <p className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            className="toggle-btn"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

// TaskManager Component
const TaskManager: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskStatus, setTaskStatus] = useState('Pending');
  const [taskDate, setTaskDate] = useState('');
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error('Failed to load tasks');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      alert('Failed to load tasks. Please check if backend is running.');
    } finally {
      setLoading(false);
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
          priority: taskPriority,
          status: taskStatus,
          dueDate: taskDate || undefined
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create task');
      }

      await loadTasks(); // Reload tasks from server
      
      // Reset form
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('Medium');
      setTaskStatus('Pending');
      setTaskDate('');
    } catch (error: any) {
      console.error('Error creating task:', error);
      alert(error.message || 'Failed to create task');
    }
  };

  const handleCancel = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('Medium');
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

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete task');
      }

      await loadTasks(); // Reload tasks from server
    } catch (error: any) {
      console.error('Error deleting task:', error);
      alert(error.message || 'Failed to delete task');
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

      if (!data.success) {
        throw new Error(data.message || 'Failed to update task');
      }

      await loadTasks(); // Reload tasks from server
    } catch (error: any) {
      console.error('Error updating task:', error);
      alert(error.message || 'Failed to update task');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
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
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
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
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
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
            <button className="create-btn" onClick={handleCreateTask} disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
            <button className="cancel-btn" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* TASK LIST SECTION */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">Loading tasks...</div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="task-list-section">
          <h2>Your Tasks ({tasks.length})</h2>
          <div className="tasks-container">
            {tasks.map(task => (
              <div key={task._id} className={`task-card ${task.status.toLowerCase()} ${task.priority.toLowerCase()}`}>
                <div className="task-header">
                  <h3 className="task-title">{task.title}</h3>
                  <div className="task-actions">
                    <button 
                      className={`status-btn ${task.status === 'Completed' ? 'completed' : ''}`}
                      onClick={() => toggleTaskStatus(task._id, task.status)}
                      disabled={loading}
                    >
                      {task.status === 'Completed' ? '✓ Completed' : 'Mark Complete'}
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteTask(task._id)}
                      disabled={loading}
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
                    Due: {formatDate(task.dueDate)}
                  </span>
                  <span className="task-created">
                    Created: {formatDate(task.createdAt)}
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

// Main App Component
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const authContextValue: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {!user ? <Login /> : <TaskManager user={user} onLogout={logout} />}
    </AuthContext.Provider>
  );
}

export default App;