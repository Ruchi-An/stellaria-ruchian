
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { ScenarioCard as ScenarioCardType, GMScenarioCard } from "../../types/scenario";
import { ScenarioCard } from "./ScenarioCard";
import { supabase } from "../../lib/supabaseClient";
import styles from "./Scenario.module.css";

type TabType = 'passed' | 'gm-ready';

export function ScenarioPage() {
  const location = useLocation();
  const getInitialTab = (): TabType => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'gm-ready') return 'gm-ready';
    return 'passed';
  };
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());

  // クエリパラメータが変わったらタブも切り替え
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'gm-ready') setActiveTab('gm-ready');
    else setActiveTab('passed');
  }, [location.search]);
  const [cards, setCards] = useState<ScenarioCardType[]>([]);
  const [gmCards, setGmCards] = useState<GMScenarioCard[]>([]);
  const [loading, setLoading] = useState(true);
  // フィルター用ステート
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [gmFilter, setGmFilter] = useState<string>('');
  const [plFilter, setPlFilter] = useState<string>('');
  const [titleSearch, setTitleSearch] = useState<string>('');
  const [memberSearch, setMemberSearch] = useState<string>('');
    // 検索・フィルター表示トグル
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        
        // 通過済みシナリオの取得
        const { data, error } = await supabase
          .from('tsuka_scenario_list')
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

        // GM可能シナリオの取得
        const { data: gmData, error: gmError } = await supabase
          .from('gm_scenario_list')
          .select('*');

        if (gmError) throw gmError;

        const gmRows = Array.isArray(gmData) ? gmData : [];
        const gmScenarios: GMScenarioCard[] = gmRows.map((row: any) => ({
          id: row.id,
          title: row.title || row.scenario_title || 'Untitled',
          category: row.category || row.scenario_category || undefined,
          production: row.production || row.maker || undefined,
          creator: row.creator || row.author || undefined,
          recommendedPlayers: row.recommended_players || row.player_count || undefined,
          playTime: row.play_time || row.duration || undefined,
          scenarioUrl: row.scenario_url || row.link || undefined,
          notes: row.notes || row.memo || undefined,
        }));

        setGmCards(gmScenarios);
      } catch (e) {
        console.error('Failed to load scenario cards:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // フィルター適用
  const filteredCards = cards.filter(card => {
    // 1段目: 検索
    const titleMatch = titleSearch ? card.title.toLowerCase().includes(titleSearch.toLowerCase()) : true;
    const memberSearchMatch = memberSearch ? card.members.some(m => m.toLowerCase().includes(memberSearch.toLowerCase())) : true;
    // 2段目: selectフィルター
    const categoryMatch = categoryFilter ? card.category === categoryFilter : true;
    const gmMatch = gmFilter ? (card.gmSt && card.gmSt.includes(gmFilter)) : true;
    const plMatch = plFilter ? (card.playerCharacter && card.playerCharacter.includes(plFilter)) : true;
    return titleMatch && memberSearchMatch && categoryMatch && gmMatch && plMatch;
  });

  // カテゴリー・GM・メンバーの選択肢を抽出
  const categoryOptions = Array.from(new Set(cards.map(card => card.category).filter(Boolean)));
  const gmOptions = Array.from(new Set(cards.map(card => card.gmSt).filter(Boolean)));
  const plOptions = Array.from(new Set(cards.map(card => card.playerCharacter).filter(Boolean)));

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
        {/* タブUI */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'passed' ? styles.active : ''}`}
            onClick={() => setActiveTab('passed')}
          >
            通過済みシナリオ
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'gm-ready' ? styles.active : ''}`}
            onClick={() => setActiveTab('gm-ready')}
          >
            GM可能シナリオ
          </button>
        </div>

        {/* フィルターUI: 通過済みタブのみ表示 */}
        {activeTab === 'passed' && (
          <div className={styles.filterLayout}>
            {/* 左：検索欄 */}
            <div className={styles.filterSide}>
              <button
                className={styles.filterToggleBtn}
                onClick={() => setShowSearch(s => !s)}
              >
                {showSearch ? '▲ 検索を閉じる' : '▼ 検索'}
              </button>
              {showSearch && (
                <div className={`${styles.filterRow} ${styles.filterColumn}`}>
                  <button
                    className={styles.filterCloseBtn}
                    aria-label="検索クリア"
                    onClick={() => { setTitleSearch(''); setMemberSearch(''); }}
                  >
                    ×
                  </button>
                  <div className={styles.filterRowItem}>
                    <label htmlFor="search-title">タイトル：</label>
                    <input
                      id="search-title"
                      type="text"
                      value={titleSearch}
                      onChange={e => setTitleSearch(e.target.value)}
                      placeholder="タイトル名"
                    />
                  </div>
                  <div className={styles.filterRowItem}>
                    <label htmlFor="search-member">人物：</label>
                    <input
                      id="search-member"
                      type="text"
                      value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                      placeholder="人物名"
                    />
                  </div>
                </div>
              )}
            </div>
            {/* 右：フィルター欄 */}
            <div className={styles.filterSide}>
              <button
                className={styles.filterToggleBtn}
                onClick={() => setShowFilter(s => !s)}
              >
                {showFilter ? '▲ フィルターを閉じる' : '▼ フィルター'}
              </button>
              {showFilter && (
                <div className={`${styles.filterRow} ${styles.filterColumn}`}>
                  <button
                    className={styles.filterCloseBtn}
                    aria-label="フィルタークリア"
                    onClick={() => { setCategoryFilter(''); setGmFilter(''); setPlFilter(''); }}
                  >
                    ×
                  </button>
                  <div className={styles.filterRowItem}>
                    <label htmlFor="filter-category">カテゴリ：</label>
                    <select id="filter-category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                      <option value="">全て</option>
                      {categoryOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.filterRowItem}>
                    <label htmlFor="filter-gm">GM/ST：</label>
                    <select id="filter-gm" value={gmFilter} onChange={e => setGmFilter(e.target.value)}>
                      <option value="">全て</option>
                      {gmOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.filterRowItem}>
                    <label htmlFor="filter-pl">PL：</label>
                    <select id="filter-pl" value={plFilter} onChange={e => setPlFilter(e.target.value)}>
                      <option value="">全て</option>
                      {plOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          // ローディング表示
          <div className={styles.emptyMessage}>Loading...</div>
        ) : activeTab === 'passed' ? (
          filteredCards.length === 0 ? (
            // 通過済みシナリオがない場合
            <div className={styles.emptyMessage}>通過済みシナリオはまだありません。</div>
          ) : (
            <div className={styles.cardGrid}>
              {filteredCards.map((card) => (
                <ScenarioCard key={card.passNumber} card={card} />
              ))}
            </div>
          )
        ) : (
          gmCards.length === 0 ? (
            // GM可能シナリオがない場合
            <div className={styles.emptyMessage}>GM可能シナリオはまだありません。</div>
          ) : (
            <div className={styles.cardGrid}>
              {gmCards.map((card) => (
                <div key={card.id} className={styles.gmCard}>
                  <h3 className={styles.gmCardTitle}>{card.title}</h3>
                  {card.category && <p className={styles.gmCardInfo}>カテゴリ: {card.category}</p>}
                  {card.production && <p className={styles.gmCardInfo}>制作: {card.production}</p>}
                  {card.creator && <p className={styles.gmCardInfo}>作者: {card.creator}</p>}
                  {card.recommendedPlayers && <p className={styles.gmCardInfo}>推奨人数: {card.recommendedPlayers}</p>}
                  {card.playTime && <p className={styles.gmCardInfo}>プレイ時間: {card.playTime}</p>}
                  {card.scenarioUrl && (
                    <p className={styles.gmCardInfo}>
                      <a href={card.scenarioUrl} target="_blank" rel="noopener noreferrer" className={styles.gmCardLink}>
                        シナリオリンク
                      </a>
                    </p>
                  )}
                  {card.notes && <p className={styles.gmCardNotes}>{card.notes}</p>}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}
