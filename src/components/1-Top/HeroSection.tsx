import { useEffect, useState } from 'react';
import styles from './HeroSection.module.css';
import { supabase } from '../../lib/supabaseClient';

type ScheduleItem = {
  id: number;
  title: string;
  play_date: string;
  start_time: string | null;
  end_time: string | null;
  category: string | null;
  memo: string | null;
};

function formatTodayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTimeCategory(timeStr: string | null): 'morning' | 'afternoon' | 'evening' | 'late-night' | 'undefined' {
  if (!timeStr || timeStr === '未定') return 'undefined';
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 'undefined';
  const hour = parseInt(match[1], 10);
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  if (hour >= 24 && hour < 30) return 'late-night';
  return 'undefined';
}

export default function HeroSection() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        setLoading(true);
        const todayKey = formatTodayKey(new Date());
        const { data, error } = await supabase
          .from('schedule_datas')
          .select('id, title, play_date, start_time, end_time, category, memo')
          .eq('play_date', todayKey)
          .order('start_time', { ascending: true });

        if (error) {
          console.error('Error fetching today schedule:', error);
          setItems([]);
        } else {
          setItems(data || []);
        }
      } catch (e) {
        console.error('Error:', e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchToday();
  }, []);

  const getDisplays = (it: ScheduleItem) => {
    const startLabel = it.start_time || '未定';
    const timeDisplay = it.end_time ? `${startLabel}-${it.end_time}` : startLabel;
    const categoryDisplay = it.category || '';
    const titleDisplay = categoryDisplay ? `${categoryDisplay} ${it.title}` : it.title;
    return { timeDisplay, titleDisplay };
  };

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroImageWrap}>
        <img
          src="/サムネ-準備中.png"
          alt="トップページサムネイル"
          className={styles.topHeroImage}
        />

        <div className={styles.overlay}>
          <div className={styles.scheduleLabel}>
            <span className={styles.scheduleIcon}>✦</span>
            <span className={styles.scheduleLabelText}>Today's Schedule</span>
            <span className={styles.scheduleIcon}>✦</span>
          </div>

          <div className={styles.scheduleCard}>
            {loading ? (
              <div className={styles.emptyState}>読み込み中...</div>
            ) : items.length === 0 ? (
              <div className={styles.emptyState}>本日の予定はありません</div>
            ) : (
              <ul className={styles.scheduleList}>
                {items.map((it) => {
                  const { timeDisplay, titleDisplay } = getDisplays(it);
                  const timeCategory = getTimeCategory(it.start_time);
                  return (
                    <li key={it.id} className={styles.scheduleItem}>
                      <div className={styles.itemBody}>
                        <div className={`${styles.itemTime} ${styles[`time-${timeCategory}`]}`}>{timeDisplay}</div>
                        <div className={styles.itemTitle}>{titleDisplay}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
