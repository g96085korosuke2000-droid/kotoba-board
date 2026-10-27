// ことばボード：オフライン用キャッシュ（先にキャッシュを出し、裏で最新版に更新）
var CACHE='kotoba-v3';
var FILES=['./','./index.html'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  var url=new URL(e.request.url);
  if(url.origin!==location.origin)return;
  var key=e.request.mode==='navigate'?'./index.html':e.request;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(key,{ignoreSearch:true}).then(function(hit){
      var net=fetch(e.request).then(function(res){if(res&&res.ok)c.put(key,res.clone());return res}).catch(function(){return hit});
      return hit||net;
    });
  }));
});
