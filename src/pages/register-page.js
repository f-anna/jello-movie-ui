import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { FloatLabel } from 'primereact/floatlabel';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      await register({ username: formData.username, email: formData.email, password: formData.password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left branding panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <i className="pi pi-film auth-brand-icon" />
          <h1 className="auth-brand-title">JelloMovie</h1>
          <p className="auth-brand-tagline">Track, discover, and share your movie journey.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-box">
          <div className="auth-form-heading">
            <h2>Create an account</h2>
            <p>Join and start tracking your movies</p>
          </div>

          {error && <Message severity="error" text={error} className="w-full mb-4" />}

          <form onSubmit={handleSubmit} className="auth-form">
            <FloatLabel>
              <IconField>
                <InputIcon className="pi pi-user" />
                <InputText
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </IconField>
              <label htmlFor="username">Username</label>
            </FloatLabel>

            <FloatLabel>
              <IconField>
                <InputIcon className="pi pi-envelope" />
                <InputText
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </IconField>
              <label htmlFor="email">Email address</label>
            </FloatLabel>

            <FloatLabel>
              <Password
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full"
                inputClassName="w-full"
                toggleMask
              />
              <label htmlFor="password">Password</label>
            </FloatLabel>

            <FloatLabel>
              <Password
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full"
                inputClassName="w-full"
                feedback={false}
                toggleMask
              />
              <label htmlFor="confirmPassword">Confirm password</label>
            </FloatLabel>

            <Button
              type="submit"
              label="Create account"
              icon="pi pi-user-plus"
              iconPos="right"
              loading={loading}
              className="w-full auth-submit-btn"
            />
          </form>

          <Divider />

          <p className="auth-switch-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
