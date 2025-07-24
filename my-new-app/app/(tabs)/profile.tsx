import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from 'react-native';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ProfileScreen() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const ProfileRow = ({ label, value, onPress, showIcon = false, iconName = 'plus' }) => (
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

  const ContactRow = ({ label, value, iconName, iconColor }) => (
    <View style={styles.contactRow}>
      <View>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <IconSymbol name={iconName} size={20} color="white" />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Avatar and Name */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <IconSymbol name="person.fill" size={40} color="white" />
        </View>
        <Text style={styles.userName}>
          {user?.displayName || user?.email?.split('@')[0] || 'User'}
        </Text>
      </View>

      {/* Profile Details */}
      <View style={styles.section}>
        <ProfileRow 
          label="Birthday" 
          onPress={() => Alert.alert('Add Birthday', 'Birthday feature coming soon')}
        />
        <ProfileRow 
          label="Gender" 
          onPress={() => Alert.alert('Add Gender', 'Gender feature coming soon')}
        />
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <ContactRow 
          label="Personal"
          value={user?.email || 'name@gmail.com'}
          iconName="envelope.fill"
          iconColor="#007AFF"
        />
        <ContactRow 
          label="Personal"
          value="716-000-0000"
          iconName="phone.fill"
          iconColor="#34C759"
        />
      </View>

      {/* Add Family Member */}
      <TouchableOpacity 
        style={styles.addFamilyButton}
        onPress={() => Alert.alert('Add Family Member', 'Family member feature coming soon')}
      >
        <Text style={styles.addFamilyText}>+ Add Family Member</Text>
      </TouchableOpacity>
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
});
