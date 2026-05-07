  import React from 'react';

const TIMES = ['12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'];

export const RenderTimeslots = ({ selectedTimes = [], onTimeSelect, bookings = [], selectedDate }) => {
  const isTimeSlotBooked = (time) => {
    const [hours, minutes, period] = time.match(/(\d+):(\d+)\s(AM|PM)/).slice(1);
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return bookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hour, parseInt(minutes), 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(slotStart.getHours() + 1);

      return (
        (bookingStart < slotEnd && bookingEnd > slotStart) ||
        (slotStart < bookingEnd && slotEnd > bookingStart)
      );
    });
  };

  return (
    <div className="time-slots-grid">
      {TIMES.map(time => {
        const isBooked = isTimeSlotBooked(time);
        const isSelected = selectedTimes.includes(time);
        
        return (
          <button
            key={time}
            className={`time-slot ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
            onClick={() => !isBooked && onTimeSelect(time)}
            disabled={isBooked}
          >
            {time}
            {isBooked && <span className="booked-indicator">•</span>}
          </button>
        );
      })}
    </div>
  );
};