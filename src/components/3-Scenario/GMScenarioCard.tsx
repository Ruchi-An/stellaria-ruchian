import { useState } from 'react';
import type { GMScenarioCard as GMScenarioCardType } from '../../types/scenario';
import styles from './GMScenarioCard.module.css';

interface GMScenarioCardProps {
  card: GMScenarioCardType;
}

export function GMScenarioCard({ card }: GMScenarioCardProps) {
  // 画像モーダル表示状態
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={styles.card}>
        {/* ヘッダー部分 */}
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>{card.title}</h3>
          </div>
          {card.category && <span className={styles.category}>{card.category}</span>}
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
          {/* 左カラム */}
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
              <span className={styles.label}>PL人数：</span>
              <span className={styles.value}>{card.plPlayers || '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>所要時間：</span>
              <span className={styles.value}>{card.playTime || '-'}</span>
            </div>
          </div>
          
          {/* 右カラム */}
          <div className={styles.rightColumn}>
            <div className={styles.infoItem}>
              <span className={styles.label}>GM回数：</span>
              <span className={styles.value}>{card.gmPlayCount !== undefined ? `${card.gmPlayCount}回` : '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>配信：</span>
              <span className={styles.value}>{card.streamOkng === true ? '可' : card.streamOkng === false ? '否' : '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>販売ページ：</span>
              {card.scenarioUrl ? (
                <a 
                  href={card.scenarioUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.link}
                >
                  リンク
                </a>
              ) : (
                <span className={styles.value}>-</span>
              )}
            </div>
          </div>
        </div>

        {/* 備考欄 */}
        {card.notes && (
          <div className={styles.notesSection}>
            <span className={styles.label}>備考：</span>
            <p className={styles.notes}>{card.notes}</p>
          </div>
        )}
      </div>
    </div>

      {/* 画像モーダル */}
      {showModal && card.cardImageUrl && (
        <div className={styles.imageModal} onClick={() => setShowModal(false)}>
          <img 
            src={card.cardImageUrl} 
            alt={card.title} 
            className={styles.imageModalContent}
          />
        </div>
      )}
    </>
  );
}
