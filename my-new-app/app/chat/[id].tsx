import { IconSymbol } from '@/components/ui/IconSymbol';
import { useChat } from '@/contexts/ChatContext';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isDeleted: boolean;
  type: 'text' | 'image' | 'file';
}

export default function ChatScreen() {
  const { currentUser, sendMessage, deleteMessage, messages, listenToMessages, loadMessagesOnce } = useChat();
  const { id, name, isGroup } = useLocalSearchParams();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [messageListener, setMessageListener] = useState(null);

  // Check if user is logged in
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <View />
        </View>
        <View style={styles.notLoggedInContainer}>
          <IconSymbol name="person.crop.circle.badge.exclamationmark" size={60} color="#FF6B6B" />
          <Text style={styles.notLoggedInTitle}>Login Required</Text>
          <Text style={styles.notLoggedInMessage}>
            You need to be logged in to access this chat.
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

  // Get messages from Firebase context
  const chatMessages = messages[id as string] || [];

  // Force load messages if not present
  useEffect(() => {
    if (id && (!chatMessages || chatMessages.length === 0) && loadMessagesOnce) {
      console.log('Force loading messages for chat ID:', id);
      loadMessagesOnce(id as string);
    }
  }, [id, chatMessages.length, loadMessagesOnce]);

  // Setup message listener when component mounts
  useEffect(() => {
    if (id && listenToMessages) {
      console.log('Setting up message listener for chat ID:', id);

      // Try real-time listener first
      const unsubscribe = listenToMessages(id as string);
      setMessageListener(unsubscribe);

      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [id, listenToMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    const messageToSend = messageText.trim();
    setMessageText(''); // Clear input immediately for better UX

    try {
      // Send to Firebase - the real-time listener will update the UI
      await sendMessage(id as string, messageToSend);
      console.log('Message sent successfully');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send message: ' + error.message);
      console.error('Send message error:', error);
      // Restore message text on error
      setMessageText(messageToSend);
    } finally {
      setSending(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const { ImagePicker } = await import('expo-image-picker');

      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSending(true);

        try {
          // For now, send image URI as text message
          // In production, you'd upload to Firebase Storage first
          await sendMessage(id as string, `📷 Image: ${imageUri}`, 'image');
          console.log('Image sent successfully');
        } catch (error: any) {
          Alert.alert('Error', 'Failed to send image: ' + error.message);
        } finally {
          setSending(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const { DocumentPicker } = await import('expo-document-picker');

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const document = result.assets[0];
        setSending(true);

        try {
          // For now, send document info as text message
          // In production, you'd upload to Firebase Storage first
          await sendMessage(id as string, `📎 File: ${document.name} (${document.size} bytes)`, 'file');
          console.log('Document sent successfully');
        } catch (error: any) {
          Alert.alert('Error', 'Failed to send document: ' + error.message);
        } finally {
          setSending(false);
        }
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to open document picker');
    }
  };

  const showAttachmentOptions = () => {
    Alert.alert(
      'Send Attachment',
      'Choose an option',
      [
        { text: 'Photo', onPress: handleImagePicker },
        { text: 'Document', onPress: handleDocumentPicker },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeleteMessage = async (messageId: string, senderId: string) => {
    if (senderId !== currentUser?.uid) {
      Alert.alert('Error', 'You can only delete your own messages');
      return;
    }

    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(messageId);
              console.log('Message deleted successfully');
              // The real-time listener will update the UI automatically
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete message: ' + error.message);
              console.error('Delete message error:', error);
            }
          }
        }
      ]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUser?.uid;
    
    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}
        onLongPress={() => handleDeleteMessage(item.id, item.senderId)}
        delayLongPress={500}
      >
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          item.isDeleted && styles.deletedMessage
        ]}>
          {!isCurrentUser && isGroup === 'true' && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          {item.type === 'image' && !item.isDeleted ? (
            <View>
              <Text style={[
                styles.messageText,
                isCurrentUser ? styles.currentUserText : styles.otherUserText
              ]}>
                {item.message}
              </Text>
              {/* In production, you'd show the actual image here */}
              <View style={styles.imagePlaceholder}>
                <IconSymbol name="photo" size={24} color="#666" />
                <Text style={styles.imagePlaceholderText}>Image</Text>
              </View>
            </View>
          ) : item.type === 'file' && !item.isDeleted ? (
            <View>
              <Text style={[
                styles.messageText,
                isCurrentUser ? styles.currentUserText : styles.otherUserText
              ]}>
                {item.message}
              </Text>
              <View style={styles.filePlaceholder}>
                <IconSymbol name="doc" size={24} color="#666" />
                <Text style={styles.filePlaceholderText}>Document</Text>
              </View>
            </View>
          ) : (
            <Text style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText,
              item.isDeleted && styles.deletedText
            ]}>
              {item.message}
            </Text>
          )}
          <Text style={[
            styles.messageTime,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{name}</Text>
          {isGroup === 'true' && (
            <Text style={styles.headerSubtitle}>Group Chat</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            if (loadMessagesOnce) {
              loadMessagesOnce(id as string);
            }
          }}
        >
          <IconSymbol name="arrow.clockwise" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
          </View>
        )}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={showAttachmentOptions}
          disabled={sending}
        >
          <IconSymbol name="plus.circle" size={28} color="#007AFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sending}
        >
          <IconSymbol
            name="arrow.up.circle.fill"
            size={32}
            color={messageText.trim() && !sending ? "#007AFF" : "#ccc"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    paddingHorizontal: 20,
    paddingVertical: 2,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 2,
  },
  currentUserBubble: {
    backgroundColor: '#007AFF',
  },
  otherUserBubble: {
    backgroundColor: '#f0f0f0',
  },
  deletedMessage: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#fff',
  },
  otherUserText: {
    color: '#333',
  },
  deletedText: {
    fontStyle: 'italic',
    color: '#999',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  attachmentButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginTop: 5,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  filePlaceholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  filePlaceholderText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notLoggedInTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  notLoggedInMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
