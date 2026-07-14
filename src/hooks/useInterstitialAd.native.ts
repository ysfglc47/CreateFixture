import { useCallback, useEffect, useRef, useState } from 'react';
import { getAdMobUnitIds } from '../config/admob';
import { canRequestAdMobAds, initializeAdMob } from '../services/admobService';

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

export function useInterstitialAd() {
  const [loaded, setLoaded] = useState(false);
  const interstitialRef = useRef<any>(null);
  const unsubscribeRefs = useRef<Array<() => void>>([]);

  const cleanup = useCallback(() => {
    unsubscribeRefs.current.forEach(unsubscribe => {
      try {
        unsubscribe?.();
      } catch (error) {
        // Ignore ad listener cleanup errors.
      }
    });
    unsubscribeRefs.current = [];
  }, []);

  const load = useCallback(async () => {
    try {
      const isInitialized = await initializeAdMob();
      if (!isInitialized && !canRequestAdMobAds()) return;

      const GoogleMobileAds = getGoogleMobileAdsModule();
      if (!GoogleMobileAds) return;

      cleanup();
      const { InterstitialAd, AdEventType } = GoogleMobileAds;
      const { interstitial } = getAdMobUnitIds();
      if (!InterstitialAd || !AdEventType || !interstitial) return;

      const ad = InterstitialAd.createForAdRequest(interstitial);
      interstitialRef.current = ad;

      unsubscribeRefs.current = [
        ad.addAdEventListener(AdEventType.LOADED, () => setLoaded(true)),
        ad.addAdEventListener(AdEventType.CLOSED, () => {
          setLoaded(false);
          load();
        }),
        ad.addAdEventListener(AdEventType.ERROR, () => {
          setLoaded(false);
        }),
      ];

      ad.load();
    } catch (error) {
      setLoaded(false);
    }
  }, [cleanup]);

  const show = useCallback(async () => {
    try {
      if (!loaded || !interstitialRef.current) return false;
      await interstitialRef.current.show();
      return true;
    } catch (error) {
      setLoaded(false);
      load();
      return false;
    }
  }, [load, loaded]);

  useEffect(() => {
    load();
    return cleanup;
  }, [cleanup, load]);

  return {
    loaded,
    load,
    show,
  };
}


