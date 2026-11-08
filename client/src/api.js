// All calls to the backend go through this helper.
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const CATEGORIES = ['Culture', 'Travel', 'Current Affairs', 'Education', 'Technology', 'Lifestyle', 'Entertainment'];
export const TYPES = ['article', 'video', 'image', 'podcast'];

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(API + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong');
    err.status = res.status;
    throw err;
  }
  return data;
}

// A random id saved in the browser so one viewer can only like an item once
export function getViewerId() {
  let id = localStorage.getItem('viewerId');
  if (!id) {
    id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('viewerId', id);
  }
  return id;
}

export const formatDate = d => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
