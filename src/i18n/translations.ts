export const LANGUAGE_STORAGE_KEY = 'createfixture_language';

export const supportedLanguages = [
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷' },
  { code: 'en', nativeName: 'English', englishName: 'English', flag: '🇺🇸' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', flag: '🇵🇹' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese', flag: '🇨🇳' },
];

export const translations = {
  tr: {
    common: {
      cancel: 'İptal',
      clean: 'Temizle',
    },
    settings: {
      title: 'Ayarlar',
      controlCenter: 'CreateFixture Kontrol Merkezi',
      summary: '%{tournaments} turnuva, %{teams} takım kayıtlı.',
      appearance: 'Görünüm',
      darkMode: 'Koyu mod',
      darkModeDescription: 'Sarı-siyah tema düşük ışıkta daha rahat görünür.',
      compactLists: 'Kompakt listeler',
      compactListsDescription: 'Turnuva ve takım listelerinde daha az boşluk kullanır.',
      languageTitle: 'Dil',
      languageDescription: 'Uygulama arayüzünde kullanmak istediğiniz dili seçin.',
      selectedLanguage: 'Seçili dil',
      tournamentPreferences: 'Turnuva Tercihleri',
      autoSaveResults: 'Skorları otomatik sakla',
      autoSaveResultsDescription: 'Maç sonucu girildiğinde SQLite veritabanı üzerinden kayıt tutulur.',
      showMatchDates: 'Maç tarihlerini göster',
      showMatchDatesDescription: 'Maç kartlarında tarih ve gün bilgisini görünür tutar.',
      defaultMode: 'Varsayılan mod',
      dataManagement: 'Veri Yönetimi',
      clearTournamentData: 'Turnuva verilerini temizle',
      clearDataNote: 'Bu işlem hesap bilgilerini silmez; sadece turnuva, maç, grup ve tablo kayıtlarını temizler.',
      clearDataTitle: 'Turnuva Verilerini Temizle',
      clearDataMessage: 'Kayıtlı tüm turnuvalar, maçlar ve tablolar silinecek. Devam edilsin mi?',
    },
  },
  en: {
    common: { cancel: 'Cancel', clean: 'Clear' },
    settings: {
      title: 'Settings', controlCenter: 'CreateFixture Control Center', summary: '%{tournaments} tournaments, %{teams} teams saved.', appearance: 'Appearance', darkMode: 'Dark mode', darkModeDescription: 'The yellow-black theme is easier to read in low light.', compactLists: 'Compact lists', compactListsDescription: 'Uses less spacing in tournament and team lists.', languageTitle: 'Language', languageDescription: 'Choose the language you want to use in the app interface.', selectedLanguage: 'Selected language', tournamentPreferences: 'Tournament Preferences', autoSaveResults: 'Auto-save scores', autoSaveResultsDescription: 'Scores are stored through the SQLite database when match results are entered.', showMatchDates: 'Show match dates', showMatchDatesDescription: 'Keeps date and day information visible on match cards.', defaultMode: 'Default mode', dataManagement: 'Data Management', clearTournamentData: 'Clear tournament data', clearDataNote: 'This does not delete account information; it only clears tournaments, matches, groups and table records.', clearDataTitle: 'Clear Tournament Data', clearDataMessage: 'All saved tournaments, matches and tables will be deleted. Continue?'
    },
  },
  es: {
    common: { cancel: 'Cancelar', clean: 'Limpiar' },
    settings: {
      title: 'Ajustes', controlCenter: 'Centro de Control de CreateFixture', summary: '%{tournaments} torneos, %{teams} equipos guardados.', appearance: 'Apariencia', darkMode: 'Modo oscuro', darkModeDescription: 'El tema amarillo y negro se ve mejor con poca luz.', compactLists: 'Listas compactas', compactListsDescription: 'Usa menos espacio en listas de torneos y equipos.', languageTitle: 'Idioma', languageDescription: 'Elige el idioma de la interfaz de la aplicación.', selectedLanguage: 'Idioma seleccionado', tournamentPreferences: 'Preferencias del torneo', autoSaveResults: 'Guardar marcadores automáticamente', autoSaveResultsDescription: 'Los resultados se guardan en SQLite al introducir el marcador.', showMatchDates: 'Mostrar fechas de partidos', showMatchDatesDescription: 'Mantiene visible la fecha y el día en las tarjetas de partido.', defaultMode: 'Modo predeterminado', dataManagement: 'Gestión de datos', clearTournamentData: 'Limpiar datos del torneo', clearDataNote: 'No elimina la cuenta; solo limpia torneos, partidos, grupos y tablas.', clearDataTitle: 'Limpiar datos del torneo', clearDataMessage: 'Se eliminarán todos los torneos, partidos y tablas guardados. ¿Continuar?'
    },
  },
  fr: {
    common: { cancel: 'Annuler', clean: 'Effacer' },
    settings: {
      title: 'Paramètres', controlCenter: 'Centre de contrôle CreateFixture', summary: '%{tournaments} tournois, %{teams} équipes enregistrées.', appearance: 'Apparence', darkMode: 'Mode sombre', darkModeDescription: 'Le thème jaune et noir est plus confortable en faible luminosité.', compactLists: 'Listes compactes', compactListsDescription: 'Réduit les espacements dans les listes de tournois et d’équipes.', languageTitle: 'Langue', languageDescription: 'Choisissez la langue de l’interface.', selectedLanguage: 'Langue sélectionnée', tournamentPreferences: 'Préférences du tournoi', autoSaveResults: 'Enregistrer les scores automatiquement', autoSaveResultsDescription: 'Les résultats sont enregistrés dans SQLite après saisie.', showMatchDates: 'Afficher les dates des matchs', showMatchDatesDescription: 'Garde la date et le jour visibles sur les cartes de match.', defaultMode: 'Mode par défaut', dataManagement: 'Gestion des données', clearTournamentData: 'Effacer les données du tournoi', clearDataNote: 'Cette action ne supprime pas le compte; elle efface seulement les tournois, matchs, groupes et classements.', clearDataTitle: 'Effacer les données du tournoi', clearDataMessage: 'Tous les tournois, matchs et classements enregistrés seront supprimés. Continuer ?'
    },
  },
  de: {
    common: { cancel: 'Abbrechen', clean: 'Löschen' },
    settings: {
      title: 'Einstellungen', controlCenter: 'CreateFixture Kontrollzentrum', summary: '%{tournaments} Turniere, %{teams} Teams gespeichert.', appearance: 'Darstellung', darkMode: 'Dunkler Modus', darkModeDescription: 'Das gelb-schwarze Design ist bei wenig Licht angenehmer.', compactLists: 'Kompakte Listen', compactListsDescription: 'Verwendet weniger Abstand in Turnier- und Teamlisten.', languageTitle: 'Sprache', languageDescription: 'Wähle die Sprache der App-Oberfläche.', selectedLanguage: 'Ausgewählte Sprache', tournamentPreferences: 'Turniereinstellungen', autoSaveResults: 'Ergebnisse automatisch speichern', autoSaveResultsDescription: 'Spielergebnisse werden nach Eingabe in SQLite gespeichert.', showMatchDates: 'Spieldaten anzeigen', showMatchDatesDescription: 'Datum und Tag bleiben auf Spielkarten sichtbar.', defaultMode: 'Standardmodus', dataManagement: 'Datenverwaltung', clearTournamentData: 'Turnierdaten löschen', clearDataNote: 'Kontoinformationen werden nicht gelöscht; nur Turniere, Spiele, Gruppen und Tabellen.', clearDataTitle: 'Turnierdaten löschen', clearDataMessage: 'Alle gespeicherten Turniere, Spiele und Tabellen werden gelöscht. Fortfahren?'
    },
  },
  pt: {
    common: { cancel: 'Cancelar', clean: 'Limpar' },
    settings: {
      title: 'Configurações', controlCenter: 'Central de Controle CreateFixture', summary: '%{tournaments} torneios, %{teams} equipes salvas.', appearance: 'Aparência', darkMode: 'Modo escuro', darkModeDescription: 'O tema amarelo e preto é mais confortável com pouca luz.', compactLists: 'Listas compactas', compactListsDescription: 'Usa menos espaço nas listas de torneios e equipes.', languageTitle: 'Idioma', languageDescription: 'Escolha o idioma da interface do aplicativo.', selectedLanguage: 'Idioma selecionado', tournamentPreferences: 'Preferências do torneio', autoSaveResults: 'Salvar placares automaticamente', autoSaveResultsDescription: 'Os resultados são salvos no SQLite ao inserir o placar.', showMatchDates: 'Mostrar datas dos jogos', showMatchDatesDescription: 'Mantém data e dia visíveis nos cartões de jogo.', defaultMode: 'Modo padrão', dataManagement: 'Gerenciamento de dados', clearTournamentData: 'Limpar dados do torneio', clearDataNote: 'Isso não exclui a conta; limpa apenas torneios, jogos, grupos e tabelas.', clearDataTitle: 'Limpar dados do torneio', clearDataMessage: 'Todos os torneios, jogos e tabelas salvos serão excluídos. Continuar?'
    },
  },
  ar: {
    common: { cancel: 'إلغاء', clean: 'مسح' },
    settings: {
      title: 'الإعدادات', controlCenter: 'مركز تحكم CreateFixture', summary: 'تم حفظ %{tournaments} بطولة و %{teams} فريقًا.', appearance: 'المظهر', darkMode: 'الوضع الداكن', darkModeDescription: 'السمة الصفراء والسوداء أوضح في الإضاءة المنخفضة.', compactLists: 'قوائم مدمجة', compactListsDescription: 'تستخدم مسافات أقل في قوائم البطولات والفرق.', languageTitle: 'اللغة', languageDescription: 'اختر لغة واجهة التطبيق.', selectedLanguage: 'اللغة المحددة', tournamentPreferences: 'تفضيلات البطولة', autoSaveResults: 'حفظ النتائج تلقائيًا', autoSaveResultsDescription: 'يتم حفظ نتائج المباريات في SQLite عند إدخالها.', showMatchDates: 'عرض تواريخ المباريات', showMatchDatesDescription: 'إظهار التاريخ واليوم في بطاقات المباريات.', defaultMode: 'الوضع الافتراضي', dataManagement: 'إدارة البيانات', clearTournamentData: 'مسح بيانات البطولة', clearDataNote: 'لا يحذف هذا معلومات الحساب؛ بل يمسح البطولات والمباريات والمجموعات والجداول فقط.', clearDataTitle: 'مسح بيانات البطولة', clearDataMessage: 'سيتم حذف جميع البطولات والمباريات والجداول المحفوظة. هل تريد المتابعة؟'
    },
  },
  ja: {
    common: { cancel: 'キャンセル', clean: '削除' },
    settings: {
      title: '設定', controlCenter: 'CreateFixture コントロールセンター', summary: '%{tournaments} 件の大会、%{teams} チームが保存されています。', appearance: '表示', darkMode: 'ダークモード', darkModeDescription: '黄色と黒のテーマは暗い場所で見やすくなります。', compactLists: 'コンパクトリスト', compactListsDescription: '大会とチーム一覧の余白を減らします。', languageTitle: '言語', languageDescription: 'アプリの表示言語を選択してください。', selectedLanguage: '選択中の言語', tournamentPreferences: '大会設定', autoSaveResults: 'スコアを自動保存', autoSaveResultsDescription: '試合結果を入力するとSQLiteに保存されます。', showMatchDates: '試合日を表示', showMatchDatesDescription: '試合カードに日付と曜日を表示します。', defaultMode: '既定モード', dataManagement: 'データ管理', clearTournamentData: '大会データを削除', clearDataNote: 'アカウント情報は削除されません。大会、試合、グループ、順位表のみ削除します。', clearDataTitle: '大会データを削除', clearDataMessage: '保存された大会、試合、順位表がすべて削除されます。続行しますか？'
    },
  },
  zh: {
    common: { cancel: '取消', clean: '清除' },
    settings: {
      title: '设置', controlCenter: 'CreateFixture 控制中心', summary: '已保存 %{tournaments} 个赛事，%{teams} 支球队。', appearance: '外观', darkMode: '深色模式', darkModeDescription: '黄黑主题在弱光环境下更易阅读。', compactLists: '紧凑列表', compactListsDescription: '减少赛事和球队列表中的间距。', languageTitle: '语言', languageDescription: '选择应用界面使用的语言。', selectedLanguage: '当前语言', tournamentPreferences: '赛事偏好', autoSaveResults: '自动保存比分', autoSaveResultsDescription: '输入比赛结果后会保存到 SQLite 数据库。', showMatchDates: '显示比赛日期', showMatchDatesDescription: '在比赛卡片中显示日期和星期。', defaultMode: '默认模式', dataManagement: '数据管理', clearTournamentData: '清除赛事数据', clearDataNote: '此操作不会删除账户信息；只会清除赛事、比赛、小组和积分表记录。', clearDataTitle: '清除赛事数据', clearDataMessage: '所有已保存的赛事、比赛和积分表都将被删除。是否继续？'
    },
  },
};


