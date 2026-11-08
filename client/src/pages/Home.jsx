import { useEffect, useState } from 'react';
import { api, CATEGORIES } from '../api.js';
import { ContentCard } from '../components.jsx';

export default function Home() {
  const [creator, setCreator] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Creator profile and featured content load once
  useEffect(() => {
    api('/api/auth/creator').then(setCreator).catch(() => {});
    api('/api/contents?featured=true').then(setFeatured).catch(() => {});
  }, []);

  // The list reloads when the search text or category changes
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api(`/api/contents?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`)
        .then(data => { setItems(data); setError(''); })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, category]);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          {creator?.avatarUrl ? (
            <img src={creator.avatarUrl} alt={creator.name} className="avatar" />
          ) : (
            <div className="avatar avatar-text">{(creator?.name || 'LV')[0]}</div>
          )}
          <div>
            <h1>{creator?.name || 'Lesotho Voices'}</h1>
            <p>{creator?.bio || 'Stories, culture and current affairs from Lesotho.'}</p>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container">
          <h2>Featured</h2>
          <div className="grid">{featured.map(i => <ContentCard key={i._id} item={i} />)}</div>
        </section>
      )}

      <section className="container">
        <h2>Latest content</h2>
        <input
          className="search"
          type="search"
          placeholder="Search by title or keyword"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="chips">
          {['All', ...CATEGORIES].map(c => (
            <button key={c} className={c === category ? 'chip active' : 'chip'} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        {loading ? <p>Loading...</p> : items.length === 0 ? (
          <p>No content found. Try another search or category.</p>
        ) : (
          <div className="grid">{items.map(i => <ContentCard key={i._id} item={i} />)}</div>
        )}
      </section>
    </>
  );
}
