import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function ViewerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const data = await api('/api/viewers/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
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
      <h1>Viewer login</h1>
      <p>Log in to your Lesotho Voices account.</p>

      {error && <p className="error">{error}</p>}

      <form className="form" onSubmit={submit}>
        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p>Don't have an account? <Link to="/register">Register here</Link>.</p>
      <p><Link to="/">Back to homepage</Link></p>
    </div>
  );
}