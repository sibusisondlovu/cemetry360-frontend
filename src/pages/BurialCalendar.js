import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function BurialCalendar() {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [burials, setBurials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [conflicts, setConflicts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    detectConflicts();
  }, [bookings, burials]);

  const fetchData = async () => {
    try {
      const [bookingsRes, burialsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/burials'),
      ]);

      setBookings(bookingsRes.data);
      setBurials(burialsRes.data);
      
      // Combine bookings and burials into calendar events
      const calendarEvents = [
        ...bookingsRes.data.map(booking => ({
          id: `booking-${booking._id || booking.id}`,
          title: `${booking.deceased?.fullName || 'Unknown'} - Booking`,
          start: new Date(`${booking.requestedDate}T${booking.requestedTime || '10:00'}`),
          end: new Date(new Date(`${booking.requestedDate}T${booking.requestedTime || '10:00'}`).getTime() + (booking.serviceDuration || 60) * 60000),
          resource: booking,
          type: 'booking',
          status: booking.status,
        })),
        ...burialsRes.data.map(burial => ({
          id: `burial-${burial._id || burial.id}`,
          title: `${burial.deceased?.fullName || 'Unknown'} - Burial`,
          start: new Date(`${burial.burialDate}T${burial.burialTime || '10:00'}`),
          end: new Date(new Date(`${burial.burialDate}T${burial.burialTime || '10:00'}`).getTime() + 60 * 60000),
          resource: burial,
          type: 'burial',
          confirmed: burial.confirmed,
        })),
      ];

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectConflicts = () => {
    const conflictsList = [];
    const allEvents = [...bookings, ...burials];

    for (let i = 0; i < allEvents.length; i++) {
      for (let j = i + 1; j < allEvents.length; j++) {
        const event1 = allEvents[i];
        const event2 = allEvents[j];

        const date1 = new Date(event1.requestedDate || event1.burialDate);
        const date2 = new Date(event2.requestedDate || event2.burialDate);

        // Check if same date
        if (date1.toDateString() === date2.toDateString()) {
          const time1 = event1.requestedTime || event1.burialTime || '10:00';
          const time2 = event2.requestedTime || event2.burialTime || '10:00';
          
          const plot1 = event1.plotId || event1.plot?._id;
          const plot2 = event2.plotId || event2.plot?._id;

          // Check if same plot
          if (plot1 && plot2 && plot1.toString() === plot2.toString()) {
            const [h1, m1] = time1.split(':').map(Number);
            const [h2, m2] = time2.split(':').map(Number);
            const minutes1 = h1 * 60 + m1;
            const minutes2 = h2 * 60 + m2;
            
            const duration1 = event1.serviceDuration || 60;
            const buffer1 = event1.bufferMinutes || 30;
            const end1 = minutes1 + duration1 + buffer1;
            
            const duration2 = event2.serviceDuration || 60;
            const buffer2 = event2.bufferMinutes || 30;
            const end2 = minutes2 + duration2 + buffer2;

            // Check for time overlap
            if ((minutes2 >= minutes1 && minutes2 < end1) || 
                (minutes1 >= minutes2 && minutes1 < end2)) {
              conflictsList.push({
                event1: {
                  id: event1._id || event1.id,
                  name: event1.deceased?.fullName || 'Unknown',
                  date: date1,
                  time: time1,
                  type: event1.requestedDate ? 'Booking' : 'Burial',
                },
                event2: {
                  id: event2._id || event2.id,
                  name: event2.deceased?.fullName || 'Unknown',
                  date: date2,
                  time: time2,
                  type: event2.requestedDate ? 'Booking' : 'Burial',
                },
                plot: event1.plot?.uniqueIdentifier || event1.plotId,
              });
            }
          }
        }
      }
    }

    setConflicts(conflictsList);
  };

  const filteredEvents = events.filter(event => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.resource?.deceased?.fullName?.toLowerCase().includes(searchLower) ||
      event.resource?.plot?.uniqueIdentifier?.toLowerCase().includes(searchLower)
    );
  });

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#265985';

    if (event.type === 'burial') {
      backgroundColor = event.confirmed ? '#28a745' : '#ffc107';
      borderColor = event.confirmed ? '#1e7e34' : '#e0a800';
    } else if (event.type === 'booking') {
      if (event.status === 'Confirmed') {
        backgroundColor = '#17a2b8';
        borderColor = '#138496';
      } else if (event.status === 'Pending') {
        backgroundColor = '#ffc107';
        borderColor = '#e0a800';
      }
    }

    // Check if event has conflicts
    const hasConflict = conflicts.some(c => 
      c.event1.id === event.resource?._id || c.event1.id === event.resource?.id ||
      c.event2.id === event.resource?._id || c.event2.id === event.resource?.id
    );

    if (hasConflict) {
      backgroundColor = '#dc3545';
      borderColor = '#c82333';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderRadius: '5px',
        color: 'white',
        padding: '2px 5px',
      },
    };
  };

  if (loading) {
    return <div className="text-center py-12">Loading calendar...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Burial Events Calendar</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search by name or plot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            ⚠️ {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''} Detected
          </h3>
          <div className="space-y-2">
            {conflicts.map((conflict, idx) => (
              <div key={idx} className="text-sm text-red-700">
                <strong>Plot {conflict.plot}:</strong> {conflict.event1.name} ({conflict.event1.type}) 
                conflicts with {conflict.event2.name} ({conflict.event2.type}) on{' '}
                {conflict.event1.date.toLocaleDateString()} at {conflict.event1.time} / {conflict.event2.time}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-4" style={{ height: '700px' }}>
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => {
            alert(`Event: ${event.title}\nType: ${event.type}\nDate: ${event.start.toLocaleString()}`);
          }}
          defaultDate={selectedDate}
          defaultView="month"
          views={['month', 'week', 'day', 'agenda']}
          popup
        />
      </div>

      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span>Confirmed Booking</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span>Pending Booking</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
            <span>Confirmed Burial</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
            <span>Conflict Detected</span>
          </div>
        </div>
      </div>
    </div>
  );
}


