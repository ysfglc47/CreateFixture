let initialized = false;

export async function initializeAdMob() {
  initialized = false;
  return false;
}

export function canRequestAdMobAds() {
  return initialized;
}
