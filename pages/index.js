import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/index.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Truck Insurance Quote</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Truck Insurance Quote</h1>
        <p className={styles.subtitle}>Select an option below:</p>
        <div className={styles.buttonContainer}>
          <Link href="/view?dot=2971998">
            <a className={styles.button}>View Data</a>
          </Link>
          <Link href="/edit?dot=2971998">
            <a className={styles.button}>Edit Data</a>
          </Link>
        </div>
      </main>
    </div>
  );
}
