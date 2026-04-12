import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import md5 from 'md5';
import { useDarkMode } from '../DarkModeContext';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ProfileScreen({ navigation, route }) {
  const { isDarkMode } = useDarkMode();
  const { email } = route.params || {};
  const gravatarUrl = (email) =>
    `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?d=identicon`;

  // Çıkış fonksiyonu
  const handleLogout = async () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  // Hesabı sil fonksiyonu
  const handleDeleteAccount = async () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          style: 'destructive',
          onPress: async () => {
            const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
            const filteredUsers = users.filter(u => u.email !== email);
            await AsyncStorage.setItem('users', JSON.stringify(filteredUsers));
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#222' }]}>
      <Image source={{ uri: gravatarUrl(email) }} style={styles.avatar} />
      <Text style={[styles.email, isDarkMode && { color: '#fff' }]}>{email}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
      <View style={{ position: 'absolute', top: 72, left: 24, zIndex: 1 }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={40} color={isDarkMode ? '#fff' : '#222'} />
              </TouchableOpacity>
            </View>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Hesabı Sil</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProfile', { email })} // Düzenleme ekranına yönlendirme
      >
        <Text style={styles.editText}>Hesabı Düzenle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    paddingTop: 100,
    backgroundColor: '#fff'
 },
  avatar: {
    
    width: 100,
    height: 100, 
    borderRadius: 50, 
    marginBottom: 20,
 },
  email: { 
    fontSize: 18,
    fontWeight: 'bold'
 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  backText: {
    fontSize: 48,
    color: '#222',
    fontWeight: 'bold',
  },
   logoutButton: {
    position: 'absolute',
    
    right: 20,
    padding: 8,
    backgroundColor: '#FFD700',
    borderRadius: 80,
    top: 75,
  },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
    deleteButton: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        backgroundColor: '#f33',
        padding: 12,
        borderRadius: 8,
},
deleteText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},
editButton: {
  position: 'absolute',
  bottom: 100,
  alignSelf: 'center',
  backgroundColor: '#007bff',
  paddingHorizontal: 32,
  paddingVertical: 12,
  borderRadius: 8,
},
editText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},
});