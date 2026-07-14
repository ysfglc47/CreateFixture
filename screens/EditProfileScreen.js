import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useDarkMode } from '../DarkModeContext';
import { createPasswordResetToken, findUserByEmail, updateUser, updateUserPassword } from '../database';

import { Text, TextInput } from '../components/I18nPrimitives';

export default function EditProfileScreen({ route, navigation }) {
  const { email } = route.params || {};
  const [newEmail, setNewEmail] = useState(email);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordAgain, setNewPasswordAgain] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useDarkMode();
  const styles = getStyles(isDarkMode);

  const handleSave = async () => {
    const cleanEmail = newEmail.trim();

    if (!cleanEmail) {
      setMessage('E-posta adresi boş olamaz.');
      return;
    }
    if (!oldPassword) {
      setMessage('Eski şifre zorunludur.');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Yeni şifre en az 6 karakter olmalı.');
      return;
    }
    if (newPassword !== newPasswordAgain) {
      setMessage('Yeni şifreler eşleşmiyor.');
      return;
    }
    if (oldPassword === newPassword) {
      setMessage('Yeni şifre eski şifreyle aynı olmamalı.');
      return;
    }

    setLoading(true);
    try {
      const existingUser = await findUserByEmail(cleanEmail);
      if (existingUser && existingUser.email !== email) {
        setMessage('Bu e-posta adresi zaten kullanılıyor.');
        return;
      }

      if (cleanEmail !== email) {
        await updateUserPassword(email, oldPassword, newPassword);
        await updateUser(email, cleanEmail, newPassword);
      } else {
        await updateUserPassword(email, oldPassword, newPassword);
      }
      setMessage('Şifre başarıyla güncellendi.');
      setTimeout(() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }), 900);
    } catch (error) {
      setMessage(error?.message === 'OLD_PASSWORD_INVALID' ? 'Eski şifre hatalı.' : 'Bilgiler güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      const result = await createPasswordResetToken(email);
      if (!result) {
        setMessage('Bu e-posta ile kayıtlı kullanıcı bulunamadı.');
        return;
      }
      setMessage(`Şifre yenileme bağlantısı hazır: createfixture://reset-password?token=${result.token}`);
      navigation.navigate('ResetPassword', { token: result.token });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={32} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
        <Text style={styles.title}>Hesabı Düzenle</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {message ? <Text style={styles.messageText}>{message}</Text> : null}

      <Text style={styles.label}>E-posta adresi</Text>
      <TextInput
        style={styles.input}
        value={newEmail}
        onChangeText={setNewEmail}
        placeholder="E-posta adresi"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
      />

      <Text style={styles.label}>Eski şifre</Text>
      <TextInput
        style={styles.input}
        value={oldPassword}
        onChangeText={setOldPassword}
        placeholder="Eski şifre"
        secureTextEntry
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
      />

      <Text style={styles.label}>Yeni şifre</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Yeni şifre"
        secureTextEntry
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
      />

      <Text style={styles.label}>Yeni şifre tekrar</Text>
      <TextInput
        style={styles.input}
        value={newPasswordAgain}
        onChangeText={setNewPasswordAgain}
        placeholder="Yeni şifre tekrar"
        secureTextEntry
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
      />

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'İşleniyor...' : 'Düzenle'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
        <Text style={styles.forgotText}>Eski şifremi unuttum</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
}

function getStyles(isDarkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#222' : '#fff',
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: 24,
      paddingBottom: 32,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: '900',
      color: isDarkMode ? '#fff' : '#000',
    },
    label: {
      color: isDarkMode ? '#FFD700' : '#222',
      fontWeight: '900',
      marginBottom: 7,
    },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: isDarkMode ? '#555' : '#ccc',
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
      backgroundColor: isDarkMode ? '#333' : '#fff',
    },
    messageText: {
      color: '#FFD700',
      fontWeight: '900',
      textAlign: 'center',
      marginBottom: 14,
      fontSize: 13,
    },
    button: {
      backgroundColor: '#FFD700',
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 4,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#222',
      fontWeight: '900',
      fontSize: 16,
    },
    forgotButton: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    forgotText: {
      color: '#FFD700',
      fontWeight: '900',
    },
  });
}
