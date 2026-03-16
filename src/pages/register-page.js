import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../features/users/context/auth-context';
import './auth-page.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <Card className="auth-card">
        <div className="auth-header">
          <i className="pi pi-film" style={{ fontSize: '2.5rem' }}></i>
          <h2>Register for JelloMovie</h2>
        </div>

        {error && (
          <Message severity="error" text={error} className="w-full mb-3" />
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="username">Username</label>
            <InputText
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full"
              placeholder="Choose a username"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full"
              placeholder="Enter your email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full"
              inputClassName="w-full"
              placeholder="Enter your password"
              toggleMask
            />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Password
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full"
              inputClassName="w-full"
              placeholder="Confirm your password"
              feedback={false}
              toggleMask
            />
          </div>

          <Button
            type="submit"
            label="Register"
            icon="pi pi-user-plus"
            loading={loading}
            className="w-full"
          />
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
