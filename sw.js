/**
 * DWG Converter Pro - Service Worker
 * لدعم العمل بدون إنترنت وتحسين الأداء
 */

const CACHE_NAME = 'dwg-converter-v2.0';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/fonts/cairo.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

const API_CACHE_NAME = 'dwg-converter-api-v1';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ساعة

// تثبيت Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Error caching static assets:', error);
            })
    );
});

// تنشيط Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== API_CACHE_NAME)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients');
                return self.clients.claim();
            })
    );
});

// استراتيجيات التخزين المؤقت
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // تجاوز الطلبات غير HTTP/HTTPS
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // تجاوز Google Fonts و Font Awesome (نستخدم network first)
    if (url.hostname.includes('googleapis') || 
        url.hostname.includes('cloudflare') ||
        url.hostname.includes('fontawesome')) {
        event.respondWith(networkFirst(event.request));
        return;
    }
    
    // استجابة سريعة للملفات المحلية (cache first)
    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    
    // API requests (network first with cache fallback)
    event.respondWith(networkFirst(event.request));
});

// استراتيجية Cache First - للملفات المحلية الثابتة
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // تحديث الخلفية
        fetchAndCache(request);
        return cachedResponse;
    }
    
    return fetchAndCache(request);
}

// استراتيجية Network First - للطلبات الخارجية
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(API_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // إرجاع صفحة الخطأ إذا كانت موجودة
        const errorPage = await caches.match('/offline.html');
        if (errorPage) {
            return errorPage;
        }
        
        // إرجاع استجابة خطأ افتراضية
        return new Response('خطأ في الاتصال', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/html; charset=utf-8'
            })
        });
    }
}

// جلب وتخزين مؤقت
async function fetchAndCache(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Fetch error:', error);
        throw error;
    }
}

// معالجة الرسائل من الصفحة الرئيسية
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearAllCaches();
    }
});

// مسح جميع التخزين المؤقت
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(name => caches.delete(name))
    );
    console.log('[SW] All caches cleared');
}

// مزامنة في الخلفية
self.addEventListener('sync', event => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-files') {
        event.waitUntil(syncFiles());
    }
});

// مزامنة الملفات
async function syncFiles() {
    // سيتم تنفيذ مزامنة الملفات هنا
    console.log('[SW] Syncing files...');
}

// إشعارات Push
self.addEventListener('push', event => {
    console.log('[SW] Push received:', event);
    
    let data = {
        title: 'DWG Converter Pro',
        body: 'لديك إشعار جديد',
        icon: '/icon-192.png',
        badge: '/badge-72.png'
    };
    
    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            vibrate: [100, 50, 100],
            data: data.data || {},
            actions: [
                { action: 'open', title: 'فتح' },
                { action: 'close', title: 'إغلاق' }
            ]
        })
    );
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification click:', event.action);
    
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // التركيز على نافذة مفتوحة أو فتح جديدة
                for (const client of clientList) {
                    if (client.url.includes('#converter') && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                if (clients.openWindow) {
                    return clients.openWindow('/#converter');
                }
            })
    );
});

// رسائل_background sync
self.addEventListener('sync', event => {
    if (event.tag === 'sync-conversions') {
        event.waitUntil(syncConversions());
    }
});

async function syncConversions() {
    // جلب قائمة التحويلات المعلقة
    // تنفيذ المزامنة
    console.log('[SW] Syncing conversions...');
}

console.log('[SW] Service Worker loaded');
