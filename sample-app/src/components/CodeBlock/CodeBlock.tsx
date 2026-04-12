import { useState } from 'react';
import './CodeBlock.css';

type CodeBlockProps = {
  code: string;
  language?: string;
  filename?: string;
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'tsx', filename }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-filename">{filename ?? language}</span>
        <button className="btn btn-ghost btn-sm code-block-copy" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="code-block-body"><code>{code}</code></pre>
    </div>
  );
};

export default CodeBlock;
