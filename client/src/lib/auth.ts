// Authentication helper functions

// Add auth token to API requests
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('authToken');
}

// Login function
export async function loginUser(credentials: { username: string; password: string }) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  
  // Store token
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  
  return data;
}

// Signup function
export async function signupUser(userData: { 
  username: string; 
  email: string; 
  password: string; 
  confirmPassword: string;
}) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }

  const data = await response.json();
  
  // Store token
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  
  return data;
}

// Logout function
export function logoutUser() {
  localStorage.removeItem('authToken');
}

// Get current user
export async function getCurrentUser() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return null;
  }
  
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      return null;
    }
    throw new Error('Failed to fetch user data');
  }

  return response.json();
}