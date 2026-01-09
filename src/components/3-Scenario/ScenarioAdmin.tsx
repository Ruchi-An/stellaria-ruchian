import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
// タブ定義
const TABS = [
  { key: "scenario", label: "通過済みシナリオ管理" },
  { key: "gm", label: "GMシナリオ管理" },
];
import sharedStyles from "../2-Schedule/Schedule.shared.module.css";
import styles from "./ScenarioAdmin.module.css";
import { supabase } from "../../lib/supabaseClient";
import type { ScenarioCard, GMScenarioCard } from "../../types/scenario";


const SCENARIO_TABLE = "tsuka_scenario_list";
const GM_SCENARIO_TABLE = "gm_scenario_list";
const SCENARIO_BUCKET = "scenario-card-images";
// --- GMシナリオ用 ---
type GMFormState = {
  id: number | null;
  title: string;
  category: string;
  production: string;
  creator: string;
  plPlayers: string;
  playTime: string;
  gmPlayCount: string;
  scenarioUrl: string;
  notes: string;
  cardImageUrl: string;
  streamOkng: boolean;
};

const emptyGMForm: GMFormState = {
  id: null,
  title: "",
  category: "",
  production: "",
  creator: "",
  plPlayers: "",
  playTime: "",
  gmPlayCount: "",
  scenarioUrl: "",
  notes: "",
  cardImageUrl: "",
  streamOkng: false,
};

function toGMFormState(row: Partial<GMScenarioCard>): GMFormState {
  return {
    id: row.id ?? null,
    title: row.title ?? "",
    category: row.category ?? "",
    production: row.production ?? "",
    creator: row.creator ?? "",
    plPlayers: row.plPlayers ?? "",
    playTime: row.playTime ?? "",
    gmPlayCount: row.gmPlayCount?.toString() ?? "",
    scenarioUrl: row.scenarioUrl ?? "",
    notes: row.notes ?? "",
    cardImageUrl: row.cardImageUrl ?? "",
    streamOkng: row.streamOkng ?? false,
  };
}

type ScenarioRow = ScenarioCard & { id?: number; membersText?: string };

type FormState = {
  id: number | null;
  title: string;
  category: string;
  production: string;
  creator: string;
  gmSt: string;
  playerCharacter: string;
  playDate: string; // play_date
  membersText: string;
  scenarioUrl: string; // scenario_url
  streamUrl: string; // stream_url
  cardImageUrl: string; // card_image_url
};

const emptyForm: FormState = {
  id: null,
  title: "",
  category: "",
  production: "",
  creator: "",
  gmSt: "",
  playerCharacter: "",
  playDate: "",
  membersText: "",
  scenarioUrl: "",
  streamUrl: "",
  cardImageUrl: "",
};

function normalizeMembers(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\,\u3001\uFF0C\/／\n]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function toFormState(row: ScenarioRow): FormState {
  return {
    id: row.id ?? null,
    title: row.title ?? "",
    category: row.category ?? "",
    production: row.production ?? "",
    creator: row.creator ?? "",
    gmSt: row.gmSt ?? "",
    playerCharacter: row.playerCharacter ?? "",
    playDate: row.playDate ?? "",
    membersText: row.members?.join(", ") ?? "",
    scenarioUrl: row.scenarioUrl ?? "",
    streamUrl: row.streamUrl ?? "",
    cardImageUrl: row.cardImageUrl ?? "",
  };
}

export function ScenarioAdminPage() {
  // タブ状態
  const [activeTab, setActiveTab] = useState<string>(TABS[0].key);
    // --- GMシナリオ用 ---
    const [gmCards, setGmCards] = useState<GMScenarioCard[]>([]);
    const [gmLoading, setGmLoading] = useState(true);
    const [gmSaving, setGmSaving] = useState(false);
    const [gmUploading, setGmUploading] = useState(false);
    const [gmForm, setGmForm] = useState<GMFormState>(emptyGMForm);
    const [gmMessage, setGmMessage] = useState<string>("");
  const [cards, setCards] = useState<ScenarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState<string>("");

  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      const ad = new Date(a.playDate || 0).getTime();
      const bd = new Date(b.playDate || 0).getTime();
      return bd - ad;
    });
  }, [cards]);

  // GMシナリオ取得
  const fetchGMCards = async () => {
    try {
      setGmLoading(true);
      const { data, error } = await supabase
        .from(GM_SCENARIO_TABLE)
        .select("*")
        .order("id", { ascending: false });
      if (error) throw error;
      const mapped: GMScenarioCard[] = (data ?? []).map((row: any) => ({
        id: row.id,
        title: row.title ?? "",
        category: row.category ?? "",
        production: row.production ?? "",
        creator: row.creator ?? "",
        plPlayers: row.pl_players ?? row.recommended_players ?? "",
        playTime: row.play_time ?? "",
        gmPlayCount: row.gm_play_count ?? null,
        scenarioUrl: row.scenario_url ?? "",
        notes: row.notes ?? "",
        cardImageUrl: row.card_image_url ?? "",
        streamOkng: row.stream_okng ?? false,
      }));
      setGmCards(mapped);
    } catch (err) {
      setGmMessage("GMシナリオの読み込みに失敗しました");
    } finally {
      setGmLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(SCENARIO_TABLE)
        .select(
          "id, title, category, production, creator, gm_st, player_character, scenario_url, play_date, member, stream_url, card_image_url"
        )
        .order("play_date", { ascending: true });

      if (error) throw error;

      const rows: ScenarioRow[] = (data ?? []).map((row: any, index: number) => {
        // 通過日が古い順で連番を振る
        const passNumber = index + 1;
        const members = normalizeMembers(row.member);
        return {
          id: row.id,
          passNumber,
          title: row.title ?? "Untitled",
          category: row.category ?? "",
          production: row.production ?? "",
          creator: row.creator ?? "",
          gmSt: row.gm_st ?? "",
          playerCharacter: row.player_character ?? "",
          playDate: row.play_date ?? "",
          members,
          scenarioUrl: row.scenario_url ?? "",
          streamUrl: row.stream_url ?? "",
          cardImageUrl: row.card_image_url ?? "",
        };
      });

      setCards(rows);
    } catch (err) {
      console.error("Failed to load scenario cards:", err);
      setMessage("読み込みに失敗しました。設定を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    fetchGMCards();
  }, []);
  // GMシナリオフォーム入力
  const handleGMInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setGmForm((prev) => ({ ...prev, [name]: value }));
  };

  // 編集
  const handleGMEdit = (card: GMScenarioCard) => {
    setGmForm(toGMFormState(card));
    setGmMessage("編集モード: 保存で上書きします");
  };

  // リセット
  const handleGMReset = () => {
    setGmForm(emptyGMForm);
    setGmMessage("新規作成モードに戻しました");
  };

  // 削除
  const handleGMDelete = async (card: GMScenarioCard) => {
    if (!card.id) return;
    if (!confirm(`"${card.title}" を削除しますか？`)) return;
    try {
      setGmSaving(true);
      const { error } = await supabase.from(GM_SCENARIO_TABLE).delete().eq("id", card.id);
      if (error) throw error;
      setGmMessage("削除しました");
      await fetchGMCards();
      handleGMReset();
    } catch (err) {
      setGmMessage("削除に失敗しました");
    } finally {
      setGmSaving(false);
    }
  };

  // 登録・更新
  const handleGMSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGmSaving(true);
    setGmMessage("");
    const payload = {
      title: gmForm.title || null,
      category: gmForm.category || null,
      production: gmForm.production || null,
      creator: gmForm.creator || null,
      pl_players: gmForm.plPlayers || null,
      play_time: gmForm.playTime || null,
      gm_play_count: gmForm.gmPlayCount ? Number(gmForm.gmPlayCount) : null,
      scenario_url: gmForm.scenarioUrl || null,
      notes: gmForm.notes || null,
      card_image_url: gmForm.cardImageUrl || null,
      stream_okng: gmForm.streamOkng,
    };
    try {
      if (gmForm.id) {
        const { error } = await supabase
          .from(GM_SCENARIO_TABLE)
          .update(payload)
          .eq("id", gmForm.id);
        if (error) throw error;
        setGmMessage("更新しました");
      } else {
        const { error } = await supabase.from(GM_SCENARIO_TABLE).insert([payload]);
        if (error) throw error;
        setGmMessage("追加しました");
      }
      await fetchGMCards();
      handleGMReset();
    } catch (err) {
      setGmMessage("保存に失敗しました");
    } finally {
      setGmSaving(false);
    }
  };

  const handleInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (card: ScenarioRow) => {
    setForm(toFormState(card));
    setMessage("編集モード: 保存で上書きします");
  };

  const handleReset = () => {
    setForm(emptyForm);
    setMessage("新規作成モードに戻しました");
  };

  const handleDelete = async (card: ScenarioRow) => {
    if (!card.id) return;
    if (!confirm(`"${card.title}" を削除しますか？`)) return;

    try {
      setSaving(true);
      const { error } = await supabase.from(SCENARIO_TABLE).delete().eq("id", card.id);
      if (error) throw error;
      setMessage("削除しました");
      await fetchCards();
      handleReset();
    } catch (err) {
      console.error("Delete error", err);
      setMessage("削除に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      title: form.title || null,
      category: form.category || null,
      production: form.production || null,
      creator: form.creator || null,
      gm_st: form.gmSt || null,
      player_character: form.playerCharacter || null,
      play_date: form.playDate || null,
      member: form.membersText || null,
      scenario_url: form.scenarioUrl || null,
      stream_url: form.streamUrl || null,
      card_image_url: form.cardImageUrl || null,
    };

    try {
      if (form.id) {
        const { error } = await supabase
          .from(SCENARIO_TABLE)
          .update(payload)
          .eq("id", form.id);
        if (error) throw error;
        setMessage("更新しました");
      } else {
        const { error } = await supabase.from(SCENARIO_TABLE).insert([payload]);
        if (error) throw error;
        setMessage("追加しました");
      }

      await fetchCards();
      handleReset();
    } catch (err) {
      console.error("Save error", err);
      setMessage("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setMessage("画像をアップロードしています...");
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(SCENARIO_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(SCENARIO_BUCKET)
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error("公開URLの取得に失敗しました");

      setForm((prev) => ({ ...prev, cardImageUrl: publicUrl }));
      setMessage("画像URLをフォームに設定しました");
    } catch (err) {
      console.error("Upload error", err);
      setMessage("画像アップロードに失敗しました。バケット名と権限を確認してください。");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleGMUploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setGmUploading(true);
      setGmMessage("画像をアップロードしています...");
      const ext = file.name.split(".").pop();
      const fileName = `gm-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(SCENARIO_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(SCENARIO_BUCKET)
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error("公開URLの取得に失敗しました");

      setGmForm((prev) => ({ ...prev, cardImageUrl: publicUrl }));
      setGmMessage("画像URLをフォームに設定しました");
    } catch (err) {
      console.error("Upload error", err);
      setGmMessage("画像アップロードに失敗しました。バケット名と権限を確認してください。");
    } finally {
      setGmUploading(false);
      e.target.value = "";
    }
  };

  // --- 通過済み→GM連携 ---
  const handleCopyToGM = (card: ScenarioRow) => {
    setGmForm({
      id: null,
      title: card.title ?? "",
      category: card.category ?? "",
      production: card.production ?? "",
      creator: card.creator ?? "",
      plPlayers: "",
      playTime: "",
      gmPlayCount: "",
      scenarioUrl: card.scenarioUrl ?? "",
      notes: "",
      cardImageUrl: card.cardImageUrl ?? "",
      streamOkng: false,
    });
    setGmMessage("通過済みシナリオから項目をコピーしました。必要に応じて編集して保存してください。");
  };

  return (
    <main className={sharedStyles.page}>
      <section className={sharedStyles.hero}>
        <div className={sharedStyles.titleRow}>
          <span className={sharedStyles.titleIcon}>✦</span>
          <h1 className={sharedStyles.title}>SCENARIO ADMIN</h1>
          <span className={sharedStyles.titleIcon}>✦</span>
        </div>
        <p className={styles.subtitle}>管理者専用 - シナリオ一覧の編集・画像アップロード</p>
      </section>

      {/* タブ切り替えUI（Scenarioページと同じ構造） */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={styles.tab + (activeTab === tab.key ? ' ' + styles['tab'] + ' ' + styles['active'] : '')}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- GM可能シナリオ管理 --- */}
      {activeTab === "gm" && (
        <section className={styles.container}>
          <div className={styles.panel}>
            {/* ...GM管理UI... */}
            <header className={styles.panelHeader}>
              <div>
                <p className={styles.panelTitle}>{gmForm.id ? "GMシナリオを編集" : "新規GMシナリオを追加"}</p>
                <p className={styles.panelHint}>GM可能シナリオの管理・登録</p>
              </div>
              <div className={styles.headerActions}>
                <button type="button" className={styles.secondaryButton} onClick={handleGMReset} disabled={gmSaving}>
                  新規作成モード
                </button>
                <button type="button" className={styles.ghostButton} onClick={fetchGMCards} disabled={gmSaving}>
                  再読み込み
                </button>
              </div>
            </header>
            <form className={styles.form} onSubmit={handleGMSubmit}>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>タイトル</span>
                  <input name="title" value={gmForm.title} onChange={handleGMInput} required />
                </label>
                <label className={styles.field}>
                  <span>カテゴリ</span>
                  <select name="category" value={gmForm.category} onChange={handleGMInput}>
                    <option value="">選択してください</option>
                    <option value="マーダーミステリー">マーダーミステリー</option>
                    <option value="ストーリープレイング">ストーリープレイング</option>
                    <option value="スパイゲーム">スパイゲーム</option>
                    <option value="その他">その他</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span>制作</span>
                  <input name="production" value={gmForm.production} onChange={handleGMInput} />
                </label>
                <label className={styles.field}>
                  <span>作者様</span>
                  <input name="creator" value={gmForm.creator} onChange={handleGMInput} />
                </label>
                <label className={styles.field}>
                  <span>推奨人数</span>
                  <input name="plPlayers" value={gmForm.plPlayers} onChange={handleGMInput} />
                </label>
                <label className={styles.field}>
                  <span>プレイ時間</span>
                  <input name="playTime" value={gmForm.playTime} onChange={handleGMInput} />
                </label>
                <label className={styles.field}>
                  <span>GM卓回数</span>
                  <input name="gmPlayCount" value={gmForm.gmPlayCount} onChange={handleGMInput} type="number" min="0" />
                </label>
                <label className={styles.field}>
                  <span>シナリオリンク</span>
                  <input name="scenarioUrl" value={gmForm.scenarioUrl} onChange={handleGMInput} />
                </label>
                <label className={styles.field}>
                  <span>配信可否</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      name="streamOkng" 
                      checked={gmForm.streamOkng} 
                      onChange={(e) => setGmForm(prev => ({ ...prev, streamOkng: e.target.checked }))}
                      style={{ width: 'auto', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.9rem' }}>配信可</span>
                  </label>
                </label>
                <label className={styles.field}>
                  <span>メモ/備考</span>
                  <textarea name="notes" value={gmForm.notes} onChange={handleGMInput} rows={2} />
                </label>
                <label className={styles.field}>
                  <span>カード画像URL</span>
                  <input
                    name="cardImageUrl"
                    value={gmForm.cardImageUrl}
                    onChange={handleGMInput}
                    placeholder="アップロード後に自動入力されます"
                  />
                  {gmForm.cardImageUrl && (
                    <div>
                      <img src={gmForm.cardImageUrl} alt="preview" className={styles.preview} />
                    </div>
                  )}
                </label>
                <label className={styles.field}>
                  <span>画像アップロード</span>
                  <input type="file" accept="image/*" onChange={handleGMUploadImage} disabled={gmUploading} />
                  <button type="button" className={styles.uploadButton} onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()} disabled={gmUploading}>
                    <span>{gmUploading ? "アップロード中..." : "画像を選択"}</span>
                  </button>
                  <p className={styles.uploadHint}>Supabase Storage ({SCENARIO_BUCKET}) にアップロードし、公開URLを自動でセットします。</p>
                </label>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.primaryButton} disabled={gmSaving}>
                  {gmSaving ? "保存中..." : gmForm.id ? "更新する" : "追加する"}
                </button>
              </div>
            </form>
            {gmMessage && <p className={styles.message}>{gmMessage}</p>}
          </div>
          <div className={styles.listPanel}>
            <header className={styles.listHeader}>
              <div>
                <p className={styles.panelTitle}>既存GMシナリオ</p>
                <p className={styles.panelHint}>クリックで編集モードに切り替わります</p>
              </div>
              <span className={styles.badge}>{gmCards.length} 件</span>
            </header>
            {gmLoading ? (
              <div className={styles.empty}>読み込み中...</div>
            ) : gmCards.length === 0 ? (
              <div className={styles.empty}>まだデータがありません</div>
            ) : (
              <div className={styles.cardList}>
                {gmCards.map((card) => (
                  <article key={card.id} className={styles.cardRow}>
                    <div className={styles.cardMeta}>
                      <div className={styles.cardTitleRow}>
                        <button
                          className={styles.linkButton}
                          type="button"
                          onClick={() => handleGMEdit(card)}
                          aria-label={`編集: ${card.title}`}
                        >
                          {card.title}
                        </button>
                      </div>
                      <p className={styles.cardSub}>{card.category || "カテゴリ未設定"}</p>
                      <p className={styles.cardSub}>制作: {card.production || "-"} / 作者: {card.creator || "-"}</p>
                      <p className={styles.cardSub}>推奨人数: {card.plPlayers || "-"} / プレイ時間: {card.playTime || "-"}</p>
                      <p className={styles.cardSub}>GM卓回数: {card.gmPlayCount ?? "-"} / 配信: {card.streamOkng === true ? "可" : card.streamOkng === false ? "否" : "-"}</p>
                      {card.scenarioUrl && <a href={card.scenarioUrl} target="_blank" rel="noreferrer" className={styles.smallLink}>シナリオ</a>}
                      {card.cardImageUrl && <a href={card.cardImageUrl} target="_blank" rel="noreferrer" className={styles.smallLink}>画像</a>}
                      {card.notes && <div className={styles.cardSub}>{card.notes}</div>}
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={() => handleGMDelete(card)}
                        disabled={gmSaving}
                      >
                        削除
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* --- 通過済みシナリオ管理 --- */}
      {activeTab === "scenario" && (
        <section className={styles.container}>
          <div className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <p className={styles.panelTitle}>{form.id ? "シナリオを編集" : "新規シナリオを追加"}</p>
                <p className={styles.panelHint}>通過日は play_date で保存されます。未入力でも保存できます。</p>
              </div>
              <div className={styles.headerActions}>
                <button type="button" className={styles.secondaryButton} onClick={handleReset} disabled={saving || uploading}>
                  新規作成モード
                </button>
                <button type="button" className={styles.ghostButton} onClick={fetchCards} disabled={saving || uploading}>
                  再読み込み
                </button>
              </div>
            </header>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>タイトル</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleInput}
                    placeholder="シナリオ名"
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span>通過日</span>
                  <input
                    name="playDate"
                    type="date"
                    value={form.playDate}
                    onChange={handleInput}
                  />
                </label>
                <label className={styles.field}>
                  <span>カテゴリ</span>
                  <select name="category" value={form.category} onChange={handleInput}>
                    <option value="">選択してください</option>
                    <option value="マーダーミステリー">マーダーミステリー</option>
                    <option value="ストーリープレイング">ストーリープレイング</option>
                    <option value="スパイゲーム">スパイゲーム</option>
                    <option value="その他">その他</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span>制作</span>
                  <input
                    name="production"
                    value={form.production}
                    onChange={handleInput}
                    placeholder="制作名"
                  />
                </label>
                <label className={styles.field}>
                  <span>作者様</span>
                  <input
                    name="creator"
                    value={form.creator}
                    onChange={handleInput}
                    placeholder="作者名"
                  />
                </label>
                <label className={styles.field}>
                  <span>GM/ST</span>
                  <input
                    name="gmSt"
                    value={form.gmSt}
                    onChange={handleInput}
                    placeholder="担当GM/ST"
                  />
                </label>
                <label className={styles.field}>
                  <span>担当PC</span>
                  <input
                    name="playerCharacter"
                    value={form.playerCharacter}
                    onChange={handleInput}
                    placeholder="キャラクター名"
                  />
                </label>
                <label className={styles.field}>
                  <span>メンバー（カンマ区切り）</span>
                  <textarea
                    name="membersText"
                    value={form.membersText}
                    onChange={handleInput}
                    placeholder="名前1, 名前2"
                    rows={2}
                  />
                </label>
                <label className={styles.field}>
                  <span>シナリオリンク</span>
                  <input
                    name="scenarioUrl"
                    value={form.scenarioUrl}
                    onChange={handleInput}
                    placeholder="https://..."
                  />
                </label>
                <label className={styles.field}>
                  <span>配信リンク</span>
                  <input
                    name="streamUrl"
                    value={form.streamUrl}
                    onChange={handleInput}
                    placeholder="https://..."
                  />
                </label>
                <label className={styles.field}>
                  <span>カード画像URL</span>
                  <input
                    name="cardImageUrl"
                    value={form.cardImageUrl}
                    onChange={handleInput}
                    placeholder="アップロード後に自動入力されます"
                  />
                  {form.cardImageUrl && (
                    <div className={styles.previewWrapper}>
                      <img src={form.cardImageUrl} alt="preview" className={styles.preview} />
                    </div>
                  )}
                </label>
                <div className={styles.field}>
                  <span>画像アップロード</span>
                  <label className={styles.uploadLabel}>
                    <input type="file" accept="image/*" onChange={handleUploadImage} disabled={uploading || saving} />
                    <span>{uploading ? "アップロード中..." : "画像を選択"}</span>
                  </label>
                  <p className={styles.uploadHint}>Supabase Storage ({SCENARIO_BUCKET}) にアップロードし、公開URLを自動でセットします。</p>
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.primaryButton} disabled={saving || uploading}>
                  {saving ? "保存中..." : form.id ? "更新する" : "追加する"}
                </button>
              </div>
            </form>
            {message && <p className={styles.message}>{message}</p>}
          </div>
          <div className={styles.listPanel}>
            <header className={styles.listHeader}>
              <div>
                <p className={styles.panelTitle}>既存シナリオ</p>
                <p className={styles.panelHint}>クリックで編集モードに切り替わります</p>
              </div>
              <span className={styles.badge}>{sortedCards.length} 件</span>
            </header>
            {loading ? (
              <div className={styles.empty}>読み込み中...</div>
            ) : sortedCards.length === 0 ? (
              <div className={styles.empty}>まだデータがありません</div>
            ) : (
              <div className={styles.cardList}>
                {sortedCards.map((card) => (
                  <article key={card.id ?? card.passNumber} className={styles.cardRow}>
                    <div className={styles.cardMeta}>
                      <div className={styles.cardTitleRow}>
                        <span className={styles.passNumber}>#{card.passNumber}</span>
                        <button
                          className={styles.linkButton}
                          type="button"
                          onClick={() => handleEdit(card)}
                          aria-label={`編集: ${card.title}`}
                        >
                          {card.title}
                        </button>
                      </div>
                      <p className={styles.cardSub}>{card.playDate || "日付未設定"} / {card.category || "カテゴリ未設定"}</p>
                      <p className={styles.cardSub}>制作: {card.production || "-"} / 作者: {card.creator || "-"}</p>
                      <p className={styles.cardSub}>GM/ST: {card.gmSt || "-"} / PC: {card.playerCharacter || "-"}</p>
                      <div className={styles.memberChips}>
                        {card.members.map((member, idx) => (
                          <span key={idx} className={styles.memberChip}>{member}</span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      {card.cardImageUrl && <a href={card.cardImageUrl} target="_blank" rel="noreferrer" className={styles.smallLink}>画像</a>}
                      {card.scenarioUrl && <a href={card.scenarioUrl} target="_blank" rel="noreferrer" className={styles.smallLink}>シナリオ</a>}
                      {card.streamUrl && <a href={card.streamUrl} target="_blank" rel="noreferrer" className={styles.smallLink}>配信</a>}
                      {/* GM可能シナリオへ連携ボタン。右余白用クラスを追加 */}
                      <button
                        type="button"
                        className={styles.secondaryButton + ' ' + styles.copyToGMButton}
                        onClick={() => handleCopyToGM(card)}
                      >
                        GM可能シナリオへ連携
                      </button>
                      <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={() => handleDelete(card)}
                        disabled={saving || uploading}
                      >
                        削除
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}