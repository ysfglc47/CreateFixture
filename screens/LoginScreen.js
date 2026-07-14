import React, { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useDarkMode } from '../DarkModeContext';
import { createUser, findUserByCredentials, findUserByEmail, findUserByUsername } from '../database';
import KvkkModal from '../components/KvkkModal';

import { Text, TextInput } from '../components/I18nPrimitives';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }) {
  const { isDarkMode } = useDarkMode();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [kvkkVisible, setKvkkVisible] = useState(false);
  const [message, setMessage] = useState('');
  const styles = useMemo(() => getStyles(isDarkMode), [isDarkMode]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 2200);
  };

  const goHome = (userEmail) => {
    navigation.replace('Home', { email: userEmail });
  };

  async function handleLogin() {
    if (!email.trim() || !password) {
      showMessage('E-posta ve şifre boş olamaz.');
      return;
    }

    const user = await findUserByCredentials(email.trim(), password);
    if (!user) {
      showMessage('E-posta veya şifre hatalı.');
      return;
    }

    showMessage('Giriş başarılı.');
    setTimeout(() => goHome(user.email), 450);
  }

  async function handleRegister() {
    const cleanEmail = email.trim();
    const cleanUsername = username.trim();

    if (!cleanUsername || !cleanEmail || !password) {
      showMessage('Kullanıcı adı, e-posta ve şifre boş olamaz.');
      return;
    }
    if (cleanUsername.length < 3) {
      showMessage('Kullanıcı adı en az 3 karakter olmalı.');
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      showMessage('Geçerli bir e-posta giriniz.');
      return;
    }
    if (password.length < 6) {
      showMessage('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (!kvkkAccepted) {
      showMessage('Kayıt olmak için KVKK Aydınlatma Metni’ni okuduğunuzu onaylamalısınız.');
      return;
    }

    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      showMessage('Bu e-posta ile zaten kayıt olunmuş.');
      return;
    }

    const existingUsername = await findUserByUsername(cleanUsername);
    if (existingUsername) {
      showMessage('Bu kullanıcı adı zaten kullanılıyor.');
      return;
    }

    await createUser(cleanEmail, password, 'email', {
      username: cleanUsername,
      kvkkAcceptedAt: new Date().toISOString(),
    });
    showMessage('Kayıt başarılı.');
    setTimeout(() => goHome(cleanEmail), 450);
  }

  function handleGuestLogin() {
    showMessage('Misafir olarak devam ediliyor.');
    setTimeout(() => goHome('misafir@createfixture.app'), 450);
  }

  const primaryAction = mode === 'login' ? handleLogin : handleRegister;
  const primaryLabel = mode === 'login' ? 'Giriş' : 'Kayıt Ol';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.brandRow}>
              <Image source={require('../assets/createfixture-logo.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.tagline}>Turnuvanı hızlıca kur, yönet ve paylaş.</Text>
            </View>

            <View style={styles.segment}>
              <TouchableOpacity
                style={[styles.segmentButton, mode === 'login' && styles.segmentButtonActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.segmentText, mode === 'login' && styles.segmentTextActive]}>Giriş</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentButton, mode === 'register' && styles.segmentButtonActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[styles.segmentText, mode === 'register' && styles.segmentTextActive]}>Kayıt</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {mode === 'register' ? (
                <>
                  <Text style={styles.label}>Kullanıcı adı</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Kullanıcı adın"
                    placeholderTextColor={isDarkMode ? '#777' : '#888'}
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                  />
                </>
              ) : null}

              <Text style={styles.label}>E-posta</Text>
              <TextInput
                style={styles.input}
                placeholder="ornek@mail.com"
                placeholderTextColor={isDarkMode ? '#777' : '#888'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Şifre</Text>
                {mode === 'login' ? (
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotText}>Şifremi unuttum</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <TextInput
                style={styles.input}
                placeholder="En az 6 karakter"
                placeholderTextColor={isDarkMode ? '#777' : '#888'}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {mode === 'register' ? (
                <TouchableOpacity style={styles.kvkkRow} onPress={() => setKvkkAccepted(!kvkkAccepted)}>
                  <View style={[styles.checkbox, kvkkAccepted && styles.checkboxActive]}>
                    {kvkkAccepted ? <Icon name="check" size={14} color="#222" /> : null}
                  </View>
                  <Text style={styles.kvkkText}>
                    KVKK Aydınlatma Metni’ni okudum ve anladım.
                    <Text style={styles.kvkkLink} onPress={() => setKvkkVisible(true)}> Metni aç</Text>
                  </Text>
                </TouchableOpacity>
              ) : null}

              {message ? (
                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>{message}</Text>
                </View>
              ) : null}

              <TouchableOpacity style={styles.primaryButton} onPress={primaryAction}>
                <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>veya</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
                <Icon name="user-circle-o" size={17} color={isDarkMode ? '#FFD700' : '#222'} />
                <Text style={styles.guestButtonText}>Misafir olarak devam et</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <KvkkModal visible={kvkkVisible} onClose={() => setKvkkVisible(false)} isDarkMode={isDarkMode} />
    </SafeAreaView>
  );
}

function getStyles(isDarkMode) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: isDarkMode ? '#181818' : '#f7f7fa' },
    keyboardView: { flex: 1 },
    content: { flexGrow: 1, justifyContent: 'center', padding: 18 },
    card: {
      backgroundColor: isDarkMode ? '#232323' : '#fff',
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333' : '#ececec',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    brandRow: { alignItems: 'center', marginBottom: 16 },
    logo: { width: 230, height: 92, marginBottom: 6 },
    tagline: {
      color: isDarkMode ? '#cfcfcf' : '#666',
      fontSize: 13,
      fontWeight: '600',
      marginTop: 3,
      textAlign: 'center',
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#181818' : '#f1f1f1',
      borderRadius: 14,
      padding: 4,
      marginBottom: 16,
    },
    segmentButton: { flex: 1, borderRadius: 11, paddingVertical: 9, alignItems: 'center' },
    segmentButtonActive: { backgroundColor: '#FFD700' },
    segmentText: { color: isDarkMode ? '#ddd' : '#666', fontWeight: '800' },
    segmentTextActive: { color: '#222' },
    form: { gap: 8 },
    label: { color: isDarkMode ? '#FFD700' : '#222', fontWeight: '800', fontSize: 13 },
    passwordLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    forgotText: { color: '#FFD700', fontWeight: '800', fontSize: 12 },
    input: {
      backgroundColor: isDarkMode ? '#181818' : '#f7f7fa',
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#ddd',
      color: isDarkMode ? '#fff' : '#222',
      borderRadius: 12,
      paddingHorizontal: 13,
      paddingVertical: 12,
      fontWeight: '700',
    },
    kvkkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      paddingVertical: 4,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: '#FFD700',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxActive: { backgroundColor: '#FFD700' },
    kvkkText: {
      flex: 1,
      color: isDarkMode ? '#ddd' : '#444',
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 17,
    },
    kvkkLink: { color: '#FFD700', fontWeight: '900' },
    messageBox: {
      backgroundColor: isDarkMode ? '#302a10' : '#fff7c7',
      borderColor: '#FFD700',
      borderWidth: 1,
      borderRadius: 12,
      padding: 10,
      marginTop: 2,
    },
    messageText: {
      color: isDarkMode ? '#FFD700' : '#222',
      textAlign: 'center',
      fontWeight: '800',
      fontSize: 12,
    },
    primaryButton: {
      backgroundColor: '#FFD700',
      borderRadius: 13,
      paddingVertical: 13,
      alignItems: 'center',
      marginTop: 4,
    },
    primaryButtonText: { color: '#222', fontSize: 15, fontWeight: '900' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 7 },
    divider: { flex: 1, height: 1, backgroundColor: isDarkMode ? '#3a3a3a' : '#e1e1e1' },
    dividerText: { color: isDarkMode ? '#aaa' : '#777', fontWeight: '800', fontSize: 12 },
    guestButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 9,
    },
    guestButtonText: { color: isDarkMode ? '#FFD700' : '#222', fontWeight: '800', fontSize: 13 },
  });
}
