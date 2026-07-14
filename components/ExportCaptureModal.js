import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, View } from 'react-native';
import { exportRefAsPng } from '../utils/exportImage';
import { showExportInterstitialAd } from '../utils/ads';

import { Text } from '../components/I18nPrimitives';

export default function ExportCaptureModal({ visible, fileName, onDone, children }) {
  const captureRef = useRef(null);
  const [isCaptureReady, setIsCaptureReady] = useState(false);

  useEffect(() => {
    if (visible) setIsCaptureReady(false);
  }, [visible]);

  useEffect(() => {
    if (!visible || !isCaptureReady) return undefined;

    const timer = setTimeout(async () => {
      try {
        const exported = await exportRefAsPng(captureRef, fileName);
        if (exported) {
          await showExportInterstitialAd();
        }
      } finally {
        onDone?.();
      }
    }, Platform.OS === 'web' ? 800 : 1100);

    return () => clearTimeout(timer);
  }, [fileName, isCaptureReady, onDone, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <View style={styles.backdrop}>
        <View
          style={styles.captureArea}
          ref={captureRef}
          collapsable={false}
          needsOffscreenAlphaCompositing
          renderToHardwareTextureAndroid
          onLayout={() => setIsCaptureReady(true)}
        >
          {children}
        </View>
        <View style={styles.statusBox}>
          <ActivityIndicator color="#FFD700" />
          <Text style={styles.statusText}>{isCaptureReady ? 'PNG işleniyor...' : 'Tablo hazırlanıyor...'}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: '#f7f7fa',
  },
  statusBox: {
    backgroundColor: '#181818',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  statusText: {
    color: '#FFD700',
    fontWeight: '900',
    marginTop: 10,
  },
});
