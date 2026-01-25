import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
  const [currentUserId, setCurrentUserId] = useState(null);

  // Load events from Firebase when component mounts
  useEffect(() => {
    // Get current user and load their events
    const initializeEvents = async () => {
      try {
        // Import Firebase functions dynamically to avoid import issues
        const { auth } = await import('../lib/firebase');
        const { onAuthStateChanged } = await import('firebase/auth');

        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setCurrentUserId(user.uid);
            setupFirebaseListener(user.uid);
          } else {
            setCurrentUserId(null);
            setJoinedEvents([]);
            setLoading(false);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing events:', error);
        // Fallback to local storage
        loadEventsFromStorage();
      }
    };

    initializeEvents();
  }, []);

  // Setup real-time Firebase listener
  const setupFirebaseListener = async (userId) => {
    try {
      console.log('Setting up Firebase listener for user:', userId);
      const { collection, query, where, orderBy, onSnapshot } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');

      const eventsRef = collection(db, 'joinedEvents');
      const q = query(
        eventsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      // Listen for real-time updates
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const events = [];
        querySnapshot.forEach((doc) => {
          events.push({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamp to ISO string if needed
            joinedAt: doc.data().joinedAt?.toDate?.()?.toISOString() || doc.data().joinedAt,
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          });
        });

        console.log('Real-time events updated successfully');
        setJoinedEvents(events);
        setLoading(false);

        // Also save to local storage as backup
        saveEventsToStorage(events);
      }, async (error) => {
        console.error('Firebase listener error:', error);

        // If it's an index error, try fallback query without ordering
        if (error.code === 'failed-precondition') {
          console.log('Index not ready for events, trying fallback query...');
          try {
            const { getDocs } = await import('firebase/firestore');
            const fallbackQuery = query(
              eventsRef,
              where('userId', '==', userId)
            );

            const querySnapshot = await getDocs(fallbackQuery);
            const events = [];

            querySnapshot.forEach((doc) => {
              events.push({
                id: doc.id,
                ...doc.data(),
                joinedAt: doc.data().joinedAt?.toDate?.()?.toISOString() || doc.data().joinedAt,
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
              });
            });

            // Sort manually by createdAt
            events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            console.log('Events loaded with fallback:', events);
            setJoinedEvents(events);
            setLoading(false);
            saveEventsToStorage(events);
          } catch (fallbackError) {
            console.error('Fallback events query also failed:', fallbackError);
            // Final fallback to loading from Firebase once
            loadEventsFromFirebase(userId);
          }
        } else {
          // For other errors, fallback to loading from Firebase once
          loadEventsFromFirebase(userId);
        }
      });

      // Store unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up Firebase listener:', error);
      // Fallback to one-time load
      loadEventsFromFirebase(userId);
    }
  };

  // Load events from Firebase
  const loadEventsFromFirebase = async (userId) => {
    try {
      console.log('Loading events from Firebase for user:', userId);
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');

      const eventsRef = collection(db, 'joinedEvents');

      // Try with ordering first
      try {
        const q = query(
          eventsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const events = [];

        querySnapshot.forEach((doc) => {
          events.push({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamp to ISO string if needed
            joinedAt: doc.data().joinedAt?.toDate?.()?.toISOString() || doc.data().joinedAt,
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          });
        });

        console.log('Loaded events from Firebase:', events);
        setJoinedEvents(events);
      } catch (indexError) {
        // If index error, try without ordering
        if (indexError.code === 'failed-precondition') {
          console.log('Index not ready, trying fallback query without ordering...');
          const fallbackQuery = query(
            eventsRef,
            where('userId', '==', userId)
          );

          const querySnapshot = await getDocs(fallbackQuery);
          const events = [];

          querySnapshot.forEach((doc) => {
            events.push({
              id: doc.id,
              ...doc.data(),
              joinedAt: doc.data().joinedAt?.toDate?.()?.toISOString() || doc.data().joinedAt,
              createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
            });
          });

          // Sort manually by createdAt
          events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          console.log('Loaded events with fallback query:', events);
          setJoinedEvents(events);
        } else {
          throw indexError; // Re-throw if it's not an index error
        }
      }
    } catch (error) {
      console.error('Error loading events from Firebase:', error);
      // Fallback to local storage
      await loadEventsFromStorage();
    } finally {
      setLoading(false);
    }
  };

  // Load events from AsyncStorage (fallback)
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

  // Add a new joined event to Firebase
  const addJoinedEvent = async (eventData) => {
    try {
      console.log('Adding event to Firebase:', eventData);
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');

      const newEventData = {
        ...eventData,
        joinedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      };

      // Add to Firebase
      const docRef = await addDoc(collection(db, 'joinedEvents'), newEventData);

      // Create the event object with the Firebase document ID
      const newEvent = {
        id: docRef.id,
        ...newEventData,
        createdAt: new Date().toISOString(), // Convert for local state
      };

      // Update local state
      const updatedEvents = [...joinedEvents, newEvent];
      setJoinedEvents(updatedEvents);

      // Also save to local storage as backup
      await saveEventsToStorage(updatedEvents);

      console.log('Event added to Firebase successfully');
      return newEvent;
    } catch (error) {
      console.error('Error adding event to Firebase:', error);

      // Fallback to local storage only
      const newEvent = {
        id: Date.now().toString(),
        ...eventData,
        joinedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const updatedEvents = [...joinedEvents, newEvent];
      setJoinedEvents(updatedEvents);
      await saveEventsToStorage(updatedEvents);

      console.log('Event added to local storage (fallback)');
      return newEvent;
    }
  };

  // Remove a joined event from Firebase
  const removeJoinedEvent = async (eventId) => {
    try {
      console.log('Removing event from Firebase:', eventId);
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');

      // Delete from Firebase
      await deleteDoc(doc(db, 'joinedEvents', eventId));

      // Update local state
      const updatedEvents = joinedEvents.filter(event => event.id !== eventId);
      setJoinedEvents(updatedEvents);
      await saveEventsToStorage(updatedEvents);

      console.log('Event removed from Firebase:', eventId);
    } catch (error) {
      console.error('Error removing event from Firebase:', error);

      // Fallback to local removal only
      const updatedEvents = joinedEvents.filter(event => event.id !== eventId);
      setJoinedEvents(updatedEvents);
      await saveEventsToStorage(updatedEvents);

      console.log('Event removed from local storage (fallback):', eventId);
    }
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
    try {
      if (currentUserId) {
        console.log('Clearing all events for user:', currentUserId);
        const { collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');

        // Get all user's events
        const eventsRef = collection(db, 'joinedEvents');
        const q = query(eventsRef, where('userId', '==', currentUserId));
        const querySnapshot = await getDocs(q);

        // Delete each event
        const deletePromises = [];
        querySnapshot.forEach((docSnapshot) => {
          deletePromises.push(deleteDoc(doc(db, 'joinedEvents', docSnapshot.id)));
        });

        await Promise.all(deletePromises);
        console.log('All events cleared from Firebase');
      }
    } catch (error) {
      console.error('Error clearing events from Firebase:', error);
    }

    // Clear local state and storage
    setJoinedEvents([]);
    await AsyncStorage.removeItem('joinedEvents');
    console.log('All events cleared from local storage');
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
