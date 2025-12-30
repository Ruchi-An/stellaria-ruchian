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
          まだ未実装です！！
          小鳥遊村に関することを載せたい思い！！！
        </p>
      </div>
    </main>
  );
}
