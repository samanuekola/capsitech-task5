import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const API_URL = 'https://capsitech-task5-backend.vercel.app/api/todos';

function App() {
  const [task, setTask] = useState('');
  const [todos, setTodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  axios.defaults.withCredentials=true;
  useEffect(() => {
    axios.get(API_URL).then((res) => setTodos(res.data));
  }, []);

  const addTodo = async () => {
    if (task.trim().length < 3) return alert("Task must be at least 3 characters long.");
    const res = await axios.post(API_URL, { title: task, completed: false });
    setTodos([res.data, ...todos]);
    setTask('');
  };

  const updateTodo = async () => {
    if (!editingId || task.trim().length < 3) return alert("Task must be at least 3 characters long.");
    await axios.put(`${API_URL}/${editingId}`, { title: task });
    const updatedTodos = todos.map(todo =>
      todo._id === editingId ? { ...todo, title: task } : todo
    );
    setTodos(updatedTodos);
    setEditingId(null);
    setTask('');
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setTodos(todos.filter(todo => todo._id !== id));
  };

  const toggleComplete = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;
    const res = await axios.put(`${API_URL}/${id}`, { completed: updatedStatus });
    const updatedTodos = todos.map(todo =>
      todo._id === id ? res.data : todo
    );
    setTodos(updatedTodos);
  };

  const handleEdit = (todo) => {
    setTask(todo.title);
    setEditingId(todo._id);
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      editingId ? updateTodo() : addTodo();
    }
  };

  return (
    <div className="app">
      <div className="todo-box">
        <h2 className="title">To-Do List <span>📝</span></h2>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Add your task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={handleEnter}
          />
          <button onClick={editingId ? updateTodo : addTodo}>
            {editingId ? 'Update' : 'Add'}
          </button>
        </div>
        <ul className="task-list">
          {todos.map((todo) => (
            <li key={todo._id} id={todo._id}>
              <label className="task-left">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo._id, todo.completed)}
                />
                <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                  {todo.title}
                </span>
              </label>
              <div className="right-icons">
                <span className="edit-btn" onClick={() => handleEdit(todo)}>✏️</span>
                <span className="delete-btn" onClick={() => deleteTodo(todo._id)}>×</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
