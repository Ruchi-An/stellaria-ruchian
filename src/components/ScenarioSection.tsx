import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import styles from './ScenarioSection.module.css';

export function ScenarioSection() {
  const sectionStyle = { '--float-delay': '0.2s' } as CSSProperties;

  return (
    <section
      className="floatingSection cardSection"
      style={sectionStyle}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className={styles.labelRow}>
          <span className={styles.labelIcon}>✦</span>
          <span className={styles.labelText}>Scenario</span>
          <span className={styles.labelIcon}>✦</span>
        </div>
        <p style={{ opacity: 0.85, marginTop: 8 }}>
          台本・世界観の公開やアーカイブへの導線を置きます。
        </p>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/scenario" className="detailButton">
            PASSED LIST
          </Link>
          <Link to="/scenario" className="detailButton">
            GM LIST
          </Link>
        </div>

      </div>
    </section>
  );
}
