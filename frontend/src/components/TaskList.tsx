import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { tasksAPI } from '../services/api';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const tasksData = await tasksAPI.getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
    setShowForm(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter(task => task._id !== taskId));
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="task-list">
      <div className="task-header">
        <h2>My Tasks ({tasks.length})</h2>
        <button onClick={() => setShowForm(true)}>Add Task</button>
      </div>

      {showForm && (
        <TaskForm 
          onTaskCreated={handleTaskCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="tasks">
        {tasks.map(task => (
          <TaskItem
            key={task._id}
            task={task}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        ))}
        {tasks.length === 0 && (
          <p>No tasks yet. Create your first task!</p>
        )}
      </div>
    </div>
  );
};

export default TaskList;