import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/edit.module.css';

export default function EditPage() {
  const router = useRouter();
  const { dot } = router.query;
  const [row, setRow] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (dot) {
      fetch(`/api/getData?dot=${dot}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.row) {
            setRow(data.row);
          } else {
            setError("Sorry, your DOT number isn't found.");
          }
        })
        .catch(() => setError("Error fetching data"));
    }
  }, [dot]);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!row) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Post updated data to /api/updateData.
    // For now, you can log updated values or display a message.
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Edit Client Data</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className={styles.main}>
        <h1>Edit Client Data for DOT: {dot}</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {Object.entries(row).map(([key, value]) => (
            <div key={key} className={styles.field}>
              <label>{key}</label>
              <input
                type="text"
                defaultValue={value}
                // Optionally handle onChange to update local state
              />
            </div>
          ))}
          <button type="submit" className={styles.button}>
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
}
