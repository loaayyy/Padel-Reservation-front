import React, { useState } from 'react';
import '../../GlobalCSS/global.css';
import { RenderTimeslots } from './BookingComponents/RenderTimeslots.jsx';

const BookingPage = () => {
  const [selectedTime, setSelectedTime] = useState(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const resetBooking = () => {
    setSelectedTime(null);
    setIsBookingConfirmed(false);
  };

  return (
        <div id="page-booking" className="page">
            <div className="booking-page">

                <div style="margin-bottom:28px;">
                <h2 style="font-size:24px;font-weight:700;letter-spacing:-0.5px;">Book a court</h2>
                <p style="font-size:14px;color:var(--gray-400);margin-top:4px;">Select a date & time</p>
                </div>

                <div id="calendarSlider" className="calendar-slider">
                    
                </div>

                <div style="margin-bottom:24px;">
                <div className="form-label" style="margin-bottom:10px;">Time slot</div>
                <div id="timeSlots" className="time-slots">
                    <RenderTimeslots 
                        selectedTime={selectedTime} 
                        onTimeSelect={handleTimeSelect} 
                    />
                </div>
                </div>


                <div id="bookingConfirmed" className="confirmed-box">
                <div className="confirmed-icon">✓</div>
                <h3>Booking confirmed!</h3>
                <p>Your court has been reserved. See you on the court!</p>
                <button className="btn btn-ghost btn-sm" onClick={resetBooking}>Book another court</button>
                </div>

            </div>
        </div>
    );
}

export default BookingPage;
