# CreateFixture Play Store Release Checklist

## App identity
- Android package name: com.createfixture.app
- Version name: 1.0.0
- Version code: 1
- Release format: Android App Bundle (AAB)

## Build commands

Run checks before building:

```bash
npm run check:types
npm run check:expo
```

Create a production AAB:

```bash
npm run build:android:production
```

Submit after the first manual Play Console upload:

```bash
npm run submit:android:production
```

## Play Console notes
- Mark the app as containing ads if real AdMob ads are enabled.
- Fill Data safety for local account data, tournament data, profile photo/gallery access, and advertising identifiers if ads are enabled.
- Add a privacy policy URL before production release.
- New personal Google Play developer accounts may need 12 closed-test testers for 14 continuous days before production access.

## AdMob status
Production ad unit IDs are not configured yet. The app will use test ads only in development. Production builds will not show test ads until real AdMob banner/interstitial unit IDs are added in src/config/admob.ts and app.json plugin App IDs are replaced with real AdMob App IDs.

## Important update rule
Before each Play Store update, increase android.versionCode in app.json. Example: 1 -> 2 -> 3.
