import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CHAT/login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const LoginForm = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // API call here
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        localStorage.setItem('token', data.token);
        if (data.user?.userType) {
          localStorage.setItem('role', data.user.userType);
        }
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>LOGIN</h1>
      <section className="login">
        <form onSubmit={LoginForm}>
          {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
          
          <div className="input-box">
            <span className="material-symbols-outlined">person</span>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-box">
            <span className="material-symbols-outlined">lock</span>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <br />
          <br />
          <a href="/signup" style={{ color: '#007BFF', textDecoration: 'none' }}>Don't have an account? Sign up here.</a>
          <br />
        </form>
      </section>
    </div>
  );
}

export default Login;
