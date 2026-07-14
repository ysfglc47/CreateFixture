import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { resetPasswordWithToken } from '../database';

import { Text, TextInput } from '../components/I18nPrimitives';

export default function ResetPasswordScreen({ navigation, route }) {
  const { token = '' } = route.params || {};
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (password.length < 6) {
      setMessage('Yeni şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== passwordAgain) {
      setMessage('Yeni şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithToken(token, password);
      setMessage('Şifreniz başarıyla güncellendi, yeni şifrenizle giriş yapabilirsiniz.');
      setTimeout(() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }), 1100);
    } catch (error) {
      setMessage('Şifre yenileme bağlantısı geçersiz veya süresi dolmuş.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni Şifre Belirle</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Yeni şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Yeni şifre tekrar"
        secureTextEntry
        value={passwordAgain}
        onChangeText={setPasswordAgain}
      />
      <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Güncelleniyor...' : 'Şifreyi güncelle'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 18,
  },
  message: {
    color: '#222',
    backgroundColor: '#fff7c7',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    padding: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#222',
    fontWeight: '900',
  },
});
