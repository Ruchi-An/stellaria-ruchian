import styles from "./Scenario.module.css";

export function ScenarioPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>✦</span>
          <h1 className={styles.title}>SCENARIO</h1>
          <span className={styles.titleIcon}>✦</span>
        </div>
      </section>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px" }}>
        <p style={{ opacity: 0.85, marginTop: 8 }}>
          ここにシナリオ・設定・台本などの詳細を作成します。
        </p>
        <section style={{ marginTop: 24 }}>
          <div style={{ background: "rgba(15, 47, 128, 0.6)", padding: 16, borderRadius: 10 }}>
            <strong>例</strong>
            <ul style={{ marginTop: 8 }}>
              <li>世界観の概要</li>
              <li>登場キャラクターの設定</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
