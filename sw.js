// 오프라인: 앱 화면은 네트워크 우선(업데이트 반영, 3초 안에 안 오면 저장본),
// 지도 타일·공략도·라이브러리는 저장본 우선. ponytail: 캐시 정리 없음, 타일이 쌓여도 코스 하나라 수십 MB 수준
const C = 'golf-v1';
const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdn.jsdelivr.net/npm/leaflet-rotate@0.2.8/dist/leaflet-rotate.min.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', ...LIBS])));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

const keep = (key, r) => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(C).then(c => c.put(key, cp)); } return r; };
self.addEventListener('fetch', e => {
  const q = e.request;
  if (q.method !== 'GET') return;
  if (q.mode === 'navigate') {
    const late = new Promise((_, no) => setTimeout(no, 3000));
    e.respondWith(Promise.race([fetch(q).then(r => keep('./', r)), late]).catch(() => caches.match('./')));
    return;
  }
  e.respondWith(caches.match(q).then(hit => hit || fetch(q).then(r => keep(q, r))));
});
