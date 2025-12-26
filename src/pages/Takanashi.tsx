import styles from "./Takanashi.module.css";

export function TakanashiPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>✦</span>
          <h1 className={styles.title}>TAKANASHI</h1>
          <span className={styles.titleIcon}>✦</span>
        </div>
      </section>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px" }}>
        <p style={{ opacity: 0.85, marginTop: 8 }}>
          鷹梨に関するアーカイブ、企画、ラフ案などを掲載します。
        </p>
        <section style={{ marginTop: 24 }}>
          <div style={{ background: "#143a95", padding: 16, borderRadius: 10 }}>
            <strong>例</strong>
            <ul style={{ marginTop: 8 }}>
              <li>キャラクタービジュアル案</li>
              <li>ショートストーリー</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
