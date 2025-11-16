import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import './CalendarView.css';

const CalendarView = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const fetchAppointments = async () => {
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const response = await axios.get('/api/appointments', {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return isSameDay(aptDate, date);
    });
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (loading) {
    return <div className="loading">Loading calendar...</div>;
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-btn">
          <FiChevronLeft />
        </button>
        <h2>{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth} className="nav-btn">
          <FiChevronRight />
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="calendar-day empty"></div>
          ))}
          
          {daysInMonth.map(day => {
            const dayAppointments = getAppointmentsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <div
                key={day.toISOString()}
                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayAppointments.length > 0 ? 'has-appointments' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="day-number">{format(day, 'd')}</div>
                {dayAppointments.length > 0 && (
                  <div className="appointment-indicators">
                    {dayAppointments.slice(0, 3).map((apt, idx) => (
                      <div
                        key={idx}
                        className={`appointment-dot status-${apt.status}`}
                        title={`${apt.appointmentTime} - ${apt.patient?.user?.firstName} ${apt.patient?.user?.lastName}`}
                      />
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="appointment-more">+{dayAppointments.length - 3}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="selected-date-appointments">
          <h3>Appointments on {format(selectedDate, 'MMMM dd, yyyy')}</h3>
          <div className="appointments-list">
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <p className="no-appointments">No appointments scheduled</p>
            ) : (
              getAppointmentsForDate(selectedDate).map(apt => (
                <div key={apt._id} className="appointment-item">
                  <div className="appointment-time">{apt.appointmentTime}</div>
                  <div className="appointment-details">
                    <div className="appointment-patient">
                      {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                    </div>
                    <div className="appointment-doctor">
                      Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                    </div>
                    {apt.reason && (
                      <div className="appointment-reason">{apt.reason}</div>
                    )}
                  </div>
                  <span className={`status-badge status-${apt.status}`}>
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;

