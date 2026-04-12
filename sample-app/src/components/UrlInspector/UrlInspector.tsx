import { useState, useEffect } from 'react';
import './UrlInspector.css';

const UrlInspector: React.FC = () => {
  const [url, setUrl] = useState(window.location.href);

  useEffect(() => {
    const update = () => setUrl(window.location.href);
    window.addEventListener('popstate', update);
    const id = setInterval(update, 100);
    return () => {
      window.removeEventListener('popstate', update);
      clearInterval(id);
    };
  }, []);

  const questionMark = url.indexOf('?');
  const base = questionMark === -1 ? url : url.slice(0, questionMark);
  const query = questionMark === -1 ? null : url.slice(questionMark + 1);

  return (
    <div className="url-inspector">
      <span className="url-inspector-label">Live URL</span>
      <div className="url-inspector-bar">
        <span className="url-base">{base}</span>
        {query ? (
          <>
            <span className="url-sep">?</span>
            <span className="url-query">{query}</span>
          </>
        ) : (
          <span className="url-empty">no query params</span>
        )}
      </div>
    </div>
  );
};

export default UrlInspector;
