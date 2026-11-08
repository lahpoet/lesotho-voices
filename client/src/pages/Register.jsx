import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setBusy(true);

    try {
      const data = await api('/api/viewers/register', {
        method: 'POST',
        body: JSON.stringify({
          displayName: form.displayName,
          email: form.email,
          password: form.password
        })
      });

      localStorage.setItem('viewerToken', data.token);
      localStorage.setItem('viewer', JSON.stringify(data.viewer));

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container narrow">
      <h1>Create your Lesotho Voices account</h1>
      <p>Join our community and share your thoughts on stories from Lesotho.</p>

      {error && <p className="error">{error}</p>}

      <form className="form" onSubmit={submit}>
        <label>
          Full name
          <input
            type="text"
            value={form.displayName}
            onChange={e => setForm({ ...form, displayName: e.target.value })}
            maxLength={50}
            required
          />
        </label>

        <label>
          Email address
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>

        <label>
          Password (minimum 8 characters)
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            minLength={8}
            required
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />
        </label>

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p>Already registered? <Link to="/viewer-login">Log in here</Link>.</p>
      <p><Link to="/">Back to homepage</Link></p>
    </div>
  );
}