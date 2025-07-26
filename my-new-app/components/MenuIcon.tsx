import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Modal, TouchableWithoutFeedback } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

export const MenuIcon: React.FC = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuPress = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleSignIn = () => {
    console.log('Sign In pressed');
    setIsMenuVisible(false);
  };

  const handleLogOut = () => {
    console.log('Log Out pressed');
    setIsMenuVisible(false);
  };

  const closeMenu = () => {
    setIsMenuVisible(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.container} 
        onPress={handleMenuPress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <IconSymbol name="gear" size={24} color="#9E005D" />
      </TouchableOpacity>
      
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.overlay}>
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.menuItem} onPress={handleSignIn}>
                <Text style={styles.menuText}>Sign In</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              <TouchableOpacity style={styles.menuItem} onPress={handleLogOut}>
                <Text style={styles.menuText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    top: 50,
    padding: 15,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});
