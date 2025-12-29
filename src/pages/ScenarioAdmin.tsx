import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import sharedStyles from "./Schedule.shared.module.css";
import styles from "./ScenarioAdmin.module.css";
import { supabase } from "../lib/supabaseClient";
import type { ScenarioCard } from "../types/scenario";

const SCENARIO_TABLE = "tsuka_sinario_list";
const SCENARIO_BUCKET = "scenario-card-images";

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
  }, []);

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
                <input
                  name="category"
                  value={form.category}
                  onChange={handleInput}
                  placeholder="例: TRPG"
                />
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
    </main>
  );
}
