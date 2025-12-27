import { useState, useEffect } from "react";
import styles from "./Schedule.module.css";
import { supabase } from "../lib/supabaseClient";

type CalendarCell = {
  label: string;
  key: string;
  isToday: boolean;
  events: Event[];
  isEmpty: boolean;
};

type Event = {
  id?: number;
  title: string;
  play_date: string;
  start_time: string | null;
  end_time: string | null;
  type: string | null;
  category: string | null;
  game_name: string | null;
  memo: string | null;
};

type ScheduleData = {
  id: number;
  title: string;
  play_date: string;
  start_time: string | null;
  end_time: string | null;
  type: string | null;
  category: string | null;
  game_name: string | null;
  memo: string | null;
};

const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getTimeCategory(timeStr: string | null): string {
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
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // データベースからスケジュールを取得
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('schedule_datas')
          .select('id, title, play_date, start_time, end_time, type, category, game_name, memo')
          .order('play_date', { ascending: true });

        if (error) {
          console.error('Error fetching schedules:', error);
        } else {
          setSchedules(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // スケジュールデータを日付ごとにグループ化
  const eventsByDate: Record<string, Event[]> = {};
  schedules.forEach((schedule) => {
    if (schedule.play_date) {
      if (!eventsByDate[schedule.play_date]) {
        eventsByDate[schedule.play_date] = [];
      }
      eventsByDate[schedule.play_date].push({
        id: schedule.id,
        title: schedule.title,
        play_date: schedule.play_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        type: schedule.type,
        category: schedule.category,
        game_name: schedule.game_name,
        memo: schedule.memo,
      });
    }
  });

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
      events: eventsByDate[dateKey] ?? [],
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

  // モーダル処理
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>✦</span>
          <h1 className={styles.title}>SCHEDULE</h1>
          <span className={styles.titleIcon}>✦</span>
        </div>
      </section>

      {loading ? (
        <section className={styles.calendarSection}>
          <div className={styles.calendarCard}>
            <p style={{ textAlign: 'center', padding: '2rem' }}>読み込み中...</p>
          </div>
        </section>
      ) : (
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
                        const timeCategory = getTimeCategory(event.start_time);
                        const timeDisplay = event.start_time || "未定";
                        return (
                          <li 
                            key={`${event.id}-${event.title}`} 
                            className={`${styles.eventChip} ${styles[`event-${timeCategory}`]}`}
                            onClick={() => handleEventClick(event)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleEventClick(event);
                              }
                            }}
                          >
                            {event.title} — {timeDisplay}
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
      )}

      {/* モーダル */}
      {isModalOpen && selectedEvent && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={handleCloseModal} aria-label="閉じる">
              ✕
            </button>
            <h2 className={styles.modalTitle}>{selectedEvent.title}</h2>
            <div className={styles.modalBody}>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>日付:</span>
                <span className={styles.modalValue}>{selectedEvent.play_date}</span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>開始時刻:</span>
                <span className={styles.modalValue}>{selectedEvent.start_time || '未定'}</span>
              </div>
              {selectedEvent.end_time && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>終了時刻:</span>
                  <span className={styles.modalValue}>{selectedEvent.end_time}</span>
                </div>
              )}
              {selectedEvent.type && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>タイプ:</span>
                  <span className={styles.modalValue}>{selectedEvent.type}</span>
                </div>
              )}
              {selectedEvent.category && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>カテゴリ:</span>
                  <span className={styles.modalValue}>{selectedEvent.category}</span>
                </div>
              )}
              {selectedEvent.game_name && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>ゲーム:</span>
                  <span className={styles.modalValue}>{selectedEvent.game_name}</span>
                </div>
              )}
              {selectedEvent.memo && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>メモ:</span>
                  <span className={styles.modalValue}>{selectedEvent.memo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
