/**
 * 404 Not Found page.
 */
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container empty-state">
      <h1>404</h1>
      <p>Page not found. The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
}
