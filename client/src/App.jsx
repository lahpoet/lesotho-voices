import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ContentDetails from './pages/ContentDetails.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Register from './pages/Register.jsx';
import ViewerLogin from './pages/ViewerLogin.jsx';

function ProtectedRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      <header className="navbar">
        <Link to="/" className="brand">Lesotho Voices</Link>
        <nav>
          <Link to="/">Home</Link>
          {loggedIn ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <button className="link-btn" onClick={logout}>Log out</button>
            </>
          ) : (
            <Link to="/login">Creator login</Link>
          )}
        </nav>
      </header>
      <main>
       <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/content/:id" element={<ContentDetails />} />

  {/* Creator login */}
  <Route path="/login" element={<Login />} />

  {/* Viewer registration and login */}
  <Route path="/register" element={<Register />} />
  <Route path="/viewer-login" element={<ViewerLogin />} />

  {/* Creator dashboard */}
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

  <Route path="*" element={<p className="container">Page not found.</p>} />
</Routes>
      </main>
      <footer className="footer">Lesotho Voices - stories and news from the Mountain Kingdom</footer>
    </>
  );
}
