import { Link } from 'react-router-dom';
import { formatDate } from './api.js';

// One card in the content list
export function ContentCard({ item }) {
  return (
    <Link to={`/content/${item._id}`} className="card">
      {item.thumbnailUrl ? (
        <img src={item.thumbnailUrl} alt={item.title} className="card-img" />
      ) : (
        <div className="card-img placeholder">{item.category}</div>
      )}
      <div className="card-body">
        <span className="tag">{item.category}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <small>{formatDate(item.publishDate)} | {item.views} views | {item.likesCount} likes</small>
      </div>
    </Link>
  );
}
