import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ViewData() {
  const router = useRouter();
  const { dot } = router.query;
  const [data, setData] = useState(null);
  
  useEffect(() => {
    if (dot) {
      fetch(`/api/getData?dot=${dot}`)
        .then((res) => res.json())
        .then(({ row }) => setData(row))
        .catch((err) => console.error(err));
    }
  }, [dot]);
  
  if (!data) return <div className="loading">Loading...</div>;
  
  return (
    <div className="container">
      <h1>Client Information</h1>
      <div className="card">
        {Object.keys(data).map((key) => (
          <p key={key}>
            <strong>{key}:</strong> {data[key]}
          </p>
        ))}
      </div>
      <div className="actions">
        <Link href={`/edit?dot=${data.DOT}`}>
          <button className="edit-btn">Edit</button>
        </Link>
      </div>
  
      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 1rem;
          font-family: Arial, sans-serif;
          background: #fafafa;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
          text-align: center;
          color: #333;
        }
        .card {
          margin: 1rem 0;
          padding: 1rem;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        p {
          margin: 0.5rem 0;
          font-size: 1rem;
          color: #555;
        }
        .actions {
          text-align: center;
          margin-top: 1rem;
        }
        .edit-btn {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          background-color: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .edit-btn:hover {
          background-color: #005bb5;
        }
        .loading {
          text-align: center;
          padding: 2rem;
          font-size: 1.2rem;
        }
        @media (max-width: 600px) {
          .container {
            margin: 1rem;
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}