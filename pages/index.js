import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/index.module.css';

export default function Home() {
  const [dot, setDot] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!dot.trim()) {
      setError('Please enter a DOT number.');
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/getData?dot=${dot}`);
      const data = await res.json();

      if (res.ok && data.row) {
        router.push(`/view?dot=${dot}`);
      } else {
        setError("Sorry, your DOT number isn't found.");
      }
    } catch (err) {
      console.error("Error fetching DOT data:", err);
      setError("Sorry, your DOT number isn't found.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Truck Insurance Quote</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Truck Insurance Quote</h1>
        <p className={styles.subtitle}>Enter your DOT number:</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="DOT number"
            value={dot}
            onChange={(e) => setDot(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button} disabled={isSearching}>
            {isSearching && <span className={styles.spinner}></span>}
            {isSearching ? ' Searching...' : 'Search'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </main>
    </div>
  );
}
