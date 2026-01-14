// Netflix Skip Intro - Auto-click content script
// Automatically clicks Skip buttons on YouTube, Netflix, and streaming sites

(function() {
  'use strict';

  if (window.skipIntroInitialized) return;
  window.skipIntroInitialized = true;

  const SITE = window.location.hostname;
  console.log('%c[Netflix Skip Intro] Loaded on: ' + SITE, 'color: #00ff88; font-weight: bold;');

  const DEFAULT_TARGETS = ['Skip', 'Skip Ad', 'Skip Ads', 'Skip Intro', 'Skip intro', 'Skip ad'];
  
  let isEnabled = true;
  let targetTexts = DEFAULT_TARGETS;
  let observer = null;
  let checkInterval = null;
  let lastClickTime = 0;
  const CLICK_COOLDOWN = 150;
  const clickedSet = new Set();

  function loadSettings(callback) {
    try {
      if (chrome?.storage?.sync) {
        chrome.storage.sync.get(['autoClickEnabled', 'targetTexts'], (result) => {
          if (!chrome.runtime.lastError) {
            isEnabled = result.autoClickEnabled !== false;
            if (result.targetTexts?.length > 0) targetTexts = result.targetTexts;
          }
          console.log('[Netflix Skip Intro] Enabled:', isEnabled);
          callback?.();
        });
      } else {
        callback?.();
      }
    } catch (e) {
      callback?.();
    }
  }

  function getElementId(el) {
    return el.className + '|' + el.innerText?.slice(0, 20) + '|' + el.getBoundingClientRect().top;
  }

  function wasClicked(el) {
    return clickedSet.has(getElementId(el));
  }

  function markClicked(el) {
    const id = getElementId(el);
    clickedSet.add(id);
    setTimeout(() => clickedSet.delete(id), 30000);
  }

  function isVisible(el) {
    if (!el) return false;
    try {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (parseFloat(style.opacity) < 0.1) return false;
      const rect = el.getBoundingClientRect();
      if (rect.width < 5 || rect.height < 5) return false;
      if (rect.top > window.innerHeight || rect.bottom < 0) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function clickElement(el, reason) {
    if (wasClicked(el) || !isVisible(el)) return false;
    
    markClicked(el);
    lastClickTime = Date.now();
    
    console.log('%c[Netflix Skip Intro] CLICKING: ' + reason, 'color: #00ff88; font-weight: bold;', el);
    
    try {
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
      el.focus?.();
      el.click();
      
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const opts = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0 };
      
      el.dispatchEvent(new MouseEvent('mousedown', opts));
      el.dispatchEvent(new MouseEvent('mouseup', opts));
      el.dispatchEvent(new MouseEvent('click', opts));
      
      console.log('%c[Netflix Skip Intro] ✓ SUCCESS', 'color: #00ff88; font-weight: bold;');
      return true;
    } catch (e) {
      console.error('[Netflix Skip Intro] Click failed:', e);
      return false;
    }
  }

  function checkYouTube() {
    if (!SITE.includes('youtube')) return false;
    
    const selectors = [
      'button.ytp-ad-skip-button', 'button.ytp-ad-skip-button-modern',
      '.ytp-ad-skip-button', '.ytp-ad-skip-button-modern', '.ytp-skip-ad-button',
      '.ytp-ad-skip-button-slot button', '.ytp-ad-overlay-close-button', '.ytp-skip-intro-button'
    ];
    
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && isVisible(el)) return clickElement(el, 'YouTube: ' + sel);
    }
    
    const skipByLabel = document.querySelector('[aria-label*="Skip" i]:not([aria-hidden="true"])');
    if (skipByLabel && isVisible(skipByLabel)) {
      return clickElement(skipByLabel, 'aria-label: ' + skipByLabel.getAttribute('aria-label'));
    }
    
    const player = document.querySelector('#movie_player, .html5-video-player');
    if (player) {
      const buttons = player.querySelectorAll('button, [role="button"]');
      for (const btn of buttons) {
        const text = (btn.innerText || '').trim().toLowerCase();
        if (text.includes('skip') && isVisible(btn)) return clickElement(btn, 'player: ' + text);
      }
    }
    return false;
  }

  function checkNetflix() {
    if (!SITE.includes('netflix')) return false;
    const selectors = ['[data-uia="player-skip-intro"]', '[data-uia="next-episode-seamless-button"]', 'button[class*="skip"]'];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && isVisible(el)) return clickElement(el, 'Netflix: ' + sel);
    }
    return false;
  }

  function checkGeneric() {
    const clickables = document.querySelectorAll('button, [role="button"], [class*="skip" i]');
    for (const el of clickables) {
      if (!isVisible(el)) continue;
      const text = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
      for (const target of targetTexts) {
        if (text === target.toLowerCase() || (text.length < 25 && text.includes(target.toLowerCase()))) {
          return clickElement(el, 'text: ' + text);
        }
      }
    }
    return false;
  }

  function scan() {
    if (!isEnabled || !document.body) return;
    if (Date.now() - lastClickTime < CLICK_COOLDOWN) return;
    if (checkYouTube()) return;
    if (checkNetflix()) return;
    checkGeneric();
  }

  function startMonitoring() {
    if (observer) return;
    console.log('%c[Netflix Skip Intro] Monitoring started', 'color: #00ff88;');
    
    scan();
    setTimeout(scan, 300);
    setTimeout(scan, 1000);
    
    checkInterval = setInterval(scan, 250);
    
    observer = new MutationObserver(() => {
      clearTimeout(observer.debounce);
      observer.debounce = setTimeout(scan, 30);
    });
    
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
  }

  function handleNavigation() {
    clickedSet.clear();
    setTimeout(scan, 200);
    setTimeout(scan, 800);
  }

  if (SITE.includes('youtube')) {
    document.addEventListener('yt-navigate-finish', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    const origPush = history.pushState;
    history.pushState = function() { origPush.apply(this, arguments); handleNavigation(); };
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isEnabled) { clickedSet.clear(); scan(); }
  });

  function init() {
    loadSettings(() => {
      if (isEnabled && document.body) startMonitoring();
      else if (!document.body) document.addEventListener('DOMContentLoaded', () => { if (isEnabled) startMonitoring(); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.skipIntroDebug = {
    scan, status: () => ({ enabled: isEnabled, targets: targetTexts, site: SITE }),
    findSkipButtons: () => { document.querySelectorAll('[class*="skip" i]').forEach(el => console.log(el.className, el.innerText?.slice(0,20), isVisible(el), el)); },
    forceClick: (sel) => { const el = document.querySelector(sel); if (el) { clickElement(el, 'manual'); return 'Done'; } return 'Not found'; }
  };

  console.log('%c[Netflix Skip Intro] Ready! Debug: skipIntroDebug', 'color: #00ff88;');
})();
