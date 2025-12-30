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

interface ScheduleCalendarProps {
  year: number;
  monthIndex: number;
  todayKey: string;
  eventsByDate: Record<string, Event[]>;
  onEventClick: (event: Event) => void;
}

export function ScheduleCalendar({ year, monthIndex, todayKey, eventsByDate, onEventClick }: ScheduleCalendarProps) {
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
    return {
      key: dateKey,
      label: String(dateNumber),
      isToday: dateKey === todayKey,
      events: eventsByDate[dateKey] ?? [],
      isEmpty: false,
      weekday,
      isWeekend,
      isHoliday,
    };
  });

  return (
    <>
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
          return (
            <div key={cell.key} className={classNames.join(" ")}>
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
              {cell.events.length > 0 && (
                <ul className={sharedStyles.eventList}>
                  {cell.events.map((event) => {
                    const timeCategory = getTimeCategory(event.start_time);
                    const startLabel = event.start_time || "未定";
                    const timeDisplay = event.end_time ? `${startLabel}-${event.end_time}` : startLabel;
                    const categoryDisplay = event.category || "未分類";
                    return (
                      <li
                        key={`${event.id}-${event.title}`}
                        className={`${sharedStyles.eventChip} ${sharedStyles[`event-${timeCategory}`]}`}
                        onClick={() => onEventClick(event)}
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
