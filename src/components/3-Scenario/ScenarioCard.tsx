// ReactのuseStateフックをインポート
import { useState } from 'react';
// シナリオカード型をインポート
import type { ScenarioCard } from '../../types/scenario';
// スタイルをインポート
import styles from './ScenarioCard.module.css';

// props型定義
interface ScenarioCardProps {
  card: ScenarioCard;
  displayPassNumber?: number; // 絞り込み後の表示用通過番号
}

// シナリオカードコンポーネント本体
export function ScenarioCard({ card, displayPassNumber }: ScenarioCardProps) {
  // 画像モーダル表示状態
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* カード全体 */}
      <div className={styles.card}>
        {/* ヘッダー部分 */}
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.passNumber}>#{displayPassNumber ?? card.passNumber}</span>
            <h3 className={styles.title}>{card.title}</h3>
          </div>
          <span className={styles.category}>{card.category}</span>
        </div>

        {/* カード画像 */}
        <div className={styles.cardImage} onClick={() => card.cardImageUrl && setShowModal(true)}>
          {card.cardImageUrl ? (
            <img src={card.cardImageUrl} alt={card.title} />
          ) : (
            <div className={styles.imagePlaceholder}>No Image</div>
          )}
        </div>

        {/* カード内容 */}
        <div className={styles.cardContent}>
          <div className={styles.contentColumns}>
            {/* 左カラム：制作・作者・通過日 */}
            <div className={styles.leftColumn}>
              <div className={styles.infoItem}>
                <span className={styles.label}>制作：</span>
                <span className={styles.value}>{card.production || '-'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>作者様：</span>
                <span className={styles.value}>{card.creator || '-'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>通過日：</span>
                <span className={styles.value}>{card.playDate}</span>
              </div>
            </div>
            {/* 右カラム：担当CP・GM/ST・メンバー */}
            <div className={styles.rightColumn}>
              <div className={styles.infoItem}>
                <span className={styles.label}>担当CP：</span>
                <span className={styles.value}>{card.playerCharacter || '-'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>GM/ST：</span>
                <span className={styles.value}>{card.gmSt || '-'}</span>
              </div>
              <div className={styles.members}>
                <span className={styles.label}>メンバー：</span>
                <div className={styles.memberList}>
                  {card.members.map((member, idx) => (
                    <span key={idx} className={styles.memberTag}>
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* シナリオ・配信リンク */}
          <div className={styles.links}>
            {card.scenarioUrl && (
              <a href={card.scenarioUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                シナリオ
              </a>
            )}
            {card.streamUrl ? (
              <a href={card.streamUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                配信
              </a>
            ) : (
              <span className={styles.linkDisabled} title="配信URLが登録されていません">配信なし</span>
            )}
          </div>
        </div>
      </div>

      {/* 画像モーダル */}
      {showModal && card.cardImageUrl && (
        <div className={styles.imageModal} onClick={() => setShowModal(false)}>
          <img 
            src={card.cardImageUrl} 
            alt={card.title} 
            className={styles.imageModalContent}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
