import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
const EventContext = createContext();

// Custom hook to use the context
export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

// Event provider component
export const EventProvider = ({ children }) => {
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load events from storage when component mounts
  useEffect(() => {
    loadEventsFromStorage();
  }, []);

  // Load events from AsyncStorage
  const loadEventsFromStorage = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('joinedEvents');
      if (storedEvents) {
        setJoinedEvents(JSON.parse(storedEvents));
      }
    } catch (error) {
      console.error('Error loading events from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save events to AsyncStorage
  const saveEventsToStorage = async (events) => {
    try {
      await AsyncStorage.setItem('joinedEvents', JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events to storage:', error);
    }
  };

  // Add a new joined event
  const addJoinedEvent = async (eventData) => {
    const newEvent = {
      id: Date.now().toString(), // Simple ID generation
      ...eventData,
      joinedAt: new Date().toISOString(),
    };

    const updatedEvents = [...joinedEvents, newEvent];
    setJoinedEvents(updatedEvents);
    await saveEventsToStorage(updatedEvents);
    
    console.log('Event added:', newEvent);
    return newEvent;
  };

  // Remove a joined event
  const removeJoinedEvent = async (eventId) => {
    const updatedEvents = joinedEvents.filter(event => event.id !== eventId);
    setJoinedEvents(updatedEvents);
    await saveEventsToStorage(updatedEvents);
    
    console.log('Event removed:', eventId);
  };

  // Get events for a specific user
  const getUserEvents = (userId) => {
    return joinedEvents.filter(event => event.userId === userId);
  };

  // Get upcoming events (events that haven't passed yet)
  const getUpcomingEvents = (userId) => {
    const userEvents = getUserEvents(userId);
    const now = new Date();
    
    return userEvents.filter(event => {
      // Parse the event date (assuming format like "8/20/2025")
      const [month, day, year] = event.eventDate.split('/');
      const eventDate = new Date(year, month - 1, day);
      return eventDate >= now;
    });
  };

  // Clear all events (useful for logout)
  const clearAllEvents = async () => {
    setJoinedEvents([]);
    await AsyncStorage.removeItem('joinedEvents');
    console.log('All events cleared');
  };

  // Context value
  const value = {
    joinedEvents,
    loading,
    addJoinedEvent,
    removeJoinedEvent,
    getUserEvents,
    getUpcomingEvents,
    clearAllEvents,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};
