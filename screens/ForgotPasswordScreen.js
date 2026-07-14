import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { createPasswordResetToken } from '../database';

import { Text, TextInput } from '../components/I18nPrimitives';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setMessage('E-posta adresi giriniz.');
      return;
    }

    setLoading(true);
    try {
      const result = await createPasswordResetToken(email.trim());
      if (!result) {
        setMessage('Bu e-posta ile kayıtlı kullanıcı bulunamadı.');
        return;
      }
      setMessage(`Şifre yenileme bağlantısı hazır: createfixture://reset-password?token=${result.token}`);
      setTimeout(() => navigation.navigate('ResetPassword', { token: result.token }), 700);
    } catch (error) {
      setMessage('Şifre yenileme bağlantısı oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={32} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Şifremi Unuttum</Text>
        <View style={{ width: 32 }} />
      </View>
      <Text style={styles.description}>
        Kayıtlı e-posta adresinizi girin. Demo yerel sürümde bağlantı uygulama içinde oluşturulur.
      </Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="E-posta adresiniz"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleReset} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Gönderiliyor...' : 'Şifre yenileme bağlantısı oluştur'}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    color: '#666',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
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
