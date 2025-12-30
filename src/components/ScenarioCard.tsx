import { useState } from 'react';
import type { ScenarioCard } from '../types/scenario';
import styles from './ScenarioCard.module.css';

interface ScenarioCardProps {
  card: ScenarioCard;
}

export function ScenarioCard({ card }: ScenarioCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.passNumber}>#{card.passNumber}</span>
            <h3 className={styles.title}>{card.title}</h3>
          </div>
          <span className={styles.category}>{card.category}</span>
        </div>

        <div className={styles.cardImage} onClick={() => card.cardImageUrl && setShowModal(true)}>
          {card.cardImageUrl ? (
            <img src={card.cardImageUrl} alt={card.title} />
          ) : (
            <div className={styles.imagePlaceholder}>No Image</div>
          )}
        </div>

      <div className={styles.cardContent}>
        <div className={styles.contentColumns}>
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
