import { useState, useEffect } from "react";
import type { ScenarioCard as ScenarioCardType } from "../types/scenario";
import { ScenarioCard } from "../components/ScenarioCard";
import { supabase } from "../lib/supabaseClient";
import styles from "./Scenario.module.css";

export function ScenarioPage() {
  const [cards, setCards] = useState<ScenarioCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tsuka_sinario_list')
          .select('*');

        if (error) throw error;

        const rows = Array.isArray(data) ? data : [];

        // マッピング関数：可能性のある列名を柔軟に対応
        const mapRow = (row: any, index: number): ScenarioCardType => {
          const playDate: string = row.play_date || row.pass_date || row.date || row.passed_on || '';
          const title: string = row.title || row.scenario_title || row.name || 'Untitled';
          const category: string | undefined = row.category || row.scenario_category || undefined;
          const production: string | undefined = row.production || row.maker || undefined;
          const creator: string | undefined = row.creator || row.author || row.created_by || undefined;
          const gmSt: string | undefined = row.gm_st || row.gm || row.st || undefined;
          const playerCharacter: string | undefined = row.player_character || row.pc || row.character || undefined;
          const scenarioUrl: string | undefined = row.scenario_url || row.link || row.scenario_link || undefined;
          const streamUrl: string | undefined = row.stream_url || row.distribution_link || row.stream_link || undefined;
          const cardImageUrl: string | undefined = row.card_image_url || row.image_url || undefined;
          const membersRaw = row.member || row.members || row.members_text || row.member_list || [];
          const members: string[] = Array.isArray(membersRaw)
            ? membersRaw
            : typeof membersRaw === 'string'
              ? membersRaw
                  .split(/[\,\u3001\uFF0C\/／\n]+/)
                  .map((m: string) => m.trim())
                  .filter(Boolean)
              : [];

          // 通過数: テーブルに無ければ日付ソート後の連番を利用
          // 通過日が古い順で連番を振る
          const passNumber: number = index + 1;

          return {
            passNumber,
            title,
            category,
            production,
            creator,
            gmSt,
            playerCharacter,
            playDate,
            members,
            scenarioUrl,
            streamUrl,
            cardImageUrl,
          };
        };

        // 1) 通過日が古い順にソートして連番を採番
        const sortedAsc = [...rows].sort((a: any, b: any) => {
          const ad = new Date(a.play_date || a.pass_date || a.date || a.passed_on || 0).getTime();
          const bd = new Date(b.play_date || b.pass_date || b.date || b.passed_on || 0).getTime();
          return ad - bd;
        });

        const numbered = sortedAsc.map(mapRow);

        // 2) 表示は通過日が新しい順（大きい番号順）
        const displayCards = [...numbered].sort((a, b) => {
          const ad = new Date(a.playDate || 0).getTime();
          const bd = new Date(b.playDate || 0).getTime();
          return bd - ad;
        });

        setCards(displayCards);
      } catch (e) {
        console.error('Failed to load scenario cards:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>✦</span>
          <h1 className={styles.title}>SCENARIO</h1>
          <span className={styles.titleIcon}>✦</span>
        </div>
      </section>

      <div className={styles.container}>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px", opacity: 0.6 }}>
            Loading...
          </div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", opacity: 0.6 }}>
            No scenario cards available yet.
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {cards.map((card) => (
              <ScenarioCard key={card.passNumber} card={card} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
