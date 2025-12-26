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
          自己紹介、活動履歴、SNS・リンクなどをまとめます。
        </p>
        <section style={{ marginTop: 24 }}>
          <div style={{ background: "rgba(15, 47, 128, 0.6)", padding: 16, borderRadius: 10 }}>
            <strong>例</strong>
            <ul style={{ marginTop: 8 }}>
              <li>略歴</li>
              <li>受賞/出演情報</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
