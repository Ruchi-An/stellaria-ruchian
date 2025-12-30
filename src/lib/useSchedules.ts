import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export type Event = {
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

export type ScheduleData = Event & { id: number };

export function useSchedules() {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
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
