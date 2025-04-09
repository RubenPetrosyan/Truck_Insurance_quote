import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import '../styles/edit.module.css';

export default function Edit() {
  const router = useRouter();
  const { dot } = router.query;
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Fetch client data using the dot identifier when available
  useEffect(() => {
    if (dot) {
      fetch(`/api/getData?dot=${dot}`)
        .then((res) => res.json())
        .then(({ row }) => setData(row))
        .catch((err) => console.error(err));
    }
  }, [dot]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

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
    <div className="edit-container">
      <Head>
        <title>Edit Client Data</title>
      </Head>
      <h1>Edit Client Information</h1>
      <form onSubmit={handleSubmit} className="edit-form">
        {Object.keys(data).map((key) => (
          <div className="form-group" key={key}>
            <label htmlFor={key}>{key}:</label>
            <input
              id={key}
              name={key}
              type="text"
              value={data[key]}
              onChange={handleChange}
              // Disable editing for the URL field
              disabled={key === 'URL'}
            />
          </div>
        ))}
        <button type="submit" disabled={saving} className="submit-btn">
          {saving ? 'Saving...' : 'Submit'}
        </button>
        {msg && <p className="message">{msg}</p>}
      </form>
    </div>
  );
}