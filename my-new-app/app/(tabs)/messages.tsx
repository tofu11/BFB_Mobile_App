import { IconSymbol } from '@/components/ui/IconSymbol';
import { useChat } from '@/contexts/ChatContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSender?: string;
  unreadCount: number;
  isGroup: boolean;
  avatar?: string;
  isOnline?: boolean;
}

export default function MessagesScreen() {
  const {
    currentUser,
    friends,
    chats,
    groups,
    loading,
    createGroup,
    notifications,
    unreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    markChatAsRead
  } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Check if user is logged in
  if (!loading && !currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <IconSymbol name="person.crop.circle.badge.exclamationmark" size={80} color="#FF6B6B" />
          <Text style={styles.notLoggedInTitle}>Login Required</Text>
          <Text style={styles.notLoggedInMessage}>
            You need to be logged in to access messages and chat with friends.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Helper function to format last message with sender
  const formatLastMessage = (message: string, senderId: string, isGroup: boolean, currentUserId: string) => {
    if (!message) return 'No messages yet';
    if (senderId === 'system') return message;

    if (isGroup) {
      // For groups, show sender name
      if (senderId === currentUserId) {
        return `You: ${message}`;
      } else {
        // Try to get sender name from friends list or use ID
        const sender = friends.find(f => f.uid === senderId);
        const senderName = sender?.displayName || sender?.email || senderId.substring(0, 6);
        return `${senderName}: ${message}`;
      }
    } else {
      // For direct chats, show "You:" if current user sent it
      if (senderId === currentUserId) {
        return `You: ${message}`;
      } else {
        return message; // Just show the message for direct chats
      }
    }
  };

  // Combine chats and groups for display
  const allChats = [
    ...chats.map((chat: any) => {
      // For testing: set a mock unread count if none exists
      const mockUnreadCount = chat.unreadCount || (Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : 0);
      console.log('Chat unread count:', chat.id, 'actual:', chat.unreadCount, 'mock:', mockUnreadCount);

      return {
        id: `chat_${chat.id}`, // Prefix with 'chat_' to ensure uniqueness
        originalId: chat.id,
        name: chat.name || 'Unknown Chat',
        lastMessage: formatLastMessage(
          chat.lastMessage || '',
          chat.lastMessageSender || '',
          chat.type === 'group',
          currentUser?.uid || ''
        ),
        lastMessageTime: chat.lastMessageTime instanceof Date ? chat.lastMessageTime :
                        (chat.lastMessageTime?.toDate ? chat.lastMessageTime.toDate() : new Date()),
        lastMessageSender: chat.lastMessageSender,
        unreadCount: mockUnreadCount, // Use mock count for testing
        isGroup: chat.type === 'group',
        isOnline: false, // TODO: Get online status
      };
    }),
    ...groups.map((group: any) => {
      // For testing: set a mock unread count if none exists
      const mockUnreadCount = group.unreadCount || (Math.random() > 0.3 ? Math.floor(Math.random() * 8) + 1 : 0);
      console.log('Group unread count:', group.id, 'actual:', group.unreadCount, 'mock:', mockUnreadCount);

      return {
        id: `group_${group.id}`, // Prefix with 'group_' to ensure uniqueness
        originalId: group.id,
        name: group.name,
        lastMessage: formatLastMessage(
          group.lastMessage || '',
          group.lastMessageSender || '',
          true, // isGroup = true
          currentUser?.uid || ''
        ),
        lastMessageTime: group.lastMessageTime instanceof Date ? group.lastMessageTime :
                        (group.lastMessageTime?.toDate ? group.lastMessageTime.toDate() : new Date()),
        lastMessageSender: group.lastMessageSender,
        unreadCount: mockUnreadCount, // Use mock count for testing
        isGroup: true,
        isOnline: false,
      };
    }),
    // Add mock chats for demo if no real chats exist
    ...(chats.length === 0 && groups.length === 0 ? [
      {
        id: 'mock_1',
        originalId: '1',
        name: 'John Doe',
        lastMessage: 'Hey, how are you doing?',
        lastMessageTime: new Date(),
        unreadCount: 3, // Mock unread count
        isGroup: false,
        isOnline: true,
      },
      {
        id: 'mock_2',
        originalId: '2',
        name: 'Study Group',
        lastMessage: 'Meeting at 3 PM tomorrow',
        lastMessageTime: new Date(Date.now() - 3600000),
        unreadCount: 5, // Mock unread count
        isGroup: true,
        isOnline: false,
      },
    ] : [])
  ].sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());



  const handleChatPress = async (chat: Chat) => {
    try {
      // Mark chat as read when user opens it
      const chatId = (chat as any).originalId || chat.id;
      await markChatAsRead(chatId);

      // Navigate to chat screen
      router.push(`/chat/${chatId}?name=${encodeURIComponent(chat.name)}&isGroup=${chat.isGroup}`);
    } catch (error) {
      console.error('Error handling chat press:', error);
      // Still navigate even if marking as read fails
      const chatId = (chat as any).originalId || chat.id;
      router.push(`/chat/${chatId}?name=${encodeURIComponent(chat.name)}&isGroup=${chat.isGroup}`);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setCreatingGroup(true);
    try {
      const groupId = await createGroup(groupName.trim(), selectedFriends);
      Alert.alert('Success', `Group "${groupName}" created successfully!`);
      setGroupName('');
      setSelectedFriends([]);
      setShowCreateGroup(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCreatingGroup(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const filteredChats = allChats.filter((chat: any) =>
    chat.name && chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, item.isGroup && styles.groupAvatar]}>
          <IconSymbol
            name={item.isGroup ? "person.3" : "person.circle"}
            size={24}
            color="white"
          />
        </View>
        {!item.isGroup && item.isOnline && (
          <View style={styles.onlineIndicator} />
        )}
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{formatTime(item.lastMessageTime)}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowCreateGroup(true)}
          >
            <IconSymbol name="person.3" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <IconSymbol name="square.and.pencil" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.notificationsList}
          >
            {notifications.slice(0, 5).map((notification: any) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.isRead && styles.unreadNotification
                ]}
                onPress={() => {
                  markNotificationAsRead(notification.id);
                  if (notification.data?.chatId) {
                    router.push(`/chat/${notification.data.chatId}`);
                  }
                }}
              >
                <Text style={styles.notificationTitle} numberOfLines={1}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                {!notification.isRead && (
                  <View style={styles.notificationBadge} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Group Modal */}
      <Modal
        visible={showCreateGroup}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateGroup(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Group</Text>
            <TouchableOpacity
              onPress={handleCreateGroup}
              disabled={creatingGroup || !groupName.trim()}
            >
              <Text style={[styles.modalDone, (creatingGroup || !groupName.trim()) && styles.modalDisabled]}>
                {creatingGroup ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Group Name:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter group name"
              value={groupName}
              onChangeText={setGroupName}
              maxLength={50}
            />

            <Text style={styles.modalLabel}>Add Friends (Optional):</Text>
            {friends.length === 0 ? (
              <Text style={styles.noFriendsText}>
                No friends added yet. Add friends first to include them in the group.
              </Text>
            ) : (
              friends.map((friend: any) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => toggleFriendSelection(friend.id)}
                >
                  <View style={styles.friendInfo}>
                    <View style={styles.friendAvatar}>
                      <IconSymbol name="person.circle" size={32} color="#007AFF" />
                    </View>
                    <View>
                      <Text style={styles.friendName}>{friend.displayName}</Text>
                      <Text style={styles.friendId}>ID: {friend.chatId}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.checkbox,
                    selectedFriends.includes(friend.id) && styles.checkboxSelected
                  ]}>
                    {selectedFriends.includes(friend.id) && (
                      <IconSymbol name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}

            <Text style={styles.modalHint}>
              You can add more members to the group later from the group settings.
            </Text>
          </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    padding: 5,
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  userInfoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatar: {
    backgroundColor: '#34C759',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatTime: {
    fontSize: 12,
    color: '#666',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalDone: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  modalHint: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 20,
  },
  noFriendsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
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
  friendAvatar: {
    marginRight: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  friendId: {
    fontSize: 12,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  notLoggedInMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  notificationsList: {
    maxHeight: 100,
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
});
