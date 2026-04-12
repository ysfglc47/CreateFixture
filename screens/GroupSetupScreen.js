import React from 'react';
import { View, Text } from 'react-native';

export default function GroupSetupScreen({ route }) {
  // Gerekli parametreleri route.params ile alabilirsin
  // const { tournament } = route.params;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Grup Ayarları Ekranı</Text>
      {/* Burada grup sayısı, grup isimleri ve takım dağıtımı için alanlar ekleyeceksin */}
    </View>
  );
}