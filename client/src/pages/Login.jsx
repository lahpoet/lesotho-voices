
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form)
      });

      localStorage.setItem('token', data.token);
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">
        <div className="login-brand">
          <span className="brand-mark">LV</span>
          <span>Lesotho Voices</span>
        </div>

        <div className="login-welcome">
          <span className="login-label">THE VOICE OF THE MOUNTAIN KINGDOM</span>

          <h1>
            Every story deserves
            <span> to be heard.</span>
          </h1>

          <p>
            Welcome to your publishing space. Share stories,
            celebrate culture and connect with readers across
            Lesotho and beyond.
          </p>

          <div className="login-decoration">
            <div className="decoration-line"></div>
            <span>Stories • Culture • Community</span>
          </div>
        </div>

        <div className="login-bottom">
          Proudly telling stories from Lesotho.
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">

          <div className="login-icon">✦</div>

          <span className="login-eyebrow">CREATOR PORTAL</span>

          <h2>Welcome back</h2>

          <p className="login-subtitle">
            Sign in to manage your content and publishing dashboard.
          </p>

          {error && (
            <div className="error login-error">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="login-form">

            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={e =>
                setForm({ ...form, email: e.target.value })
              }
              autoComplete="username"
              required
            />

            <div className="password-heading">
              <label htmlFor="password">Password</label>
            </div>

            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e =>
                  setForm({ ...form, password: e.target.value })
                }
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={busy}
            >
              {busy ? 'Signing in...' : 'Sign in to dashboard'}
              {!busy && <span>→</span>}
            </button>

          </form>

          <div className="login-divider">
            <span>SECURE CREATOR ACCESS</span>
          </div>

          <p className="login-security">
            Your account is protected. Only authorised creators
            can access the publishing dashboard.
          </p>

          <Link to="/" className="back-home">
            ← Back to homepage
          </Link>

        </div>
      </div>

    </div>
  );
}
