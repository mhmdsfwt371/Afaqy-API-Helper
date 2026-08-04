/* خدمة الخلفية — الشبكة الأول، والكاش احتياطي.
   اسم الكاش فيه رقم النسخة، فأي نشر جديد بيلغي القديم بالكامل. */
const VERSION = '2.6';
const CACHE = 'afaqy-helper-' + VERSION;
const SHELL = ['./', './index.html', './manifest.json',
               './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', ev => {
  if (ev.data === 'flush') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;                          // نداءات الـ API ما تتخزنش
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;           // سيرفر أفاقي يعدي على طول
  if (url.pathname.endsWith('version.json')) return;         // فحص النسخة دايمًا من الشبكة
  if (url.pathname.endsWith('sw.js')) return;

  /* الصفحة نفسها بتتجاب من الشبكة متجاهلة كاش المتصفح.
     من غير no-store، سيرفر الصفحات بيرجّع نسخة مخزّنة لحد عشر دقايق
     والأداة تفضل على نسخة قديمة مهما عملت تحديث. */
  const isDoc = req.mode === 'navigate' || url.pathname.endsWith('/') ||
                url.pathname.endsWith('index.html');

  ev.respondWith(
    fetch(isDoc ? new Request(req.url, {cache: 'no-store'}) : req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, {ignoreSearch: true})
                         .then(r => r || caches.match('./index.html')))
  );
});
