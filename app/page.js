import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <h1 className={styles.title}>FreeAgents</h1>
          <p className={styles.subtitle}>
            Connect with elite freelance sports talent. Secure payments, dynamic listings, and vibrant community integration.
          </p>
        </header>

        <div className={styles.cta}>
          <Link href="/pricing" className={styles.primaryBtn}>
            Explore Pricing
          </Link>
          <Link href="/auth/signin" className={styles.secondaryBtn}>
            Sign In
          </Link>
        </div>

        <p className={styles.notice}>
          Sign-up & Sign-in — <strong>Coming Soon</strong><br />
          <span>Currently only functional for admins</span>
        </p>

        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>Why Choose FreeAgents Platform?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>🔒</div>
              <h3>Secure Payments</h3>
              <p>Escrow system, milestone payments & bank-grade encryption</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>⚡</div>
              <h3>Dynamic Listings</h3>
              <p>Real-time availability, smart matching & instant updates</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>🌟</div>
              <h3>Vibrant Community</h3>
              <p>Built-in messaging, reviews, portfolios & reputation system</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
