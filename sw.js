/* ===== 像素机甲对战 PWA Service Worker ===== */
const CACHE_NAME = 'mecha-battle-v3';

const PRECACHE = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// 安装时预缓存核心文件
self.addEventListener('install', evt => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// 网络优先，缓存兜底
self.addEventListener('fetch', evt => {
  evt.respondWith(
    fetch(evt.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(evt.request, clone));
        return res;
      })
      .catch(() => caches.match(evt.request))
  );
});