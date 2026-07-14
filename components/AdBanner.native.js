import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { getAdMobUnitIds } from '../src/config/admob';
import { canRequestAdMobAds, initializeAdMob } from '../src/services/admobService';

import { Text } from '../components/I18nPrimitives';

function isExpoGoRuntime() {
  try {
    const Constants = require('expo-constants').default;
    return Constants?.appOwnership === 'expo' || Constants?.executionEnvironment === 'storeClient';
  } catch (error) {
    return false;
  }
}

function getGoogleMobileAdsModule() {
  if (isExpoGoRuntime()) return null;

  try {
    return require('react-native-google-mobile-ads');
  } catch (error) {
    return null;
  }
}
function PlaceholderBanner({ isDarkMode = false, label = 'Reklam Alanı', compact = false }) {
  return (
    <View style={[
      styles.container,
      compact && styles.containerCompact,
      isDarkMode && styles.containerDark,
    ]}>
      <Text style={[styles.label, isDarkMode && styles.labelDark]}>{label}</Text>
      <Text style={[styles.subLabel, isDarkMode && styles.subLabelDark]}>Banner reklam için ayrıldı</Text>
    </View>
  );
}

export default function AdBanner({ isDarkMode = false, label = 'Reklam Alanı', compact = false }) {
  const [ready, setReady] = useState(false);
  const [adModule, setAdModule] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function prepareAds() {
      try {
        const initialized = await initializeAdMob();
        if (!mounted || (!initialized && !canRequestAdMobAds())) return;

        const GoogleMobileAds = getGoogleMobileAdsModule();
        if (!GoogleMobileAds) return;

        setAdModule(GoogleMobileAds);
        setReady(true);
      } catch (error) {
        if (mounted) setReady(false);
      }
    }

    prepareAds();
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready || !adModule) {
    return <PlaceholderBanner isDarkMode={isDarkMode} label={label} compact={compact} />;
  }

  try {
    const { BannerAd, BannerAdSize } = adModule;
    const { banner } = getAdMobUnitIds();
    if (!BannerAd || !BannerAdSize || !banner) {
      return <PlaceholderBanner isDarkMode={isDarkMode} label={label} compact={compact} />;
    }

    return (
      <View style={[styles.realAdWrapper, compact && styles.realAdWrapperCompact]}>
        <BannerAd
          unitId={banner}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdFailedToLoad={() => setReady(false)}
        />
      </View>
    );
  } catch (error) {
    return <PlaceholderBanner isDarkMode={isDarkMode} label={label} compact={compact} />;
  }
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6C64A',
    backgroundColor: '#FFF7C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  containerCompact: {
    minHeight: 48,
    marginVertical: 6,
  },
  containerDark: {
    backgroundColor: '#232323',
    borderColor: '#FFD700',
  },
  label: {
    color: '#222',
    fontSize: 13,
    fontWeight: '900',
  },
  labelDark: {
    color: '#FFD700',
  },
  subLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  subLabelDark: {
    color: '#ddd',
  },
  realAdWrapper: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  realAdWrapperCompact: {
    minHeight: 52,
    marginVertical: 6,
  },
});


