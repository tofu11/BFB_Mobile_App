import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { useEvents } from '../contexts/EventContext';

export default function FirebaseEventTest() {
  const { joinedEvents, addJoinedEvent, removeJoinedEvent, clearAllEvents, loading } = useEvents();
  const [testRunning, setTestRunning] = useState(false);

  const testAddEvent = async () => {
    setTestRunning(true);
    try {
      const testEvent = {
        programTitle: 'Test Program',
        programId: 'test-program-1',
        eventDate: '12/25/2024',
        eventTime: '10:00am',
        participationType: 'Student Volunteer',
        userId: 'test-user-123',
        userEmail: 'test@example.com',
        volunteerDetails: {
          name: 'Test User',
          email: 'test@example.com',
          gender: 'Other',
          leaves: '5',
        },
        status: 'registered',
      };

      await addJoinedEvent(testEvent);
      Alert.alert('Success', 'Test event added to Firebase!');
    } catch (error) {
      Alert.alert('Error', `Failed to add event: ${error.message}`);
    } finally {
      setTestRunning(false);
    }
  };

  const testRemoveEvent = async () => {
    if (joinedEvents.length === 0) {
      Alert.alert('No Events', 'No events to remove');
      return;
    }

    setTestRunning(true);
    try {
      const eventToRemove = joinedEvents[0];
      await removeJoinedEvent(eventToRemove.id);
      Alert.alert('Success', 'Event removed from Firebase!');
    } catch (error) {
      Alert.alert('Error', `Failed to remove event: ${error.message}`);
    } finally {
      setTestRunning(false);
    }
  };

  const testClearAll = async () => {
    Alert.alert(
      'Clear All Events',
      'Are you sure you want to clear all events?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setTestRunning(true);
            try {
              await clearAllEvents();
              Alert.alert('Success', 'All events cleared from Firebase!');
            } catch (error) {
              Alert.alert('Error', `Failed to clear events: ${error.message}`);
            } finally {
              setTestRunning(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Firebase Event Test</Text>
        <Text style={styles.loading}>Loading events from Firebase...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Event Test</Text>
      
      <View style={styles.stats}>
        <Text style={styles.statsText}>Total Events: {joinedEvents.length}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.addButton]} 
          onPress={testAddEvent}
          disabled={testRunning}
        >
          <Text style={styles.buttonText}>
            {testRunning ? 'Adding...' : 'Add Test Event'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.removeButton]} 
          onPress={testRemoveEvent}
          disabled={testRunning || joinedEvents.length === 0}
        >
          <Text style={styles.buttonText}>
            {testRunning ? 'Removing...' : 'Remove First Event'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={testClearAll}
          disabled={testRunning || joinedEvents.length === 0}
        >
          <Text style={styles.buttonText}>
            {testRunning ? 'Clearing...' : 'Clear All Events'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>Current Events:</Text>
        {joinedEvents.length === 0 ? (
          <Text style={styles.noEvents}>No events found</Text>
        ) : (
          joinedEvents.map((event, index) => (
            <View key={event.id} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{event.programTitle}</Text>
              <Text style={styles.eventDetail}>Date: {event.eventDate}</Text>
              <Text style={styles.eventDetail}>Time: {event.eventTime}</Text>
              <Text style={styles.eventDetail}>Type: {event.participationType}</Text>
              <Text style={styles.eventDetail}>Status: {event.status}</Text>
              <Text style={styles.eventId}>ID: {event.id}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  loading: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  stats: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  removeButton: {
    backgroundColor: '#FF9800',
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  eventsContainer: {
    marginTop: 20,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  noEvents: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  eventCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  eventDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eventId: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    fontFamily: 'monospace',
  },
});
