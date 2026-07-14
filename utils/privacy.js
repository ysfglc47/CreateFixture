export const KVKK_CONFIG = {
  dataController: 'CreateFixture Veri Sorumlusu',
  companyTitle: 'Daha sonra düzenlenecek kişi/şirket bilgisi',
  contactEmail: 'ysf.glcamz01@gmail.com',
};

export function maskEmail(email = '') {
  const [local, domainFull] = email.split('@');
  if (!local || !domainFull || !domainFull.includes('.')) return 'E-posta gizli';

  const parts = domainFull.split('.');
  const extension = parts.pop();
  const domain = parts.join('.');
  if (!domain || !extension) return 'E-posta gizli';

  const visibleLocal = local.slice(0, 2);
  const maskedLocal = `${visibleLocal}${'*'.repeat(Math.max(local.length - 2, 2))}`;
  const maskedDomain = `${domain.slice(0, 1)}${'*'.repeat(Math.max(domain.length - 1, 4))}`;
  return `${maskedLocal}@${maskedDomain}.${extension}`;
}

export function getKvkkSections(config = KVKK_CONFIG) {
  return [
    {
      title: 'Veri Sorumlusu',
      body: `${config.dataController}, CreateFixture uygulaması kapsamında kişisel verilerin işlenmesinden sorumludur. ${config.companyTitle} ve iletişim bilgileri daha sonra güncellenebilir.`,
    },
    {
      title: 'İşlenen Kişisel Veriler',
      body: 'Uygulamada kullanıcı adı, e-posta adresi, şifre bilgisi, profil fotoğrafı, turnuva verileri, fikstürler, tablo çıktıları ve temel işlem güvenliği kayıtları işlenebilir.',
    },
    {
      title: 'Kişisel Verilerin İşlenme Amaçları',
      body: 'Veriler; hesap oluşturma, oturum açma, turnuva oluşturma, fikstürleri yönetme, profil bilgilerini düzenleme, PNG çıktısı oluşturma, şifre yenileme ve uygulama güvenliğini sürdürme amaçlarıyla işlenir.',
    },
    {
      title: 'Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi',
      body: 'Veriler kayıt ve giriş formları, profil düzenleme ekranları ve uygulama içi işlemler aracılığıyla elektronik ortamda toplanır. İşleme faaliyetleri hizmetin sunulması, sözleşmenin kurulması veya ifası, meşru menfaat ve gerekli hallerde açık rıza hukuki sebeplerine dayanır.',
    },
    {
      title: 'Kişisel Verilerin Aktarılması',
      body: 'Kişisel veriler yalnızca uygulamanın çalışması için gerekli kimlik doğrulama, veri saklama, e-posta gönderimi, bulut ve teknik altyapı sağlayıcılarıyla sınırlı olarak paylaşılabilir. Veriler gereksiz amaçlarla üçüncü kişilerle paylaşılmaz ve satılmaz.',
    },
    {
      title: 'Google AdMob ve Reklam Teknolojileri',
      body: 'Uygulamada Google AdMob reklam teknolojileri kullanılabilir. Bu kapsamda cihaz reklam kimliği, reklam gösterim bilgileri, yaklaşık cihaz/uygulama bilgileri ve reklam etkileşimleri Google tarafından işlenebilir. Kullanıcı tercihleri ve izin durumuna göre kişiselleştirilmiş veya kişiselleştirilmemiş reklam gösterilebilir. Reklam tercihleri cihaz ayarları veya Google reklam ayarları üzerinden yönetilebilir.',
    },
    {
      title: 'Kişisel Verilerin Saklanması',
      body: 'Veriler hizmetin gerektirdiği süre boyunca saklanır. Şifrelerin açık metin saklanmaması esastır; uygulama yerel veritabanında şifreleri hashlenmiş biçimde tutar. Kullanıcı hesabını sildiğinde ilgili hesap verilerinin kaldırılması hedeflenir.',
    },
    {
      title: 'Kullanıcının Hakları',
      body: 'Kullanıcılar kişisel verilerinin işlenip işlenmediğini öğrenme, bilgi talep etme, eksik veya yanlış verilerin düzeltilmesini isteme, gerekli şartlar oluştuğunda silme veya yok etme talep etme ve hukuka aykırı işleme nedeniyle zarar görmesi halinde giderim isteme haklarına sahiptir.',
    },
    {
      title: 'İletişim',
      body: `KVKK kapsamındaki talepler ${config.contactEmail} adresi üzerinden iletilebilir.`,
    },
  ];
}
