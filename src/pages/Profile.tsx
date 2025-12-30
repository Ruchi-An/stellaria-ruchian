import styles from "./Profile.module.css";

export function ProfilePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>✦</span>
          <h1 className={styles.title}>PROFILE</h1>
          <span className={styles.titleIcon}>✦</span>
        </div>
      </section>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px" }}>
        <p style={{ opacity: 0.85, marginTop: 8 }}>
          まだ未実装です！！！
          あ、夕星るちあ（せきせいるちあ）といいます！！！
          よろしくお願いします！！！
        </p>
      </div>
    </main>
  );
}
