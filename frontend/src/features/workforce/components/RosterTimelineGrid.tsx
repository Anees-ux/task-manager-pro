import React, { useState, useMemo } from 'react';
import type { User, Allocation, TimeOff } from '../types/workforce.types';
import { TimelineBlock } from './TimelineBlock';
import { formatDate } from '@shared/lib/dateUtils';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconUser,
  IconPlaneDeparture,
} from '@tabler/icons-react';

interface RosterTimelineGridProps {
  users: User[];
  allocations: Allocation[];
  timeOffs?: TimeOff[];
}

export function RosterTimelineGrid({
  users,
  allocations,
  timeOffs = [],
}: RosterTimelineGridProps) {
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    // Align to Monday of current week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  const [daysCount, setDaysCount] = useState<7 | 14>(7);

  // Generate array of calendar days in the visible window
  const days = useMemo(() => {
    const result: { date: Date; dateStr: string; dayName: string; dayNum: number; isToday: boolean; isWeekend: boolean }[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();

      result.push({
        date: d,
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
    return result;
  }, [startDate, daysCount]);

  const handlePrev = () => {
    const next = new Date(startDate);
    next.setDate(startDate.getDate() - daysCount);
    setStartDate(next);
  };

  const handleNext = () => {
    const next = new Date(startDate);
    next.setDate(startDate.getDate() + daysCount);
    setStartDate(next);
  };

  const handleToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setStartDate(new Date(d.setDate(diff)));
  };

  const endDate = days[days.length - 1]?.date || startDate;
  const dateRangeLabel = `${formatDate(startDate, 'MMM dd, yyyy')} – ${formatDate(endDate, 'MMM dd, yyyy')}`;

  return (
    <div className="card glass-surface p-0 overflow-hidden shadow-sm border-0">
      {/* Top Header & Navigation Bar */}
      <div className="p-3 border-bottom border-secondary-subtle bg-body-tertiary d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group shadow-sm">
            <button
              type="button"
              onClick={handlePrev}
              className="btn btn-sm btn-outline-secondary btn-icon"
              title="Previous Range"
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="btn btn-sm btn-outline-secondary px-3"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-sm btn-outline-secondary btn-icon"
              title="Next Range"
            >
              <IconChevronRight size={16} />
            </button>
          </div>

          <div className="d-flex align-items-center gap-1.5 ms-2 text-body fw-bold small">
            <IconCalendar size={16} className="text-primary" />
            <span>{dateRangeLabel}</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="btn-group btn-group-sm shadow-sm" role="group">
            <button
              type="button"
              className={`btn ${daysCount === 7 ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setDaysCount(7)}
            >
              7 Days
            </button>
            <button
              type="button"
              className={`btn ${daysCount === 14 ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setDaysCount(14)}
            >
              14 Days
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Day Timeline Grid */}
      <div className="table-responsive">
        <div
          className="d-flex flex-column"
          style={{
            minWidth: daysCount === 14 ? '1200px' : '900px',
            '--timeline-cols': daysCount,
          } as React.CSSProperties}
        >
          {/* Header Row: User Column + Days Header */}
          <div className="d-flex border-bottom border-secondary-subtle bg-body-tertiary">
            {/* Left Sticky User Header */}
            <div
              className="p-3 text-secondary small fw-bold text-uppercase flex-shrink-0 border-end border-secondary-subtle"
              style={{ width: '260px', fontSize: '0.675rem', letterSpacing: '0.06em' }}
            >
              Team Member & Role
            </div>

            {/* Days Columns */}
            <div className="d-flex flex-fill">
              {days.map((day) => (
                <div
                  key={day.dateStr}
                  className={`flex-fill p-2 text-center border-end border-secondary-subtle ${
                    day.isWeekend ? 'bg-body-secondary opacity-75' : ''
                  } ${day.isToday ? 'bg-primary-subtle' : ''}`}
                  style={{ minWidth: '85px' }}
                >
                  <div className="text-secondary small fw-semibold" style={{ fontSize: '0.7rem' }}>
                    {day.dayName}
                  </div>
                  <div
                    className={`d-inline-flex align-items-center justify-content-center fw-bold rounded-circle mt-0.5 ${
                      day.isToday
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-body'
                    }`}
                    style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}
                  >
                    {day.dayNum}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Rows & Allocation Streams */}
          {users.length === 0 ? (
            <div className="p-5 text-center text-secondary small">
              No team members found in this workspace.
            </div>
          ) : (
            users.map((user) => {
              const userAllocations = allocations.filter((a) => a.userId === user.id);
              const userTimeOffs = timeOffs.filter((t) => t.userId === user.id && t.status === 'Approved');

              return (
                <div
                  key={user.id}
                  className="d-flex border-bottom border-secondary-subtle transition-fast"
                  style={{ minHeight: '80px' }}
                >
                  {/* Left User Card */}
                  <div
                    className="p-3 d-flex align-items-center gap-2.5 flex-shrink-0 border-end border-secondary-subtle bg-body-tertiary"
                    style={{ width: '260px' }}
                  >
                    <div
                      className="avatar avatar-sm rounded-circle bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                      style={{ width: '34px', height: '34px' }}
                    >
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName || user.username} className="rounded-circle" />
                      ) : (
                        (user.fullName || user.username).charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="fw-semibold text-body text-truncate small" style={{ fontSize: '0.825rem' }}>
                        {user.fullName || user.username}
                      </div>
                      <div className="d-flex align-items-center gap-1.5 mt-0.5">
                        <span className="badge bg-body-secondary text-secondary border border-secondary-subtle px-1.5 py-0.5 rounded small" style={{ fontSize: '0.65rem' }}>
                          {user.role || 'Member'}
                        </span>
                        {user.hourlyRate > 0 && (
                          <span className="text-muted small" style={{ fontSize: '0.68rem' }}>
                            ${user.hourlyRate}/h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Timeline Date Track */}
                  <div className="d-flex flex-fill position-relative">
                    {/* Background Column Grid Lines */}
                    {days.map((day) => (
                      <div
                        key={day.dateStr}
                        className={`flex-fill border-end border-secondary-subtle ${
                          day.isWeekend ? 'bg-body-secondary opacity-50' : ''
                        }`}
                        style={{ minWidth: '85px' }}
                      />
                    ))}

                    {/* Render Time-Off Blocks (Vacation / Leave) */}
                    {userTimeOffs.map((leave) => {
                      const startIdx = days.findIndex((d) => d.dateStr === leave.startDate);
                      const endIdx = days.findIndex((d) => d.dateStr === leave.endDate);

                      // If leave overlaps visible window
                      const gridStart = Math.max(0, startIdx === -1 ? 0 : startIdx);
                      const gridEnd = Math.min(daysCount - 1, endIdx === -1 ? daysCount - 1 : endIdx);
                      const span = Math.max(1, gridEnd - gridStart + 1);

                      return (
                        <div
                          key={leave.id}
                          className="position-absolute rounded-2 px-2 py-1.5 bg-purple-subtle text-purple border border-purple-subtle d-flex align-items-center gap-1 shadow-sm"
                          style={{
                            left: `calc(${gridStart} * (100% / var(--timeline-cols)) + 4px)`,
                            width: `calc(${span} * (100% / var(--timeline-cols)) - 8px)`,
                            top: '8px',
                            bottom: '8px',
                            zIndex: 1,
                            fontSize: '0.72rem',
                          }}
                          title={`Approved Time Off: ${leave.type} (${leave.totalDays} days)`}
                        >
                          <IconPlaneDeparture size={14} className="flex-shrink-0" />
                          <span className="fw-semibold text-truncate">{leave.type} Leave</span>
                        </div>
                      );
                    })}

                    {/* Render Allocation Task Blocks */}
                    {userAllocations.map((alloc) => {
                      let startIdx = days.findIndex((d) => d.dateStr === alloc.startDate);
                      let endIdx = days.findIndex((d) => d.dateStr === alloc.endDate);

                      if (startIdx === -1 && endIdx === -1) {
                        // Fallback: If both outside range, check if spanning across
                        const allocStart = new Date(alloc.startDate);
                        const allocEnd = new Date(alloc.endDate);
                        if (allocStart <= endDate && allocEnd >= startDate) {
                          startIdx = 0;
                          endIdx = daysCount - 1;
                        } else {
                          return null;
                        }
                      } else {
                        if (startIdx === -1) startIdx = 0;
                        if (endIdx === -1) endIdx = daysCount - 1;
                      }

                      const gridStartCol = startIdx + 1;
                      const gridColSpan = Math.max(1, endIdx - startIdx + 1);

                      return (
                        <TimelineBlock
                          key={alloc.id}
                          allocation={alloc}
                          gridStartCol={gridStartCol}
                          gridColSpan={gridColSpan}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
