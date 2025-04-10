import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/view.module.css';

export default function ViewPage() {
  const router = useRouter();
  const { dot } = router.query;
  const [row, setRow] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
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
        .catch((err) => {
          console.error(err);
          setError("Error fetching data");
        });
    }
  }, [router.isReady, dot]);

  if (!router.isReady) return null;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!row) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>View Client Data</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className={styles.main}>
        <h1>Client Data for DOT: {dot}</h1>
        <div className={styles.card}>
          {/* New left-aligned content block */}
          <div className={styles.leftContent}>
            {Object.entries(row).map(([key, value]) => {
              if (!value) return null;
              return (
                <p key={key}>
                  <strong>{key}:</strong> {value}
                </p>
              );
            })}
          </div>
        </div>
        <Link href={`/edit?dot=${dot}`} className={styles.button}>
          Edit Data
        </Link>
      </main>
    </div>
  );
}
