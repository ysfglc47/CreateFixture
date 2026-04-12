import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';

export default function LoginScreen({ navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginInfo, setShowLoginInfo] = useState(false);
  const [showRegisterInfo, setShowRegisterInfo] = useState(false);
  const [showAnonInfo, setShowAnonInfo] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  

  async function handleLogin() {
    if (!email || !password) {
      setLoginMessage('E-posta ve şifre boş olamaz!');
      setShowLoginInfo(true);
      setTimeout(() => setShowLoginInfo(false), 1000);
      return;
    }
    const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setLoginMessage('Giriş başarılı!');
       setShowLoginInfo(true);
      setTimeout(() => {
        setShowLoginInfo(false);
        navigation.navigate('Home', { email: user.email });
      }, 500);
    } else {
      setLoginMessage('E-posta veya şifre hatalı!');
    }
    setShowLoginInfo(true);
    setTimeout(() => setShowLoginInfo(false), 1000);
  }

  async function handleRegister() {
    if (!email || !password) {
      setRegisterMessage('E-posta ve şifre boş olamaz!');
      setShowRegisterInfo(true);
      setTimeout(() => setShowRegisterInfo(false), 1000);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setRegisterMessage('Geçerli bir e-posta giriniz!');
      setShowRegisterInfo(true);
      setTimeout(() => setShowRegisterInfo(false), 1000);
      return;
    }
    if (password.length < 6) {
      setRegisterMessage('Şifre en az 6 karakter olmalı!');
      setShowRegisterInfo(true);
      setTimeout(() => setShowRegisterInfo(false), 1000);
      return;
    }
    // Aynı e-posta ile kayıt var mı kontrol et
    const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
      setRegisterMessage('Bu e-posta ile zaten kayıt olunmuş!');
      setShowRegisterInfo(true);
      setTimeout(() => setShowRegisterInfo(false), 1000);
      return;
    }
    users.push({ email, password });
    await AsyncStorage.setItem('users', JSON.stringify(users));
    setRegisterMessage('Kayıt başarılı!');
    setShowRegisterInfo(true);
    setTimeout(() => {
      setShowRegisterInfo(false);
      navigation.navigate('Home', { email });
    }, 500);
  }

  function handleGoogleLogin() {
    alert('Google ile oturum açılıyor...');
  }

  function handleAnonLogin() {
    setShowAnonInfo(true);
    setTimeout(() => setShowAnonInfo(false), 1000);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/myicon.png')}
        style={styles.logo}
        resizeMode='contain'
        />
      <Text style={styles.link}>Hesabınız yok mu? <Text style={styles.underline}>Kayıt ol tıklayınız!</Text></Text>

      <Text style={styles.label}>E-Mail</Text>
      <TextInput
        style={styles.input}
        placeholder="ornekeposta@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />

      <Text style={styles.label}>Şifre</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      {showLoginInfo && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{loginMessage}</Text>
        </View>
      )}

      {showRegisterInfo && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{registerMessage}</Text>
        </View>
      )}
      
      {showAnonInfo && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{`Anonim devam ediliyor...`}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş yap</Text>
      </TouchableOpacity>

      
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
        <Text style={styles.buttonText}>Google ile oturum aç</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleAnonLogin}>
        <Text style={styles.buttonText}>Anonim devam et</Text>
      </TouchableOpacity>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  link: {
    textAlign: 'center',
    color: 'gray',
    marginBottom: 24,
    fontWeight: 'bold',
    fontSize: 16,
  },
  underline: {
    textDecorationLine: 'underline',
    color: 'black',
    fonntsize: 16,
    fontWeight: 'bold',
  },
  label: {
    marginBottom: 4,
    fontWeight: 'bold',
    color: 'black',
  },
  input: {
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: '#ddd',
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 12,
    marginTop: 14,
    borderRadius: 8,
    
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  infoBox: {
    position: 'absolute',
    top: 60,
    left: 30,
    right: 30,
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 8,
    zIndex: 10,
  },
  infoText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 30,
  },
});
