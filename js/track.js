/* BFEx site tracking — the ONE place for the GA4 Measurement ID and lead events.
   Loaded on every public page (<script src="js/track.js" defer>).
   Events sent to GA4:
     page_view          automatic (gtag config)
     phone_call         any tel: link click   (nav, hero, footer, sticky call bar ...)
     email_click        any mailto: link click
     quote_form_submit  Formspree accepted the quote form (page scripts call bfexTrack)
     quote_form_error   Formspree rejected it / network failed
   Mark phone_call + quote_form_submit as Key events in GA4 Admin > Events.
   Skips localhost / file: so the HQ preview iframe never pollutes the numbers. */
(function () {
  var MEASUREMENT_ID = 'G-ZPQJ00MHJ8';
  var host = location.hostname;
  if (location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '') {
    window.bfexTrack = function () {};
    return;
  }
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.appendChild(s);

  window.bfexTrack = function (name, params) {
    try { gtag('event', name, params || {}); } catch (e) { /* never break the page */ }
  };

  function placement(a) {
    var c = a.className || '';
    if (/call-bar/.test(c)) return 'sticky_call_bar';
    if (/nav-phone|mobile-menu-phone/.test(c)) return 'nav';
    if (/hero/.test(c)) return 'hero';
    if (a.closest && a.closest('footer')) return 'footer';
    if (a.closest && a.closest('#quote')) return 'quote_section';
    return c || 'body';
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var a = t && t.closest ? t.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) {
      window.bfexTrack('phone_call', { placement: placement(a), page_path: location.pathname });
    } else if (href.indexOf('mailto:') === 0) {
      window.bfexTrack('email_click', { placement: placement(a), page_path: location.pathname });
    }
  }, true);
})();
