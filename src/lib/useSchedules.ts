import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// スケジュールイベントの型定義
export type Event = {
  id?: number; // データベースID（オプショナル）
  title: string; // イベントタイトル
  play_date: string; // 開催日（YYYY-MM-DD形式）
  start_time: string | null; // 開始時刻（HH:MM形式 or null）
  end_time: string | null; // 終了時刻（HH:MM形式 or null）
  type: string | null; // イベントタイプ（絵文字アイコン等）
  category: string | null; // カテゴリ（絵文字アイコン等）
  game_name: string | null; // ゲーム名
  memo: string | null; // メモ・備考
};

// データベースから取得したスケジュールデータの型（IDが必須）
export type ScheduleData = Event & { id: number };

/**
 * スケジュールデータを取得するカスタムフック
 * @returns schedules - スケジュールデータの配列, loading - 読み込み中フラグ, error - エラー情報
 */
export function useSchedules() {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Supabaseからスケジュールデータを取得
        const { data, error } = await supabase
          .from('schedule_datas')
          .select('id, title, play_date, start_time, end_time, type, category, game_name, memo')
          .order('play_date', { ascending: true });
          
        if (error) {
          setError(error);
        } else {
          setSchedules(data || []);
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedules();
  }, []);

  return { schedules, loading, error };
}
