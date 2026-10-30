import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Filter & Search State
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (err) {
      setError('Unable to connect to the backend server. Make sure MongoDB and Express are running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Task title is required');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      status
    };

    try {
      if (editingTaskId) {
        await axios.put(`${API_URL}/${editingTaskId}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }
      resetForm();
      fetchTasks();
    } catch (err) {
      alert('Error saving task. Please try again.');
      console.error(err);
    }
  };

  const handleEdit = (task) => {
    setEditingTaskId(task._id);
    setTitle(task.title || '');
    setDescription(task.description || '');
    setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');
    setStatus(task.status || 'Pending');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setStatus('Pending');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchTasks();
      } catch (err) {
        alert('Failed to delete task.');
        console.error(err);
      }
    }
  };

  const toggleStatus = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await axios.put(`${API_URL}/${task._id}`, {
        ...task,
        status: nextStatus
      });
      fetchTasks();
    } catch (err) {
      alert('Failed to update status.');
      console.error(err);
    }
  };

  // Filter & Search logic
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === 'All' || task.status === filter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Calculate statistics
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;

  return (
    <div>
      {/* Top Professional Navigation Bar */}
      <nav className="navbar app-navbar px-3 py-2 mb-4 sticky-top">
        <div className="container-xl d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-icon">
              <i className="bi bi-layers-half"></i>
            </div>
            <div>
              <span className="fw-bold fs-5 text-dark tracking-tight">TaskFlow</span>
              <span className="badge rounded-pill bg-light text-secondary ms-2 border">MERN Stack</span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge-custom badge-completed">
              <i className="bi bi-circle-fill" style={{ fontSize: '7px' }}></i>
              Database Online
            </span>
          </div>
        </div>
      </nav>

      <div className="container-xl pb-5">
        {/* Metric Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-4">
            <div className="stat-card d-flex align-items-center justify-content-between">
              <div>
                <div className="text-secondary small fw-semibold">TOTAL TASKS</div>
                <div className="fs-2 fw-bold mt-1 text-dark">{totalCount}</div>
              </div>
              <div className="stat-icon-wrapper stat-total">
                <i className="bi bi-grid-fill"></i>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-4">
            <div className="stat-card d-flex align-items-center justify-content-between">
              <div>
                <div className="text-secondary small fw-semibold">PENDING TASKS</div>
                <div className="fs-2 fw-bold mt-1" style={{ color: '#d97706' }}>{pendingCount}</div>
              </div>
              <div className="stat-icon-wrapper stat-pending">
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-4">
            <div className="stat-card d-flex align-items-center justify-content-between">
              <div>
                <div className="text-secondary small fw-semibold">COMPLETED TASKS</div>
                <div className="fs-2 fw-bold mt-1" style={{ color: '#059669' }}>{completedCount}</div>
              </div>
              <div className="stat-icon-wrapper stat-completed">
                <i className="bi bi-check2-circle"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
            <div>{error}</div>
          </div>
        )}

        <div className="row g-4">
          {/* Left: Task Form */}
          <div className="col-lg-4">
            <div className="form-card">
              <div className="form-header d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0 text-dark">
                  <i className={`bi ${editingTaskId ? 'bi-pencil-square text-warning' : 'bi-plus-circle text-teal'} me-2`}></i>
                  {editingTaskId ? 'Edit Task' : 'Add New Task'}
                </h5>
                {editingTaskId && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary py-1"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">
                      TASK TITLE <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Deliver product sprint review"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">DESCRIPTION</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Add key objectives or notes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-7">
                      <label className="form-label small fw-bold text-secondary">DUE DATE</label>
                      <input
                        type="date"
                        className="form-control"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-bold text-secondary">STATUS</label>
                      <select
                        className="form-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mt-2">
                    <i className={`bi ${editingTaskId ? 'bi-check2' : 'bi-plus-lg'} me-1`}></i>
                    {editingTaskId ? 'Update Task' : 'Save Task'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Task List, Search & Filter */}
          <div className="col-lg-8">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
              {/* Segmented Filter Pills */}
              <ul className="nav nav-pills">
                <li className="nav-item">
                  <button
                    className={`nav-link ${filter === 'All' ? 'active' : ''}`}
                    onClick={() => setFilter('All')}
                  >
                    All ({totalCount})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${filter === 'Pending' ? 'active' : ''}`}
                    onClick={() => setFilter('Pending')}
                  >
                    Pending ({pendingCount})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${filter === 'Completed' ? 'active' : ''}`}
                    onClick={() => setFilter('Completed')}
                  >
                    Completed ({completedCount})
                  </button>
                </li>
              </ul>

              {/* Search Bar */}
              <div className="search-wrapper" style={{ minWidth: '240px' }}>
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Task Card Grid */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" style={{ color: 'var(--primary-color)' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-secondary">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="card text-center p-5 border-0 shadow-sm rounded-4">
                <div className="mb-3 text-muted">
                  <i className="bi bi-clipboard2-check fs-1 text-secondary opacity-50"></i>
                </div>
                <h5 className="fw-semibold text-dark">No tasks found</h5>
                <p className="text-secondary small mb-0">
                  {searchQuery || filter !== 'All'
                    ? 'Try adjusting your search query or switching filters.'
                    : 'Create your first task using the form on the left!'}
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filteredTasks.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  const formattedDate = task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : null;

                  return (
                    <div
                      key={task._id}
                      className={`task-card p-3 p-md-4 ${
                        isCompleted ? 'status-completed' : 'status-pending'
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            <span
                              className={`badge-custom ${
                                isCompleted ? 'badge-completed' : 'badge-pending'
                              }`}
                            >
                              <i
                                className={`bi ${
                                  isCompleted ? 'bi-check-circle-fill' : 'bi-hourglass-split'
                                }`}
                              ></i>
                              {task.status}
                            </span>

                            {formattedDate && (
                              <span className="badge-custom badge-date">
                                <i className="bi bi-calendar3"></i>
                                {formattedDate}
                              </span>
                            )}
                          </div>

                          <h5
                            className={`fw-bold mb-1 text-dark ${
                              isCompleted ? 'completed-title' : ''
                            }`}
                          >
                            {task.title}
                          </h5>

                          {task.description && (
                            <p className="text-secondary mb-0 mt-2 small lh-base">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="d-flex justify-content-end align-items-center gap-2 mt-3 pt-3 border-top">
                        <button
                          className={`btn btn-action ${
                            isCompleted ? 'btn-action-pending' : 'btn-action-complete'
                          }`}
                          onClick={() => toggleStatus(task)}
                        >
                          <i
                            className={`bi ${
                              isCompleted ? 'bi-arrow-counterclockwise' : 'bi-check2'
                            }`}
                          ></i>
                          {isCompleted ? 'Mark Pending' : 'Mark Done'}
                        </button>
                        <button
                          className="btn btn-action btn-action-edit"
                          onClick={() => handleEdit(task)}
                        >
                          <i className="bi bi-pencil-square"></i>
                          Edit
                        </button>
                        <button
                          className="btn btn-action btn-action-delete"
                          onClick={() => handleDelete(task._id)}
                        >
                          <i className="bi bi-trash3"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
