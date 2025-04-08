import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import styles from '../styles/view.module.css';

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

  if (!data) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.viewContainer}>
      <Head>
        <title>View Client Data</title>
      </Head>
      <h1>Client Information</h1>
      <div className={styles.card}>
        {Object.keys(data).map((key) => (
          <p key={key}>
            <strong>{key}:</strong> {data[key]}
          </p>
        ))}
      </div>
      <div className={styles.actions}>
        <Link href={`/edit?dot=${data.DOT}`}>
          <button className={styles.editBtn}>Edit</button>
        </Link>
      </div>
    </div>
  );
}