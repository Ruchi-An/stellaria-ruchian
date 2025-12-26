import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import styles from './TakanashiSection.module.css';

export function TakanashiSection() {
  const sectionStyle = { '--float-delay': '0.3s' } as CSSProperties;

  return (
    <section
      className="floatingSection cardSection"
      style={sectionStyle}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className={styles.labelRow}>
          <span className={styles.labelIcon}>✦</span>
          <span className={styles.labelText}>Takanashi</span>
          <span className={styles.labelIcon}>✦</span>
        </div>
        <p style={{ opacity: 0.85, marginTop: 8 }}>
          鷹梨（たかなしか）関連の企画・作品・メモをまとめます。
        </p>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/takanashi" className="detailButton">
            VIEW MORE
          </Link>
        </div>
      </div>
    </section>
  );
}
