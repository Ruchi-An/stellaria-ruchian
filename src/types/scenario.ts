// シナリオカード型定義
export interface ScenarioCard {
  // 通過数（日付で連番）
  passNumber: number;
  // シナリオタイトル
  title: string;
  // シナリオカテゴリ
  category?: string;
  // 制作
  production?: string;
  // 作者様
  creator?: string;
  // GM/ST
  gmSt?: string;
  // 担当PC
  playerCharacter?: string;
  // 通過日 (ISO文字列 or YYYY-MM-DD)
  playDate: string;
  // メンバー
  members: string[];
  // シナリオリンク
  scenarioUrl?: string;
  // 配信リンク
  streamUrl?: string;
  // 画像URL（pngなど）
  cardImageUrl?: string;
}

// GM可能シナリオカード型定義
export interface GMScenarioCard {
  // ID
  id: number;
  // シナリオタイトル
  title: string;
  // シナリオカテゴリ
  category?: string;
  // 制作
  production?: string;
  // 作者様
  creator?: string;
  // PL人数
  plPlayers?: string;
  // プレイ時間
  playTime?: string;
  // GM卓回数
  gmPlayCount?: number;
  // シナリオリンク
  scenarioUrl?: string;
  // メモ/備考
  notes?: string;
  // 画像URL（pngなど）
  cardImageUrl?: string;
  // 配信可否
  streamOkng?: boolean;
}
