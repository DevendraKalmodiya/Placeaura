import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  // State to hold login credentials
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send credentials to the Node.js backend
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Save the JWT token and user details to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userRole', data.user.role);
        
        // Route the user to their profile page
        navigate('/profile');
      } else {
        // Display backend error (e.g., Invalid credentials)
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Failed to connect to the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Welcome Back</h2>
        
        {/* Display error message if there is one */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              placeholder="you@example.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white font-medium py-2.5 rounded-md transition-colors mt-4 shadow-sm ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}