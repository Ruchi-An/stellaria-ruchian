import { useState, useEffect } from "react";
import Holidays from "date-holidays";
import styles from "./ScheduleAdmin.module.css";
import { supabase } from "../lib/supabaseClient";

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

// タイプとカテゴリの定義
const TYPE_OPTIONS = ["🎮", "📚", "🌏"];

const CATEGORY_OPTIONS: Record<string, string[]> = {
  "🎮": ["🤪", "🚀", "🍎", "🐺", "🔍", "🪿", "🫖", "🚙", "🛸", "⛄", "👻", "💳", "👤"],
  "📚": ["📕", "📗", "📘", "📙"],
  "🌏": ["🌏"],
};

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

export function ScheduleAdminPage() {
  const now = new Date();
  const [displayDate, setDisplayDate] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [_selectedDate, setSelectedDate] = useState<string>("");
  const [gameNames, setGameNames] = useState<string[]>([]);
  const holidays = new Holidays('JP');
  
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // フォーム用の状態
  const [formData, setFormData] = useState({
    title: "",
    play_date: "",
    start_time: "",
    end_time: "",
    type: "",
    category: "",
    game_name: "",
    memo: "",
  });

  // データベースからスケジュールを取得
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
        // 過去のゲーム名を抽出(重複を除去)
        const uniqueGames = Array.from(new Set(
          (data || []).map(s => s.game_name).filter((name): name is string => !!name)
        )).sort();
        setGameNames(uniqueGames);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // 日付セルをクリック（新規追加）
  const handleCellClick = (dateKey: string) => {
    setSelectedDate(dateKey);
    setEditingEvent(null);
    setFormData({
      title: "",
      play_date: dateKey,
      start_time: "",
      end_time: "",
      type: "",
      category: "",
      game_name: "",
      memo: "",
    });
    setIsEditModalOpen(true);
  };

  // 新規作成ボタンをクリック
  const handleCreateNew = () => {
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setSelectedDate(today);
    setEditingEvent(null);
    setFormData({
      title: "",
      play_date: today,
      start_time: "",
      end_time: "",
      type: "",
      category: "",
      game_name: "",
      memo: "",
    });
    setIsEditModalOpen(true);
  };

  // 既存イベントをクリック（編集）
  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation(); // 日付セルのクリックイベントを防ぐ
    setEditingEvent(event);
    setSelectedDate(event.play_date);
    setFormData({
      title: event.title,
      play_date: event.play_date,
      start_time: event.start_time || "",
      end_time: event.end_time || "",
      type: event.type || "",
      category: event.category || "",
      game_name: event.game_name || "",
      memo: event.memo || "",
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEvent(null);
    setSelectedDate("");
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 保存処理
  const handleSave = async () => {
    try {
      const dataToSave = {
        title: formData.title,
        play_date: formData.play_date,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        type: formData.type || null,
        category: formData.category || null,
        game_name: formData.game_name || null,
        memo: formData.memo || null,
      };

      if (editingEvent && editingEvent.id) {
        // 更新
        const { error } = await supabase
          .from('schedule_datas')
          .update(dataToSave)
          .eq('id', editingEvent.id);

        if (error) {
          console.error('Error updating schedule:', error);
          alert('更新に失敗しました');
          return;
        }
        alert('更新しました');
      } else {
        // 新規追加
        const { error } = await supabase
          .from('schedule_datas')
          .insert([dataToSave]);

        if (error) {
          console.error('Error inserting schedule:', error);
          alert('追加に失敗しました');
          return;
        }
        alert('追加しました');
      }

      // 再取得
      await fetchSchedules();
      handleCloseEditModal();
    } catch (err) {
      console.error('Save error:', err);
      alert('エラーが発生しました');
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!editingEvent || !editingEvent.id) return;
    
    if (!confirm('本当に削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('schedule_datas')
        .delete()
        .eq('id', editingEvent.id);

      if (error) {
        console.error('Error deleting schedule:', error);
        alert('削除に失敗しました');
        return;
      }

      alert('削除しました');
      await fetchSchedules();
      handleCloseEditModal();
    } catch (err) {
      console.error('Delete error:', err);
      alert('エラーが発生しました');
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>✦</span>
          <h1 className={styles.title}>SCHEDULE ADMIN</h1>
          <span className={styles.titleIcon}>✦</span>
        </div>
        <p className={styles.subtitle}>管理者専用 - スケジュール編集ページ</p>
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
            <button 
              className={styles.createButton}
              onClick={handleCreateNew}
              aria-label="新規作成"
              title="新しいスケジュールを作成"
            >
              ＋
            </button>
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
              if (!cell.isEmpty) classNames.push(styles.clickable);

              return (
                <div 
                  key={cell.key} 
                  className={classNames.join(" ")}
                  onClick={() => !cell.isEmpty && handleCellClick(cell.key)}
                >
                  {(() => {
                    const dateClasses = [styles.dateNumber];
                    if (cell.isHoliday) {
                      dateClasses.push(styles.holidayDate);
                    } else if (cell.weekday === 0) {
                      dateClasses.push(styles.sundayDate);
                    } else if (cell.weekday === 6) {
                      dateClasses.push(styles.saturdayDate);
                    }
                    return <span className={dateClasses.join(' ')}>{cell.label}</span>;
                  })()}
                  {cell.events.length > 0 && (
                    <ul className={styles.eventList}>
                      {cell.events.map((event) => {
                        const timeCategory = getTimeCategory(event.start_time);
                        const startLabel = event.start_time || "未定";
                        const timeDisplay = event.end_time ? `${startLabel}-${event.end_time}` : startLabel;
                        const categoryDisplay = event.category || "未分類";
                        return (
                          <li 
                            key={`${event.id}-${event.title}`} 
                            className={`${styles.eventChip} ${styles[`event-${timeCategory}`]}`}
                            onClick={(e) => handleEventClick(event, e)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleEventClick(event, e as unknown as React.MouseEvent);
                              }
                            }}
                          >
                            <div className={styles.eventText}>
                              <span className={styles.eventTitleRow}>
                                <span
                                  className={styles.eventCategory}
                                  title={categoryDisplay}
                                >
                                  {categoryDisplay}
                                </span>
                                {event.title && (
                                  <span
                                    className={styles.eventTitle}
                                    title={event.title}
                                  >
                                    {event.title}
                                  </span>
                                )}
                              </span>
                              <span className={styles.eventTime}>（{timeDisplay}）</span>
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

      {/* 編集モーダル */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseEditModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={handleCloseEditModal} aria-label="閉じる">
              ✕
            </button>
            <h2 className={styles.modalTitle}>
              {editingEvent ? 'スケジュール編集' : '新規スケジュール追加'}
            </h2>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>タイトル *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className={styles.formInput}
                  placeholder="タイトルを入力"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>日付 *</label>
                <input
                  type="date"
                  name="play_date"
                  value={formData.play_date}
                  onChange={handleFormChange}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>開始時刻</label>
                  <input
                    type="text"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleFormChange}
                    className={styles.formInput}
                    placeholder="例: 21:00 または 25:00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>終了時刻</label>
                  <input
                    type="text"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleFormChange}
                    className={styles.formInput}
                    placeholder="例: 23:00 または 27:00"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>タイプ</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className={styles.formInput}
                  >
                    <option value="">選択してください</option>
                    {TYPE_OPTIONS.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>カテゴリ</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className={styles.formInput}
                    disabled={!formData.type}
                  >
                    <option value="">選択してください</option>
                    {formData.type && CATEGORY_OPTIONS[formData.type] && 
                      CATEGORY_OPTIONS[formData.type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>ゲーム名</label>
                <input
                  type="text"
                  name="game_name"
                  value={formData.game_name}
                  onChange={handleFormChange}
                  className={styles.formInput}
                  list="game-names"
                  placeholder="ゲーム名を入力または選択"
                />
                <datalist id="game-names">
                  {gameNames.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>メモ</label>
                <textarea
                  name="memo"
                  value={formData.memo}
                  onChange={handleFormChange}
                  className={styles.formTextarea}
                  placeholder="メモを入力"
                  rows={3}
                />
              </div>

              <div className={styles.modalActions}>
                {editingEvent && (
                  <button 
                    type="button" 
                    className={styles.deleteButton}
                    onClick={handleDelete}
                  >
                    削除
                  </button>
                )}
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={handleCloseEditModal}
                >
                  キャンセル
                </button>
                <button 
                  type="button" 
                  className={styles.saveButton}
                  onClick={handleSave}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
