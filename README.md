# Odaklanma Zamanlayıcısı (Focus Tracking App)

Odaklanma ve mola oturumlarınızı takip etmenize, kategori bazlı kayıt tutmanıza ve grafiklerle ilerlemenizi görselleştirmenize yardımcı olan bir React Native (Expo) uygulaması.

## İçindekiler
- Proje Hakkında
- Özellikler
- Ekranlar
- Mimari ve Dosya Yapısı
- Kurulum ve Çalıştırma
- Kullanım
- Veri Saklama ve Model
- Bağımlılıklar
- Geliştirme Notları ve İzinler
- Yol Haritası / Geliştirme Önerileri

## Proje Hakkında

Uygulama, Pomodoro benzeri odak oturumlarını başlatma/duraklatma/bitirme akışı sağlar. Odak ve Mola modları arasında geçiş yapılabilir. Odak oturumları bittiğinde veya erken bitirildiğinde oturum özeti kaydedilir. Geçmiş oturumlar, günlük ve toplam süre istatistikleri, dikkat dağınıklığı sayıları ve kategori dağılımı grafiklerle sunulur.

## Özellikler
- Odak ve Mola modları arasında geçiş.
- Süre seçimi (15/25/30/45/60 dk) ve mod bazlı varsayılanlar (Odak: 25 dk, Mola: 5 dk).
- Çember ilerleme göstergesi (progress ring) ile kalan süre görselleştirme.
- Uygulama arka plana atıldığında otomatik duraklatma ve dikkat dağınıklığı sayacı artışı.
- Odak oturumu sonunda titreşimle bildirim ve oturum özeti.
- Kategori yönetimi: varsayılan kategoriler, kategori ekleme/silme, seçili kategori ile oturum kaydı.
- Raporlar ekranında:
  - Bugün ve toplam dakika istatistikleri,
  - Son 7 güne ait bar grafik (dakika),
  - Kategorilere göre pasta grafik,
  - Geçmiş oturum listesi ve tekil kayıt silme.
- Yerel depolama (AsyncStorage) ile kalıcı veri saklama.
- Safe area desteği ve alt sekme navigasyonu.

## Ekranlar

### Zamanlayıcı (HomeScreen)
- Sayaç başlat/duraklat/bitir kontrolleri.
- Süre seçimi butonları ve mod (Odak/Mola) değişimi.
- Odak modunda kategori seçimi, kategori ekleme/silme.
- Oturum bitince özet modalı (kategori, süre, dikkat dağınıklığı).

### Raporlar (ReportsScreen)
- Bugün/toplam dakika ve toplam dikkat dağınıklığı istatistikleri.
- Son 7 gün dakika dağılımı için bar grafik.
- Kategori bazlı süre dağılımı için pasta grafik.
- Geçmiş oturum listesi, tekil kayıt silme.

## Mimari ve Dosya Yapısı


- `App.js`: Tab tabanlı navigasyon, `Zamanlayıcı` ve `Raporlar` sekmeleri; başlıkta SVG Logo.
- `app.json`: Expo uygulama yapılandırması (ad, ikon, splash, platform ayarları, `expo-asset` plugin).
- `src/components/Logo.js`: `react-native-svg` ile gradient arka planlı, halka ve onay işareti içeren logo.
- `src/hooks/useFocusTimer.js`: Sayaç durumu, mod yönetimi, arka plan davranışı ve titreşim.
- `src/screens/HomeScreen.js`: Zamanlayıcı UI, kategori yönetimi, oturum özeti modalı.
- `src/screens/ReportsScreen.js`: İstatistikler, grafikler ve geçmiş oturumlar.
- `src/utils/storage.js`: AsyncStorage ile oturum ve kategori saklama/okuma/silme.
- `assets/`: İkon ve splash görselleri.

## Kurulum ve Çalıştırma

Önkoşullar:
- Node.js (LTS) ve npm/yarn.
- Expo CLI (yerel geliştirici araçları). Yüklü değilse: `npm i -g expo-cli` veya son sürümlerde `npx expo start` yeterlidir.

Adımlar:
1. Bağımlılıkları yükleyin: `npm install`
2. Geliştirme sunucusunu başlatın: `npm run start`
3. Platforma göre açın:
   - Android: `npm run android`
   - iOS: `npm run ios`
   - Web: `npm run web`

Notlar:
- Expo Go ile cihazda QR kodu okutarak test edebilirsiniz.
- Grafikler ve bazı Expo modülleri webde kısıtlı olabilir; mobil hedef önerilir.

## Kullanım

1. `Zamanlayıcı` sekmesinde süre ve mod seçin.
2. Odak modunda bir kategori seçin veya ekleyin.
3. `Başlat` ile sayaç çalıştırın; `Duraklat` ile duraklatın; `Bitir` ile oturumu sonlandırın.
4. Oturum sonlarında açılan özet modaldan bilgileri görüntüleyin.
5. `Raporlar` sekmesinden günlük/toplam istatistikleri, son 7 günü ve kategori dağılımını takip edin; gerekirse tekil oturumları silin.

## Veri Saklama ve Model

AsyncStorage anahtarları:
- `@focus_sessions`: Oturum listesi.
- `@focus_categories`: Kategori listesi.

Oturum nesnesi örneği (`src/utils/storage.js`):
```
{
  id: string,               // otomatik: Date.now().toString()
  date: string,             // ISO tarih
  duration: number,         // planlanan süre (saniye)
  elapsed: number,          // gerçekleşen süre (saniye)
  category: string,         // seçili kategori
  distractions: number      // dikkat dağınıklığı sayısı
}
```

Kategori yönetimi:
- Varsayılanlar: `Ders Çalışma`, `Kodlama`, `Proje`, `Kitap Okuma`.
- Ekle/sil işlemleri `HomeScreen` üzerinden yapılır ve AsyncStorage’a kaydedilir.

Kaydetme davranışı:
- Sadece `Odak` modundaki oturumlar kaydedilir.
- Oturum tamamlanınca veya manuel bitirilince özet modalı açılır ve kayıt yapılır.

## Bağımlılıklar

`package.json` başlıca bağımlılıklar:
- `expo`, `react`, `react-native`
- `@react-navigation/native`, `@react-navigation/bottom-tabs`
- `react-native-safe-area-context`, `react-native-screens`
- `@react-native-async-storage/async-storage`
- `@react-native-picker/picker`
- `react-native-svg`
- `expo-keep-awake`, `expo-av`, `expo-status-bar`, `expo-asset`
- `react-native-chart-kit`

## Geliştirme Notları ve İzinler

- Titreşim: `Vibration` API kullanılır; cihazda titreşim iznine gerek olmadan çalışır.
- Arka plan davranışı: `AppState` ile arka plana geçildiğinde sayaç duraklatılır ve `distractions` artırılır.
- Ses uyarısı: `expo-av` üzerinden ses çalma örneği yer alır; varsayılan olarak titreşim kullanılır.
- Ekranı açık tutma: `expo-keep-awake` ile odak sırasında ekran kapanmaz.

## Yol Haritası / Geliştirme Önerileri
- Odak/mola süreleri için kullanıcıya özel ayar paneli.
- Oturum tamamlandığında not ekleme ve hedefler.
- Grafiklerde daha fazla filtre (hafta/ay/yıl).
- Dışa aktarma (CSV/JSON) ve bulut senkronizasyonu.
- Bildirim sesinin uygulamaya eklenmesi ve ayarlanabilirliği.

---

Bu README, mevcut kod tabanının (App.js, HomeScreen, ReportsScreen, useFocusTimer, storage ve diğer ilgili dosyalar) tam incelenmesine dayanarak hazırlanmıştır.

