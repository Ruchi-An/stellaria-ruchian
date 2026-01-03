// Reactのフックをインポート
import { useState } from "react";
import sharedStyles from "./Schedule.shared.module.css";
import styles from "./Schedule.module.css";
import { useSchedules } from "../../lib/useSchedules";
import type { Event } from "../../lib/useSchedules";
import { ScheduleCalendar } from "./ScheduleCalendar";
import { UndefinedScheduleList } from "./UndefinedScheduleList";



// スケジュールページ本体
export function SchedulePage() {
  // 現在日時
  const now = new Date();
  // 表示中の年月
  const [displayDate, setDisplayDate] = useState({ year: now.getFullYear(), month: now.getMonth() });
  // スケジュール一覧・ローディング状態
  const { schedules, loading } = useSchedules();
  // モーダルで表示する選択中イベント
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  // モーダル表示状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 日にち未定セクションの開閉状態
  const [isUndefinedSchedulesOpen, setIsUndefinedSchedulesOpen] = useState(true);
  
  // 今日の日付キー（YYYY-MM-DD）
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // スケジュールデータを日付ごとにグループ化、未定リスト分離
  const eventsByDate: Record<string, Event[]> = {};
  const undefinedSchedules: Event[] = [];
  schedules.forEach((schedule) => {
    if (schedule.play_date) {
      if (!eventsByDate[schedule.play_date]) {
        eventsByDate[schedule.play_date] = [];
      }
      eventsByDate[schedule.play_date].push(schedule);
    } else {
      undefinedSchedules.push(schedule);
    }
  });

  // 表示中の年・月
  const year = displayDate.year;
  const monthIndex = displayDate.month;

  // 前月へ移動
  const handlePrevMonth = () => {
    setDisplayDate((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  // 次月へ移動
  const handleNextMonth = () => {
    setDisplayDate((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // 年選択変更
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayDate((prev) => ({
      ...prev,
      year: parseInt(e.target.value, 10),
    }));
  };

  // 月選択変更
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayDate((prev) => ({
      ...prev,
      month: parseInt(e.target.value, 10),
    }));
  };

  // 年のドロップダウン選択肢を生成（過去3年から未来3年）
  const currentYear = now.getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  // イベントクリック時のモーダル表示処理
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // 画面描画
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
            <p className={sharedStyles.loadingMessage}>読み込み中...</p>
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
            {/* カレンダー部分を分離コンポーネントで表示 */}
            <ScheduleCalendar
              year={year}
              monthIndex={monthIndex}
              todayKey={todayKey}
              eventsByDate={eventsByDate}
              onEventClick={handleEventClick}
            />
          </div>
        </section>
      )}

      {/* 日にち未定の予定リスト部分を分離コンポーネントで表示 */}
      <UndefinedScheduleList
        undefinedSchedules={undefinedSchedules}
        isOpen={isUndefinedSchedulesOpen}
        onToggle={() => setIsUndefinedSchedulesOpen(!isUndefinedSchedulesOpen)}
        onEventClick={handleEventClick}
      />

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
