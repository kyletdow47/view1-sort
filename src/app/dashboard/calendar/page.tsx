'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

/* ---------- constants ---------- */

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* First day-of-week (0=Sun) for each month of 2026 */
const FIRST_DAY_OF_MONTH_2026 = [3, 6, 6, 2, 4, 0, 2, 5, 1, 3, 6, 1];
const DAYS_IN_MONTH_2026 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

interface MockEvent {
  id: number;
  day: number;
  month: number;
  title: string;
  type: string;
  time: string;
  location: string;
  team: string;
  status: 'Confirmed' | 'Pending';
}

const MOCK_EVENTS: MockEvent[] = [
  { id: 1, day: 5, month: 2, title: 'Sterling Wedding', type: 'Wedding', time: '14:00 - 22:00', location: 'Sonoma Valley', team: 'Alex Rivera (Lead)', status: 'Confirmed' },
  { id: 2, day: 12, month: 2, title: 'Vogue Editorial', type: 'Editorial', time: '09:00 - 17:00', location: 'Studio A', team: 'Mia Chen (Lead)', status: 'Pending' },
  { id: 3, day: 19, month: 2, title: 'Marcus Portrait', type: 'Portrait', time: '11:00 - 13:00', location: 'Urban Loft', team: 'Sam Torres (Lead)', status: 'Confirmed' },
  { id: 4, day: 26, month: 2, title: 'Napa Engagement', type: 'Engagement', time: '16:00 - 19:00', location: 'Napa Vineyards', team: 'Alex Rivera (Lead)', status: 'Confirmed' },
  { id: 5, day: 8, month: 3, title: 'Spring Lookbook', type: 'Editorial', time: '10:00 - 16:00', location: 'Botanical Gardens', team: 'Mia Chen (Lead)', status: 'Pending' },
  { id: 6, day: 22, month: 3, title: 'Chen Family Session', type: 'Family', time: '09:00 - 11:00', location: 'Golden Gate Park', team: 'Sam Torres (Lead)', status: 'Confirmed' },
];

const TODAY_MONTH = 2; // March (0-indexed)
const TODAY_DAY = 26;

/* ---------- component ---------- */

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(TODAY_MONTH);
  const [selectedDay, setSelectedDay] = useState<number | null>(TODAY_DAY);

  const daysInMonth = DAYS_IN_MONTH_2026[currentMonth];
  const firstDayOfMonth = FIRST_DAY_OF_MONTH_2026[currentMonth];

  const eventsForDay = (day: number) =>
    MOCK_EVENTS.filter((e) => e.day === day && e.month === currentMonth);

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];
  const selectedEvent = selectedEvents[0] ?? null;

  const isToday = (day: number) => currentMonth === TODAY_MONTH && day === TODAY_DAY;

  /* ---- calendar grid ---- */

  const renderDays = () => {
    const cells: React.ReactNode[] = [];

    // leading empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="h-28 border-r border-b border-outline-variant/5 bg-surface-container-lowest/20"
        />,
      );
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayEvents = eventsForDay(d);
      const hasEvent = dayEvents.length > 0;
      const isSelected = selectedDay === d;

      cells.push(
        <div
          key={d}
          onClick={() => setSelectedDay(d)}
          className={[
            'h-28 border-r border-b border-outline-variant/5 p-2 transition-all cursor-pointer group relative',
            isSelected ? 'bg-primary/5' : 'hover:bg-surface-container-high/20',
            isToday(d) && !isSelected ? 'bg-surface-container-high/40' : '',
          ].join(' ')}
        >
          <div className="flex justify-between items-start">
            <span
              className={[
                'text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all',
                isSelected
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant/40 group-hover:text-on-surface',
                isToday(d) && !isSelected ? 'ring-1 ring-primary/40 text-primary' : '',
              ].join(' ')}
            >
              {d}
            </span>
            {hasEvent && (
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {dayEvents.length > 1 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                )}
              </div>
            )}
          </div>

          {hasEvent && (
            <div className="mt-2 space-y-1 overflow-hidden">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="px-2 py-1 bg-surface-container-high rounded-md border-l-2 border-primary overflow-hidden"
                >
                  <p className="text-[9px] font-headline font-bold text-on-surface truncate">
                    {event.title}
                  </p>
                  <p className="text-[8px] font-mono text-on-surface-variant/60 uppercase tracking-widest truncate">
                    {event.time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>,
      );
    }

    return cells;
  };

  /* ---- render ---- */

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface italic flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-primary" />
            Studio Availability
          </h2>
          <p className="text-on-surface-variant font-body mt-2">
            Manage your shoot schedule, availability slots, and booking confirmations.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition-all border border-outline-variant/10 text-on-surface">
            <Search className="w-4 h-4" />
            Find Slot
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-[#ffb780] to-[#d48441] text-on-primary rounded-xl text-xs font-mono font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all">
            <Plus className="w-4 h-4" />
            Add Booking
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========== Calendar Grid ========== */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden shadow-sm">
            {/* Month header */}
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-headline font-extrabold tracking-tighter italic text-on-surface">
                  {MONTHS[currentMonth]} 2026
                </h3>
                <div className="flex gap-1 p-1 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                  <button
                    onClick={() => {
                      setCurrentMonth((prev) => Math.max(0, prev - 1));
                      setSelectedDay(null);
                    }}
                    className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentMonth((prev) => Math.min(11, prev + 1));
                      setSelectedDay(null);
                    }}
                    className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-surface-container-high text-primary rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest">
                  Month
                </button>
                <button className="px-4 py-1.5 text-on-surface-variant/40 hover:text-on-surface rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-colors">
                  Week
                </button>
                <button className="px-4 py-1.5 text-on-surface-variant/40 hover:text-on-surface rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-colors">
                  Day
                </button>
              </div>
            </div>

            {/* Weekday header row */}
            <div className="grid grid-cols-7 border-b border-outline-variant/10 bg-surface-container-high/30">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant/60"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">{renderDays()}</div>
          </div>
        </div>

        {/* ========== Right Sidebar: Day Inspector ========== */}
        <div className="lg:col-span-4 space-y-6">
          {selectedDay ? (
            <div
              key={`${currentMonth}-${selectedDay}`}
              className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-sm space-y-8 transition-all duration-300"
            >
              {/* Inspector header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest mb-1">
                    Agenda for
                  </p>
                  <h3 className="text-3xl font-headline font-extrabold tracking-tighter italic text-on-surface">
                    {MONTHS[currentMonth]} {selectedDay}, 2026
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-xl font-mono font-bold text-on-surface">
                  {selectedDay}
                </div>
              </div>

              {/* Event details or empty state */}
              <div className="space-y-4">
                {selectedEvent ? (
                  <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/5 space-y-6 relative overflow-hidden group">
                    {/* Left accent bar */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-mono font-bold uppercase tracking-widest rounded-md">
                          {selectedEvent.type}
                        </span>
                        <h4 className="text-xl font-headline font-bold mt-2 text-on-surface">
                          {selectedEvent.title}
                        </h4>
                      </div>
                      <div
                        className={[
                          'flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest',
                          selectedEvent.status === 'Confirmed' ? 'text-secondary' : 'text-tertiary',
                        ].join(' ')}
                      >
                        {selectedEvent.status === 'Confirmed' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {selectedEvent.status}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-on-surface-variant/60">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-headline">{selectedEvent.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant/60">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-headline">{selectedEvent.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant/60">
                        <User className="w-4 h-4" />
                        <span className="text-xs font-headline">{selectedEvent.team}</span>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-2">
                      <button className="flex-1 py-2.5 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all text-on-surface">
                        Edit Details
                      </button>
                      <button className="flex-1 py-2.5 bg-gradient-to-br from-[#ffb780] to-[#d48441] text-on-primary rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest shadow-lg transition-all">
                        Open Project
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-on-surface-variant/40 gap-4 border-2 border-dashed border-outline-variant/10 rounded-2xl">
                    <CalendarIcon className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-headline italic">No events scheduled</p>
                    <button className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary hover:underline">
                      + Add Booking
                    </button>
                  </div>
                )}
              </div>

              {/* Availability slots */}
              <div className="pt-6 border-t border-outline-variant/10">
                <h4 className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-widest font-bold mb-4">
                  Availability Slots
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {['09:00 - 11:00', '13:00 - 15:00', '16:00 - 18:00'].map((slot) => (
                    <button
                      key={slot}
                      className="py-2 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-[9px] font-mono text-on-surface-variant/60 hover:border-primary/40 hover:text-primary transition-all"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-sm h-96 flex flex-col items-center justify-center text-on-surface-variant/40 gap-4">
              <CalendarIcon className="w-16 h-16 opacity-10" />
              <p className="text-sm font-headline italic">Select a day to view agenda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
