import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'E-posta adresi giriniz!');
      return;
    }
    const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email.trim());
    if (user) {
      Alert.alert('Bilgi', `Şifreniz: ${user.password}`);
    } else {
      Alert.alert('Hata', 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Şifremi Unuttum</Text>
      <TextInput
        style={styles.input}
        placeholder="E-posta adresiniz"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Button title="Şifreyi Göster" onPress={handleReset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 20 },
});