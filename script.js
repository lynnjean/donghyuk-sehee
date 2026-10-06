/* =========================================================
   강동혁 ♥ 김세희 모바일 청첩장 — script.js
   ========================================================= */
(function () {
  'use strict';

  /* ---- 설정값 (여기만 바꾸면 전체 반영) ---- */
  var WEDDING = new Date(2027, 0, 9, 11, 0, 0); // 2027-01-09 11:00
  var GB_KEY = 'sehee-donghyuk-guestbook-v2';
  var GB_KEY_OLD = 'sehee-donghyuk-guestbook';   // 비밀번호 쓰던 구버전 — 발견하면 삭제
  var GB_PAGE = 5;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* =======================================================
     토스트
     ======================================================= */
  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 1900);
  }

  /* =======================================================
     스크롤 등장 애니메이션
     ======================================================= */
  (function reveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('on'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('on');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }());

  /* =======================================================
     캘린더 (예식월 자동 생성)
     ======================================================= */
  (function calendar() {
    var body = $('#calBody');
    if (!body) return;

    var y = WEDDING.getFullYear(), m = WEDDING.getMonth();
    var first = new Date(y, m, 1).getDay();
    var last = new Date(y, m + 1, 0).getDate();
    var html = '', day = 1;

    for (var w = 0; w < 6; w++) {
      if (day > last) break;
      html += '<tr>';
      for (var d = 0; d < 7; d++) {
        if ((w === 0 && d < first) || day > last) {
          html += '<td></td>';
        } else {
          var cls = [];
          if (d === 0) cls.push('sun');
          if (day === WEDDING.getDate()) cls.push('today');
          html += '<td class="' + cls.join(' ') + '"><span class="d">' + day + '</span></td>';
          day++;
        }
      }
      html += '</tr>';
    }
    body.innerHTML = html;
  }());

  /* =======================================================
     D-DAY 카운트다운
     ======================================================= */
  (function dday() {
    var dD = $('#ddD'), dH = $('#ddH'), dM = $('#ddM'), dS = $('#ddS'), msg = $('#ddayMsg');
    if (!dD) return;

    var pad = function (n) { return String(n).padStart(2, '0'); };

    function tick() {
      var gap = WEDDING - new Date();

      if (gap <= 0) {
        dD.textContent = dH.textContent = dM.textContent = dS.textContent = '00';
        msg.innerHTML = '동혁 &amp; 세희의 <b>결혼식 날</b>입니다. 감사합니다!';
        clearInterval(timer);
        return;
      }

      var s = Math.floor(gap / 1000);
      var days = Math.floor(s / 86400);
      dD.textContent = days > 99 ? days : pad(days);
      dH.textContent = pad(Math.floor(s / 3600) % 24);
      dM.textContent = pad(Math.floor(s / 60) % 60);
      dS.textContent = pad(s % 60);

      msg.innerHTML = days > 0
        ? '동혁 &amp; 세희의 결혼식이 <b>' + days + '일</b> 남았습니다.'
        : '오늘은 동혁 &amp; 세희의 <b>결혼식 날</b>입니다.';
    }

    tick();
    var timer = setInterval(tick, 1000);
  }());

  /* =======================================================
     클립보드 복사 (HTTPS / file:// 모두 대응)
     ======================================================= */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var label = btn.getAttribute('data-label') || '';
      copyText(text).then(function () {
        btn.classList.add('done');
        btn.textContent = '완료';
        toast(label + '가 복사되었습니다.');
        setTimeout(function () {
          btn.classList.remove('done');
          btn.textContent = '복사';
        }, 1600);
      }).catch(function () {
        toast('복사에 실패했습니다. 길게 눌러 복사해 주세요.');
      });
    });
  });

  /* 링크 복사 / 공유 */
  var shareBtn = $('#shareLink');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var url = location.href;
      if (navigator.share) {
        navigator.share({ title: '강동혁 ♥ 김세희 결혼합니다', text: '2027년 1월 9일 토요일 오전 11시, 애플컨벤션', url: url })
          .catch(function () { /* 사용자가 취소 */ });
        return;
      }
      copyText(url)
        .then(function () { toast('청첩장 링크가 복사되었습니다.'); })
        .catch(function () { toast('링크 복사에 실패했습니다.'); });
    });
  }

  /* =======================================================
     하단 시트 (연락처)
     ======================================================= */
  var lastFocus = null;
  function openSheet(id) {
    var el = document.getElementById(id);
    if (!el) return;
    lastFocus = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeSheet(el) {
    el.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-sheet-open]').forEach(function (b) {
    b.addEventListener('click', function () { openSheet(b.getAttribute('data-sheet-open')); });
  });
  $$('[data-sheet-close]').forEach(function (b) {
    b.addEventListener('click', function () { closeSheet(b.closest('.sheet')); });
  });

  /* =======================================================
     갤러리 라이트박스
     ======================================================= */
  (function lightbox() {
    var items = $$('.mosaic__item:not(.placeholder)');
    if (!items.length) return;

    var srcs = items.map(function (f) { return f.querySelector('img').src; });
    var alts = items.map(function (f) { return f.querySelector('img').alt; });

    var lb = $('#lightbox'), img = $('#lbImg'), count = $('#lbCount');
    var cur = 0;

    function render() {
      img.src = srcs[cur];
      img.alt = alts[cur];
      count.textContent = (cur + 1) + ' / ' + srcs.length;
    }
    function open(i) {
      cur = i;
      render();
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = '';
    }
    function move(step) {
      cur = (cur + step + srcs.length) % srcs.length;
      render();
    }

    items.forEach(function (f, i) {
      f.addEventListener('click', function () { open(i); });
    });
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', function () { move(-1); });
    $('#lbNext').addEventListener('click', function () { move(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
    });

    /* 스와이프 */
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
      x0 = null;
    });
  }());

  /* ESC 로 시트 닫기 */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    $$('.sheet').forEach(function (s) { if (!s.hidden) closeSheet(s); });
  });

  /* =======================================================
     배경음악
     ======================================================= */
  (function bgm() {
    var audio = $('#bgm'), btn = $('#bgmBtn');
    if (!audio || !btn) return;

    audio.volume = 0.35;
    var armed = false; // 첫 사용자 제스처 시 자동 재생 시도

    function setState(on) { btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }

    function play() {
      var p = audio.play();
      if (p && p.catch) {
        p.then(function () { setState(true); })
         .catch(function () { setState(false); });
      } else {
        setState(true);
      }
    }

    btn.addEventListener('click', function () {
      armed = true;
      if (audio.paused) play();
      else { audio.pause(); setState(false); }
    });

    /* 모바일 정책상 자동재생이 막히므로, 첫 터치/스크롤에 한 번 시도 */
    function firstGesture() {
      if (!armed) { armed = true; play(); }
      window.removeEventListener('touchstart', firstGesture);
      window.removeEventListener('click', firstGesture);
    }
    window.addEventListener('touchstart', firstGesture, { once: true, passive: true });
    window.addEventListener('click', firstGesture, { once: true });

    audio.addEventListener('error', function () { setState(false); });
    audio.addEventListener('pause', function () { setState(false); });
    audio.addEventListener('play', function () { setState(true); });
  }());

  /* =======================================================
     방명록 (localStorage — 추후 Google Sheets 연동 지점)
     ======================================================= */
  (function guestbook() {
    var form = $('#gbForm'), list = $('#gbList'), more = $('#gbMore');
    if (!form) return;

    var shown = GB_PAGE;

    /* 비밀번호를 쓰던 구버전 데이터는 더 이상 쓰지 않으므로 정리 */
    try { localStorage.removeItem(GB_KEY_OLD); } catch (e) { /* 저장소 접근 불가 */ }

    function load() {
      try { return JSON.parse(localStorage.getItem(GB_KEY)) || []; }
      catch (e) { return []; }
    }
    function save(arr) {
      try { localStorage.setItem(GB_KEY, JSON.stringify(arr)); }
      catch (e) { toast('저장 공간이 부족합니다.'); }
    }
    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function fmt(ts) {
      var d = new Date(ts), p = function (n) { return String(n).padStart(2, '0'); };
      return d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate());
    }

    function render() {
      var data = load();
      if (!data.length) {
        list.innerHTML = '<li class="gb__empty">아직 등록된 메시지가 없습니다.<br>첫 번째 축하를 남겨주세요 ♥</li>';
        more.classList.add('hidden');
        return;
      }
      list.innerHTML = data.slice(0, shown).map(function (it) {
        return '<li>' +
          '<div class="gb__head"><span class="gb__nm">' + esc(it.name) + '</span>' +
          '<span class="gb__dt">' + fmt(it.ts) + '</span></div>' +
          '<p class="gb__tx">' + esc(it.msg) + '</p>' +
          '</li>';
      }).join('');
      more.classList.toggle('hidden', data.length <= shown);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#gbName').value.trim();
      var msg = $('#gbMsg').value.trim();
      if (!name || !msg) { toast('이름과 메시지를 모두 입력해 주세요.'); return; }

      var data = load();
      data.unshift({ id: 'g' + Date.now(), name: name, msg: msg, ts: Date.now() });
      save(data);
      form.reset();
      shown = GB_PAGE;
      render();
      toast('축하 메시지가 등록되었습니다.');
    });

    more.addEventListener('click', function () {
      shown += GB_PAGE;
      render();
    });

    render();
  }());

}());
