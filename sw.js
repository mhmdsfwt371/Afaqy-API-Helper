/* خدمة الخلفية — الشبكة الأول، والكاش احتياطي.
   الترتيب ده مقصود: الأداة لازم تجيب أحدث نسخة أول ما يبقى في نت،
   والكاش يشتغل بس لما النت يقع. العكس كان هيخلي الفريق على نسخة قديمة. */
const CACHE = 'afaqy-helper-v1';
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

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;                          // نداءات الـ API ما تتخزنش
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;           // سيرفر أفاقي يعدي على طول
  if (url.pathname.endsWith('version.json')) return;         // فحص النسخة دايمًا من الشبكة

  ev.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
