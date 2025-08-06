import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useChat } from '../contexts/ChatContext';

export default function ChatTestComponent() {
  const { 
    currentUser, 
    friends, 
    chats, 
    groups, 
    messages, 
    loading, 
    addFriend, 
    sendMessage, 
    createGroup 
  } = useChat();
  
  const [testing, setTesting] = useState(false);

  const testAddFriend = async () => {
    setTesting(true);
    try {
      // Test with a mock 6-digit ID
      const testId = '123456';
      await addFriend(testId);
      Alert.alert('Success', 'Friend added (or would be added in real scenario)');
    } catch (error) {
      Alert.alert('Test Result', `Add friend test: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testSendMessage = async () => {
    setTesting(true);
    try {
      // Send a test message to chat ID "1"
      await sendMessage('1', 'Hello! This is a test message from Firebase!');
      Alert.alert('Success', 'Test message sent to Firebase!');
    } catch (error) {
      Alert.alert('Error', `Send message test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testCreateGroup = async () => {
    setTesting(true);
    try {
      const groupId = await createGroup('Test Group', []);
      Alert.alert('Success', `Test group created with ID: ${groupId}`);
    } catch (error) {
      Alert.alert('Error', `Create group test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chat System Test</Text>
        <Text style={styles.loading}>Loading chat system...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🚀 Chat System Test</Text>
      
      {/* User Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current User</Text>
        {currentUser ? (
          <View style={styles.userCard}>
            <Text style={styles.userInfo}>Name: {currentUser.displayName}</Text>
            <Text style={styles.userInfo}>Email: {currentUser.email}</Text>
            <Text style={styles.userInfo}>Chat ID: {currentUser.chatId}</Text>
            <Text style={styles.userInfo}>UID: {currentUser.uid}</Text>
          </View>
        ) : (
          <Text style={styles.noData}>No user logged in</Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{friends.length}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{chats.length}</Text>
            <Text style={styles.statLabel}>Chats</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{groups.length}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Object.keys(messages).length}</Text>
            <Text style={styles.statLabel}>Message Threads</Text>
          </View>
        </View>
      </View>

      {/* Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Functions</Text>
        
        <TouchableOpacity 
          style={[styles.testButton, styles.addFriendButton]} 
          onPress={testAddFriend}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? 'Testing...' : '👥 Test Add Friend'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, styles.sendMessageButton]} 
          onPress={testSendMessage}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? 'Testing...' : '💬 Test Send Message'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, styles.createGroupButton]} 
          onPress={testCreateGroup}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? 'Testing...' : '👥 Test Create Group'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Messages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Messages</Text>
        {Object.keys(messages).length === 0 ? (
          <Text style={styles.noData}>No messages yet</Text>
        ) : (
          Object.entries(messages).map(([chatId, chatMessages]) => (
            <View key={chatId} style={styles.messageThread}>
              <Text style={styles.threadTitle}>Chat Thread ({chatMessages.length} messages)</Text>
              {chatMessages.slice(-2).map((msg, index) => (
                <View key={index} style={styles.messagePreview}>
                  <Text style={styles.messageSender}>{msg.senderName}:</Text>
                  <Text style={styles.messageText}>{msg.message}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 How to Test</Text>
        <Text style={styles.instruction}>1. Check that your user info appears above</Text>
        <Text style={styles.instruction}>2. Use the test buttons to verify Firebase integration</Text>
        <Text style={styles.instruction}>3. Go to Messages tab to see the full chat interface</Text>
        <Text style={styles.instruction}>4. Try sending messages in individual chats</Text>
        <Text style={styles.instruction}>5. Test adding friends with 6-digit IDs</Text>
        <Text style={styles.instruction}>6. Create groups and test group messaging</Text>
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  userCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  userInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  noData: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  testButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  addFriendButton: {
    backgroundColor: '#34C759',
  },
  sendMessageButton: {
    backgroundColor: '#007AFF',
  },
  createGroupButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  messageThread: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  threadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  messagePreview: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  messageText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    paddingLeft: 10,
  },
});