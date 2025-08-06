import { IconSymbol } from '@/components/ui/IconSymbol';
import { auth } from '@/lib/firebase';
import { router } from 'expo-router';
import { signOut, updateProfile, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface ProfileRowProps {
  label: string;
  value?: string;
  onPress: () => void;
}

interface ContactRowProps {
  label: string;
  value: string;
  iconName: string;
  iconColor: string;
}

export default function ProfileScreen() {
  const { currentUser: chatUser } = require('@/contexts/ChatContext').useChat();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setUser(user);
      setDisplayName(user?.displayName || '');
    });
    return unsubscribe;
  }, []);

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleSaveName = async (): Promise<void> => {
    if (!user) return;
    
    try {
      await updateProfile(user, {
        displayName: displayName.trim()
      });
      setEditModalVisible(false);
      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update name');
    }
  };

  const ProfileRow: React.FC<ProfileRowProps> = ({ label, value, onPress }) => (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.label}>{label}</Text>
        {value && <Text style={styles.value}>{value}</Text>}
      </View>
      <TouchableOpacity onPress={onPress} style={styles.actionButton}>
        <Text style={styles.actionText}>
          {value ? 'Edit' : '+ Add'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const ContactRow: React.FC<ContactRowProps> = ({ label, value, iconName, iconColor }) => (
    <View style={styles.contactRow}>
      <View>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <IconSymbol name={iconName as any} size={20} color="white" />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.editButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <IconSymbol name="person.fill" size={40} color="white" />
        </View>
        <Text style={styles.userName}>
          {user?.displayName || user?.email?.split('@')[0] || 'User'}
        </Text>
      </View>

      <View style={styles.section}>
        <ProfileRow 
          label="Name" 
          value={user?.displayName || undefined}
          onPress={() => setEditModalVisible(true)}
        />
        <ProfileRow 
          label="Birthday" 
          onPress={() => Alert.alert('Add Birthday', 'Birthday feature coming soon')}
        />
        <ProfileRow 
          label="Gender" 
          onPress={() => Alert.alert('Add Gender', 'Gender feature coming soon')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <ContactRow
          label="Personal"
          value={user?.email || 'name@gmail.com'}
          iconName="envelope.fill"
          iconColor="#007AFF"
        />
        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => {
            if (chatUser?.chatId) {
              Alert.alert(
                'Your Chat ID',
                `Share this ID with friends so they can add you:\n\n${chatUser.chatId}`,
                [
                  { text: 'Copy ID', onPress: () => {
                    Alert.alert('Copied!', 'Chat ID copied to clipboard');
                  }},
                  { text: 'OK' }
                ]
              );
            } else {
              Alert.alert('Loading', 'Chat ID is being generated...');
            }
          }}
        >
          <View style={styles.contactIcon}>
            <IconSymbol name="message.fill" size={20} color="#FF9500" />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactLabel}>Chat ID</Text>
            <Text style={styles.contactValue}>
              {chatUser?.chatId || 'Loading...'}
            </Text>
          </View>
          <IconSymbol name="doc.on.doc" size={16} color="#999" />
        </TouchableOpacity>
        <ContactRow
          label="Personal"
          value="716-000-0000"
          iconName="phone.fill"
          iconColor="#34C759"
        />
      </View>

      <TouchableOpacity 
        style={styles.addFamilyButton}
        onPress={() => Alert.alert('Add Family Member', 'Family member feature coming soon')}
      >
        <Text style={styles.addFamilyText}>+ Add Family Member</Text>
      </TouchableOpacity>

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <TextInput
              style={styles.modalInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDisplayName(user?.displayName || '');
                  setEditModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveName}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  editButton: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  rowContent: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFamilyButton: {
    backgroundColor: 'white',
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  addFamilyText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});