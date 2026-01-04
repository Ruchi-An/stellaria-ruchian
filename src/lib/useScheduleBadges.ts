import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export type BadgeType = 'stream-off' | 'work-off' | 'tentative';

export type BadgeData = {
  id: number;
  play_date: string;
  badge_type: BadgeType;
  created_at: string;
};

/**
 * スケジュール・バッジデータを取得するカスタムフック
 * @returns badges - バッジデータの配列, loading - 読み込み中フラグ, error - エラー情報, refetch - 再取得関数
 */
export function useScheduleBadges() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('schedule_badges')
        .select('id, play_date, badge_type, created_at')
        .order('play_date', { ascending: true });

      if (fetchError) {
        setError(fetchError);
      } else {
        setBadges(data || []);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  /**
   * バッジを追加する
   */
  const addBadge = async (playDate: string, badgeType: BadgeType) => {
    try {
      const { data, error: insertError } = await supabase
        .from('schedule_badges')
        .insert([{ play_date: playDate, badge_type: badgeType }])
        .select();

      if (insertError) {
        throw insertError;
      }

      if (data) {
        setBadges([...badges, data[0]]);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  /**
   * バッジを削除する
   */
  const removeBadge = async (playDate: string, badgeType: BadgeType) => {
    try {
      const { error: deleteError } = await supabase
        .from('schedule_badges')
        .delete()
        .eq('play_date', playDate)
        .eq('badge_type', badgeType);

      if (deleteError) {
        throw deleteError;
      }

      setBadges(badges.filter(b => !(b.play_date === playDate && b.badge_type === badgeType)));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  /**
   * 指定された日付のバッジを取得
   */
  const getBadgesForDate = (playDate: string): BadgeType[] => {
    return badges
      .filter(b => b.play_date === playDate)
      .map(b => b.badge_type);
  };

  return {
    badges,
    loading,
    error,
    refetch: fetchBadges,
    addBadge,
    removeBadge,
    getBadgesForDate,
  };
}
