import styles from './HeroSection.module.css';

export default function HeroSection() {
  const todayEvents = [
    { time: '20:00', title: 'ASMR 配信', note: 'やさしく囁く冬至スペシャルああああああああああああああああ' },
  ];

  return (
    <section className={styles.heroSection}>
      <div className={styles.sectionWrapper}>
        <div className={styles.content}>
          <div className={styles.scheduleLabel}>
            <span className={styles.scheduleIcon}>✦</span>
            <span className={styles.scheduleLabelText}>Today's Schedule</span>
            <span className={styles.scheduleIcon}>✦</span>
          </div>

          <div className={styles.scheduleCard}>
            <ul className={styles.scheduleList}>
              {todayEvents.map((ev, idx) => (
                <li key={idx} className={styles.scheduleItem}>
                  <div className={styles.itemBody}>
                    <div className={styles.itemTitle}>{ev.time} {ev.title}</div>
                    <div className={styles.itemNote}>{ev.note}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
