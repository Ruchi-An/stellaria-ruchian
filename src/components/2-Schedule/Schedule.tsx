import { useState, useEffect } from "react";
import Holidays from "date-holidays";
import sharedStyles from "./Schedule.shared.module.css";
import styles from "./Schedule.module.css";
import { supabase } from "../../lib/supabaseClient";

type CalendarCell = {
  label: string;
  key: string;
  isToday: boolean;
  events: Event[];
  isEmpty: boolean;
  weekday?: number;
  isWeekend?: boolean;
  isHoliday?: boolean;
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
  const [isUndefinedSchedulesOpen, setIsUndefinedSchedulesOpen] = useState(true);
  const holidays = new Holidays('JP');
  
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
  const undefinedSchedules: Event[] = [];
  
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
    } else {
      // play_dateがnull/空の場合は日にち未定として追加
      undefinedSchedules.push({
        id: schedule.id,
        title: schedule.title,
        play_date: schedule.play_date || '',
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
    const dateObj = new Date(year, monthIndex, dateNumber);
    const weekday = dateObj.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const isHoliday = Boolean(holidays.isHoliday(dateObj));

    return {
      key: dateKey,
      label: String(dateNumber),
      isToday: dateKey === todayKey,
      events: eventsByDate[dateKey] ?? [],
      isEmpty: false,
      weekday,
      isWeekend,
      isHoliday,
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
    <main className={sharedStyles.page}>
      <section className={sharedStyles.hero}>
        <div className={sharedStyles.titleRow}>
          <span className={sharedStyles.titleIcon}>✦</span>
          <h1 className={sharedStyles.title}>SCHEDULE</h1>
          <span className={sharedStyles.titleIcon}>✦</span>
        </div>
      </section>

      {loading ? (
        <section className={sharedStyles.calendarSection}>
          <div className={sharedStyles.calendarCard}>
            <p style={{ textAlign: 'center', padding: '2rem' }}>読み込み中...</p>
          </div>
        </section>
      ) : (
        <section className={sharedStyles.calendarSection}>
        <div className={sharedStyles.calendarCard}>
          <header className={sharedStyles.calendarHeader}>
            <div className={sharedStyles.legendContainer}>
              <div className={sharedStyles.legend}>
                <div className={sharedStyles.legendItem}>
                  <span className={`${sharedStyles.legendDot} ${sharedStyles.legendMorning}`} />
                  <span className={sharedStyles.legendText}>朝</span>
                </div>
              </div>
              <div className={sharedStyles.legend}>
                <div className={sharedStyles.legendItem}>
                  <span className={`${sharedStyles.legendDot} ${sharedStyles.legendAfternoon}`} />
                  <span className={sharedStyles.legendText}>昼</span>
                </div>
              </div>
              <div className={sharedStyles.legend}>
                <div className={sharedStyles.legendItem}>
                  <span className={`${sharedStyles.legendDot} ${sharedStyles.legendEvening}`} />
                  <span className={sharedStyles.legendText}>夜</span>
                </div>
              </div>
              <div className={sharedStyles.legend}>
                <div className={sharedStyles.legendItem}>
                  <span className={`${sharedStyles.legendDot} ${sharedStyles.legendLateNight}`} />
                  <span className={sharedStyles.legendText}>深夜</span>
                </div>
              </div>
              <div className={sharedStyles.legend}>
                <div className={sharedStyles.legendItem}>
                  <span className={`${sharedStyles.legendDot} ${sharedStyles.legendUndefined}`} />
                  <span className={sharedStyles.legendText}>時間未定</span>
                </div>
              </div>
            </div>
            <div className={sharedStyles.dateNavigationContainer}>
              <button 
                className={sharedStyles.navButton} 
                onClick={handlePrevMonth}
                aria-label="前月"
              >
                ←
              </button>
              <select
                value={year}
                onChange={handleYearChange}
                className={sharedStyles.dateSelector}
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
                className={sharedStyles.dateSelector}
                aria-label="月を選択"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i + 1).padStart(2, "0")}月
                  </option>
                ))}
              </select>
              <button 
                className={sharedStyles.navButton} 
                onClick={handleNextMonth}
                aria-label="次月"
              >
                →
              </button>
            </div>
          </header>

          <div className={sharedStyles.weekRow}>
            {weekdayLabels.map((day) => (
              <span key={day} className={sharedStyles.weekLabel}>
                {day}
              </span>
            ))}
          </div>

          <div className={sharedStyles.calendarGrid}>
            {calendarCells.map((cell) => {
              const classNames = [sharedStyles.dayCell];
              if (cell.isToday) classNames.push(sharedStyles.today);
              if (cell.events.length > 0) classNames.push(sharedStyles.hasEvent);
              if (cell.isEmpty) classNames.push(sharedStyles.empty);

              return (
                <div key={cell.key} className={classNames.join(" ")}>
                  {(() => {
                    const dateClasses = [sharedStyles.dateNumber];
                    if (cell.isHoliday) {
                      dateClasses.push(sharedStyles.holidayDate);
                    } else if (cell.weekday === 0) {
                      dateClasses.push(sharedStyles.sundayDate);
                    } else if (cell.weekday === 6) {
                      dateClasses.push(sharedStyles.saturdayDate);
                    }
                    return <span className={dateClasses.join(' ')}>{cell.label}</span>;
                  })()}
                  {cell.events.length > 0 && (
                    <ul className={sharedStyles.eventList}>
                      {cell.events.map((event) => {
                        const timeCategory = getTimeCategory(event.start_time);
                        const startLabel = event.start_time || "未定";
                        const timeDisplay = event.end_time ? `${startLabel}-${event.end_time}` : startLabel;
                        const categoryDisplay = event.category || "未分類";
                        return (
                          <li 
                            key={`${event.id}-${event.title}`} 
                            className={`${sharedStyles.eventChip} ${sharedStyles[`event-${timeCategory}`]}`}
                            onClick={() => handleEventClick(event)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleEventClick(event);
                              }
                            }}
                          >
                            <div className={sharedStyles.eventText}>
                              <span className={sharedStyles.eventTitleRow}>
                                <span
                                  className={sharedStyles.eventCategory}
                                  title={categoryDisplay}
                                >
                                  {categoryDisplay}
                                </span>
                                {event.title && (
                                  <span
                                    className={sharedStyles.eventTitle}
                                    title={event.title}
                                  >
                                    {event.title}
                                  </span>
                                )}
                              </span>
                              <span className={sharedStyles.eventTime}>（{timeDisplay}）</span>
                            </div>
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

      {/* 日にち未定の予定セクション */}
      <section className={sharedStyles.calendarSection} style={{ marginTop: '32px' }}>
        <div className={sharedStyles.undefinedSection}>
          <button
            className={sharedStyles.undefinedToggleButton}
            onClick={() => setIsUndefinedSchedulesOpen(!isUndefinedSchedulesOpen)}
            aria-expanded={isUndefinedSchedulesOpen}
          >
            <span className={sharedStyles.toggleIcon}>
              {isUndefinedSchedulesOpen ? '▼' : '▶'}
            </span>
            <span className={sharedStyles.undefinedTitle}>日にち未定の予定</span>
            <span className={sharedStyles.undefinedCount}>({undefinedSchedules.length}件)</span>
          </button>

          {isUndefinedSchedulesOpen && (
            <div className={sharedStyles.undefinedList}>
              {undefinedSchedules.length > 0 ? (
                <ul className={sharedStyles.undefinedItems}>
                  {undefinedSchedules.map((event) => {
                    const categoryDisplay = event.category || '未分類';
                    return (
                      <li 
                        key={`${event.id}-${event.title}`}
                        className={sharedStyles.undefinedItem}
                      >
                        <div 
                          className={sharedStyles.undefinedEventChip}
                          onClick={() => handleEventClick(event)}
                          role="button"
                          tabIndex={0}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleEventClick(event);
                            }
                          }}
                        >
                          <div className={sharedStyles.undefinedEventText}>
                            <span className={sharedStyles.undefinedEventCategory}>
                              {categoryDisplay}
                            </span>
                            {event.title && (
                              <span
                                className={sharedStyles.undefinedEventTitle}
                                title={event.title}
                              >
                                {event.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={sharedStyles.emptyMessage}>日にち未定の予定はありません</p>
              )}
            </div>
          )}
        </div>
      </section>

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
