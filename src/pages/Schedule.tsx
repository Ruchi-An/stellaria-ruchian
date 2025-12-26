import { useState } from "react";
import styles from "./Schedule.module.css";

type CalendarCell = {
  label: string;
  key: string;
  isToday: boolean;
  events: Event[];
  isEmpty: boolean;
};

type Event = {
  text: string;
  time: string;
};

const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getTimeCategory(timeStr: string): string {
  if (!timeStr || timeStr === "未定") return "undefined";

  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return "undefined";

  const hour = parseInt(match[1], 10);
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 24) return "evening";
  if (hour >= 0 && hour < 6) return "late-night";
  return "undefined";
}

export function SchedulePage() {
  const now = new Date();
  const [displayDate, setDisplayDate] = useState({ year: now.getFullYear(), month: now.getMonth() });
  
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const sampleEvents: Record<string, Event[]> = {
    [`${now.getFullYear()}-12-24`]: [{ text: "配信予定 A", time: "10:00" }],
    [`${now.getFullYear()}-12-26`]: [{ text: "コラボ予定 B", time: "21:00" }],
    [`${now.getFullYear()}-12-30`]: [{ text: "年末まとめ配信", time: "19:30" }],
  };

  const year = displayDate.year;
  const monthIndex = displayDate.month;

  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  const calendarCells: CalendarCell[] = Array.from({ length: totalCells }, (_, index) => {
    const dateNumber = index - firstDayOfMonth + 1;
    if (dateNumber < 1 || dateNumber > daysInMonth) {
      return {
        key: `empty-${index}`,
        label: "",
        isToday: false,
        events: [],
        isEmpty: true,
      };
    }

    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(dateNumber).padStart(2, "0")}`;

    return {
      key: dateKey,
      label: String(dateNumber),
      isToday: dateKey === todayKey,
      events: sampleEvents[dateKey] ?? [],
      isEmpty: false,
    };
  });

  const handlePrevMonth = () => {
    setDisplayDate((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setDisplayDate((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayDate((prev) => ({
      ...prev,
      year: parseInt(e.target.value, 10),
    }));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayDate((prev) => ({
      ...prev,
      month: parseInt(e.target.value, 10),
    }));
  };

  // 年のドロップダウン選択肢を生成（過去3年から未来3年）
  const currentYear = now.getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>✦</span>
          <h1 className={styles.title}>SCHEDULE</h1>
          <span className={styles.titleIcon}>✦</span>
        </div>
      </section>

      <section className={styles.calendarSection}>
        <div className={styles.calendarCard}>
          <header className={styles.calendarHeader}>
            <div className={styles.legendContainer}>
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendMorning}`} />
                  <span className={styles.legendText}>朝</span>
                </div>
              </div>
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendAfternoon}`} />
                  <span className={styles.legendText}>昼</span>
                </div>
              </div>
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendEvening}`} />
                  <span className={styles.legendText}>夜</span>
                </div>
              </div>
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendLateNight}`} />
                  <span className={styles.legendText}>深夜</span>
                </div>
              </div>
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendUndefined}`} />
                  <span className={styles.legendText}>時間未定</span>
                </div>
              </div>
            </div>
            <div className={styles.dateNavigationContainer}>
              <button 
                className={styles.navButton} 
                onClick={handlePrevMonth}
                aria-label="前月"
              >
                ←
              </button>
              <select
                value={year}
                onChange={handleYearChange}
                className={styles.dateSelector}
                aria-label="年を選択"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}年
                  </option>
                ))}
              </select>
              <select
                value={monthIndex}
                onChange={handleMonthChange}
                className={styles.dateSelector}
                aria-label="月を選択"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i + 1).padStart(2, "0")}月
                  </option>
                ))}
              </select>
              <button 
                className={styles.navButton} 
                onClick={handleNextMonth}
                aria-label="次月"
              >
                →
              </button>
            </div>
          </header>

          <div className={styles.weekRow}>
            {weekdayLabels.map((day) => (
              <span key={day} className={styles.weekLabel}>
                {day}
              </span>
            ))}
          </div>

          <div className={styles.calendarGrid}>
            {calendarCells.map((cell) => {
              const classNames = [styles.dayCell];
              if (cell.isToday) classNames.push(styles.today);
              if (cell.events.length > 0) classNames.push(styles.hasEvent);
              if (cell.isEmpty) classNames.push(styles.empty);

              return (
                <div key={cell.key} className={classNames.join(" ")}>
                  <span className={styles.dateNumber}>{cell.label}</span>
                  {cell.events.length > 0 && (
                    <ul className={styles.eventList}>
                      {cell.events.map((event) => {
                        const timeCategory = getTimeCategory(event.time);
                        return (
                          <li key={event.text} className={`${styles.eventChip} ${styles[`event-${timeCategory}`]}`}>
                            {event.text} — {event.time}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
