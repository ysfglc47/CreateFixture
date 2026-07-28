# CreateFixture bulut veritabani kurulumu

Kayitli kullanicilar Supabase Auth ve PostgreSQL uzerinde tutulur. Misafir modu cihazda yerel calismaya devam eder.

## 1. Supabase projesi

1. `https://supabase.com/dashboard` adresinden yeni bir proje olusturun.
2. SQL Editor ekranini acin.
3. `supabase/migrations/202607280001_create_cloud_data.sql` dosyasinin tamamini calistirin.
4. Authentication > URL Configuration > Redirect URLs alanina `createfixture://reset-password` ve `createfixture://auth-confirmed` ekleyin.
5. Authentication > Email Templates bolumundeki sifre sifirlama e-postasinin etkin oldugunu kontrol edin.

## 2. Yerel gelistirme ayarlari

Proje kokunde `.env` dosyasi olusturun:

```env
EXPO_PUBLIC_SUPABASE_URL=https://PROJE_KIMLIGI.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY
```

Bu iki degeri Supabase > Project Settings > API ekranindan alabilirsiniz. `service_role` anahtarini mobil uygulamaya kesinlikle koymayin.

## 3. EAS production ayarlari

Degerleri production build ortaminda tanimlayin:

```powershell
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://PROJE_KIMLIGI.supabase.co" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "SUPABASE_ANON_KEY" --visibility sensitive
```

Preview APK icin ayni iki degeri `preview` ortaminda da tanimlayin.

## 4. Davranis

- Yeni hesaplar Supabase Auth icinde olusturulur.
- E-posta dogrulamasi etkinse kullanici, e-postadaki baglantiyi acmadan panele giremez.
- Sifre sifirlama baglantisi `createfixture://reset-password` ile uygulamayi acar.
- Turnuvalar ve turnuvaya bagli yerel ayarlar kullanici kimligiyle buluta yazilir.
- RLS politikalari her kullanicinin yalnizca kendi verisini okumasini ve degistirmesini saglar.
- Eski yerel hesap, ayni e-posta ve sifreyle ilk kez giris yaptiginda verileri buluta tasinmaya calisilir.
