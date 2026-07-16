const API_BASE = '/api';

/**
 * Standard fetch helper with error parsing
 */
async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || `Request failed with status ${response.status}`);
    }
    return result.data;
  } catch (error) {
    console.error(`API Error on ${url}:`, error.message);
    throw error;
  }
}

export const api = {
  // Employee CRUD
  employees: {
    getAll: () => request('/employees'),
    getById: (id) => request(`/employees/${id}`),
    create: (data) => request('/employees', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/employees/${id}`, {
      method: 'DELETE'
    })
  },

  // Task CRUD
  tasks: {
    getAll: () => request('/tasks'),
    getById: (id) => request(`/tasks/${id}`),
    create: (data) => request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/tasks/${id}`, {
      method: 'DELETE'
    })
  },

  // AI Functionalities
  ai: {
    generateReview: (employeeId, achievements, areasOfImprovement) => request('/ai/review', {
      method: 'POST',
      body: JSON.stringify({ employeeId, achievements, areasOfImprovement })
    }),
    matchTask: (task) => request('/ai/match-task', {
      method: 'POST',
      body: JSON.stringify(task)
    }),
    scanResume: (resumeText) => request('/ai/scan-resume', {
      method: 'POST',
      body: JSON.stringify({ resumeText })
    }),
    getReviews: () => request('/ai/reviews'),
    deleteReview: (id) => request(`/ai/reviews/${id}`, {
      method: 'DELETE'
    })
  }
};
