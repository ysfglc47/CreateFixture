import React, { useState } from 'react';
import { Text, TextInput, Button, StyleSheet, Alert, ScrollView, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from '../DarkModeContext';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function EditProfileScreen({ route, navigation }) {
  const { email } = route.params || {};
  const [newEmail, setNewEmail] = useState(email);
  const [newPassword, setNewPassword] = useState('');
  const { isDarkMode } = useDarkMode();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#222' : '#fff',
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: isDarkMode ? '#fff' : '#000',
    },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: isDarkMode ? '#555' : '#ccc',
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
      backgroundColor: isDarkMode ? '#333' : '#fff',
    },
  });

  const handleSave = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Hata', 'E-posta adresi boş olamaz!');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Hata', 'Şifre boş olamaz!');
      return;
    }
    try {
      const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
      const updatedUsers = users.map(user =>
        user.email === email
          ? { ...user, email: newEmail, password: newPassword }
          : user
      );
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      console.log('Kullanıcılar başarıyla güncellendi.');
      Alert.alert('Başarılı', 'E-posta ve şifre güncellendi!');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.log('Hata:', error);
      Alert.alert('Hata', 'Bilgiler güncellenirken bir hata oluştu.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Go Back Butonu */}
      <View style={{ position: 'absolute', top: 72, left: 24, zIndex: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={40} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Hesabı Düzenle</Text>
      <TextInput
        style={styles.input}
        value={newEmail}
        onChangeText={setNewEmail}
        placeholder="Yeni e-posta adresi"
        keyboardType="email-address"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
      />
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Yeni şifre"
        secureTextEntry={true}
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
      />
      <Button title="Kaydet" onPress={handleSave} color={isDarkMode ? '#007bff' : '#000'} />
    </ScrollView>
  );
}