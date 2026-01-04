import type { Event } from "../../lib/useSchedules";
import Holidays from "date-holidays";
import sharedStyles from "./Schedule.shared.module.css";

export type CalendarCell = {
  label: string;
  key: string;
  isToday: boolean;
  events: Event[];
  isEmpty: boolean;
  weekday?: number;
  isWeekend?: boolean;
  isHoliday?: boolean;
  badgeTypes?: Array<'stream-off' | 'work-off' | 'tentative'>;
};

const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getTimeCategory(timeStr: string | null): string {
  if (!timeStr || timeStr === "未定") return "undefined";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "undefined";
  const hour = parseInt(match[1], 10);
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 24) return "evening";
  if (hour >= 24 && hour < 30) return "late-night";
  return "undefined";
}

function getStartMinutes(timeStr: string | null): number {
  if (!timeStr || timeStr === "未定") return Number.POSITIVE_INFINITY;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.POSITIVE_INFINITY;
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  return hour * 60 + minute;
}

interface ScheduleCalendarProps {
  year: number;
  monthIndex: number;
  todayKey: string;
  eventsByDate: Record<string, Event[]>;
  onEventClick: (event: Event) => void;
  streamOffDays?: Set<string>;
  workOffDays?: Set<string>;
  tentativeDays?: Set<string>;
  onCellClick?: (dateKey: string) => void;
  onCellRightClick?: (dateKey: string, e: React.MouseEvent) => void;
  isClickable?: boolean;
}

export function ScheduleCalendar({ 
  year, 
  monthIndex, 
  todayKey, 
  eventsByDate, 
  onEventClick,
  streamOffDays = new Set(),
  workOffDays = new Set(),
  tentativeDays = new Set(),
  onCellClick,
  onCellRightClick,
  isClickable = false,
}: ScheduleCalendarProps) {
  const holidays = new Holidays('JP');
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  const calendarCells: CalendarCell[] = Array.from({ length: totalCells }, (_, index) => {
    const dateNumber = index - firstDayOfMonth + 1;
    if (dateNumber < 1 || dateNumber > daysInMonth) {
      return {
        key: `empty-${index}`,
        label: "",
        isToday: false,
        events: [],
        isEmpty: true,
      };
    }
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(dateNumber).padStart(2, "0")}`;
    const dateObj = new Date(year, monthIndex, dateNumber);
    const weekday = dateObj.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const isHoliday = Boolean(holidays.isHoliday(dateObj));
    
    const badgeTypes: Array<'stream-off' | 'work-off' | 'tentative'> = [];
    if (streamOffDays.has(dateKey)) badgeTypes.push('stream-off');
    if (workOffDays.has(dateKey)) badgeTypes.push('work-off');
    if (tentativeDays.has(dateKey)) badgeTypes.push('tentative');
    
    return {
      key: dateKey,
      label: String(dateNumber),
      isToday: dateKey === todayKey,
      events: eventsByDate[dateKey] ?? [],
      isEmpty: false,
      weekday,
      isWeekend,
      isHoliday,
      badgeTypes,
    };
  });

  return (
    <>
      <div className={sharedStyles.legendContainer}>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.legendDot} ${sharedStyles.legendMorning}`} />
            <span className={sharedStyles.legendText}>朝</span>
          </div>
        </div>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.legendDot} ${sharedStyles.legendAfternoon}`} />
            <span className={sharedStyles.legendText}>昼</span>
          </div>
        </div>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.legendDot} ${sharedStyles.legendEvening}`} />
            <span className={sharedStyles.legendText}>夜</span>
          </div>
        </div>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.legendDot} ${sharedStyles.legendLateNight}`} />
            <span className={sharedStyles.legendText}>深夜</span>
          </div>
        </div>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.legendDot} ${sharedStyles.legendUndefined}`} />
            <span className={sharedStyles.legendText}>時間未定</span>
          </div>
        </div>
      </div>
      <div className={sharedStyles.legendContainer} style={{ marginTop: '8px' }}>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.badgeMarker} ${sharedStyles['badge-stream-off']}`} style={{ fontSize: '0.7rem', padding: '1px 3px' }}>✕</span>
            <span className={sharedStyles.legendText}>配信休み</span>
          </div>
        </div>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.badgeMarker} ${sharedStyles['badge-work-off']}`} style={{ fontSize: '0.7rem', padding: '1px 3px' }}>〇</span>
            <span className={sharedStyles.legendText}>仕事休み</span>
          </div>
        </div>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.badgeMarker} ${sharedStyles['badge-tentative']}`} style={{ fontSize: '0.7rem', padding: '1px 3px' }}>？</span>
            <span className={sharedStyles.legendText}>予定入るかも</span>
          </div>
        </div>
      </div>
      <div className={sharedStyles.weekRow}>
        {weekdayLabels.map((day) => (
          <span key={day} className={sharedStyles.weekLabel}>{day}</span>
        ))}
      </div>
      <div className={sharedStyles.calendarGrid}>
        {calendarCells.map((cell) => {
          const classNames = [sharedStyles.dayCell];
          if (cell.isToday) classNames.push(sharedStyles.today);
          if (cell.events.length > 0) classNames.push(sharedStyles.hasEvent);
          if (cell.isEmpty) classNames.push(sharedStyles.empty);
          if (cell.badgeTypes?.includes('stream-off')) classNames.push(sharedStyles.streamOffDay);
          
          const badgeInfo = {
            'stream-off': { icon: '✕', label: '配信休み' },
            'work-off': { icon: '〇', label: '仕事休み' },
            'tentative': { icon: '？', label: '予定未定' },
          };
          
          return (
            <div 
              key={cell.key} 
              className={classNames.join(" ")}
              onClick={() => !cell.isEmpty && onCellClick && onCellClick(cell.key)}
              onContextMenu={(e) => !cell.isEmpty && onCellRightClick && onCellRightClick(cell.key, e)}
              title={isClickable ? "右クリックでバッジを追加/削除" : undefined}
              style={isClickable && !cell.isEmpty ? { cursor: 'pointer' } : undefined}
            >
              <div className={sharedStyles.dateRow}>
                {(() => {
                  const dateClasses = [sharedStyles.dateNumber];
                  if (cell.isHoliday) {
                    dateClasses.push(sharedStyles.holidayDate);
                  } else if (cell.weekday === 0) {
                    dateClasses.push(sharedStyles.sundayDate);
                  } else if (cell.weekday === 6) {
                    dateClasses.push(sharedStyles.saturdayDate);
                  }
                  return <span className={dateClasses.join(' ')}>{cell.label}</span>;
                })()}
                {cell.badgeTypes && cell.badgeTypes.length > 0 && (
                  <div className={sharedStyles.badgeContainer}>
                    {cell.badgeTypes.map((badgeType) => (
                      <span 
                        key={badgeType}
                        className={`${sharedStyles.badgeMarker} ${sharedStyles[`badge-${badgeType}`]}`}
                        title={badgeInfo[badgeType].label}
                      >
                        {badgeInfo[badgeType].icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {cell.events.length > 0 && (
                <ul className={sharedStyles.eventList}>
                  {[...cell.events]
                    .sort((a, b) => getStartMinutes(a.start_time) - getStartMinutes(b.start_time))
                    .map((event) => {
                    const timeCategory = getTimeCategory(event.start_time);
                    const startLabel = event.start_time || "未定";
                    const timeDisplay = event.end_time ? `${startLabel}-${event.end_time}` : startLabel;
                    const categoryDisplay = event.category || "未分類";
                    return (
                      <li
                        key={`${event.id}-${event.title}`}
                        className={`${sharedStyles.eventChip} ${sharedStyles[`event-${timeCategory}`]}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onEventClick(event);
                          }
                        }}
                      >
                        <div className={sharedStyles.eventText}>
                          <span className={sharedStyles.eventTitleRow}>
                            <span className={sharedStyles.eventCategory} title={categoryDisplay}>{categoryDisplay}</span>
                            {event.title && (
                              <span className={sharedStyles.eventTitle} title={event.title}>{event.title}</span>
                            )}
                          </span>
                          <span className={sharedStyles.eventTime}>（{timeDisplay}）</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
