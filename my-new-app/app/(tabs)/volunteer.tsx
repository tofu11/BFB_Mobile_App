import { IconSymbol } from '@/components/ui/IconSymbol';
import { useEvents } from '@/contexts/EventContext';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function VolunteerScreen() {
  const { getUserEvents, getUpcomingEvents, joinedEvents: contextEvents, loading: eventsLoading } = useEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [joinedEvents, setJoinedEvents] = useState<Array<any>>([]);

  // This would typically come from a database or context based on user's registrations
  // For now, we'll simulate this with local state that gets populated when user joins events
  const hasJoinedEvent = user && joinedEvents.length > 0;

  // Function to add an event when user registers (this would be called from program detail screens)
  // Currently not used but would be called when users register for events

  // Use events directly from Firebase context
  useEffect(() => {
    // Update local state with context events for compatibility
    setJoinedEvents(contextEvents);
    console.log('Updated events from Firebase context:', contextEvents);
  }, [contextEvents]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setUser(user);
      if (!user) {
        // Clear joined events when user logs out
        setJoinedEvents([]);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClockIn = () => {
    setIsTracking(true);
    setStartTime(new Date());
    setElapsedTime(0);
    Alert.alert('Clocked In', 'Your volunteer time tracking has started!');
  };

  const handleClockOut = () => {
    if (isTracking && startTime) {
      setIsTracking(false);
      const sessionTime = elapsedTime;
      setTotalTime(prev => prev + sessionTime);
      
      const totalMinutes = Math.floor(sessionTime / 60);
      Alert.alert(
        'Clocked Out', 
        `Session: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m\nTotal today: ${formatTime(totalTime + sessionTime)}`
      );
      setStartTime(null);
      setElapsedTime(0);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Day headers
    const headers = dayNames.map(day => (
      <Text key={day} style={styles.dayHeader}>{day}</Text>
    ));

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate;
      const isToday = day === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() &&
                     currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDay,
            isToday && styles.todayDay
          ]}
          onPress={() => setSelectedDate(day)}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            isToday && styles.todayText
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <IconSymbol name="chevron.left" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.monthYear}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <IconSymbol name="chevron.right" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.dayHeaders}>
          {headers}
        </View>
        <View style={styles.daysGrid}>
          {days}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Volunteer Hours</Text>
        <TouchableOpacity>
          <IconSymbol name="line.horizontal.3" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Firebase Status Indicator */}
        <View style={styles.firebaseStatus}>
          <Text style={styles.firebaseStatusText}>
            {eventsLoading ? '🔄 Loading from Firebase...' : `📊 ${contextEvents.length} events from Firebase`}
          </Text>
        </View>

        {/* Chat Test Section */}
        <View style={styles.chatTestSection}>
          <Text style={styles.chatTestTitle}>💬 Chat System Test</Text>
          <Text style={styles.chatTestDescription}>
            Test the real-time chat system with Firebase integration
          </Text>
          <TouchableOpacity
            style={styles.chatTestButton}
            onPress={() => {
              // For now, just show an alert with instructions
              Alert.alert(
                'Chat System Ready!',
                'Go to the Messages tab to test:\n\n' +
                '• Your 6-digit chat ID\n' +
                '• Add friends by ID\n' +
                '• Send real-time messages\n' +
                '• Create group chats\n' +
                '• Share images & files\n\n' +
                'All data is saved to Firebase!',
                [{ text: 'Got it!' }]
              );
            }}
          >
            <Text style={styles.chatTestButtonText}>Test Chat Features</Text>
          </TouchableOpacity>
        </View>

        {hasJoinedEvent && joinedEvents.map((event, index) => (
          <View key={index} style={styles.eventInfoCard}>
            <Text style={styles.eventInfoTitle}>Upcoming Event</Text>
            <Text style={styles.eventInfoProgram}>{event.programTitle}</Text>
            <Text style={styles.eventInfoDate}>Date: {event.eventDate}</Text>
            <Text style={styles.eventInfoTime}>Time: {event.eventTime}</Text>
            <Text style={styles.eventInfoType}>Role: {event.participationType}</Text>
            <Text style={styles.eventInfoStatus}>Status: {event.status}</Text>
            {event.volunteerDetails && (
              <View style={styles.detailsSection}>
                <Text style={styles.detailsTitle}>Volunteer Details:</Text>
                <Text style={styles.detailsText}>Name: {event.volunteerDetails.name}</Text>
                <Text style={styles.detailsText}>Email: {event.volunteerDetails.email}</Text>
                <Text style={styles.detailsText}>Gender: {event.volunteerDetails.gender}</Text>
                <Text style={styles.detailsText}>Leaves: {event.volunteerDetails.leaves}</Text>
              </View>
            )}
            {event.familyDetails && (
              <View style={styles.detailsSection}>
                <Text style={styles.detailsTitle}>Family Details:</Text>
                <Text style={styles.detailsText}>Family Name: {event.familyDetails.name}</Text>
                <Text style={styles.detailsText}>Members: {event.familyDetails.members}</Text>
                <Text style={styles.detailsText}>Email: {event.familyDetails.email}</Text>
              </View>
            )}
            <Text style={styles.eventInfoNote}>
              You're registered for this event!
            </Text>
          </View>
        ))}

        <View style={styles.totalHoursCard}>
          <Text style={styles.totalHoursLabel}>Total Hours Today</Text>
          <Text style={styles.totalHoursValue}>
            {formatTime(totalTime + elapsedTime)}
          </Text>
        </View>

        {renderCalendar()}

        <View style={styles.timeTracker}>
          <View style={styles.trackerHeader}>
            <IconSymbol name="clock" size={24} color="#FF8C00" />
            <Text style={styles.trackerTitle}>Current Session</Text>
          </View>
          <Text style={styles.timeDisplay}>
            {formatTime(elapsedTime)}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.clockInButton]}
            onPress={handleClockIn}
            disabled={isTracking}
          >
            <Text style={styles.buttonText}>Clock In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.clockOutButton]}
            onPress={handleClockOut}
            disabled={!isTracking}
          >
            <Text style={styles.buttonText}>Clock Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF8C00',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
  },
  eventInfoCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  eventInfoProgram: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  eventInfoDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventInfoTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventInfoNote: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  calendar: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDay: {
    backgroundColor: '#FF8C00',
  },
  selectedDayText: {
    color: 'white',
  },
  todayDay: {
    backgroundColor: '#e0e0e0',
  },
  todayText: {
    fontWeight: 'bold',
  },
  timeTracker: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  trackerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  timeDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  clockInButton: {
    backgroundColor: '#FF8C00',
  },
  clockOutButton: {
    backgroundColor: '#FF8C00',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  totalTimeContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  totalTimeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  totalTimeValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF8C00',
  },
  totalHoursCard: {
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalHoursLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    fontWeight: '500',
  },
  totalHoursValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'monospace',
  },
  eventInfoType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventInfoStatus: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 8,
    fontWeight: '500',
  },
  detailsSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  firebaseStatus: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  firebaseStatusText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
    textAlign: 'center',
  },
  chatTestSection: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  chatTestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 5,
  },
  chatTestDescription: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
    lineHeight: 18,
  },
  chatTestButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  chatTestButtonText: {
    color: '#212529',
    fontSize: 14,
    fontWeight: '600',
  },
});