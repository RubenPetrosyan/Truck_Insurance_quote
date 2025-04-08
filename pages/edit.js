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
        .then(res => res.json())
        .then(({ row }) => setData(row))
        .catch(console.error);
    }
  }, [dot]);

  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/updateData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setMsg(result.message || 'Updated');
    setSaving(false);
  };

  if (!data) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      {Object.keys(data).map((key) => (
        <div key={key}>
          <label>{key}:</label>
          <input
            type="text"
            name={key}
            value={data[key]}
            onChange={handleChange}
            disabled={key === 'DOT'} // Keep identifier read-only
          />
        </div>
      ))}
      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Submit'}
      </button>
      {msg && <p>{msg}</p>}
    </form>
  );
}