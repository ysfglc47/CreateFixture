import { getAdMobUnitIds } from '../src/config/admob';
import { canRequestAdMobAds, initializeAdMob } from '../src/services/admobService';

let interstitialAd = null;
let interstitialLoaded = false;
let interstitialLoading = false;
let unsubscribeInterstitial = [];

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

function cleanupInterstitialListeners() {
  unsubscribeInterstitial.forEach(unsubscribe => {
    try {
      unsubscribe?.();
    } catch (error) {
      // Ignore listener cleanup errors.
    }
  });
  unsubscribeInterstitial = [];
}

export const ADMOB_TEST_IDS = {
  banner: 'TestIds.BANNER',
  interstitial: 'TestIds.INTERSTITIAL',
};

export async function loadInterstitialAd() {
  if (interstitialLoading || interstitialLoaded) return interstitialLoaded;

  try {
    interstitialLoading = true;
    const initialized = await initializeAdMob();
    if (!initialized && !canRequestAdMobAds()) return false;

    const GoogleMobileAds = getGoogleMobileAdsModule();
    if (!GoogleMobileAds) return false;

    const { InterstitialAd, AdEventType } = GoogleMobileAds;
    const { interstitial } = getAdMobUnitIds();
    if (!InterstitialAd || !AdEventType || !interstitial) return false;

    cleanupInterstitialListeners();
    interstitialAd = InterstitialAd.createForAdRequest(interstitial);
    unsubscribeInterstitial = [
      interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        interstitialLoaded = true;
        interstitialLoading = false;
      }),
      interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        interstitialLoaded = false;
        interstitialAd = null;
        loadInterstitialAd();
      }),
      interstitialAd.addAdEventListener(AdEventType.ERROR, () => {
        interstitialLoaded = false;
        interstitialLoading = false;
      }),
    ];

    interstitialAd.load();
    return true;
  } catch (error) {
    interstitialLoaded = false;
    return false;
  } finally {
    interstitialLoading = false;
  }
}

export async function showExportInterstitialAd() {
  try {
    if (!interstitialLoaded || !interstitialAd) {
      await loadInterstitialAd();
      return false;
    }

    await interstitialAd.show();
    return true;
  } catch (error) {
    interstitialLoaded = false;
    interstitialAd = null;
    loadInterstitialAd();
    return false;
  }
}

