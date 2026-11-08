
import { useEffect, useState } from 'react';
import { api, CATEGORIES, TYPES, formatDate } from '../api.js';

const emptyForm = {
  title: '',
  description: '',
  category: 'Culture',
  contentType: 'article',
  thumbnailUrl: '',
  mediaUrl: '',
  articleBody: '',
  status: 'Draft',
  publishDate: '',
  isFeatured: false
};

const toLocalInput = d => {
  if (!d) return '';
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 16);
};

export default function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [contents, setContents] = useState([]);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    try {
      const [s, c, cm] = await Promise.all([
        api('/api/dashboard/stats'),
        api('/api/contents/admin/all'),
        api('/api/comments/admin/all')
      ]);

      setStats(s);
      setContents(c);
      setComments(cm);
    } catch (e) {
      if (e.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError(e.message);
      }
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const save = async e => {
    e.preventDefault();
    setMsg('');
    setError('');
    setSaving(true);

    const body = {
      ...form,
      publishDate: form.publishDate
        ? new Date(form.publishDate).toISOString()
        : undefined
    };

    try {
      if (editingId) {
        await api(`/api/contents/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        setMsg('Your content has been successfully updated.');
      } else {
        await api('/api/contents', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        setMsg('Your new content has been successfully created.');
      }

      setForm(emptyForm);
      setEditingId(null);
      setTab('content');
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const edit = item => {
    setForm({
      ...emptyForm,
      ...item,
      publishDate: toLocalInput(item.publishDate)
    });
    setEditingId(item._id);
    setTab('form');
    setMsg('');
    setError('');
  };

  const remove = async item => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;

    try {
      await api(`/api/contents/${item._id}`, { method: 'DELETE' });
      setMsg('Content successfully deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const setStatus = async (id, status) => {
    try {
      await api(`/api/comments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setMsg(`Comment ${status}.`);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeComment = async id => {
    if (!window.confirm('Delete this comment permanently?')) return;

    try {
      await api(`/api/comments/${id}`, { method: 'DELETE' });
      setMsg('Comment deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '◫' },
    { id: 'content', label: 'My content', icon: '▤' },
    { id: 'form', label: editingId ? 'Edit content' : 'Add content', icon: '+' },
    { id: 'comments', label: 'Comments', icon: '▤' }
  ];

  const statCards = stats ? [
    { label: 'Total content', value: stats.total, icon: '▤' },
    { label: 'Published', value: stats.published, icon: '✓' },
    { label: 'Drafts', value: stats.drafts, icon: '✎' },
    { label: 'Scheduled', value: stats.scheduled, icon: '◷' },
    { label: 'Comments', value: stats.comments, icon: '☷', detail: `${stats.pendingComments} awaiting review` },
    { label: 'Total views', value: stats.totalViews, icon: '◉' },
    { label: 'Total likes', value: stats.totalLikes, icon: '♡' }
  ] : [];

  return (
    <div className="dashboard-page">

      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">LESOTHO VOICES / ADMINISTRATION</span>
          <h1>Creator dashboard</h1>
          <p>Manage your stories, publish content and engage with your readers.</p>
        </div>

        <button
          className="dashboard-add"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setTab('form');
            setMsg('');
            setError('');
          }}
        >
          + Create content
        </button>
      </div>

      <div className="dashboard-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={tab === t.id ? 'dashboard-tab active' : 'dashboard-tab'}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span>
            {t.label}
            {t.id === 'comments' && comments.length > 0 && (
              <span className="tab-count">{comments.length}</span>
            )}
          </button>
        ))}
      </div>

      {msg && <p className="notice">{msg}</p>}
      {error && <p className="error">{error}</p>}

      {tab === 'overview' && (
        <>
          <div className="section-heading">
            <div>
              <h2>Overview</h2>
              <p>Here's how your publishing platform is performing.</p>
            </div>
          </div>

          {!stats ? (
            <p>Loading dashboard statistics...</p>
          ) : (
            <>
              <div className="dashboard-stats">
                {statCards.map(s => (
                  <div className="dashboard-stat" key={s.label}>
                    <div className="stat-top">
                      <span>{s.label}</span>
                      <span className="stat-icon">{s.icon}</span>
                    </div>
                    <strong>{s.value ?? 0}</strong>
                    {s.detail && <small>{s.detail}</small>}
                  </div>
                ))}
              </div>

              <div className="popular-section">
                <div className="section-heading">
                  <div>
                    <h2>Most popular content</h2>
                    <p>Your most viewed stories.</p>
                  </div>
                  <button className="small" onClick={() => setTab('content')}>
                    View all content →
                  </button>
                </div>

                {stats.popular?.length ? (
                  <div className="popular-list">
                    {stats.popular.map((p, index) => (
                      <div className="popular-item" key={p._id}>
                        <span className="popular-number">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="popular-info">
                          <strong>{p.title}</strong>
                          <small>{p.views} views · {p.likesCount} likes</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No popular content yet. Publish your first story!</p>
                )}
              </div>
            </>
          )}
        </>
      )}

      {tab === 'content' && (
        <>
          <div className="section-heading">
            <div>
              <h2>My content</h2>
              <p>Manage and organise all your published stories and drafts.</p>
            </div>
            <button
              className="dashboard-add"
              onClick={() => {
                setForm(emptyForm);
                setEditingId(null);
                setTab('form');
              }}
            >
              + Add new
            </button>
          </div>

          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Content title</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Publish date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contents.map(c => (
                  <tr key={c._id}>
                    <td>
                      <strong>{c.title}</strong>
                    </td>
                    <td>{c.category}</td>
                    <td>{c.contentType}</td>
                    <td>
                      <span className={`status ${c.status}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{formatDate(c.publishDate)}</td>
                    <td className="table-actions">
                      <button className="small" onClick={() => edit(c)}>
                        Edit
                      </button>
                      <button className="small danger" onClick={() => remove(c)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {contents.length === 0 && (
              <div className="dashboard-empty">
                <span>▤</span>
                <h3>No content created yet</h3>
                <p>Start sharing your stories with the world.</p>
                <button className="dashboard-add" onClick={() => setTab('form')}>
                  Create your first post
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'form' && (
        <>
          <div className="section-heading">
            <div>
              <h2>{editingId ? 'Edit content' : 'Create new content'}</h2>
              <p>Prepare your story and choose when it should be published.</p>
            </div>
          </div>

          <form onSubmit={save} className="dashboard-editor">

            <div className="editor-section">
              <h3>Story information</h3>
              <p>Give your content a clear title and description.</p>

              <label>
                Content title
                <input
                  value={form.title}
                  onChange={e => updateField('title', e.target.value)}
                  placeholder="Enter an engaging title"
                  required
                  maxLength={150}
                />
              </label>

              <label>
                Short description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => updateField('description', e.target.value)}
                  placeholder="Briefly describe your story..."
                  required
                  maxLength={500}
                />
              </label>

              <div className="row">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={e => updateField('category', e.target.value)}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>

                <label>
                  Content type
                  <select
                    value={form.contentType}
                    onChange={e => updateField('contentType', e.target.value)}
                  >
                    {TYPES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <div className="editor-section">
              <h3>Media and resources</h3>
              <p>Add an image and any related media links.</p>

              <label>
                Thumbnail image URL
                <input
                  type="url"
                  value={form.thumbnailUrl}
                  onChange={e => updateField('thumbnailUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </label>

              <label>
                Media URL
                <input
                  type="url"
                  value={form.mediaUrl}
                  onChange={e => updateField('mediaUrl', e.target.value)}
                  placeholder="Video, podcast or source link"
                />
              </label>

              {form.contentType === 'article' && (
                <label>
                  Full article text
                  <textarea
                    rows={9}
                    value={form.articleBody}
                    onChange={e => updateField('articleBody', e.target.value)}
                    placeholder="Write your full article here..."
                  />
                </label>
              )}
            </div>

            <div className="editor-section">
              <h3>Publishing settings</h3>
              <p>Choose the publication status and schedule.</p>

              <div className="row">
                <label>
                  Publication status
                  <select
                    value={form.status}
                    onChange={e => updateField('status', e.target.value)}
                  >
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Scheduled</option>
                  </select>
                </label>

                <label>
                  Publish date and time
                  <input
                    type="datetime-local"
                    value={form.publishDate}
                    onChange={e => updateField('publishDate', e.target.value)}
                    required={form.status === 'Scheduled'}
                  />
                </label>
              </div>

              <label className="check">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => updateField('isFeatured', e.target.checked)}
                />
                Feature this story on the homepage
              </label>
            </div>

            <div className="editor-actions">
              <button className="dashboard-add" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Publish content'}
              </button>

              <button
                type="button"
                className="btn outline"
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                  setTab('content');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </>
      )}

      {tab === 'comments' && (
        <>
          <div className="section-heading">
            <div>
              <h2>Reader comments</h2>
              <p>Review and moderate comments from your audience.</p>
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="dashboard-empty">
              <span>☷</span>
              <h3>No comments yet</h3>
              <p>Reader comments will appear here.</p>
            </div>
          ) : (
            <div className="dashboard-comments">
              {comments.map(c => (
                <div key={c._id} className="dashboard-comment">
                  <div className="comment-heading">
                    <div>
                      <strong>{c.displayName}</strong>
                      <small>On: {c.contentId?.title || 'Deleted content'}</small>
                    </div>
                    <span className={`status ${c.status}`}>{c.status}</span>
                  </div>

                  <p>{c.text}</p>

                  <div className="comment-actions">
                    <button
                      className="small"
                      onClick={() => setStatus(c._id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="small"
                      onClick={() => setStatus(c._id, 'hidden')}
                    >
                      Hide
                    </button>
                    <button
                      className="small danger"
                      onClick={() => removeComment(c._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}
