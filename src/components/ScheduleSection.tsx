import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import styles from './ScheduleSection.module.css';

export function ScheduleSection() {
  const sectionStyle = { '--float-delay': '0.1s' } as CSSProperties;

  return (
    <section
      className="floatingSection cardSection"
      style={sectionStyle}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className={styles.labelRow}>
          <span className={styles.labelIcon}>✦</span>
          <span className={styles.labelText}>Schedule</span>
          <span className={styles.labelIcon}>✦</span>
        </div>
        <p style={{ opacity: 0.85, marginTop: 8 }}>
          直近のスケジュールや配信予定を掲載します。
        </p>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/schedule" className="detailButton">
            CALENDAR
          </Link>
        </div>
      </div>
    </section>
  );
}
