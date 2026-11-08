

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, getViewerId, formatDate } from '../api.js';

export default function ContentDetails() {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ text: '' });

  const viewerToken = localStorage.getItem('viewerToken');
  const viewer = JSON.parse(localStorage.getItem('viewer') || 'null');

  useEffect(() => {
    api(`/api/contents/${id}`)
      .then(setItem)
      .catch(e => setError(e.message));

    api(`/api/comments/${id}`)
      .then(setComments)
      .catch(() => {});

    api(`/api/likes/${id}?viewerId=${getViewerId()}`)
      .then(d => setLiked(d.liked))
      .catch(() => {});
  }, [id]);

  // Like or unlike content
  const toggleLike = async () => {
    try {
      const d = await api('/api/likes', {
        method: 'POST',
        body: JSON.stringify({
          contentId: id,
          viewerId: getViewerId()
        })
      });

      setLiked(d.liked);
      setItem(prev => ({ ...prev, likesCount: d.likesCount }));
    } catch (e) {
      setMsg(e.message);
    }
  };

  // Share content
  const share = async () => {
    const link = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          url: link
        });
      } else {
        await navigator.clipboard.writeText(link);
        setMsg('Link copied');
      }
    } catch {
      // User cancelled sharing
    }
  };

  // Submit comment - registered viewers only
  const submitComment = async e => {
    e.preventDefault();
    setMsg('');

    if (!viewerToken) {
      setMsg('Please log in or register before commenting.');
      return;
    }

    try {
      const d = await api('/api/comments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${viewerToken}`
        },
        body: JSON.stringify({
          contentId: id,
          text: form.text
        })
      });

      setMsg(d.message);
      setForm({ text: '' });
    } catch (err) {
      setMsg(err.message);
    }
  };

  // Error and loading states
  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container narrow">

      <Link to="/"> &larr; Back to all content</Link>

      <span className="tag top">{item.category}</span>

      <h1>{item.title}</h1>

      <p className="meta">
        {formatDate(item.publishDate)} | {item.contentType} | {item.views} views
      </p>

      {item.thumbnailUrl && (
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="detail-img"
        />
      )}

      <p className="lead">{item.description}</p>

      {item.mediaUrl && (
        <p>
          <a
            className="btn"
            href={item.mediaUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open {item.contentType === 'article' ? 'source' : item.contentType}
          </a>
        </p>
      )}

      {item.articleBody &&
        item.articleBody.split('\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))
      }

      {/* Like and share buttons */}
      <div className="actions">
        <button
          className={liked ? 'btn liked' : 'btn'}
          onClick={toggleLike}
        >
          {liked ? 'Liked' : 'Like'} ({item.likesCount})
        </button>

        <button className="btn outline" onClick={share}>
          Share link
        </button>
      </div>

      {/* Comments section */}
      <h2>Comments ({comments.length})</h2>

      {/* Registered viewer comment form */}
      {viewerToken ? (
        <form onSubmit={submitComment} className="form">

          <p>
            Commenting as{' '}
            <strong>
              {viewer?.displayName || 'Registered viewer'}
            </strong>
          </p>

          <textarea
            placeholder="Write a comment"
            value={form.text}
            onChange={e => setForm({ text: e.target.value })}
            required
            maxLength={500}
            rows={3}
          />

          <button className="btn" type="submit">
            Post comment
          </button>

        </form>
      ) : (
        <p>
          Please <Link to="/viewer-login">log in</Link> or{' '}
          <Link to="/register">register</Link> to post a comment.
        </p>
      )}

      {msg && <p className="notice">{msg}</p>}

      {/* Display approved comments */}
      {comments.length === 0 && (
        <p>No comments yet. Be the first.</p>
      )}

      {comments.map(c => (
        <div key={c._id} className="comment">
          <strong>{c.displayName}</strong>{' '}
          <small>{formatDate(c.createdAt)}</small>
          <p>{c.text}</p>
        </div>
      ))}

    </div>
  );
}
