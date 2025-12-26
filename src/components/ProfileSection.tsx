import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import styles from './ProfileSection.module.css';

export function ProfileSection() {
  const sectionStyle = { '--float-delay': '0.4s' } as CSSProperties;

  return (
    <section
      className="floatingSection cardSection"
      style={sectionStyle}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className={styles.labelRow}>
          <span className={styles.labelIcon}>✦</span>
          <span className={styles.labelText}>Profile</span>
          <span className={styles.labelIcon}>✦</span>
        </div>
        <p style={{ opacity: 0.85, marginTop: 8 }}>
          プロフィール、活動履歴、リンク集などを掲載します。
        </p>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/profile" className="detailButton">
            VIEW MORE
          </Link>
        </div>
      </div>
    </section>
  );
}
