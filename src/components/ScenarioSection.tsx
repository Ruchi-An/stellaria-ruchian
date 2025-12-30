
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import styles from './ScenarioSection.module.css';
import { useScenarioTabNavigate } from '../lib/useScenarioTabNavigate';

export function ScenarioSection() {
  const sectionStyle = { '--float-delay': '0.2s' } as CSSProperties;
  const goScenarioTab = useScenarioTabNavigate();

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
        <p className={styles.description}>
          シナリオ通過報告リスト、GM可能シナリオリストを掲載します。
        </p>
        <div className={styles.buttonRow} style={{ marginTop: 20 }}>
          <button
            type="button"
            className="detailButton"
            onClick={() => goScenarioTab('passed')}
          >
            PASSED LIST
          </button>
          <button
            type="button"
            className="detailButton"
            onClick={() => goScenarioTab('gm-ready')}
          >
            GM LIST
          </button>
        </div>
      </div>
    </section>
  );
}
