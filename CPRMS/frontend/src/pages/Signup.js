import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CHAT/signup.css';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    city: '',
    state: '',
    gender: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    const fieldName = id || name;
    const normalizedField = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);

    setFormData((prev) => ({
      ...prev,
      [normalizedField]: value,
    }));
  };

  const SignUpForm = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.phoneNumber ||
      !formData.city ||
      !formData.state ||
      !formData.gender
    ) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email');
      return;
    }

    // Password validation (at least 6 characters)
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundImage: `url('https://media.licdn.com/dms/image/v2/D4E12AQGupKtYX6Xojw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1689854556613?e=2147483647&v=beta&t=s6FXx2t3ulA9HNMXGm9eqkltrnDobLYWeT-qCklVBiY')`, backgroundSize: 'cover', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', fontSize: '35px', fontFamily: "Georgia, 'Times New Roman', Times, serif", color: '#ffffff' }}>Sign Up now!</h1>

      <section className="signup">
        <form onSubmit={SignUpForm}>
          {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: '10px', textAlign: 'center', fontWeight: 'bold' }}>{success}</div>}

          <div className="input-box">
            <span className="material-symbols-outlined">person</span>
            <input
              type="text"
              id="FirstName"
              placeholder="Enter your First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="input-box">
            <span className="material-symbols-outlined">person</span>
            <input
              type="text"
              id="LastName"
              placeholder="Enter your Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div className="input-box">
            <span className="material-symbols-outlined">email</span>
            <input
              type="email"
              id="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-box">
            <span className="material-symbols-outlined">lock</span>
            <input
              type="password"
              id="Password"
              placeholder="Your Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="input-box">
            <span className="material-symbols-outlined">phone</span>
            <input
              type="number"
              id="PhoneNumber"
              placeholder="+91"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="input-box">
            <span className="material-symbols-outlined">house</span>
            <input
              type="text"
              id="city"
              placeholder="Your City"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="input-box">
            <span className="material-symbols-outlined">pin</span>
            <input
              type="text"
              id="state"
              placeholder="Your State"
              value={formData.state}
              onChange={handleChange}
            />
          </div>

          <label style={{ color: '#ffffff', fontWeight: 'bold' }}>Gender:</label>
          <br />
          <div className="labelinputs">
            <div className="input-box">
              <span className="material-symbols-outlined">male</span>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleChange}
              />
              <label style={{ color: '#ffffff' }}>Male</label>
            </div>
            <div className="input-box">
              <span className="material-symbols-outlined">female</span>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleChange}
              />
              <label style={{ color: '#ffffff' }}>Female</label>
            </div>
            <div className="input-box">
              <span className="material-symbols-outlined">transgender</span>
              <input
                type="radio"
                name="gender"
                value="Trans"
                checked={formData.gender === 'Trans'}
                onChange={handleChange}
              />
              <label style={{ color: '#ffffff' }}>Trans</label>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: '20px' }}>
            {loading ? 'SUBMITTING...' : 'SUBMIT'}
          </button>
          <br />
          <br />
          <a href="/login" style={{ color: '#007BFF', textDecoration: 'none' }}>Already have an account? Login here.</a>
        </form>
      </section>
    </div>
  );
}

export default Signup;
