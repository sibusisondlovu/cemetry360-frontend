import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import api from '../services/api';

const BookingCalendar = ({ onBookingClick, onDateSelect, searchQuery = '' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [conflicts, setConflicts] = useState([]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    fetchBookings();
  }, [currentDate, searchQuery]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const startDate = format(monthStart, 'yyyy-MM-dd');
      const endDate = format(monthEnd, 'yyyy-MM-dd');
      
      const response = await api.get('/bookings', {
        params: {
          dateFrom: startDate,
          dateTo: endDate,
        },
      });

      let filteredBookings = response.data;
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredBookings = filteredBookings.filter(booking => 
          booking.deceasedId?.fullName?.toLowerCase().includes(query) ||
          booking.plotId?.uniqueIdentifier?.toLowerCase().includes(query) ||
          booking.confirmationNumber?.toLowerCase().includes(query) ||
          booking.cemeteryId?.name?.toLowerCase().includes(query)
        );
      }

      setBookings(filteredBookings);
      detectConflicts(filteredBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectConflicts = (bookingsList) => {
    const conflictsList = [];
    const timeSlots = {};

    bookingsList.forEach(booking => {
      if (booking.status === 'Pending' || booking.status === 'Confirmed') {
        const dateKey = format(new Date(booking.requestedDate), 'yyyy-MM-dd');
        const timeKey = booking.requestedTime;
        const slotKey = `${dateKey}-${timeKey}-${booking.plotId?._id || booking.crematoriumId?._id}`;

        if (timeSlots[slotKey]) {
          conflictsList.push({
            booking1: timeSlots[slotKey],
            booking2: booking,
            date: dateKey,
            time: timeKey,
            location: booking.plotId?.uniqueIdentifier || booking.crematoriumId?.name,
          });
        } else {
          timeSlots[slotKey] = booking;
        }
      }
    });

    setConflicts(conflictsList);
  };

  const getBookingsForDate = (date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.requestedDate), date)
    );
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const getDayClass = (date) => {
    const dayBookings = getBookingsForDate(date);
    const hasConflict = conflicts.some(c => 
      isSameDay(new Date(c.date), date)
    );
    
    let classes = 'h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50';
    
    if (isToday(date)) {
      classes += ' bg-blue-50 border-blue-300';
    }
    
    if (hasConflict) {
      classes += ' bg-red-100 border-red-400';
    }
    
    if (dayBookings.length > 0) {
      classes += ' bg-yellow-50';
    }
    
    return classes;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          ← Prev
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Next →
        </button>
      </div>

      {conflicts.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 font-semibold">
            ⚠️ {conflicts.length} conflict(s) detected
          </p>
          <ul className="mt-2 text-sm text-red-700">
            {conflicts.slice(0, 3).map((conflict, idx) => (
              <li key={idx}>
                {format(new Date(conflict.date), 'MMM dd')} at {conflict.time} - {conflict.location}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date) => {
          const dayBookings = getBookingsForDate(date);
          const dayConflicts = conflicts.filter(c => 
            isSameDay(new Date(c.date), date)
          );

          return (
            <div
              key={date.toISOString()}
              className={getDayClass(date)}
              onClick={() => handleDateClick(date)}
            >
              <div className="text-sm font-medium mb-1">
                {format(date, 'd')}
              </div>
              <div className="space-y-1">
                {dayBookings.slice(0, 2).map((booking) => (
                  <div
                    key={booking._id || booking.id}
                    className={`text-xs p-1 rounded truncate ${
                      booking.status === 'Confirmed'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onBookingClick) onBookingClick(booking);
                    }}
                    title={`${booking.deceasedId?.fullName || 'Unknown'} - ${booking.requestedTime}`}
                  >
                    {booking.requestedTime} {booking.deceasedId?.fullName?.substring(0, 10) || 'Booking'}
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayBookings.length - 2} more
                  </div>
                )}
                {dayConflicts.length > 0 && (
                  <div className="text-xs text-red-600 font-semibold">
                    ⚠️ Conflict
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">
            Bookings for {format(selectedDate, 'MMMM dd, yyyy')}
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {getBookingsForDate(selectedDate).map((booking) => (
              <div
                key={booking._id || booking.id}
                className="p-2 bg-white rounded border cursor-pointer hover:bg-blue-50"
                onClick={() => onBookingClick && onBookingClick(booking)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    {booking.deceasedId?.fullName || 'Unknown'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {booking.requestedTime}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {booking.plotId?.uniqueIdentifier || booking.crematoriumId?.name || 'No location'}
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;


