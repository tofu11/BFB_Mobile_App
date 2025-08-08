import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useChat } from '../../contexts/ChatContext';

interface Friend {
  id: string;
  displayName: string;
  chatId: string;
  email?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  friendshipId?: string;
}

export default function FriendsScreen() {
  const { 
    currentUser, 
    friends, 
    loading, 
    addFriend,
    notifications,
    unreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useChat();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendId, setFriendId] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);

  // Filter friends based on search query
  const filteredFriends = friends.filter((friend: Friend) =>
    (friend.displayName && friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (friend.chatId && friend.chatId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (friend.email && friend.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddFriend = async () => {
    if (!friendId.trim()) {
      Alert.alert('Error', 'Please enter a friend ID');
      return;
    }

    setAddingFriend(true);
    try {
      await addFriend(friendId.trim());
      Alert.alert('Success', 'Friend added successfully!');
      setFriendId('');
      setShowAddFriend(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add friend');
    } finally {
      setAddingFriend(false);
    }
  };

  const handleFriendPress = async (friend: Friend) => {
    try {
      if (!currentUser) return;

      // Create a consistent chat ID format (same as used in addFriend)
      const chatId = currentUser.uid < friend.id
        ? `${currentUser.uid}_${friend.id}`
        : `${friend.id}_${currentUser.uid}`;

      // Check if chat already exists, if not create it
      const { doc: docRef, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');

      const chatDoc = await getDoc(docRef(db, 'chats', chatId));

      if (!chatDoc.exists()) {
        // Create the chat if it doesn't exist
        await setDoc(docRef(db, 'chats', chatId), {
          participants: [currentUser.uid, friend.id],
          type: 'direct',
          createdAt: serverTimestamp(),
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          lastMessageSender: '',
          name: friend.displayName,
        });
        console.log('Created new chat:', chatId);
      }

      // Navigate to the chat
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error handling friend press:', error);
      Alert.alert('Error', 'Failed to open chat');
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => handleFriendPress(item)}
    >
      <View style={styles.friendInfo}>
        <View style={[styles.avatar, styles.friendAvatar]}>
          <IconSymbol name="person.circle" size={24} color="white" />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.displayName}</Text>
          <Text style={styles.friendId}>ID: {item.chatId}</Text>
          {item.email && (
            <Text style={styles.friendEmail}>{item.email}</Text>
          )}
          {item.isOnline ? (
            <Text style={styles.onlineStatus}>Online</Text>
          ) : (
            <Text style={styles.offlineStatus}>
              {item.lastSeen ? `Last seen ${formatTime(item.lastSeen)}` : 'Offline'}
            </Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity style={styles.chatButton}>
        <IconSymbol name="message" size={20} color="#007AFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.loginContainer}>
        <IconSymbol name="person.circle" size={80} color="#ccc" />
        <Text style={styles.loginTitle}>Please Login</Text>
        <Text style={styles.loginMessage}>
          You need to be logged in to see your friends
        </Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddFriend(true)}
        >
          <IconSymbol name="person.badge.plus" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* User Info */}
      {currentUser && (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>
            Your ID: {currentUser.chatId} • {currentUser.displayName}
          </Text>
        </View>
      )}

      {/* Notifications */}
      {notifications && notifications.length > 0 && (
        <View style={styles.notificationsContainer}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.notificationsTitle}>
              Notifications {unreadNotifications > 0 && `(${unreadNotifications})`}
            </Text>
            {unreadNotifications > 0 && (
              <TouchableOpacity onPress={markAllNotificationsAsRead}>
                <Text style={styles.markAllReadText}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList 
            horizontal 
            showsHorizontalScrollIndicator={false}
            data={notifications.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.notificationItem,
                  !item.isRead && styles.unreadNotification
                ]}
                onPress={() => {
                  markNotificationAsRead(item.id);
                  if (item.data?.chatId) {
                    router.push(`/chat/${item.data.chatId}`);
                  }
                }}
              >
                <Text style={styles.notificationTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {item.message}
                </Text>
                {!item.isRead && (
                  <View style={styles.notificationBadge} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Friends List */}
      {filteredFriends.length > 0 ? (
        <FlatList
          data={filteredFriends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          style={styles.friendsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <IconSymbol name="person.2" size={60} color="#ccc" />
          <Text style={styles.emptyTitle}>No Friends Yet</Text>
          <Text style={styles.emptyMessage}>
            {searchQuery ? 'No friends match your search' : 'Add friends to start chatting!'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity 
              style={styles.addFirstFriendButton}
              onPress={() => setShowAddFriend(true)}
            >
              <Text style={styles.addFirstFriendText}>Add Your First Friend</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriend}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddFriend(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Friend</Text>
            <TouchableOpacity 
              onPress={handleAddFriend}
              disabled={addingFriend}
            >
              <Text style={[styles.addButton, addingFriend && styles.disabledButton]}>
                {addingFriend ? 'Adding...' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Friend's ID</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter 6-digit friend ID"
              value={friendId}
              onChangeText={setFriendId}
              maxLength={6}
              keyboardType="numeric"
              autoFocus
            />
            <Text style={styles.helpText}>
              Ask your friend for their 6-digit ID from their profile
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  loginMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // Notification styles
  notificationsContainer: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  markAllReadText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    width: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  unreadNotification: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  friendsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  friendAvatar: {
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  friendId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  offlineStatus: {
    fontSize: 12,
    color: '#999',
  },
  chatButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstFriendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addFirstFriendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});