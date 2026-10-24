/**
 * Orbit's best-effort WebView privacy filter.
 * This is DOM/script-level filtering, not a network-level content blocker.
 * Server-side/in-stream ads (including some YouTube ads) cannot be reliably removed here.
 */
export function buildPrivacyScript(siteProtectionOverrides: string[] = []): string {
  const overrides = JSON.stringify(siteProtectionOverrides);
  return `(function(){
    try {
      var allowlisted = ${overrides};
      var host = (location.hostname || '').toLowerCase();
      if (allowlisted.some(function(h){ return h === host || host.endsWith('.' + h); })) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'privacy',host:host,ads:0,trackers:0,disabledForSite:true}));
        return true;
      }
      if (window.__orbitPrivacyInstalled) return true;
      window.__orbitPrivacyInstalled = true;
      var blockedAds = 0, blockedTrackers = 0;
      var adHosts = /(^|\\.)(doubleclick\\.net|googlesyndication\\.com|googleadservices\\.com|adnxs\\.com|taboola\\.com|outbrain\\.com|criteo\\.com|adform\\.net|rubiconproject\\.com|pubmatic\\.com|openx\\.net|amazon-adsystem\\.com|adsrvr\\.org|scorecardresearch\\.com)$/i;
      var trackerHosts = /(^|\\.)(google-analytics\\.com|analytics\\.google\\.com|googletagmanager\\.com|hotjar\\.com|segment\\.com|mixpanel\\.com|amplitude\\.com|clarity\\.ms|facebook\\.net|connect\\.facebook\\.net|pixel\\.quantserve\\.com)$/i;
      function hostOf(value){ try { return new URL(value, location.href).hostname.toLowerCase(); } catch(e){ return ''; } }
      function isAd(value){ return adHosts.test(hostOf(value)); }
      function isTracker(value){ return trackerHosts.test(hostOf(value)); }
      var css = document.getElementById('__orbit_adblock_css') || document.createElement('style');
      css.id = '__orbit_adblock_css';
      css.textContent = 'ins.adsbygoogle,.adsbygoogle,[data-ad],[data-ad-slot],[data-ad-client],[aria-label="advertisement" i],[aria-label="sponsored" i],iframe[src*="doubleclick.net"],iframe[src*="googlesyndication.com"],iframe[src*="adnxs.com"],iframe[src*="taboola.com"],iframe[src*="outbrain.com"],iframe[src*="criteo.com"],[id^="google_ads_"],[id^="div-gpt-ad"],[id*="taboola"],[class*="taboola"],[id*="outbrain"],[class*="outbrain"],.ad-slot,.ad-unit,.advertisement,.sponsor-ad,.popup-ad{display:none!important;visibility:hidden!important;pointer-events:none!important;max-height:0!important;overflow:hidden!important}';
      (document.head || document.documentElement).appendChild(css);
      function report(){ try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'privacy',host:host,ads:blockedAds,trackers:blockedTrackers})); } catch(e){} }
      function scan(root){
        if(!root || !root.querySelectorAll) return;
        var nodes = [];
        if(root.matches && root.matches('iframe[src],script[src],img[src],a[href],source[src]')) nodes.push(root);
        try { nodes = nodes.concat(Array.prototype.slice.call(root.querySelectorAll('iframe[src],script[src],img[src],a[href],source[src],[id],[class],[data-ad]'))); } catch(e){}
        nodes.forEach(function(el){
          var url = el.src || el.href || '';
          if(url && isAd(url)) { if(el.tagName === 'IFRAME' || el.tagName === 'SCRIPT' || el.tagName === 'IMG' || el.tagName === 'SOURCE') { el.removeAttribute('src'); } el.style && el.style.setProperty('display','none','important'); blockedAds++; }
          else if(url && isTracker(url) && (el.tagName === 'SCRIPT' || el.tagName === 'IFRAME' || el.tagName === 'IMG')) { if(el.tagName === 'SCRIPT' || el.tagName === 'IFRAME' || el.tagName === 'IMG') el.removeAttribute('src'); blockedTrackers++; }
          else {
            var label = ((el.id||'')+' '+(typeof el.className==='string'?el.className:'')).toLowerCase();
            if(/(^|[ _-])(ad-container|ad-wrapper|ad-slot|ad-banner|advertisement|sponsored-content|promoted-content|taboola|outbrain)([ _-]|$)/.test(label) || /^google_ads_iframe|^div-gpt-ad/.test(el.id||'')) { el.style.setProperty('display','none','important'); blockedAds++; }
          }
        });
        report();
      }
      var originalFetch = window.fetch;
      if(originalFetch) window.fetch = function(input, init){ var url = typeof input === 'string' ? input : (input && input.url) || ''; if(isAd(url) || isTracker(url)){ if(isAd(url)) blockedAds++; else blockedTrackers++; report(); return Promise.resolve(new Response('',{status:204,statusText:'No Content'})); } return originalFetch.apply(this, arguments); };
      var originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url){ this.__orbitUrl = url; return originalOpen.apply(this, arguments); };
      var originalSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function(){ if(isAd(this.__orbitUrl) || isTracker(this.__orbitUrl)){ if(isAd(this.__orbitUrl)) blockedAds++; else blockedTrackers++; report(); try { this.abort(); } catch(e){} return; } return originalSend.apply(this, arguments); };
      if(navigator.sendBeacon){ var beacon = navigator.sendBeacon.bind(navigator); navigator.sendBeacon = function(url,data){ if(isAd(url)||isTracker(url)){ if(isAd(url)) blockedAds++; else blockedTrackers++; report(); return true; } return beacon(url,data); }; }
      scan(document);
      new MutationObserver(function(records){ records.forEach(function(r){ Array.prototype.forEach.call(r.addedNodes,function(n){ if(n.nodeType===1) scan(n); }); }); }).observe(document.documentElement,{childList:true,subtree:true});
      report();
    } catch(e) {}
    return true;
  })();true;`;
}
