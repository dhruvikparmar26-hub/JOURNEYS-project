import React from 'react';
import { Calendar } from 'lucide-react';

const DayNav = ({ days = [], activeDayNumber, onDayClick }) => {
  if (!days || days.length <= 1) return null;

  return (
    <div className="w-full">
      {/* Mobile Horizontal Scroll Chip-Row */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-3 pt-1 px-1 no-scrollbar scroll-smooth">
        {days.map((day) => {
          const isActive = day.dayNumber === activeDayNumber;
          return (
            <button
              key={day.dayNumber}
              onClick={() => onDayClick(day)}
              className={`
                flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-accent-gold text-[#00612e] border-accent-gold shadow-sm font-bold'
                  : 'bg-bg-surface text-text-secondary border-border/50 hover:border-text-secondary hover:text-text-primary'
                }
              `}
            >
              Day {day.dayNumber}
            </button>
          );
        })}
      </div>

      {/* Desktop Sticky Vertical List */}
      <div className="hidden md:flex flex-col gap-1.5 p-4 bg-bg-surface border border-border rounded-2xl shadow-[0_4px_20px_rgba(13,46,39,0.04)]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 px-2 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          Trip Schedule
        </h4>
        <div className="space-y-1 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
          {days.map((day) => {
            const isActive = day.dayNumber === activeDayNumber;
            return (
              <button
                key={day.dayNumber}
                onClick={() => onDayClick(day)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer
                  ${isActive
                    ? 'bg-selected-bg text-[#006d35] font-bold border-l-4 border-accent-gold pl-2'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70'
                  }
                `}
              >
                <div className="truncate pr-2">
                  <span className="opacity-70 mr-1.5">Day {day.dayNumber}:</span>
                  <span className="font-medium text-text-primary">{day.title || 'Exploration'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayNav;
