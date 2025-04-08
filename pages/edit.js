import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Edit() {
  const router = useRouter();
  const { dot } = router.query;
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (dot) {
      fetch(`/api/getData?dot=${dot}`)
        .then((res) => res.json())
        .then(({ row }) => setData(row))
        .catch((err) => console.error(err));
    }
  }, [dot]);

  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/updateData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setMsg(result.message || 'Updated');
    } catch (error) {
      console.error(error);
      setMsg('An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>Edit Client Information</h1>
      <form onSubmit={handleSubmit} className="form">
        {Object.keys(data).map((key) => (
          <div key={key} className="form-group">
            <label htmlFor={key} className="label">
              {key}
            </label>
            <input
              id={key}
              name={key}
              type="text"
              value={data[key]}
              onChange={handleChange}
              // Disable editing only for the URL
              disabled={key === 'URL'}
              className="input"
            />
          </div>
        ))}
        <button type="submit" disabled={saving} className="button">
          {saving ? 'Saving...' : 'Submit'}
        </button>
        {msg && <p className="message">{msg}</p>}
      </form>
      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 1rem;
          font-family: Arial, sans-serif;
          background: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #333;
        }
        .form {
          display: flex;
          flex-direction: column;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }
        .label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #555;
        }
        .input {
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .input:disabled {
          background-color: #f0f0f0;
        }
        .button {
          padding: 0.75rem 1rem;
          font-size: 1rem;
          background-color: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 1rem;
          align-self: center;
          min-width: 100px;
        }
        .button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .message {
          margin-top: 1rem;
          text-align: center;
          color: green;
        }
        .loading {
          text-align: center;
          padding: 2rem;
          font-size: 1.25rem;
        }
        @media (max-width: 600px) {
          .container {
            margin: 1rem;
            padding: 1rem;
          }
          h1 {
            font-size: 1.25rem;
          }
          .button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
