import type { Event } from "../../lib/useSchedules";
import sharedStyles from "./Schedule.shared.module.css";

interface UndefinedScheduleListProps {
  undefinedSchedules: Event[];
  isOpen: boolean;
  onToggle: () => void;
  onEventClick: (event: Event) => void;
}

export function UndefinedScheduleList({ undefinedSchedules, isOpen, onToggle, onEventClick }: UndefinedScheduleListProps) {
  return (
    <section className={sharedStyles.calendarSection + ' ' + sharedStyles.undefinedSectionMargin}>
      <div className={sharedStyles.undefinedSection}>
        <button
          className={sharedStyles.undefinedToggleButton}
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <span className={sharedStyles.toggleIcon}>
            {isOpen ? '▼' : '▶'}
          </span>
          <span className={sharedStyles.undefinedTitle}>日にち未定の予定</span>
          <span className={sharedStyles.undefinedCount}>({undefinedSchedules.length}件)</span>
        </button>
        {isOpen && (
          <div className={sharedStyles.undefinedList}>
            {undefinedSchedules.length > 0 ? (
              <ul className={sharedStyles.undefinedItems}>
                {undefinedSchedules.map((event) => {
                  const categoryDisplay = event.category || '未分類';
                  return (
                    <li
                      key={`${event.id}-${event.title}`}
                      className={sharedStyles.undefinedItem}
                    >
                      <div
                        className={sharedStyles.undefinedEventChip}
                        onClick={() => onEventClick(event)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onEventClick(event);
                          }
                        }}
                      >
                        <div className={sharedStyles.undefinedEventText}>
                          <span className={sharedStyles.undefinedEventCategory}>{categoryDisplay}</span>
                          {event.title && (
                            <span className={sharedStyles.undefinedEventTitle} title={event.title}>{event.title}</span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={sharedStyles.emptyMessage}>日にち未定の予定はありません</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
