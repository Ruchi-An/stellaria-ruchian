
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { ScenarioCard as ScenarioCardType, GMScenarioCard as GMScenarioCardType } from "../../types/scenario";
import { ScenarioCard } from "./ScenarioCard";
import { GMScenarioCard } from "./GMScenarioCard";
import { supabase } from "../../lib/supabaseClient";
import styles from "./Scenario.module.css";

type TabType = 'passed' | 'gm-ready';

export function ScenarioPage() {
  const location = useLocation();
  
  // URLクエリパラメータから初期タブを取得する関数
  const getInitialTab = (): TabType => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'gm-ready') return 'gm-ready';
    return 'passed';
  };
  
  // 現在表示中のタブ（'passed': 通過済み, 'gm-ready': GM可能）
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  // 通過済みシナリオのカテゴリサブタブ
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  // 画面幅が600px以下かどうか
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);

  // URLクエリパラメータが変わったらタブも切り替え
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'gm-ready') setActiveTab('gm-ready');
    else setActiveTab('passed');
  }, [location.search]);

  // 画面幅の監視
  useEffect(() => {
    const checkScreenWidth = () => {
      setIsNarrowScreen(window.innerWidth < 600);
    };
    
    checkScreenWidth();
    window.addEventListener('resize', checkScreenWidth);
    
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);
  
  // 通過済みシナリオのカードリスト
  const [passedScenarioCards, setPassedScenarioCards] = useState<ScenarioCardType[]>([]);
  // GM可能シナリオのカードリスト
  const [gmReadyScenarioCards, setGmReadyScenarioCards] = useState<GMScenarioCardType[]>([]);
  // データ読み込み中フラグ
  const [isLoading, setIsLoading] = useState(true);
  
  // サブタブが変更されたらフィルタを自動連動
  useEffect(() => {
    if (activeCategoryTab === 'all') {
      setSelectedCategoryFilter('');
    } else {
      setSelectedCategoryFilter(activeCategoryTab);
    }
  }, [activeCategoryTab]);

  // === 絞り込み用のステート ===
  // カテゴリによる絞り込み（リストから選択）
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');
  // シナリオタイトルのテキスト絞り込み（自由記入）
  const [titleSearchText, setTitleSearchText] = useState<string>('');
  // メンバー（GM/ST、プレイヤー問わず）のテキスト絞り込み（自由記入）
  const [memberSearchText, setMemberSearchText] = useState<string>('');
  // 絞り込み欄の表示/非表示トグル
  const [isFilterBoxVisible, setIsFilterBoxVisible] = useState(false);
  // ソート順（'asc': 昇順（古い順）, 'desc': 降順（新しい順））
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // データベースからシナリオカード情報を取得する関数
    const fetchScenarioCards = async () => {
      try {
        setIsLoading(true);
        
        // 通過済みシナリオの取得
        const { data: passedScenarioData, error: passedScenarioError } = await supabase
          .from('tsuka_scenario_list')
          .select('*');

        if (passedScenarioError) throw passedScenarioError;

        const passedScenarioRows = Array.isArray(passedScenarioData) ? passedScenarioData : [];

        // データベースの行をScenarioCardType型に変換する関数
        // 異なる列名パターンに柔軟に対応
        const mapDatabaseRowToScenarioCard = (databaseRow: any, scenarioIndex: number): ScenarioCardType => {
          // プレイ日（通過日）
          const playDate: string = databaseRow.play_date || databaseRow.pass_date || databaseRow.date || databaseRow.passed_on || '';
          // シナリオタイトル
          const title: string = databaseRow.title || databaseRow.scenario_title || databaseRow.name || 'Untitled';
          // カテゴリ（例：CoC、DX等）
          const category: string | undefined = databaseRow.category || databaseRow.scenario_category || undefined;
          // 制作元
          const production: string | undefined = databaseRow.production || databaseRow.maker || undefined;
          // シナリオ作者
          const creator: string | undefined = databaseRow.creator || databaseRow.author || databaseRow.created_by || undefined;
          // ゲームマスター/ストーリーテラー
          const gmSt: string | undefined = databaseRow.gm_st || databaseRow.gm || databaseRow.st || undefined;
          // プレイヤーが使用したキャラクター
          const playerCharacter: string | undefined = databaseRow.player_character || databaseRow.pc || databaseRow.character || undefined;
          // シナリオの詳細ページURL
          const scenarioUrl: string | undefined = databaseRow.scenario_url || databaseRow.link || databaseRow.scenario_link || undefined;
          // 配信アーカイブURL
          const streamUrl: string | undefined = databaseRow.stream_url || databaseRow.distribution_link || databaseRow.stream_link || undefined;
          // カード表示用の画像URL
          const cardImageUrl: string | undefined = databaseRow.card_image_url || databaseRow.image_url || undefined;
          // 参加メンバーの生データ（配列または文字列）
          const membersRawData = databaseRow.member || databaseRow.members || databaseRow.members_text || databaseRow.member_list || [];
          // 参加メンバーを配列形式に統一
          const members: string[] = Array.isArray(membersRawData)
            ? membersRawData
            : typeof membersRawData === 'string'
              ? membersRawData
                  .split(/[\,\u3001\uFF0C\/／\n]+/)
                  .map((memberName: string) => memberName.trim())
                  .filter(Boolean)
              : [];

          // 通過番号（プレイ日が古い順に1から連番）
          const passNumber: number = scenarioIndex + 1;

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
        const scenariosOldestFirst = [...passedScenarioRows].sort((rowA: any, rowB: any) => {
          const dateA = new Date(rowA.play_date || rowA.pass_date || rowA.date || rowA.passed_on || 0).getTime();
          const dateB = new Date(rowB.play_date || rowB.pass_date || rowB.date || rowB.passed_on || 0).getTime();
          return dateA - dateB;
        });

        // 各シナリオに連番を付けてマッピング
        const scenariosWithPassNumber = scenariosOldestFirst.map(mapDatabaseRowToScenarioCard);

        // 2) 表示は通過日が新しい順（大きい番号順）に並べ替え
        const scenariosNewestFirst = [...scenariosWithPassNumber].sort((cardA, cardB) => {
          const dateA = new Date(cardA.playDate || 0).getTime();
          const dateB = new Date(cardB.playDate || 0).getTime();
          return dateB - dateA;
        });

        setPassedScenarioCards(scenariosNewestFirst);

        // GM可能シナリオの取得
        const { data: gmScenarioData, error: gmScenarioError } = await supabase
          .from('gm_scenario_list')
          .select('*');

        if (gmScenarioError) throw gmScenarioError;

        const gmScenarioRows = Array.isArray(gmScenarioData) ? gmScenarioData : [];
        // データベースの行をGMScenarioCardType型に変換
        const gmScenarios: GMScenarioCardType[] = gmScenarioRows.map((databaseRow: any) => ({
          id: databaseRow.id,
          title: databaseRow.title || databaseRow.scenario_title || 'Untitled',
          category: databaseRow.category || databaseRow.scenario_category || undefined,
          production: databaseRow.production || databaseRow.maker || undefined,
          creator: databaseRow.creator || databaseRow.author || undefined,
          plPlayers: databaseRow.pl_players || databaseRow.recommended_players || databaseRow.player_count || undefined,
          playTime: databaseRow.play_time || databaseRow.duration || undefined,
          gmPlayCount: databaseRow.gm_play_count || databaseRow.play_count || undefined,
          scenarioUrl: databaseRow.scenario_url || databaseRow.link || undefined,
          notes: databaseRow.notes || databaseRow.memo || undefined,
          cardImageUrl: databaseRow.card_image_url || databaseRow.image_url || undefined,
          streamOkng: databaseRow.stream_okng ?? undefined,
        }));

        setGmReadyScenarioCards(gmScenarios);
      } catch (error) {
        console.error('Failed to load scenario cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScenarioCards();
  }, []);

  // 絞り込み条件に合致するシナリオのみを抽出し、通過日の古い順でpassNumberを振る
  const filteredScenarioCards = passedScenarioCards
    .filter(scenarioCard => {
      // タイトル絞り込み
      const isTitleMatched = titleSearchText ? scenarioCard.title.toLowerCase().includes(titleSearchText.toLowerCase()) : true;
      // メンバー絞り込み（GM/ST、プレイヤー両方を検索対象に含める）
      const isMemberMatched = memberSearchText ? (
        scenarioCard.members.some(memberName => memberName.toLowerCase().includes(memberSearchText.toLowerCase())) ||
        (scenarioCard.gmSt && scenarioCard.gmSt.toLowerCase().includes(memberSearchText.toLowerCase()))
      ) : true;
      // カテゴリ絞り込み
      const isCategoryMatched = selectedCategoryFilter ? scenarioCard.category === selectedCategoryFilter : true;
      return isTitleMatched && isMemberMatched && isCategoryMatched;
    });

  // 1. まず古い順にソートしてpassNumberを振る
  const cardsWithPassNumber = [...filteredScenarioCards]
    .sort((a, b) => {
      const dateA = new Date(a.playDate || 0).getTime();
      const dateB = new Date(b.playDate || 0).getTime();
      return dateA - dateB; // 古い順
    })
    .map((card, index) => ({
      ...card,
      displayPassNumber: index + 1
    }));

  // 2. 表示順に応じて並び替え
  const sortedCards = [...cardsWithPassNumber].sort((a, b) => {
    const dateA = new Date(a.playDate || 0).getTime();
    const dateB = new Date(b.playDate || 0).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <main className="commonPage">
      <section className="commonHero" style={{ paddingBottom: 0 }}>
        <div className="commonTitleRow">
          <span className="commonTitleIcon">✦</span>
          <h1 className="commonTitle">SCENARIO</h1>
          <span className="commonTitleIcon">✦</span>
        </div>
      </section>

      <div className="commonContainer" style={{ paddingBottom: '40px' }}>
        {/* タブUI */}
        <div className="commonTabs">
          <button 
            className={`commonTab ${activeTab === 'passed' ? 'active' : ''}`}
            onClick={() => setActiveTab('passed')}
          >
            通過済みシナリオ
          </button>
          <button 
            className={`commonTab ${activeTab === 'gm-ready' ? 'active' : ''}`}
            onClick={() => setActiveTab('gm-ready')}
          >
            GM可能シナリオ
          </button>
        </div>

        {/* カテゴリサブタブUI: 通過済みタブのみ表示 */}
        {activeTab === 'passed' && (
          <div className="commonTabs" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
            <button 
              className={`commonTab ${activeCategoryTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('all')}
            >
              すべて
            </button>
            <button 
              className={`commonTab ${activeCategoryTab === 'マーダーミステリー' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('マーダーミステリー')}
            >
              {isNarrowScreen ? 'マダミス' : 'マーダーミステリー'}
            </button>
            <button 
              className={`commonTab ${activeCategoryTab === 'ストーリープレイング' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('ストーリープレイング')}
            >
              {isNarrowScreen ? 'ストプレ' : 'ストーリープレイング'}
            </button>
            <button 
              className={`commonTab ${activeCategoryTab === 'スパイゲーム' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('スパイゲーム')}
            >
              {isNarrowScreen ? 'スパイ' : 'スパイゲーム'}
            </button>
            <button 
              className={`commonTab ${activeCategoryTab === 'その他' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('その他')}
            >
              その他
            </button>
          </div>
        )}

        {/* 絞り込みUI: 通過済みタブのみ表示 */}
        {activeTab === 'passed' && (
          <div className={styles.filterLayout}>
            <div className={styles.filterSide}>
              <button
                className={styles.filterToggleBtn}
                onClick={() => setIsFilterBoxVisible(isVisible => !isVisible)}
              >
                {isFilterBoxVisible ? '▲ 絞り込みを閉じる' : '▼ 絞り込み'}
              </button>
              {isFilterBoxVisible && (
                <div className={`${styles.filterRow} ${styles.filterColumn}`}>
                  <button
                    className={styles.filterCloseBtn}
                    aria-label="絞り込みクリア"
                    onClick={() => { 
                      setTitleSearchText(''); 
                      setMemberSearchText(''); 
                    }}
                  >
                    ×
                  </button>
                  <div className={styles.filterRowItem}>
                    <label htmlFor="filter-title">タイトル：</label>
                    <input
                      id="filter-title"
                      type="text"
                      value={titleSearchText}
                      onChange={e => setTitleSearchText(e.target.value)}
                      placeholder="タイトル名"
                    />
                  </div>
                  <div className={styles.filterRowItem}>
                    <label htmlFor="filter-member">メンバー：</label>
                    <input
                      id="filter-member"
                      type="text"
                      value={memberSearchText}
                      onChange={e => setMemberSearchText(e.target.value)}
                      placeholder="人物名（GM/ST、メンバー問わず）"
                    />
                  </div>
                  <div className={styles.filterRowItem}>
                    <label htmlFor="filter-sort">表示順：</label>
                    <select id="filter-sort" value={sortOrder} onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}>
                      <option value="desc">新しい順</option>
                      <option value="asc">古い順</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          // ローディング表示
          <div className={styles.emptyMessage}>Loading...</div>
        ) : activeTab === 'passed' ? (
          sortedCards.length === 0 ? (
            // 通過済みシナリオがない場合
            <div className={styles.emptyMessage}>通過済みシナリオはまだありません。</div>
          ) : (
            <div className={styles.cardGrid}>
              {sortedCards.map((scenarioCard) => (
                <ScenarioCard key={scenarioCard.passNumber} card={scenarioCard} displayPassNumber={scenarioCard.displayPassNumber} />
              ))}
            </div>
          )
        ) : (
          gmReadyScenarioCards.length === 0 ? (
            // GM可能シナリオがない場合
            <div className={styles.emptyMessage}>GM可能シナリオはまだありません。</div>
          ) : (
            <div className={styles.cardGrid}>
              {gmReadyScenarioCards.map((gmScenario) => (
                <GMScenarioCard key={gmScenario.id} card={gmScenario} />
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}
