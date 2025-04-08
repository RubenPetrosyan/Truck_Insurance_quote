import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/index.module.css';

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <Head>
        <title>Truck Insurance Quote</title>
      </Head>
      <main>
        <h1>Welcome to Truck Insurance Quote</h1>
        <p>Select an option below:</p>
        <div className={styles.buttonContainer}>
          <Link href="/view?dot=2971998">
            <button className={styles.navButton}>View Data</button>
          </Link>
          <Link href="/edit?dot=2971998">
            <button className={styles.navButton}>Edit Data</button>
          </Link>
        </div>
      </main>
    </div>
  );
}
