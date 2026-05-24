// ─── NAKSHATRA DOSHA REFERENCE TABLE ─────────────────
const DOSHA_TABLE = {
  'Ashwini':           ['child+father',  null,            null,              'mild'],
  'Bharani':           ['mild',          null,            'father|mother',   'child'],
  'Krittika':          [null,            null,            null,              'mother'],
  'Rohini':            ['father+uncle',  'father+uncle',  'father+uncle',    'father+uncle'],
  'Mrigashira':        [null,            null,            null,              null],
  'Ardra':             [null,            null,            null,              'mother'],
  'Punarvasu':         [null,            null,            null,              null],
  'Pushya':            [null,            'father+mother', 'father+mother',   null],
  'Ashlesha':          [null,            'child',         'mother',          'mother'],
  'Magha':             ['father',        'father',        null,              null],
  'Purva Phalguni':    [null,            null,            null,              'mother'],
  'Uttara Phalguni':   ['father+mother', null,            null,              null],
  'Hasta':             [null,            null,            'father+mother',   null],
  'Chitra':            ['mother',        'father',        null,              null],
  'Swati':             [null,            null,            null,              null],
  'Vishakha':          [null,            null,            null,              'mother'],
  'Anuradha':          [null,            null,            null,              null],
  'Jyeshtha':          ['mother',        'brother+uncle', 'child',           'father'],
  'Moola':             ['father',        'mother',        'wealth',          null],
  'Purva Ashadha':     [null,            null,            'father',          null],
  'Uttara Ashadha':    [null,            null,            null,              null],
  'Shravana':          [null,            null,            null,              null],
  'Dhanishtha':        [null,            null,            null,              null],
  'Shatabhisha':       [null,            null,            null,              null],
  'Purva Bhadra':      [null,            null,            null,              'child'],
  'Uttara Bhadra':     [null,            null,            null,              'child'],
  'Revati':            [null,            null,            null,              'father'],
};
const DOSHA_LABELS = {
  'child':         { te:'Child (Self)',                    en:'Child (Self)'         },
  'mother':        { te:'Mother',                          en:'Mother'               },
  'father':        { te:'Father',                          en:'Father'               },
  'mild':          { te:'General / Mild',                  en:'General / Mild'       },
  'child+father':  { te:'Child & Father',                  en:'Child & Father'       },
  'father+mother': { te:'Father & Mother',                 en:'Father & Mother'      },
  'father+uncle':  { te:'Father & Uncle',                  en:'Father & Uncle'       },
  'brother+uncle': { te:'Brother & Uncle',                 en:'Brother & Uncle'      },
  'father|mother': { te:'Boy→Father / Girl→Mother',        en:'Boy→Father / Girl→Mother' },
  'wealth':        { te:'Family Wealth',                   en:'Family Wealth'        },
};
function doshaPill(val) {
  if (!val) return '<span class="dp-safe">✓ Good</span>';
  const lbl = DOSHA_LABELS[val];
  const cls = val === 'mild' ? 'dp-mild' : 'dp-dosha';
  return '<span class="' + cls + '">⚠ ' + (lbl ? lbl.en : val) + '</span>';
}
function doshaToWhom(val) {
  if (!val) return '—';
  const lbl = DOSHA_LABELS[val];
  return lbl ? lbl.en : val;
}
let _lastResult = null;
function openDoshaScreen() {
  if (!_lastResult) return;
  renderDoshaScreen(_lastResult);
  showScreen('screen-dosha');
}
// ─── VARJYAM "A" VALUES (from Panchangam table) ──────
// Varjyam start table: A = ghatikas multiplier per nakshatra
// Formula: Varjyam Start = NK Start + (A × NK Duration / 60)
//          Varjyam Duration = NK Duration / 15
const VARJYAM_A = {
  'Ashwini':           50,
  'Bharani':           24,
  'Krittika':          30,
  'Rohini':            40,
  'Mrigashira':        14,
  'Ardra':             21,
  'Punarvasu':         30,
  'Pushya':            20,
  'Ashlesha':          32,
  'Magha':             30,
  'Purva Phalguni':    20,
  'Uttara Phalguni':   18,
  'Hasta':             21,
  'Chitra':            20,
  'Swati':             14,
  'Anuradha':          10,
  'Jyeshtha':          14,
  'Moola':             56,
  'Purva Ashadha':     24,
  'Uttara Ashadha':    20,
  'Shravana':          10,
  'Dhanishtha':        10,
  'Shatabhisha':       18,
  'Purva Bhadra':      16,
  'Uttara Bhadra':     24,
  'Revati':            30,
};

// ─── DURMUHURTAM — muhurtha slot indices per weekday (1-based from sunrise) ──
// From the Panchangam table in the image
const DURMUHURTAM_SLOTS = {
  0: { day: [14],    night: [] },   // Sunday
  1: { day: [9, 12], night: [] },   // Monday
  2: { day: [4],     night: [7]  }, // Tuesday  (7th from sunset)
  3: { day: [8],     night: [] },   // Wednesday
  4: { day: [6, 12], night: [] },   // Thursday
  5: { day: [4, 9],  night: [] },   // Friday
  6: { day: [1, 2],  night: [] },   // Saturday
};

// ─── NOAA sunrise/sunset algorithm ───────────────────────────────────────────
// Accurate to ~1 minute; matches verified against sunrise-sunset.org
function computeSunriseSunset(year, month, day, lat, lon, tz) {
  function jdn(y, m, d) {
    if (m <= 2) { y--; m += 12; }
    const A = Math.floor(y/100), B = 2 - A + Math.floor(A/4);
    return Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + d + B - 1524.5;
  }
  const JD = jdn(year, month, day) + 0.5; // noon
  const JC = (JD - 2451545.0) / 36525.0;
  const L0 = (280.46646 + JC*(36000.76983 + JC*0.0003032)) % 360;
  const M  = 357.52911 + JC*(35999.05029 - 0.0001537*JC);
  const Mrad = M * Math.PI/180;
  const C = Math.sin(Mrad)*(1.914602 - JC*(0.004817 + 0.000014*JC))
           + Math.sin(2*Mrad)*(0.019993 - 0.000101*JC)
           + Math.sin(3*Mrad)*0.000289;
  const sunLon = L0 + C;
  const omega  = 125.04 - 1934.136*JC;
  const lambda = sunLon - 0.00569 - 0.00478*Math.sin(omega*Math.PI/180);
  const eps0   = 23 + (26 + (21.448 - JC*(46.8150 + JC*(0.00059 - JC*0.001813)))/60)/60;
  const eps    = eps0 + 0.00256*Math.cos(omega*Math.PI/180);
  const sinDec = Math.sin(eps*Math.PI/180)*Math.sin(lambda*Math.PI/180);
  const dec    = Math.asin(sinDec);
  const e      = 0.016708634 - JC*(0.000042037 + 0.0000001267*JC);
  const y2     = Math.tan(eps*Math.PI/360)**2;
  const L0r    = L0*Math.PI/180;
  const EqT    = 4*(180/Math.PI)*(y2*Math.sin(2*L0r) - 2*e*Math.sin(Mrad)
    + 4*e*y2*Math.sin(Mrad)*Math.cos(2*L0r)
    - 0.5*y2*y2*Math.sin(4*L0r) - 1.25*e*e*Math.sin(2*Mrad));
  const latR   = lat*Math.PI/180;
  const cosH   = (Math.sin(-0.833*Math.PI/180) - Math.sin(latR)*sinDec)
                 / (Math.cos(latR)*Math.cos(dec));
  if (cosH > 1 || cosH < -1) return { sunrise: 6, sunset: 18 };
  const HA          = Math.acos(cosH)*180/Math.PI;
  const solarNoonUTC = 720 - 4*lon - EqT;   // minutes UTC
  const sunriseUTC   = solarNoonUTC - 4*HA;
  const sunsetUTC    = solarNoonUTC + 4*HA;
  return {
    sunrise: sunriseUTC/60 + tz,
    sunset:  sunsetUTC /60 + tz,
  };
}

// ─── DURMUHURTAM computation ──────────────────────────────────────────────────
function computeDurmuhurtam(r) {
  const jdLocal = r.birthJD + (r.tz / 24);
  const weekday = Math.floor(jdLocal + 1.5) % 7; // 0=Sun
  const frac    = ((jdLocal + 0.5) % 1 + 1) % 1;
  const birthH  = frac * 24; // birth hour in local time

  // Actual sunrise/sunset for birth date & location
  const { sunrise, sunset } = computeSunriseSunset(
    r.birthYear, r.birthMonth, r.birthDay, r.lat, r.lon, r.tz
  );
  const daylight    = sunset - sunrise;      // hours of daylight
  const muhurthaDur = daylight / 15;         // one daytime muhurtha in hours
  const nightDur    = (24 - daylight) / 15;  // one nighttime muhurtha

  const slots = DURMUHURTAM_SLOTS[weekday] || { day: [], night: [] };

  // Build slot ranges
  const slotRanges = [];
  for (const n of slots.day) {
    const start = sunrise + (n - 1) * muhurthaDur;
    slotRanges.push({ start, end: start + muhurthaDur, night: false, n });
  }
  for (const n of slots.night) {
    const start = sunset + (n - 1) * nightDur;
    slotRanges.push({ start, end: start + nightDur, night: true, n });
  }

  // Format decimal hours → "HH:MM AM/PM"
  function fmtH(h) {
    h = ((h % 24) + 24) % 24;
    const hh = Math.floor(h);
    let   mm = Math.round((h - hh) * 60);
    const hAdj = mm === 60 ? hh + 1 : hh;
    const mAdj = mm === 60 ? 0 : mm;
    const ap = hAdj < 12 ? 'AM' : 'PM';
    return `${String(hAdj % 12 || 12).padStart(2,'0')}:${String(mAdj).padStart(2,'0')} ${ap}`;
  }

  const active     = slotRanges.some(s => birthH >= s.start && birthH < s.end);
  const timeSlots  = slotRanges.map(s => ({
    label:  `Muhurtha ${s.n} (${s.night ? 'Night' : 'Day'})`,
    range:  `${fmtH(s.start)} – ${fmtH(s.end)}`,
    active: birthH >= s.start && birthH < s.end,
  }));

  const WDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return {
    active, timeSlots, weekday,
    wdayName:       WDAYS[weekday],
    sunrise:        fmtH(sunrise),
    sunset:         fmtH(sunset),
    muhurthaDurMin: Math.round(muhurthaDur * 60),
  };
}

// ─── JD → local "HH:MM AM/PM" string ─────────────────
function fmtJDtoLocalTime(jdVal, tz) {
  const jdLocal = jdVal + (tz / 24);
  const f = ((jdLocal + 0.5) % 1 + 1) % 1;
  const totalH = f * 24;
  const h = Math.floor(totalH);
  const m = Math.floor((totalH - h) * 60);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12  = h % 12 || 12;
  return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}

// ─── Nakshatra boundary finder ─────────────────────────
function findNkBoundaries(r) {
  const NK_SPAN    = 360 / 27;
  const nkStartDeg = r.nk.i * NK_SPAN;
  const nkEndDeg   = nkStartDeg + NK_SPAN;

  function sidMoonAt(jdVal) { return sid(moonT(jdVal), jdVal); }
  function findCrossing(targetDeg, searchCenter, halfWin) {
    let lo = searchCenter - halfWin, hi = searchCenter + halfWin;
    function diff(j) { return n360(sidMoonAt(j) - targetDeg + 180) - 180; }
    for (let i = 0; i < 52; i++) {
      const mid = (lo + hi) / 2;
      if (diff(mid) > 0) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  }
  const nkStartJD = findCrossing(nkStartDeg, r.birthJD - 0.5, 2);
  const nkEndJD   = findCrossing(nkEndDeg,   r.birthJD + 0.5, 2);
  return { nkStartJD, nkEndJD };
}

// ─── VARJYAM computation ──────────────────────────────
function computeVarjyam(r, nkStartJD, nkEndJD) {
  const A = VARJYAM_A[r.nk.nak.n];
  if (A === undefined) return null;

  const nkDurDays  = nkEndJD - nkStartJD;          // nakshatra duration in days
  // Varjyam Start = NK Start + (A / 60) × NK Duration
  const vStartJD   = nkStartJD + (A / 60) * nkDurDays;
  // Varjyam Duration = NK Duration / 15
  const vDurDays   = nkDurDays / 15;
  const vEndJD     = vStartJD + vDurDays;

  const active = r.birthJD >= vStartJD && r.birthJD <= vEndJD;
  const startStr = fmtJDtoLocalTime(vStartJD, r.tz);
  const endStr   = fmtJDtoLocalTime(vEndJD,   r.tz);
  // Duration in minutes
  const durMins  = Math.round(vDurDays * 24 * 60);

  return { active, startStr, endStr, durMins };
}

// ─── (Durmuhurtam computed above with NOAA sunrise) ──────────────────────────

function renderDoshaScreen(r) {
  const nakName   = r.nk.nak.n;
  const birthPada = r.nk.p;
  const doshas    = DOSHA_TABLE[nakName] || [null, null, null, null];
  const myDosha   = doshas[birthPada - 1];
  const lbl = myDosha ? DOSHA_LABELS[myDosha] : null;

  // Compute boundaries once
  const { nkStartJD, nkEndJD } = findNkBoundaries(r);

  // ── Varjyam ──
  const varj = computeVarjyam(r, nkStartJD, nkEndJD);
  let varjHtml = '';
  if (varj) {
    const icon   = varj.active ? 'od-warn' : 'od-safe';
    const emoji  = varj.active ? '⚠️' : '✓';
    const status = varj.active
      ? `<span style="color:#c62828;font-weight:700">Inauspicious — Varjyam is active at birth time</span>`
      : `<span style="color:#2e7d32;font-weight:700">Auspicious — Varjyam is not active at birth time</span>`;
    varjHtml = `<div class="od-row">
      <div class="od-num ${icon}">${emoji}</div>
      <div style="flex:1">
        <div class="od-name">Varjyam</div>
        <div class="od-desc">
          <div style="color:var(--text-dark)">${r.dateStr} &nbsp;·&nbsp; <b>${varj.startStr} – ${varj.endStr}</b></div>
          <div style="margin-top:4px">${status}</div>
        </div>
      </div>
    </div>`;
  }

  // ── Durmuhurtam ──
  const durm = computeDurmuhurtam(r);
  const dIcon  = durm.active ? 'od-warn' : 'od-safe';
  const dEmoji = durm.active ? '⚠️' : '✓';
  const dStatus = durm.active
    ? `<span style="color:#c62828;font-weight:700">Inauspicious — Durmuhurtam is active at birth time</span>`
    : `<span style="color:#2e7d32;font-weight:700">Auspicious — Durmuhurtam is not active at birth time</span>`;
  const dSlotLines = durm.timeSlots.map((s) => {
    const highlight = s.active
      ? `style="color:#c62828;font-weight:700;background:#fff3f3;padding:2px 7px;border-radius:4px;display:block"`
      : `style="color:var(--text-dark);display:block"`;
    return `<div ${highlight}>${r.dateStr} &nbsp;·&nbsp; <b>${s.range}</b>${s.active ? ' ◄' : ''}</div>`;
  }).join('');
  const durmHtml = `<div class="od-row">
    <div class="od-num ${dIcon}">${dEmoji}</div>
    <div style="flex:1">
      <div class="od-name">Durmuhurtam</div>
      <div class="od-desc">
        ${dSlotLines}
        <div style="margin-top:4px">${dStatus}</div>
      </div>
    </div>
  </div>`;

  const banner = !myDosha
    ? '<div class="dosha-banner banner-safe"><div class="banner-icon">✅</div><div><div class="banner-title">No Nakshatra Pada Dosha</div><div class="banner-sub">' + nakName + ' Pada ' + birthPada + ' carries no Nakshatra Pada Dosha. Auspicious.</div></div></div>'
    : '<div class="dosha-banner banner-warn"><div class="banner-icon">⚠️</div><div><div class="banner-title">Dosha — ' + (lbl ? lbl.en : myDosha) + '</div><div class="banner-sub">' + nakName + ' Pada ' + birthPada + ': dosha affects <b>' + (lbl ? lbl.en : myDosha) + '</b>. Consult a Jyotishi for parihara remedies.</div></div></div>';

  const rows = [1,2,3,4].map(p => {
    const d = doshas[p-1];
    const active = p === birthPada;
    return '<tr' + (active ? ' class="dp-active"' : '') + '><td>Pada ' + p + (active ? '<span class="dp-badge">BIRTH</span>' : '') + '</td><td>' + doshaPill(d) + '</td></tr>';
  }).join('');

  document.getElementById('dosha-content').innerHTML =
    '<div class="dosha-hero"><div class="dosha-hero-nak">' + nakName + '</div><div class="dosha-hero-pada">Pada ' + birthPada + ' · Janma Nakshatra</div></div>' +
    banner +
    '<div class="dosha-card"><div class="dosha-card-title">Nakshatra Pada Dosha</div><table class="d-table"><thead><tr><th>Pada</th><th>Result</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<div class="dosha-card"><div class="dosha-card-title">Varjyam &amp; Durmuhurtam</div>' + varjHtml + durmHtml + '</div>' +
    '<div style="display:flex;gap:10px;padding:4px 0 8px"><button class="nav-btn-back" style="flex:1" onclick="showScreen(\'screen-results\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M15 18l-6-6 6-6"/></svg> Back</button><button class="balarista-btn" style="flex:1" onclick="openBalaristaDosha()">🔮 Check Planetary Positions</button></div>';
}

// ─── BALARISTA DOSHA ──────────────────────────────────
const BALARISTA_TABLE = {
  'Ashwini':        { risk:'none',     affects:'—',                       remedy:'No parihara required.' },
  'Bharani':        { risk:'moderate', affects:'Child (first year)',       remedy:'Perform Jatakarma & Navagraha Shanti.' },
  'Krittika':       { risk:'moderate', affects:'Mother',                   remedy:'Mrityunjaya Japa, 108 times.' },
  'Rohini':         { risk:'none',     affects:'—',                       remedy:'Auspicious — no remedy needed.' },
  'Mrigashira':     { risk:'none',     affects:'—',                       remedy:'No parihara required.' },
  'Ardra':          { risk:'high',     affects:'Child & Father',           remedy:'Graha Shanti, Rudra Abhishekam.' },
  'Punarvasu':      { risk:'none',     affects:'—',                       remedy:'No parihara required.' },
  'Pushya':         { risk:'none',     affects:'—',                       remedy:'Most auspicious — no remedy.' },
  'Ashlesha':       { risk:'high',     affects:'Mother & Maternal uncle',  remedy:'Sarpa Dosha Shanti, Nagapratishtha.' },
  'Magha':          { risk:'moderate', affects:'Paternal grandfather',     remedy:'Pitru Tarpana, Shraddha rites.' },
  'Purva Phalguni': { risk:'moderate', affects:'Father',                   remedy:'Surya Namaskar, Aditya Hridayam.' },
  'Uttara Phalguni':{ risk:'none',     affects:'—',                       remedy:'No parihara required.' },
  'Hasta':          { risk:'none',     affects:'—',                       remedy:'No parihara required.' },
  'Chitra':         { risk:'moderate', affects:'Elder sibling',            remedy:'Mangala Graha Shanti.' },
  'Swati':          { risk:'none',     affects:'—',                       remedy:'No parihara required.' },
  'Vishakha':       { risk:'moderate', affects:'Younger sibling',          remedy:'Indra-Agni Homa, Vishakha Shanti.' },
  'Anuradha':       { risk:'none',     affects:'—',                       remedy:'No parihara required.' },
  'Jyeshtha':       { risk:'high',     affects:'Elder sibling & in-laws',  remedy:'Jyeshtha Nakshatra Shanti Homa.' },
  'Moola':          { risk:'high',     affects:'Father-in-law (paternal)', remedy:'Moola Shanti (mandatory 27th day ritual).' },
  'Purva Ashadha':  { risk:'moderate', affects:'Maternal grandmother',     remedy:'Matru Shanti, Lakshmi Puja.' },
  'Uttara Ashadha': { risk:'none',     affects:'—',                       remedy:'No parihara required.' },
  'Shravana':       { risk:'none',     affects:'—',                       remedy:'Most auspicious — no remedy.' },
  'Dhanishtha':     { risk:'moderate', affects:'Maternal aunt',            remedy:'Graha Shanti, Shiva Abhishekam.' },
  'Shatabhisha':    { risk:'moderate', affects:'Father',                   remedy:'Varuna Shanti, Abhishekam.' },
  'Purva Bhadra':   { risk:'moderate', affects:'Mother',                   remedy:'Chandi Homa, Devi Upasana.' },
  'Uttara Bhadra':  { risk:'none',     affects:'—',                       remedy:'No parihara required.' },
  'Revati':         { risk:'none',     affects:'—',                       remedy:'Auspicious — no remedy needed.' },
};

function openBalaristaDosha() {
  if (!_lastResult) return;
  renderBalaristaScreen(_lastResult);
  showScreen('screen-planetary');
}

function openBalaristaDoshaScreen() {
  if (!_lastResult) return;
  renderBalaristaDoshaScreen(_lastResult);
  showScreen('screen-balarista-dosha');
}

function renderBalaristaDoshaScreen(r) {

  /* ── Birth bar ── */
  var bar = document.getElementById('bd-birth-bar');
  if (bar) {
    bar.innerHTML =
      '<div style="background:linear-gradient(135deg,#4a3aaf,#6b52d4);padding:9px 14px 13px;display:flex;gap:7px;justify-content:center;flex-wrap:wrap">' +
        '<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;background:#ede4fa;color:#3a2d8f;font-size:11.5px;font-weight:700">' +
          r.dateStr + '</span>' +
        '<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;background:#fff3e0;color:#b36a00;font-size:11.5px;font-weight:700">' +
          r.timeStr + '</span>' +
        '<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;background:#e8f5e9;color:#2e7d32;font-size:11.5px;font-weight:700">' +
          r.place + '</span>' +
      '</div>';
  }

  /* ── Dosha Score Guide (static only) ── */
  var guideData = [
    { r:'0 - 20',   te:'తక్కువ (Low)',           en:'దోష ప్రభావం అల్పం',          c:'#2e7d32', bg:'#e8f5e9' },
    { r:'21 - 40',  te:'మధ్యస్త (Mild)',          en:'జాగ్రత్త అవసరం',             c:'#2e7d32', bg:'#e8f5e9' },
    { r:'41 - 60',  te:'మధ్యస్త హై (Moderate)',   en:'శాంతి చేయాలి',              c:'#f57f17', bg:'#fff3e0' },
    { r:'61 - 80',  te:'ఎక్కువ (High)',           en:'శాంతి చాలా అవసరం',          c:'#c62828', bg:'#fdecea' },
    { r:'81 - 100', te:'అత్యధిక (Severe)',        en:'విశేష శాంతి తప్పనిసరి',      c:'#6a0dad', bg:'#f3e5f5' }
  ];

  var guideRows = '';
  for (var i = 0; i < guideData.length; i++) {
    var g = guideData[i];
    var isLast = (i === guideData.length - 1);
    guideRows +=
      '<div style="display:flex;align-items:center;padding:13px 16px;' + (!isLast ? 'border-bottom:1px solid #f0eaf8;' : '') + '">' +
        '<div style="width:96px;flex-shrink:0">' +
          '<span style="display:inline-block;background:' + g.bg + ';color:' + g.c + ';font-size:12px;font-weight:800;padding:4px 10px;border-radius:20px;white-space:nowrap">' + g.r + '</span>' +
        '</div>' +
        '<div style="flex:1;padding-left:10px">' +
          '<div style="font-size:13px;font-weight:800;color:#1a1550">' + g.te + '</div>' +
          '<div style="font-size:11.5px;color:#6b6b8a;font-weight:600;margin-top:2px">' + g.en + '</div>' +
        '</div>' +
        '<div style="width:9px;height:9px;border-radius:50%;background:' + g.c + ';flex-shrink:0;margin-left:8px"></div>' +
      '</div>';
  }

  var html =
    '<div style="background:#fff;border-radius:18px;box-shadow:0 4px 24px rgba(58,45,143,0.10);overflow:hidden">' +
      '<div style="padding:14px 16px 12px;background:linear-gradient(135deg,#1a1550,#3a2d8f);display:flex;align-items:center;gap:10px">' +
        '<div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" style="width:20px;height:20px"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>' +
        '</div>' +
        '<div>' +
          '<div style="font-size:15px;font-weight:800;color:#fff">దోష స్కోరు గైడ్</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.65);font-weight:600;margin-top:1px">Dosha Score Guide</div>' +
        '</div>' +
      '</div>' +
      guideRows +
    '</div>' +

    '<div style="background:#f0ebfc;border:1.5px solid #d6caef;border-radius:14px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px">' +
      '<div style="font-size:18px;flex-shrink:0;margin-top:1px">&#x2139;&#xFE0F;</div>' +
      '<div style="font-size:12px;color:#6b6b8a;font-weight:600;line-height:1.65">గమనిక: ఈ ఫలితాలు జ్యోతిష శాస్త్ర ప్రమాణాల ఆధారంగా గణించబడినవి. భవిష్యత్తును ఫలితాలపై శాస్త్రీయ ఆర్కా జ్యోతిష్య అన్వేషణ అవసరం.</div>' +
    '</div>' +

    '<div style="display:flex;gap:10px;padding:4px 0 8px">' +
      '<button class="nav-btn-back" style="flex:1" onclick="showScreen(\'screen-planetary\')">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M15 18l-6-6 6-6"/></svg> Back' +
      '</button>' +
    '</div>';

  document.getElementById('bd-content').innerHTML = html;
}

function renderBalaristaScreen(r) {
  const nakName = r.nk.nak.n;
  const pada    = r.nk.p;

  // ── South-Indian Kundali: fixed rashi grid ──────────────────────────────────
  // South Indian chart: Rashi positions are FIXED, lagna is marked.
  // Grid positions (0-based cell index, row-major, 4×4):
  //   Cell  0=Pisces,  1=Aries,    2=Taurus,   3=Gemini
  //   Cell  4=Aquarius,5=center,   6=center,   7=Cancer
  //   Cell  8=Capricorn,9=center, 10=center,  11=Leo
  //   Cell 12=Sagittarius,13=Scorpio,14=Libra,15=Virgo
  // Rashi index (Mesha=0 … Meena=11) → cell index
  const RASHI_TO_CELL = [1,2,3,7,11,15,14,13,12,8,4,0];
  // Cell → rashi index (for labels)
  const CELL_TO_RASHI = [11,0,1,2,10,-1,-1,3,9,-1,-1,4,8,7,6,5];
  // Rashi abbreviations (Telugu/Sanskrit)
  const RASHI_ABBR = ['Me','Vr','Mi','Ka','Si','Ka','Tu','Vr','Dh','Ma','Ku','Me'];
  const RASHI_SYM  = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

  // Lagna rashi index
  const lagnaRashiIdx = Math.floor(r.sLagna / 30) % 12;

  // Group planets by rashi index
  const houseMap = {}; // rashiIdx → array of abbr strings
  for (const pl of r.planets) {
    const ri = pl.rashi.i;
    if (!houseMap[ri]) houseMap[ri] = [];
    const label = (pl.name === 'Lagna') ? '<span class="kc-lagna-tag">Lagna</span>' : (pl.retro ? `(${pl.abbr})` : pl.abbr);
    houseMap[ri].push(label);
  }

  // Build 12 content strings for cells (non-center)
  function cellContent(cellIdx) {
    const ri = CELL_TO_RASHI[cellIdx];
    if (ri < 0) return ''; // center
    const rashiNum = ri + 1; // 1-based rashi number (traditional SI chart shows number)
    const isLagna  = ri === lagnaRashiIdx;
    const planets  = houseMap[ri] || [];
    const lagnaLine = isLagna ? `<div class="kc-lagna-line" style="height:100%;background:rgba(56,142,60,0.12);position:absolute;inset:0;z-index:0;border-radius:0"></div><div style="position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent-gold)"></div>` : '';
    const numStr   = `<span class="kc-rashi-num${isLagna?' kc-rashi-num-lagna':''}">${rashiNum}</span>`;
    const planetStr= planets.length ? `<div class="kc-planets">${planets.join(' ')}</div>` : '';
    return lagnaLine + numStr + planetStr;
  }

  const kundaliHTML = `
<div class="balarista-kundali-wrap">
  <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-align:center;letter-spacing:0.5px;margin-bottom:6px;text-transform:uppercase">Nirayana Kundali · Lahiri Ayanamsha ${parseFloat(r.ayan).toFixed(2)}°</div>
  <div class="balarista-kundali">
    <div class="kc kc-r1c1">${cellContent(0)}</div>
    <div class="kc kc-r1c2">${cellContent(1)}</div>
    <div class="kc kc-r1c3">${cellContent(2)}</div>
    <div class="kc kc-r1c4">${cellContent(3)}</div>
    <div class="kc kc-r2c1">${cellContent(4)}</div>
    <div class="kc kc-center" style="grid-column:2/4;grid-row:2/4">
      <div class="kc-center-inner">
        <div class="kc-om-text">ॐ</div>
        <span class="kc-nak-label">${nakName} · Pada ${pada}</span>
        <div class="kc-info-val" style="font-size:11px">${r.dateStr}</div>
        <div class="kc-info-val" style="font-size:11px">${r.timeStr}</div>
        <div class="kc-info-val small" style="font-size:9.5px;margin-top:2px;opacity:0.75">${r.place}</div>
      </div>
    </div>
    <div class="kc kc-r2c4">${cellContent(7)}</div>
    <div class="kc kc-r3c1">${cellContent(8)}</div>
    <div class="kc kc-r3c4">${cellContent(11)}</div>
    <div class="kc kc-r4c1">${cellContent(12)}</div>
    <div class="kc kc-r4c2">${cellContent(13)}</div>
    <div class="kc kc-r4c3">${cellContent(14)}</div>
    <div class="kc kc-r4c4">${cellContent(15)}</div>
  </div>
</div>`;

  // ── Planetary Positions Table ────────────────────────────────────────────────
  const PLANET_COLORS = {
    'Lagna':'#c9902a','Sun':'#e07b1a','Moon':'#5c44cc','Mars':'#c0392b',
    'Mercury':'#27ae60','Jupiter':'#8e44ad','Venus':'#e91e8c',
    'Saturn':'#2c3e50','Rahu':'#6b6b8a','Ketu':'#6b6b8a'
  };
  function dmsStr(lon) {
    const ri = Math.floor(lon/30)%12;
    const d  = lon - ri*30;
    const dg = Math.floor(d);
    const mn = Math.floor((d-dg)*60);
    return `${dg}°${String(mn).padStart(2,'0')}'`;
  }
  const posTableRows = r.planets.map(pl => {
    const col = PLANET_COLORS[pl.name] || '#3a2d8f';
    const nakInfo = getNak(pl.lon);
    const nakName_pl = nakInfo.nak.n;
    const pada_pl = nakInfo.p;
    const retroTag = pl.retro ? ' <span style="color:#c62828;font-size:10px;font-weight:800">(R)</span>' : '';
    return `<tr>
      <td><span class="pp-dot" style="background:${col}"></span><b>${pl.name}</b>${retroTag}</td>
      <td style="font-size:11px;color:var(--text-dark);font-weight:700">${nakName_pl}</td>
      <td style="font-size:12px;font-weight:800;color:var(--primary);text-align:center">${pada_pl}</td>
      <td style="font-family:monospace;font-size:11px">${dmsStr(pl.lon)}</td>
    </tr>`;
  }).join('');

  const posTableHTML = `
<div class="dosha-card" style="margin-top:12px">
  <div class="dosha-card-title">🪐 Nirayana Planetary Positions</div>
  <table class="d-table">
    <thead><tr><th style="text-align:left;padding-left:8px">Planet</th><th>Nakshatra</th><th style="text-align:center">Pada</th><th>Degree</th></tr></thead>
    <tbody>${posTableRows}</tbody>
  </table>
</div>`;

  // ── Lagna info card ──────────────────────────────────────────────────────────
  const lagnaRashi = getRashi(r.sLagna);

  // Compute lagna start/end times (lagna changes ~every 2 hrs as Earth rotates)
  // Binary search: find when sidereal lagna crosses the rashi boundary at birth JD
  const lagnaRashiIdx2 = Math.floor(r.sLagna / 30) % 12;
  const lagnaStartDeg  = lagnaRashiIdx2 * 30;   // tropical-equivalent boundary start
  const lagnaEndDeg    = lagnaStartDeg + 30;     // end of rashi in lagna longitude

  function lagnaLon(jdVal) {
    // Use the same global lagnaT() + sid() + lahiri() as the main compute
    return sid(lagnaT(jdVal, r.lat, r.lon), jdVal);
  }

  function findLagnaCrossing(targetDeg, searchJD, windowDays) {
    // Binary search: find JD when lagnaLon crosses targetDeg
    // Lagna moves forward in time, so we look for lagnaLon == targetDeg
    let lo = searchJD - windowDays, hi = searchJD + windowDays;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const lon = lagnaLon(mid);
      // Difference handling wraparound at 0/360
      let diff = lon - targetDeg;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      if (diff > 0) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  }

  function fmtLagnaTime(jdVal) {
    const jdLocal = jdVal + (r.tz / 24);
    const z = Math.floor(jdLocal + 0.5);
    const f = jdLocal + 0.5 - z;
    let A;
    if (z < 2299161) { A = z; }
    else { const alpha = Math.floor((z-1867216.25)/36524.25); A = z+1+alpha-Math.floor(alpha/4); }
    const B = A+1524, C = Math.floor((B-122.1)/365.25), D = Math.floor(365.25*C), E = Math.floor((B-D)/30.6001);
    const dayF = B-D-Math.floor(30.6001*E)+f;
    const month = E<14?E-1:E-13, year = month>2?C-4716:C-4715, day = Math.floor(dayF);
    const hF = (dayF-day)*24, h = Math.floor(hF), mF = (hF-h)*60, m = Math.floor(mF);
    const ampm = h<12?'AM':'PM', h12 = h%12||12;
    const MNAMES2=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${day} ${MNAMES2[month-1]} ${year} · ${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
  }

  const lagnaStartJD = findLagnaCrossing(lagnaStartDeg, r.birthJD - 0.083, 0.15); // ~2hr window
  const lagnaEndJD   = findLagnaCrossing(lagnaEndDeg,   r.birthJD + 0.083, 0.15);
  const lagnaStartStr = fmtLagnaTime(lagnaStartJD);
  const lagnaEndStr   = fmtLagnaTime(lagnaEndJD);

  const lagnaCard = `
<div class="dosha-card" style="margin-top:12px;background:linear-gradient(135deg,#f5eeff,#ede4fa)">
  <div class="dosha-card-title" style="text-align:center">Lagna (Ascendant)</div>
  <div style="text-align:center">
    <div style="font-size:18px;font-weight:800;color:var(--primary);margin-bottom:4px">🌅 ${lagnaRashi.r} · ${lagnaRashi.en}</div>
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">Lord: <b>${lagnaRashi.lord}</b> &nbsp;|&nbsp; ${dmsStr(r.sLagna)} in Rashi</div>
    <div style="display:flex;justify-content:center;align-items:center;gap:0;background:rgba(58,45,143,0.07);border-radius:12px;padding:10px 8px;">
      <div style="flex:1;text-align:center">
        <div style="font-size:9.5px;font-weight:700;color:var(--text-muted);letter-spacing:0.8px;text-transform:uppercase;margin-bottom:3px">Start</div>
        <div style="font-size:11.5px;font-weight:800;color:var(--primary);line-height:1.4">${lagnaStartStr}</div>
      </div>
      <div style="width:1px;height:36px;background:rgba(58,45,143,0.18);margin:0 8px"></div>
      <div style="flex:1;text-align:center">
        <div style="font-size:9.5px;font-weight:700;color:var(--text-muted);letter-spacing:0.8px;text-transform:uppercase;margin-bottom:3px">End</div>
        <div style="font-size:11.5px;font-weight:800;color:var(--primary);line-height:1.4">${lagnaEndStr}</div>
      </div>
    </div>
  </div>
</div>`;

  const noteHTML = `
<div class="dosha-card" style="background:linear-gradient(135deg,#fff8e1,#fff3cd);margin-top:12px">
  <div class="dosha-card-title">Note</div>
  <div style="font-size:12px;color:var(--text-muted);line-height:1.6">All positions are Nirayana (sidereal) using Lahiri Ayanamsha. Balarista Dosha is based on Janma Nakshatra per classical Jyotisha texts. Consult a qualified Jyotishi for personalized parihara guidance.</div>
</div>`;

  const bottomBtnsHTML = `
<div style="display:flex;gap:10px;padding:8px 0 4px">
  <button class="nav-btn-back" style="flex:1" onclick="showScreen('screen-dosha')">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M15 18l-6-6 6-6"/></svg> Back
  </button>
  <button class="balarista-btn" style="flex:1" onclick="openBalaristaDoshaScreen()">🔮 Check Balarista Dosha</button>
</div>`;

  document.getElementById('balarista-content').innerHTML =
    lagnaCard + kundaliHTML + posTableHTML + noteHTML + bottomBtnsHTML;
}
// Screen → nav tab mapping
const SCREEN_NAV_MAP = {
  'screen-home':            'nav-home',
  'screen-birth':           'nav-home',
  'screen-loading':         'nav-home',
  'screen-results':         'nav-home',
  'screen-dosha':           'nav-home',
  'screen-planetary':       'nav-home',
  'screen-balarista-dosha': 'nav-home',
  'screen-calendar':        'nav-calendar',
  'screen-reports':         'nav-reports',
  'screen-profile':         'nav-profile',
};

function bdToggle(row) {
  var panel = row.nextElementSibling;
  row.classList.toggle('bd-expanded');
  panel.classList.toggle('bd-open');
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  // Hide birth bar unless on results screen
  const bar = document.getElementById('res-birth-bar');
  if (bar) bar.style.display = id === 'screen-results' ? 'block' : 'none';
  // Reset all inner scroll containers to top
  ['results-content','dosha-content','balarista-content','form-body'].forEach(sid => {
    const sc = document.getElementById(sid);
    if (sc) sc.scrollTop = 0;
  });
  document.querySelectorAll('.form-body, .results-scroll, .dosha-scroll').forEach(sc => { sc.scrollTop = 0; });
  // Scroll the page/phone itself to top so header is always visible
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const phone = document.querySelector('.phone');
  if (phone) phone.scrollTop = 0;
  // Sync bottom nav active state
  const activeNavId = SCREEN_NAV_MAP[id] || 'nav-home';
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const activeNav = document.getElementById(activeNavId);
  if (activeNav) activeNav.classList.add('active');
  // Update nav icons fill color
  updateNavIcons(activeNavId);
}

function updateNavIcons(activeNavId) {
  document.querySelectorAll('.nav-item').forEach(item => {
    const isActive = item.id === activeNavId;
    const svg = item.querySelector('svg');
    if (!svg) return;

    // Strokes
    svg.querySelectorAll('.ni-stroke').forEach(el => {
      el.setAttribute('stroke', isActive ? '#ffffff' : '#9090aa');
    });
    // Fill shapes (roof/page/avatar bg)
    svg.querySelectorAll('.ni-fill, .ni-fill2').forEach(el => {
      el.setAttribute('opacity', isActive ? '0.25' : '0');
    });
    // Header band, fold, door, window, etc.
    svg.querySelectorAll('.ni-header, .ni-door, .ni-door2, .ni-win, .ni-fold').forEach(el => {
      if (isActive) {
        el.setAttribute('stroke', '#ffffff');
        el.setAttribute('fill', el.tagName === 'rect' || el.tagName === 'path' ? 'rgba(255,255,255,0.25)' : el.getAttribute('fill'));
        el.setAttribute('opacity', '0.5');
      } else {
        el.setAttribute('stroke', '#9090aa');
        el.setAttribute('fill', el.tagName === 'rect' ? '#9090aa' : el.getAttribute('fill'));
        el.setAttribute('opacity', el.tagName === 'rect' ? '0.18' : '0.7');
      }
    });
    // Gold accent sparks
    svg.querySelectorAll('.ni-spark').forEach(el => {
      el.setAttribute('opacity', isActive ? '1' : '0');
    });
    // All plain stroked elements
    svg.querySelectorAll('[stroke="#9090aa"]').forEach(el => {
      el.setAttribute('stroke', isActive ? 'rgba(255,255,255,0.75)' : '#9090aa');
    });
    // All plain filled elements
    svg.querySelectorAll('[fill="#9090aa"]').forEach(el => {
      el.setAttribute('fill', isActive ? 'rgba(255,255,255,0.85)' : '#9090aa');
    });
    // Gold dots (calendar highlight, report bar)
    svg.querySelectorAll('[fill="#c9902a"]').forEach(el => {
      el.setAttribute('fill', isActive ? '#ffd580' : '#c9902a');
      el.setAttribute('opacity', isActive ? '1' : el.getAttribute('opacity') || '0.7');
    });
  });
}

function navTo(screenId, navId) {
  // For placeholder tabs (Calendar, Reports, Profile), show a stub screen
  const stubs = ['screen-calendar','screen-reports','screen-profile'];
  if (stubs.includes(screenId)) {
    const titles = { 'screen-calendar':'Calendar', 'screen-reports':'My Reports', 'screen-profile':'Profile' };
    const emojis = { 'screen-calendar':'📅', 'screen-reports':'📋', 'screen-profile':'👤' };
    const stubEl = document.getElementById(screenId);
    if (stubEl) {
      stubEl.querySelector('.stub-body').innerHTML =
        '<div style="font-size:56px;margin-bottom:18px">' + emojis[screenId] + '</div>' +
        '<div style="font-family:\'Playfair Display\',serif;font-size:22px;font-weight:700;color:var(--primary);margin-bottom:8px">' + titles[screenId] + '</div>' +
        '<div style="font-size:14px;color:var(--text-muted);line-height:1.6">This feature is coming soon.<br>Stay tuned for updates!</div>';
    }
  }
  showScreen(screenId);
}

// ─── INIT DROPDOWNS ───────────────────────────────────
(function init() {
  const now    = new Date();
  const curY   = now.getFullYear();
  const curM   = now.getMonth() + 1;   // 1-based
  const curD   = now.getDate();
  const curH24 = now.getHours();        // 0-23
  const curMin = now.getMinutes();
  const curAmpm = curH24 < 12 ? 'AM' : 'PM';
  const curH12  = curH24 % 12 || 12;

  // Day 1–31
  const dayEl = document.getElementById('sel-day');
  for (let d = 1; d <= 31; d++) { const o = document.createElement('option'); o.value = d; o.textContent = String(d).padStart(2,'0'); dayEl.appendChild(o); }
  dayEl.value = curD;

  // Month — set to current
  document.getElementById('sel-month').value = curM;

  // Year: current → 1900
  const yearEl = document.getElementById('sel-year');
  for (let y = curY; y >= 1900; y--) { const o = document.createElement('option'); o.value = y; o.textContent = y; yearEl.appendChild(o); }
  yearEl.value = curY;

  // Hours 1–12
  const hourEl = document.getElementById('sel-hour');
  for (let h = 1; h <= 12; h++) { const o = document.createElement('option'); o.value = h; o.textContent = String(h).padStart(2,'0'); hourEl.appendChild(o); }
  hourEl.value = curH12;

  // Minutes 00–59  (use selectedIndex — prevents browser scroll-to-top bug on mobile)
  const minEl = document.getElementById('sel-min');
  for (let m = 0; m < 60; m++) { const o = document.createElement('option'); o.value = m; o.textContent = String(m).padStart(2,'0'); minEl.appendChild(o); }
  minEl.selectedIndex = curMin;

  // AM/PM
  document.getElementById('sel-ampm').value = curAmpm;

  // ── Auto-detect location on app open ──────────────────
  if (navigator.geolocation) {
    const lbl = document.getElementById('gps-label');
    lbl.textContent = '\u23F3 Detecting location\u2026';
    document.getElementById('gps-btn').disabled = true;

    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const tzOff = Math.round(lng / 15 * 2) / 2;
      document.getElementById('birth-tz').value = tzOff;
      document.getElementById('birth-lat').value = lat.toFixed(4);
      document.getElementById('birth-lon').value = lng.toFixed(4);
      document.getElementById('birth-tz').dataset.iana = '';
      fetchIanaTimezone(lat, lng).then(ianaZone => {
        if (ianaZone) document.getElementById('birth-tz').dataset.iana = ianaZone;
      });
      try {
        const resp = await fetch(
          'https://nominatim.openstreetmap.org/reverse?lat=' + lat.toFixed(5) + '&lon=' + lng.toFixed(5) + '&format=json',
          { headers: { 'Accept-Language': 'en' } }
        );
        const d = await resp.json();
        const a = d.address || {};
        const city    = a.city || a.town || a.village || a.county || '';
        const state   = a.state || '';
        const country = a.country || '';
        document.getElementById('place-input').value = [city, state, country].filter(Boolean).join(', ');
        lbl.textContent = '\u2705 Location Set';
      } catch(e) {
        document.getElementById('place-input').value = lat.toFixed(3) + '\u00B0N, ' + lng.toFixed(3) + '\u00B0E';
        lbl.textContent = '\u2705 Coordinates Set';
      }
      document.getElementById('gps-btn').disabled = false;
    }, () => {
      // Permission denied or unavailable — silently reset
      document.getElementById('gps-btn').disabled = false;
      document.getElementById('gps-label').textContent = '\uD83D\uDCCD Use My Location';
    }, { timeout: 12000, enableHighAccuracy: false });
  }
})();

function updateDays() {
  const m = parseInt(document.getElementById('sel-month').value);
  const y = parseInt(document.getElementById('sel-year').value);
  const maxD = new Date(y, m, 0).getDate();
  const el = document.getElementById('sel-day');
  const cur = parseInt(el.value);
  while (el.options.length) el.remove(0);
  for (let d = 1; d <= maxD; d++) { const o = document.createElement('option'); o.value = d; o.textContent = String(d).padStart(2,'0'); el.appendChild(o); }
  el.value = Math.min(cur, maxD);
}

// ─── DST-aware UTC offset helpers (global) ────────────
// Given an IANA timezone name and a specific date, returns the true UTC offset
// in decimal hours (e.g. -4.0 for US Eastern during DST, -5.0 outside DST).
function ianaOffsetForDate(ianaZone, year, month, day) {
  try {
    const testDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).formatToParts(testDate);
    const get = t => parseInt(parts.find(p => p.type === t).value);
    const localH = get('hour') === 24 ? 0 : get('hour');
    const offsetHours = localH - 12 + (get('minute') / 60);
    return Math.round(offsetHours * 4) / 4;
  } catch(e) {
    return null;
  }
}

// Fetch IANA timezone name from timeapi.io (free, no API key)
async function fetchIanaTimezone(lat, lng) {
  try {
    const r = await fetch(
      `https://timeapi.io/api/timezone/coordinate?latitude=${lat.toFixed(5)}&longitude=${lng.toFixed(5)}`
    );
    if (!r.ok) return null;
    const d = await r.json();
    return d.timeZone || null;
  } catch(e) {
    return null;
  }
}

// ─── PLACE AUTOCOMPLETE ───────────────────────────────
(function initPlaceAutocomplete() {
  const input = document.getElementById('place-input');
  const box   = document.getElementById('place-suggestions');
  let debounceTimer = null;
  let activeIdx = -1;
  let currentResults = [];

  function hideSuggestions() {
    box.style.display = 'none';
    box.innerHTML = '';
    activeIdx = -1;
    currentResults = [];
  }

  function renderSuggestions(places) {
    currentResults = places;
    if (!places.length) { hideSuggestions(); return; }
    box.innerHTML = places.map((p, i) => `
      <div class="place-sug-item" data-idx="${i}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${p.display}</span>
      </div>`).join('');
    box.style.display = 'block';
    box.querySelectorAll('.place-sug-item').forEach(el => {
      el.addEventListener('mousedown', e => {
        e.preventDefault();
        selectPlace(parseInt(el.dataset.idx));
      });
    });
  }

  function selectPlace(idx) {
    const p = currentResults[idx];
    if (!p) return;
    input.value = p.display;
    // Set fallback timezone immediately (longitude estimate)
    document.getElementById('birth-tz').value = p.tz;
    document.getElementById('birth-lat').value = p.lat;
    document.getElementById('birth-lon').value = p.lon;
    // Clear any previous IANA zone
    document.getElementById('birth-tz').dataset.iana = '';
    hideSuggestions();
    // Fetch accurate IANA timezone in background (handles DST)
    fetchIanaTimezone(p.lat, p.lon).then(ianaZone => {
      if (ianaZone) {
        document.getElementById('birth-tz').dataset.iana = ianaZone;
      }
    });
  }

  async function fetchSuggestions(query) {
    box.innerHTML = '<div class="place-sug-loading">Searching…</div>';
    box.style.display = 'block';
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&featuretype=city`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      const places = data.map(item => {
        const a = item.address || {};
        const city    = a.city || a.town || a.village || a.county || item.name || '';
        const state   = a.state || '';
        const country = a.country || '';
        const display = [city, state, country].filter(Boolean).join(', ');
        const lng = parseFloat(item.lon);
        const tzFallback = Math.round(lng / 15 * 2) / 2; // rough fallback
        return { display, tz: tzFallback, lat: parseFloat(item.lat), lon: lng };
      }).filter(p => p.display);
      // Deduplicate by display name
      const seen = new Set();
      const unique = places.filter(p => { if (seen.has(p.display)) return false; seen.add(p.display); return true; });
      renderSuggestions(unique);
    } catch(e) {
      hideSuggestions();
    }
  }

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearTimeout(debounceTimer);
    if (q.length < 2) { hideSuggestions(); return; }
    debounceTimer = setTimeout(() => fetchSuggestions(q), 350);
  });

  input.addEventListener('keydown', e => {
    const items = box.querySelectorAll('.place-sug-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      selectPlace(activeIdx);
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !box.contains(e.target)) hideSuggestions();
  });
})();

// ─── GPS LOCATION ─────────────────────────────────────
function detectLocation() {
  if (!navigator.geolocation) { alert('Geolocation not supported by your browser.'); return; }
  const btn = document.getElementById('gps-btn');
  const lbl = document.getElementById('gps-label');
  btn.disabled = true; lbl.textContent = '⏳ Detecting…';

  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    // Estimate UTC offset from longitude (fallback)
    const tzOff = Math.round(lng / 15 * 2) / 2;
    document.getElementById('birth-tz').value = tzOff;
    document.getElementById('birth-lat').value = lat.toFixed(4);
    document.getElementById('birth-lon').value = lng.toFixed(4);
    document.getElementById('birth-tz').dataset.iana = '';
    // Fetch accurate IANA timezone in background
    fetchIanaTimezone(lat, lng).then(ianaZone => {
      if (ianaZone) document.getElementById('birth-tz').dataset.iana = ianaZone;
    });
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat.toFixed(5)}&lon=${lng.toFixed(5)}&format=json`, { headers:{'Accept-Language':'en'} });
      const d = await r.json();
      const a = d.address;
      const city    = a.city || a.town || a.village || a.county || '';
      const state   = a.state || '';
      const country = a.country || '';
      document.getElementById('place-input').value = [city, state, country].filter(Boolean).join(', ');
      lbl.textContent = '✅ Location Set';
    } catch(e) {
      document.getElementById('place-input').value = `${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`;
      lbl.textContent = '✅ Coordinates Set';
    }
    btn.disabled = false;
  }, err => {
    btn.disabled = false; lbl.textContent = '📍 Use My Location';
    if (err.code === 1) alert('Location access denied. Please allow and retry, or enter place manually.');
    else alert('Location unavailable. Please enter your birth place manually.');
  }, { timeout: 12000, enableHighAccuracy: false });
}

// ─── HANDLE NEXT ──────────────────────────────────────
function handleNext() {
  const day   = parseInt(document.getElementById('sel-day').value);
  const month = parseInt(document.getElementById('sel-month').value);
  const year  = parseInt(document.getElementById('sel-year').value);
  let   h12   = parseInt(document.getElementById('sel-hour').value);
  const min   = parseInt(document.getElementById('sel-min').value);
  const ampm  = document.getElementById('sel-ampm').value;
  const place = document.getElementById('place-input').value.trim();
  const tzEl = document.getElementById('birth-tz');
  let tzOff = parseFloat(tzEl.value) || 5.5;
  const ianaZone = tzEl.dataset.iana || '';
  if (ianaZone) {
    const dstOffset = ianaOffsetForDate(ianaZone, year, month, day);
    if (dstOffset !== null) tzOff = dstOffset;
  }
  const birthLat = parseFloat(document.getElementById('birth-lat').value) || 16.02;
  const birthLon = parseFloat(document.getElementById('birth-lon').value) || 80.83;

  if (!place) { alert('Please enter the place of birth.'); document.getElementById('place-input').focus(); return; }

  // 12h → 24h
  let h24 = h12 % 12;
  if (ampm === 'PM') h24 += 12;

  // Show loading screen first, then open results after 2s
  showScreen('screen-loading');
  startLoadingAnimation(() => {
    const result = computeVedic(year, month, day, h24, min, tzOff, place, birthLat, birthLon);
    renderResults(result);
    showScreen('screen-results');
  });
}

// ─── LOADING ANIMATION ────────────────────────────────
function startLoadingAnimation(onComplete) {
  const bar      = document.getElementById('loading-bar-fill');
  const pct      = document.getElementById('loading-pct');
  const statusEl = document.getElementById('loading-status-text');

  const steps = [
    { at: 0,   text: 'Reading birth data…' },
    { at: 20,  text: 'Calculating Julian Day &amp; Ayanamsha…' },
    { at: 40,  text: 'Calculating Nakshatra, Pada<br>and checking Balarishta Dosha…' },
    { at: 65,  text: 'Computing Tithi, Yoga &amp; Karana…' },
    { at: 82,  text: 'Building Vimshottari Dasha sequence…' },
    { at: 95,  text: 'Finalizing your Janma Kundali…' },
  ];

  const TOTAL_MS = 2000;
  const INTERVAL = 40; // ms per tick
  const TICKS    = TOTAL_MS / INTERVAL;
  let tick = 0;

  const timer = setInterval(() => {
    tick++;
    const progress = Math.min(tick / TICKS, 1);
    // Ease-out so it slows near 100%
    const eased = 1 - Math.pow(1 - progress, 2);
    const val   = Math.round(eased * 100);

    bar.style.width = val + '%';
    pct.textContent = val + '%';

    // Update status text at milestones
    for (let i = steps.length - 1; i >= 0; i--) {
      if (val >= steps[i].at) { statusEl.innerHTML = steps[i].text; break; }
    }

    if (progress >= 1) {
      clearInterval(timer);
      // tiny delay so user sees 100%
      setTimeout(onComplete, 120);
    }
  }, INTERVAL);
}

// ══════════════════════════════════════════════════════════
//  NIRAYANA VEDIC EPHEMERIS  —  Lahiri Ayanamsha only
//  All planetary longitudes returned as SIDEREAL (Nirayana)
//  Panchang (Tithi, Yoga, Karana) computed in Nirayana space
// ══════════════════════════════════════════════════════════

const R = Math.PI / 180;
function n360(d) { return ((d % 360) + 360) % 360; }
function sin(d)  { return Math.sin(d * R); }
function cos(d)  { return Math.cos(d * R); }

// Julian Day (UT)
function jd(yr, mo, dy, hUT) {
  if (mo <= 2) { yr--; mo += 12; }
  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mo + 1)) + dy + B - 1524.5 + hUT / 24;
}

// Lahiri Ayanamsha — IAU Chitrapaksha formula
// At J2000.0 = 23°51'11.4" = 23.853167°, precession = 50.2388475 arcsec/year
// T in Julian centuries; T*100 = years from J2000; divide by 3600 for degrees
function lahiri(JD) {
  const T = (JD - 2451545.0) / 36525.0;
  return 23.853167 + (50.2388475 / 3600.0) * T * 100.0;
}

// Tropical Sun longitude — Meeus simplified VSOP87
function sunT(JD) {
  const T = (JD - 2451545.0) / 36525;
  const L0 = n360(280.46646 + 36000.76983*T + 0.0003032*T*T);
  const M  = n360(357.52911 + 35999.05029*T - 0.0001537*T*T);
  const C  = (1.914602 - 0.004817*T - 0.000014*T*T)*sin(M)
           + (0.019993 - 0.000101*T)*sin(2*M)
           + 0.000289*sin(3*M);
  const Om = n360(125.04 - 1934.136*T);
  return n360(L0 + C - 0.00569 - 0.00478*sin(Om));
}

// Tropical Moon longitude — Meeus Ch.47 (corrected 28-term)
function moonT(JD) {
  const T  = (JD - 2451545.0) / 36525;
  const T2 = T*T, T3 = T2*T, T4 = T3*T;
  const L0 = n360(218.3164477 + 481267.88123421*T - 0.0015786*T2 + T3/538841 - T4/65194000);
  const M  = n360(357.5291092 + 35999.0502909*T  - 0.0001536*T2 + T3/24490000);
  const Mp = n360(134.9633964 + 477198.8675055*T  + 0.0087414*T2 + T3/69699 - T4/14712000);
  const F  = n360(93.2720950  + 483202.0175233*T  - 0.0036539*T2 - T3/3526000 + T4/863310000);
  const D  = n360(297.8501921 + 445267.1114034*T  - 0.0018819*T2 + T3/545868 - T4/113065000);
  const Om = n360(125.04452   - 1934.136261*T + 0.0020708*T2 + T3/450000);
  const E  = 1 - 0.002516*T - 0.0000074*T2;

  // 28-term longitude sum (arcseconds)
  let lon = 0;
  const terms = [
    [0,0,1,0,6288774,0],[2,0,-1,0,1274027,0],[2,0,0,0,658314,0],[0,0,2,0,213618,0],
    [0,1,0,0,-185116,1],[0,0,0,2,-114332,0],[2,0,-2,0,58793,0],[2,-1,-1,0,57066,1],
    [2,0,1,0,53322,0],[2,-1,0,0,45758,1],[0,1,-1,0,-40923,1],[1,0,0,0,-34720,0],
    [0,1,1,0,-30383,1],[2,0,0,-2,15327,0],[0,0,1,2,-12528,0],[0,0,1,-2,10980,0],
    [4,0,-1,0,10675,0],[0,0,3,0,10034,0],[4,0,-2,0,8548,0],[2,1,-1,0,-7888,1],
    [2,1,0,0,-6766,1],[1,0,-1,0,-5163,0],[1,1,0,0,4987,1],[2,-1,1,0,4036,1],
    [2,0,2,0,3994,0],[4,0,0,0,3861,0],[2,0,-3,0,3665,0],[0,1,-2,0,-2689,1]
  ];
  for (const [dD,dM,dMp,dF,coef,eF] of terms) {
    const arg = dD*D + dM*M + dMp*Mp + dF*F;
    lon += coef * (eF ? E : 1) * sin(arg);
  }
  // Additional terms
  lon += 3958*sin(119.75 + 131.849*T);
  lon += 1962*sin(L0 - F);
  lon +=  318*sin(53.09 + 479264.290*T);

  // Nutation (simplified)
  const nut = (-17.20*sin(Om) - 1.32*sin(2*L0) - 0.23*sin(2*Mp) + 0.21*sin(2*Om)) / 3600;
  return n360(L0 + lon / 1000000 + nut);
}

// Tropical → Nirayana
function sid(tropLon, JD) { return n360(tropLon - lahiri(JD)); }

// ─── VSOP87 heliocentric longitudes → geocentric tropical ────────────────────
// Validated against DrikPanchang for 15 Aug 1978, Repalle.
// All B,C coefficients are in radians; divisors as noted per planet.

function _vsop(terms, tau) {
  return terms.reduce((s,[A,B,C]) => s + A * Math.cos(B + C * tau), 0);
}

// Earth heliocentric position — returns {Lhel, xE, yE} (tropical radians / AU)
function _earthPos(JD) {
  const tau = (JD - 2451545.0) / 365250.0;
  const L0 = _vsop([[175347046,0,0],[3341656,4.6925912,6283.0758500],[34894,5.30286,12566.1517],[3497,2.7441,5753.3849],[3418,2.8289,3.5231],[3136,3.6277,77713.7715],[2676,4.4181,7860.4194],[2343,6.1352,3930.2097],[1324,0.7425,11506.7698],[1273,2.0371,529.6910],[1199,1.1096,1577.3435]], tau);
  const L1 = _vsop([[628331966747,0,0],[206059,2.678235,6283.075850],[4303,2.6351,12566.1517],[425,1.590,3.523],[119,5.796,26.298],[109,2.966,1577.344],[93,2.59,18849.23],[72,1.14,529.69],[68,1.87,398.15]], tau) * tau;
  const L2 = _vsop([[52919,0,0],[8720,1.0721,6283.0758],[309,0.867,12566.152],[27,0.05,3.52]], tau) * tau * tau;
  const Lrad = (L0 + L1 + L2) / 1e8;
  const R0 = _vsop([[100013989,0,0],[1670700,3.0984635,6283.0758500],[13956,3.05525,12566.15170],[3084,5.1985,77713.7715],[1628,1.1739,5753.3849],[1576,2.8469,7860.4194],[925,5.453,11506.770],[542,4.564,3930.210],[472,3.661,5884.927],[346,0.964,5507.553]], tau) / 1e8;
  return { Lhel: Lrad, xE: R0 * Math.cos(Lrad), yE: R0 * Math.sin(Lrad) };
}

// Convert heliocentric {Lrad, Rau} + Earth to geocentric tropical longitude (degrees)
// Returns {lon, dist} — dist in AU for light-time correction
function _geo(Lrad, Rau, earth) {
  const xP = Rau * Math.cos(Lrad), yP = Rau * Math.sin(Lrad);
  const dx = xP - earth.xE, dy = yP - earth.yE;
  return { lon: n360(Math.atan2(dy, dx) / R), dist: Math.sqrt(dx*dx + dy*dy) };
}
// Geocentric longitude only (no light-time)
function _geoLon(Lrad, Rau, earth) {
  const xP = Rau * Math.cos(Lrad), yP = Rau * Math.sin(Lrad);
  return n360(Math.atan2(yP - earth.yE, xP - earth.xE) / R);
}
// Apply light-time: recompute heliocentric at JD - dist*0.0057755 days
function _geoLT(getLrad, getRau, JD) {
  const earth = _earthPos(JD);
  const tau0  = (JD - 2451545.0) / 365250.0;
  const g0    = _geo(getLrad(tau0), getRau(tau0), earth);
  const lt    = g0.dist * 0.0057755 / 365250.0; // light-time in millennia
  const tau1  = tau0 - lt;
  return _geoLon(getLrad(tau1), getRau(tau1), earth);
}

function mercuryT(JD) {
  const tau = (JD - 2451545.0) / 365250.0;
  const L0 = _vsop([[440250710141,0,0],[40989414977,1.48302034,26087.90314157],[5046294200,4.47785490,52175.80628315],[855346844,1.16520322,78263.70942473],[165590362,4.11969163,104351.61256630],[34561897,0.77930768,130439.51570787],[7583476,3.71348405,156527.41884945]], tau);
  const L1 = _vsop([[2608814706223890,0,0],[1131199811,6.21874198,26087.90314157],[292242517,3.04449356,52175.80628315],[75775358,6.08980706,78263.70942473],[19691185,2.63590084,104351.61256630],[5133138,5.42663,130439.51571],[1393325,1.46215,156527.41885]], tau) * tau;
  const L2 = _vsop([[53050,0,0],[16904,4.69072,26087.90314],[7397,1.3474,52175.8063],[3018,4.4564,78263.7094],[1107,1.2623,104351.613]], tau) * tau * tau;
  const Lrad = (L0 + L1 + L2) / 1e11;
  const Rau  = _vsop([[39528272,0,0],[7834132,6.1923372,26087.90314157],[795526,2.959897,52175.806283],[121282,6.010642,78263.709425],[21922,2.77820,104351.612566],[4354,3.0631,130439.5157]], tau) / 1e8;
  return _geoLon(Lrad, Rau, _earthPos(JD));
}

function venusT(JD) {
  const tau = (JD - 2451545.0) / 365250.0;
  const L0 = _vsop([[317614667,0,0],[1353968,5.5931332,10213.2855462],[89892,5.30650,20426.57109],[5477,4.4163,7860.4194],[3456,2.6996,11790.6291],[2372,2.9938,3930.2097],[1664,4.2502,1577.3435],[1438,4.1575,9153.9038],[1317,5.1867,26.2983],[1201,6.1536,30213.8717],[761,1.950,529.691],[708,1.065,775.523],[585,3.998,191.448]], tau);
  const L1 = _vsop([[1021328554621,0,0],[95708,2.46424,10213.28555],[14445,0.51625,20426.57109],[213,1.795,30213.872],[174,2.655,26.298],[152,6.106,1577.344],[116,3.677,188.603],[101,2.539,7860.419],[86,3.511,529.691],[72,3.490,11790.629]], tau) * tau;
  const L2 = _vsop([[54127,0,0],[3891,0.3451,10213.2855],[1338,2.0201,20426.5711],[24,2.05,40853.14]], tau) * tau * tau;
  const Lrad = (L0 + L1 + L2) / 1e8;
  const Rau  = _vsop([[72334821,0,0],[489824,4.021518,10213.285546],[1658,4.9021,20426.5711]], tau) / 1e8;
  return _geoLon(Lrad, Rau, _earthPos(JD));
}

// ─── Mars tropical geocentric longitude — Swiss Ephemeris DE431 lookup table ─
// Precomputed from pyswisseph, 1920-2060, 5-day resolution, Catmull-Rom interpolation.
// Accuracy: <0.001° vs Swiss Ephemeris (matches DrikPanchang exactly).
const _MARS_JD0 = 2421594.0;    // start JD (1920 Jan 1)
const _MARS_STEP = 5;   // days between entries
const _MARS_L0 = 176.899850;  // mean longitude at start
const _MARS_N  = 0.52402068;        // mean motion °/day
const _MARS_R  = [0,-1087,-2355,-3827,-5525,-7467,-9677,-12177,-14990,-18130,-21595,-25374,-29439,-33745,-38227,-42801,-47370,-51842,-56138,-60192,-63959,-67406,-70522,-73312,-75792,-77981,-79898,-81564,-83001,-84233,-85280,-86160,-86887,-87474,-87934,-88281,-88524,-88671,-88728,-88700,-88596,-88420,-88178,-87872,-87505,-87080,-86600,-86069,-85489,-84861,-84185,-83465,-82702,-81900,-81057,-80176,-79257,-78302,-77314,-76293,-75242,-74160,-73049,-71910,-70748,-69562,-68355,-67127,-65880,-64616,-63339,-62049,-60749,-59439,-58121,-56799,-55474,-54149,-52824,-51501,-50181,-48868,-47563,-46268,-44983,-43709,-42448,-41202,-39973,-38760,-37565,-36387,-35228,-34090,-32972,-31875,-30799,-29743,-28708,-27697,-26707,-25738,-24791,-23865,-22959,-22076,-21214,-20373,-19551,-18748,-17966,-17204,-16460,-15736,-15029,-14339,-13668,-13015,-12380,-11762,-11159,-10574,-10006,-9456,-8922,-8405,-7905,-7423,-6960,-6516,-6092,-5686,-5302,-4940,-4602,-4290,-4004,-3746,-3518,-3323,-3166,-3047,-2970,-2939,-2958,-3034,-3172,-3378,-3657,-4019,-4473,-5031,-5705,-6505,-7446,-8546,-9825,-11304,-13003,-14943,-17147,-19638,-22439,-25559,-28998,-32743,-36767,-41023,-45444,-49941,-54418,-58786,-62964,-66889,-70513,-73804,-76755,-79371,-81669,-83667,-85382,-86837,-88055,-89061,-89874,-90511,-90986,-91313,-91506,-91579,-91541,-91399,-91161,-90833,-90424,-89940,-89386,-88766,-88082,-87339,-86543,-85699,-84807,-83871,-82892,-81876,-80825,-79744,-78634,-77496,-76333,-75149,-73947,-72730,-71499,-70257,-69004,-67746,-66484,-65222,-63959,-62697,-61438,-60186,-58942,-57708,-56484,-55272,-54072,-52887,-51718,-50567,-49432,-48314,-47214,-46134,-45074,-44034,-43013,-42012,-41030,-40070,-39130,-38210,-37309,-36426,-35563,-34720,-33895,-33088,-32297,-31523,-30766,-30025,-29300,-28590,-27894,-27211,-26541,-25885,-25242,-24609,-23987,-23376,-22776,-22186,-21606,-21034,-20470,-19914,-19368,-18830,-18300,-17776,-17260,-16752,-16252,-15760,-15276,-14799,-14331,-13871,-13423,-12984,-12555,-12137,-11732,-11340,-10964,-10603,-10259,-9932,-9626,-9344,-9087,-8856,-8654,-8484,-8350,-8257,-8209,-8209,-8261,-8373,-8552,-8808,-9147,-9577,-10110,-10761,-11544,-12477,-13575,-14856,-16342,-18060,-20034,-22285,-24830,-27681,-30848,-34326,-38088,-42086,-46249,-50497,-54741,-58887,-62845,-66538,-69919,-72962,-75658,-78008,-80020,-81713,-83114,-84250,-85145,-85820,-86293,-86585,-86717,-86708,-86570,-86315,-85954,-85498,-84959,-84348,-83671,-82933,-82140,-81301,-80422,-79509,-78566,-77595,-76601,-75588,-74562,-73525,-72480,-71427,-70371,-69314,-68259,-67209,-66163,-65123,-64090,-63067,-62056,-61057,-60069,-59094,-58133,-57186,-56256,-55341,-54440,-53555,-52685,-51832,-50995,-50174,-49368,-48576,-47799,-47038,-46291,-45559,-44839,-44131,-43437,-42755,-42085,-41426,-40777,-40136,-39506,-38885,-38273,-37667,-37067,-36474,-35887,-35305,-34729,-34155,-33585,-33017,-32453,-31891,-31330,-30769,-30209,-29648,-29089,-28529,-27968,-27405,-26840,-26274,-25706,-25137,-24566,-23991,-23414,-22835,-22255,-21673,-21088,-20500,-19911,-19321,-18730,-18139,-17545,-16951,-16358,-15766,-15175,-14586,-13998,-13413,-12832,-12256,-11687,-11123,-10565,-10016,-9479,-8954,-8443,-7947,-7467,-7008,-6575,-6169,-5794,-5453,-5150,-4895,-4695,-4556,-4485,-4491,-4587,-4788,-5109,-5566,-6174,-6953,-7930,-9130,-10581,-12304,-14318,-16645,-19301,-22288,-25584,-29146,-32914,-36814,-40759,-44648,-48385,-51889,-55109,-58017,-60596,-62844,-64771,-66396,-67750,-68859,-69748,-70439,-70950,-71308,-71532,-71640,-71645,-71557,-71389,-71152,-70857,-70511,-70121,-69691,-69226,-68734,-68220,-67686,-67135,-66569,-65991,-65405,-64813,-64217,-63617,-63014,-62410,-61807,-61207,-60608,-60012,-59417,-58826,-58241,-57659,-57083,-56509,-55940,-55375,-54815,-54259,-53708,-53159,-52612,-52070,-51531,-50994,-50459,-49924,-49390,-48857,-48325,-47793,-47258,-46722,-46184,-45643,-45101,-44554,-44003,-43446,-42885,-42318,-41746,-41167,-40581,-39986,-39384,-38774,-38156,-37528,-36890,-36242,-35585,-34918,-34240,-33551,-32850,-32138,-31416,-30682,-29936,-29178,-28408,-27626,-26833,-26028,-25212,-24382,-23540,-22687,-21824,-20949,-20063,-19164,-18254,-17335,-16406,-15467,-14519,-13560,-12593,-11620,-10641,-9656,-8665,-7670,-6672,-5675,-4679,-3685,-2695,-1710,-735,227,1173,2102,3011,3895,4749,5566,6344,7078,7763,8391,8951,9436,9839,10150,10359,10451,10409,10217,9861,9322,8578,7599,6360,4834,2998,828,-1701,-4604,-7881,-11507,-15437,-19606,-23932,-28313,-32638,-36804,-40730,-44363,-47671,-50638,-53266,-55567,-57567,-59296,-60779,-62040,-63103,-63990,-64725,-65327,-65811,-66190,-66476,-66680,-66814,-66887,-66905,-66873,-66796,-66681,-66533,-66356,-66151,-65922,-65670,-65399,-65112,-64809,-64492,-64161,-63816,-63461,-63096,-62721,-62336,-61940,-61535,-61122,-60701,-60271,-59831,-59381,-58923,-58455,-57978,-57492,-56994,-56485,-55966,-55436,-54895,-54341,-53774,-53194,-52601,-51995,-51376,-50741,-50091,-49425,-48744,-48049,-47337,-46607,-45861,-45097,-44317,-43520,-42705,-41872,-41020,-40150,-39264,-38359,-37437,-36496,-35537,-34560,-33567,-32557,-31530,-30486,-29425,-28349,-27259,-26154,-25035,-23902,-22756,-21600,-20433,-19257,-18071,-16877,-15677,-14473,-13265,-12055,-10844,-9632,-8424,-7220,-6023,-4834,-3653,-2484,-1328,-190,930,2031,3110,4165,5193,6189,7153,8084,8978,9832,10641,11401,12112,12769,13369,13905,14371,14761,15072,15295,15424,15447,15352,15129,14765,14248,13557,12673,11572,10234,8636,6752,4553,2015,-879,-4134,-7743,-11682,-15909,-20353,-24921,-29509,-34013,-38346,-42435,-46223,-49680,-52794,-55575,-58041,-60213,-62113,-63767,-65200,-66439,-67507,-68420,-69195,-69847,-70391,-70841,-71206,-71495,-71713,-71869,-71970,-72021,-72027,-71991,-71915,-71803,-71658,-71484,-71281,-71051,-70793,-70511,-70206,-69879,-69530,-69159,-68765,-68352,-67918,-67464,-66990,-66495,-65979,-65443,-64887,-64312,-63714,-63096,-62455,-61794,-61113,-60409,-59683,-58935,-58164,-57372,-56557,-55720,-54860,-53977,-53071,-52143,-51194,-50222,-49228,-48211,-47173,-46116,-45038,-43940,-42821,-41684,-40529,-39358,-38171,-36968,-35750,-34519,-33276,-32022,-30760,-29488,-28208,-26923,-25634,-24343,-23051,-21758,-20467,-19179,-17897,-16622,-15355,-14097,-12849,-11615,-10395,-9191,-8004,-6835,-5684,-4555,-3449,-2367,-1309,-276,730,1708,2655,3572,4458,5311,6131,6914,7660,8366,9033,9660,10241,10774,11258,11690,12067,12386,12641,12826,12937,12969,12915,12767,12513,12144,11647,11012,10224,9262,8107,6738,5133,3272,1128,-1326,-4108,-7233,-10698,-14492,-18588,-22937,-27465,-32080,-36682,-41180,-45492,-49553,-53313,-56747,-59849,-62630,-65105,-67293,-69217,-70900,-72367,-73642,-74746,-75694,-76501,-77183,-77753,-78225,-78605,-78903,-79123,-79275,-79364,-79396,-79374,-79301,-79179,-79013,-78806,-78559,-78274,-77951,-77592,-77199,-76774,-76316,-75826,-75304,-74751,-74167,-73555,-72913,-72241,-71539,-70808,-70048,-69261,-68445,-67601,-66727,-65826,-64899,-63945,-62965,-61958,-60924,-59866,-58784,-57679,-56552,-55401,-54229,-53037,-51827,-50600,-49356,-48096,-46822,-45536,-44239,-42934,-41620,-40299,-38973,-37645,-36316,-34988,-33660,-32336,-31017,-29705,-28401,-27108,-25824,-24553,-23295,-22054,-20828,-19620,-18429,-17257,-16105,-14975,-13867,-12780,-11716,-10674,-9657,-8665,-7698,-6755,-5836,-4944,-4078,-3239,-2426,-1640,-881,-149,554,1227,1871,2486,3071,3624,4142,4627,5076,5489,5864,6196,6484,6725,6918,7058,7140,7159,7110,6986,6783,6492,6103,5604,4984,4231,3332,2269,1021,-433,-2113,-4040,-6238,-8731,-11540,-14678,-18145,-21929,-26002,-30321,-34819,-39408,-43994,-48483,-52797,-56871,-60656,-64122,-67259,-70072,-72578,-74795,-76741,-78439,-79913,-81186,-82277,-83205,-83983,-84625,-85144,-85554,-85864,-86081,-86212,-86262,-86239,-86149,-85996,-85782,-85509,-85182,-84804,-84377,-83904,-83383,-82818,-82210,-81561,-80874,-80146,-79381,-78577,-77737,-76863,-75956,-75015,-74042,-73036,-72000,-70937,-69846,-68728,-67584,-66416,-65225,-64014,-62783,-61535,-60269,-58987,-57694,-56390,-55076,-53755,-52426,-51094,-49760,-48427,-47095,-45765,-44440,-43121,-41811,-40511,-39222,-37945,-36681,-35432,-34199,-32984,-31787,-30607,-29447,-28307,-27188,-26091,-25015,-23959,-22926,-21915,-20927,-19961,-19017,-18095,-17195,-16317,-15462,-14629,-13816,-13024,-12254,-11505,-10777,-10070,-9382,-8714,-8067,-7441,-6835,-6250,-5684,-5139,-4616,-4114,-3635,-3178,-2744,-2334,-1950,-1593,-1265,-966,-698,-464,-267,-110,4,74,94,59,-37,-199,-434,-748,-1149,-1651,-2263,-2998,-3868,-4888,-6077,-7456,-9048,-10870,-12945,-15297,-17949,-20918,-24209,-27818,-31724,-35892,-40267,-44772,-49314,-53799,-58140,-62266,-66121,-69663,-72872,-75746,-78297,-80543,-82501,-84190,-85634,-86856,-87879,-88721,-89397,-89920,-90304,-90564,-90710,-90752,-90694,-90545,-90311,-90000,-89616,-89164,-88645,-88065,-87425,-86733,-85990,-85197,-84357,-83472,-82545,-81580,-80578,-79542,-78471,-77369,-76240,-75085,-73907,-72707,-71486,-70247,-68995,-67730,-66455,-65171,-63879,-62584,-61286,-59990,-58695,-57404,-56117,-54837,-53566,-52307,-51059,-49824,-48602,-47396,-46206,-45035,-43881,-42746,-41629,-40531,-39455,-38400,-37365,-36350,-35356,-34382,-33431,-32500,-31588,-30697,-29824,-28972,-28140,-27327,-26531,-25752,-24991,-24248,-23521,-22810,-22115,-21433,-20767,-20115,-19477,-18853,-18241,-17641,-17054,-16479,-15916,-15365,-14824,-14295,-13777,-13271,-12778,-12295,-11823,-11363,-10917,-10485,-10067,-9662,-9272,-8899,-8544,-8209,-7894,-7599,-7329,-7084,-6869,-6685,-6534,-6419,-6344,-6315,-6337,-6413,-6548,-6749,-7024,-7384,-7837,-8392,-9061,-9857,-10799,-11905,-13193,-14680,-16389,-18345,-20574,-23097,-25927,-29071,-32528,-36284,-40305,-44529,-48878,-53259,-57583,-61763,-65718,-69385,-72723,-75717,-78366,-80680,-82671,-84357,-85763,-86915,-87839,-88553,-89075,-89422,-89612,-89662,-89586,-89392,-89091,-88691,-88203,-87636,-86997,-86291,-85523,-84698,-83824,-82906,-81949,-80955,-79927,-78870,-77789,-76689,-75571,-74438,-73292,-72137,-70976,-69812,-68648,-67483,-66320,-65162,-64011,-62869,-61737,-60614,-59503,-58406,-57323,-56256,-55205,-54169,-53150,-52148,-51165,-50200,-49252,-48322,-47410,-46516,-45641,-44783,-43943,-43119,-42311,-41520,-40747,-39988,-39244,-38514,-37798,-37096,-36407,-35730,-35065,-34410,-33766,-33132,-32508,-31893,-31285,-30685,-30092,-29506,-28926,-28352,-27781,-27216,-26654,-26098,-25544,-24994,-24445,-23899,-23355,-22815,-22276,-21738,-21201,-20666,-20134,-19604,-19076,-18548,-18023,-17501,-16982,-16468,-15956,-15448,-14944,-14447,-13957,-13474,-12998,-12530,-12072,-11627,-11194,-10775,-10371,-9983,-9614,-9269,-8947,-8652,-8385,-8150,-7953,-7800,-7693,-7638,-7640,-7707,-7852,-8082,-8409,-8842,-9396,-10090,-10943,-11975,-13206,-14656,-16352,-18319,-20583,-23155,-26037,-29224,-32696,-36414,-40314,-44305,-48293,-52185,-55901,-59369,-62535,-65363,-67846,-69991,-71815,-73337,-74577,-75560,-76314,-76867,-77242,-77457,-77528,-77472,-77308,-77050,-76710,-76296,-75816,-75281,-74698,-74077,-73422,-72736,-72023,-71290,-70541,-69781,-69010,-68231,-67446,-66657,-65869,-65082,-64298,-63516,-62738,-61965,-61200,-60444,-59695,-58953,-58220,-57496,-56783,-56079,-55385,-54700,-54023,-53357,-52702,-52055,-51417,-50787,-50164,-49551,-48945,-48347,-47754,-47167,-46586,-46011,-45441,-44874,-44311,-43750,-43191,-42636,-42081,-41528,-40973,-40418,-39863,-39307,-38749,-38188,-37623,-37055,-36483,-35908,-35327,-34741,-34149,-33551,-32947,-32337,-31720,-31095,-30462,-29822,-29175,-28520,-27857,-27185,-26504,-25815,-25119,-24415,-23701,-22979,-22248,-21509,-20764,-20010,-19247,-18476,-17698,-16913,-16122,-15324,-14518,-13706,-12888,-12067,-11241,-10411,-9577,-8740,-7903,-7066,-6232,-5399,-4569,-3746,-2932,-2131,-1344,-573,179,905,1601,2260,2879,3454,3976,4435,4820,5122,5332,5439,5425,5272,4960,4471,3785,2879,1722,285,-1461,-3537,-5959,-8741,-11884,-15372,-19157,-23168,-27315,-31504,-35634,-39608,-43342,-46779,-49889,-52666,-55113,-57244,-59077,-60638,-61958,-63063,-63978,-64722,-65314,-65774,-66120,-66367,-66526,-66606,-66616,-66566,-66466,-66321,-66136,-65914,-65661,-65382,-65080,-64759,-64420,-64064,-63694,-63312,-62922,-62523,-62115,-61699,-61277,-60850,-60419,-59983,-59543,-59097,-58648,-58195,-57739,-57279,-56814,-56345,-55871,-55393,-54910,-54422,-53927,-53425,-52918,-52404,-51884,-51355,-50817,-50270,-49714,-49150,-48576,-47990,-47393,-46784,-46165,-45533,-44889,-44231,-43560,-42874,-42176,-41463,-40736,-39992,-39234,-38460,-37672,-36868,-36048,-35211,-34358,-33490,-32606,-31706,-30790,-29858,-28909,-27946,-26968,-25975,-24967,-23943,-22906,-21855,-20793,-19717,-18629,-17528,-16419,-15300,-14173,-13038,-11896,-10748,-9597,-8445,-7292,-6139,-4987,-3840,-2700,-1570,-450,658,1752,2827,3881,4910,5913,6888,7830,8736,9600,10420,11191,11911,12574,13173,13700,14151,14519,14797,14975,15039,14979,14782,14436,13925,13225,12316,11174,9777,8100,6116,3796,1119,-1927,-5337,-9095,-13163,-17484,-21969,-26514,-31012,-35364,-39493,-43336,-46853,-50026,-52856,-55362,-57566,-59491,-61160,-62600,-63837,-64897,-65800,-66561,-67196,-67721,-68148,-68492,-68759,-68957,-69093,-69174,-69207,-69197,-69148,-69062,-68941,-68791,-68614,-68412,-68187,-67938,-67667,-67377,-67069,-66743,-66400,-66038,-65659,-65265,-64855,-64429,-63986,-63527,-63052,-62561,-62054,-61531,-60990,-60431,-59856,-59263,-58653,-58025,-57377,-56711,-56025,-55321,-54598,-53855,-53090,-52306,-51501,-50676,-49831,-48965,-48077,-47169,-46240,-45291,-44321,-43331,-42320,-41289,-40240,-39172,-38085,-36980,-35856,-34716,-33561,-32391,-31206,-30008,-28795,-27572,-26340,-25098,-23849,-22592,-21329,-20063,-18795,-17527,-16258,-14991,-13728,-12470,-11221,-9980,-8749,-7529,-6322,-5131,-3959,-2804,-1669,-554,537,1602,2641,3651,4633,5585,6503,7385,8230,9037,9805,10531,11212,11843,12424,12952,13424,13836,14181,14455,14652,14769,14799,14730,14552,14256,13831,13265,12541,11640,10541,9225,7669,5850,3742,1318,-1443,-4551,-8006,-11797,-15896,-20250,-24781,-29395,-33992,-38478,-42771,-46804,-50529,-53924,-56984,-59723,-62155,-64301,-66183,-67828,-69260,-70505,-71580,-72502,-73288,-73952,-74510,-74972,-75347,-75642,-75864,-76022,-76122,-76168,-76163,-76111,-76015,-75879,-75706,-75497,-75253,-74976,-74666,-74327,-73959,-73563,-73137,-72683,-72203,-71695,-71162,-70603,-70016,-69403,-68764,-68100,-67410,-66694,-65951,-65182,-64387,-63567,-62722,-61851,-60953,-60030,-59082,-58111,-57114,-56094,-55049,-53980,-52890,-51779,-50646,-49493,-48319,-47127,-45918,-44693,-43453,-42198,-40930,-39650,-38361,-37064,-35759,-34448,-33132,-31815,-30497,-29180,-27865,-26552,-25245,-23945,-22655,-21374,-20104,-18846,-17602,-16373,-15163,-13969,-12793,-11637,-10501,-9388,-8297,-7230,-6186,-5166,-4171,-3204,-2263,-1349,-463,396,1226,2024,2792,3529,4236,4910,5549,6152,6719,7249,7740,8190,8596,8954,9265,9524,9729,9874,9954,9963,9897,9750,9513,9175,8727,8156,7452,6601,5583,4378,2967,1329,-558,-2718,-5177,-7954,-11064,-14507,-18272,-22335,-26651,-31152,-35751,-40350,-44860,-49198,-53297,-57108,-60598,-63759,-66598,-69130,-71372,-73344,-75069,-76572,-77876,-79001,-79964,-80779,-81462,-82026,-82483,-82844,-83115,-83302,-83413,-83455,-83433,-83351,-83211,-83016,-82771,-82478,-82139,-81757,-81331,-80862,-80354,-79808,-79225,-78605,-77947,-77253,-76525,-75764,-74970,-74142,-73282,-72389,-71465,-70513,-69531,-68519,-67478,-66410,-65317,-64199,-63057,-61891,-60703,-59494,-58266,-57021,-55760,-54483,-53192,-51890,-50579,-49259,-47934,-46602,-45267,-43931,-42596,-41263,-39934,-38610,-37292,-35983,-34685,-33399,-32125,-30864,-29619,-28389,-27179,-25986,-24811,-23656,-22521,-21408,-20317,-19247,-18199,-17173,-16170,-15191,-14235,-13302,-12392,-11504,-10640,-9800,-8983,-8189,-7417,-6668,-5943,-5242,-4564,-3909,-3277,-2668,-2085,-1526,-993,-485,-2,452,878,1273,1638,1971,2270,2531,2752,2931,3065,3151,3184,3159,3070,2911,2677,2361,1951,1438,810,55,-839,-1890,-3117,-4541,-6182,-8062,-10201,-12626,-15357,-18409,-21787,-25480,-29467,-33708,-38144,-42692,-47258,-51749,-56083,-60192,-64021,-67534,-70716,-73570,-76108,-78348,-80308,-82008,-83473,-84725,-85786,-86673,-87401,-87982,-88433,-88765,-88989,-89113,-89143,-89085,-88947,-88735,-88454,-88106,-87695,-87223,-86695,-86115,-85485,-84804,-84076,-83301,-82485,-81628,-80731,-79796,-78824,-77816,-76777,-75707,-74607,-73479,-72323,-71144,-69942,-68721,-67482,-66224,-64951,-63666,-62371,-61067,-59757,-58441,-57122,-55803,-54485,-53171,-51861,-50557,-49260,-47974,-46699,-45437,-44188,-42954,-41735,-40534,-39351,-38187,-37041,-35915,-34809,-33724,-32662,-31620,-30598,-29598,-28619,-27662,-26727,-25813,-24919,-24045,-23191,-22358,-21545,-20751,-19976,-19218,-18479,-17758,-17055,-16368,-15697,-15042,-14404,-13782,-13176,-12584,-12007,-11445,-10898,-10367,-9851,-9349,-8862,-8391,-7938,-7501,-7082,-6679,-6296,-5933,-5592,-5274,-4980,-4711,-4470,-4260,-4085,-3945,-3843,-3783,-3770,-3810,-3907,-4067,-4295,-4599,-4989,-5476,-6069,-6779,-7620,-8608,-9763,-11104,-12650,-14422,-16442,-18737,-21329,-24233,-27455,-30991,-34824,-38921,-43226,-47657,-52123,-56530,-60795,-64841,-68606,-72049,-75152,-77914,-80346,-82463,-84281,-85822,-87112,-88174,-89031,-89699,-90194,-90531,-90726,-90794,-90745,-90586,-90326,-89973,-89535,-89021,-88435,-87780,-87062,-86285,-85456,-84578,-83656,-82690,-81684,-80643,-79571,-78471,-77346,-76197,-75026,-73839,-72638,-71426,-70205,-68976,-67742,-66506,-65270,-64038,-62808,-61584,-60366,-59158,-57962,-56778,-55606,-54447,-53304,-52177,-51068,-49977,-48903,-47847,-46810,-45792,-44795,-43818,-42859,-41918,-40998,-40097,-39216,-38353,-37508,-36680,-35870,-35078,-34303,-33544,-32800,-32071,-31356,-30657,-29971,-29297,-28635,-27985,-27346,-26719,-26102,-25494,-24894,-24303,-23721,-23148,-22581,-22021,-21467,-20920,-20379,-19845,-19316,-18792,-18274,-17761,-17254,-16754,-16259,-15769,-15285,-14809,-14340,-13879,-13426,-12981,-12545,-12121,-11709,-11309,-10923,-10551,-10195,-9860,-9545,-9251,-8981,-8737,-8524,-8345,-8202,-8099,-8040,-8029,-8076,-8186,-8364,-8618,-8958,-9395,-9943,-10616,-11426,-12390,-13528,-14863,-16420,-18220,-20282,-22628,-25278,-28245,-31526,-35097,-38919,-42936,-47075,-51247,-55351,-59292,-62993,-66402,-69485,-72221,-74604,-76644,-78361,-79784,-80935,-81836,-82510,-82980,-83271,-83403,-83392,-83251,-82994,-82634,-82186,-81660,-81065,-80406,-79690,-78928,-78125,-77288,-76422,-75527,-74611,-73677,-72731,-71775,-70812,-69842,-68869,-67896,-66926,-65960,-64999,-64044,-63096,-62157,-61230,-60314,-59408,-58514,-57633,-56765,-55912,-55072,-54246,-53433,-52633,-51849,-51079,-50322,-49578,-48847,-48128,-47423,-46730,-46049,-45378,-44717,-44068,-43428,-42798,-42176,-41561,-40954,-40354,-39761,-39174,-38591,-38013,-37438,-36867,-36300,-35735,-35171,-34608,-34046,-33484,-32923,-32361,-31797,-31231,-30663,-30093,-29522,-28946,-28367,-27784,-27198,-26609,-26015,-25417,-24814,-24206,-23595,-22979,-22360,-21735,-21105,-20472,-19835,-19195,-18551,-17903,-17251,-16597,-15941,-15284,-14624,-13962,-13299,-12637,-11976,-11316,-10657,-10000,-9347,-8699,-8059,-7426,-6801,-6186,-5585,-5000,-4436,-3892,-3372,-2880,-2424,-2009,-1641,-1324,-1066,-878,-773,-762,-859,-1074,-1426,-1937,-2630,-3531,-4658,-6038,-7698,-9667,-11967,-14609,-17586,-20880,-24459,-28267,-32222,-36223,-40166,-43962,-47538,-50839,-53823,-56472,-58789,-60791,-62501,-63941,-65134,-66104,-66879,-67483,-67938,-68259,-68461,-68560,-68569,-68502,-68368,-68175,-67928,-67636,-67305,-66943,-66552,-66136,-65698,-65241,-64770,-64289,-63796,-63295,-62786,-62271,-61754,-61235,-60713,-60190,-59665,-59141,-58618,-58097,-57576,-57056,-56537,-56020,-55505,-54991,-54478,-53965,-53452,-52941,-52430,-51919,-51406,-50892,-50376,-49859,-49339,-48817,-48291,-47760,-47226,-46686,-46142,-45592,-45035,-44470,-43899,-43320,-42733,-42137,-41531,-40916,-40290,-39656,-39010,-38353,-37684,-37002,-36310,-35606,-34889,-34159,-33416,-32659,-31890,-31109,-30313,-29504,-28680,-27844,-26994,-26132,-25256,-24365,-23461,-22545,-21617,-20676,-19722,-18755,-17776,-16787,-15788,-14778,-13758,-12728,-11690,-10645,-9595,-8539,-7478,-6414,-5349,-4286,-3226,-2169,-1117,-74,958,1975,2974,3954,4912,5843,6742,7604,8426,9204,9933,10605,11213,11749,12206,12579,12855,13023,13068,12977,12737,12332,11740,10939,9901,8604,7023,5133,2905,315,-2650,-5984,-9667,-13658,-17897,-22298,-26754,-31154,-35398,-39410,-43132,-46526,-49575,-52282,-54663,-56744,-58551,-60107,-61437,-62567,-63522,-64324,-64990,-65534,-65970,-66313,-66573,-66763,-66888,-66954,-66969,-66938,-66868,-66764,-66627,-66460,-66265,-66048,-65810,-65553,-65278,-64984,-64675,-64352,-64015,-63666,-63304,-62928,-62541,-62142,-61733,-61312,-60879,-60433,-59976,-59508,-59029,-58537,-58031,-57512,-56980,-56436,-55878,-55305,-54716,-54113,-53494,-52861,-52212,-51545,-50861,-50160,-49442,-48707,-47954,-47182,-46391,-45581,-44754,-43908,-43043,-42158,-41253,-40330,-39389,-38429,-37450,-36452,-35435,-34401,-33350,-32283,-31198,-30096,-28979,-27847,-26702,-25544,-24373,-23189,-21994,-20791,-19580,-18362,-17136,-15906,-14672,-13437,-12203,-10970,-9738,-8511,-7290,-6078,-4876,-3686,-2508,-1345,-200,925,2028,3109,4165,5195,6194,7160,8093,8990,9850,10668,11441,12165,12840,13462,14027,14530,14964,15325,15609,15810,15920,15927,15822,15595,15235,14728,14056,13200,12139,10853,9319,7512,5405,2970,189,-2946,-6436,-10265,-14400,-18781,-23324,-27929,-32495,-36929,-41150,-45092,-48715,-52000,-54950,-57578,-59903,-61945,-63730,-65283,-66632,-67799,-68803,-69660,-70386,-70998,-71508,-71929,-72266,-72529,-72725,-72861,-72944,-72978,-72965,-72910,-72815,-72685,-72522,-72327,-72102,-71847,-71565,-71257,-70925,-70568,-70186,-69780,-69352,-68901,-68428,-67932,-67412,-66870,-66306,-65720,-65112,-64481,-63825,-63147,-62446,-61723,-60977,-60206,-59411,-58593,-57751,-56887,-55999,-55086,-54150,-53190,-52209,-51205,-50178,-49129,-48057,-46966,-45854,-44723,-43572,-42403,-41216,-40013,-38795,-37563,-36318,-35059,-33790,-32512,-31227,-29935,-28638,-27336,-26032,-24728,-23426,-22126,-20829,-19537,-18253,-16979,-15715,-14463,-13222,-11996,-10786,-9595,-8422,-7268,-6134,-5022,-3933,-2870,-1831,-818,169,1128,2058,2957,3825,4662,5467,6239,6973,7671,8331,8953,9535,10072,10563,11006,11399,11739,12022,12243,12396,12478,12483,12406,12236,11964,11579,11071,10430,9638,8679,7531,6176,4592,2758,648,-1765,-4500,-7571,-10980,-14718,-18763,-23070,-27568,-32170,-36780,-41304,-45661,-49778,-53604,-57109,-60284,-63136,-65680,-67933,-69914,-71650,-73165,-74483,-75624,-76603,-77437,-78141,-78731,-79217,-79608,-79912,-80136,-80288,-80375,-80401,-80371,-80285,-80149,-79967,-79740,-79472,-79162,-78812,-78424,-78000,-77542,-77049,-76521,-75959,-75364,-74738,-74081,-73392,-72672,-71920,-71138,-70327,-69487,-68617,-67718,-66790,-65833,-64851,-63841,-62805,-61743,-60655,-59544,-58410,-57254,-56076,-54878,-53660,-52425,-51174,-49908,-48628,-47336,-46032,-44720,-43401,-42077,-40748,-39416,-38083,-36751,-35423,-34099,-32779,-31467,-30163,-28870,-27590,-26322,-25068,-23828,-22606,-21401,-20216,-19049,-17902,-16775,-15670,-14589,-13529,-12493,-11479,-10488,-9522,-8581,-7665,-6773,-5905,-5062,-4245,-3454,-2689,-1949,-1234,-546,113,746,1350,1927,2476,2993,3478,3931,4350,4735,5083,5390,5655,5875,6048,6171,6239,6245,6185,6053,5844,5550,5161,4665,4051,3309,2425,1380,156,-1269,-2914,-4800,-6950,-9390,-12141,-15217,-18619,-22339,-26355,-30626,-35089,-39659,-44243,-48748,-53095,-57212,-61048,-64568,-67759,-70625,-73179,-75439,-77422,-79151,-80649,-81941,-83046,-83982,-84762,-85401,-85914,-86314,-86609,-86808,-86916,-86941,-86890,-86769,-86582,-86331,-86019,-85650,-85228,-84756,-84235,-83665,-83048,-82388,-81686,-80943,-80160,-79338,-78477,-77581,-76650,-75686,-74689,-73659,-72599,-71510,-70395,-69254,-68088,-66898,-65686,-64456,-63207,-61943,-60663,-59370,-58065,-56753,-55433,-54109,-52780,-51449,-50119,-48791,-47468,-46150,-44838,-43535,-42242,-40961,-39694,-38440,-37201,-35979,-34773,-33587,-32420,-31272,-30144,-29036,-27949,-26885,-25842,-24821,-23821,-22842,-21886,-20953,-20041,-19150,-18280,-17430,-16603,-15797,-15010,-14244,-13496,-12769,-12061,-11373,-10704,-10052,-9419,-8804,-8209,-7633,-7074,-6534,-6012,-5510,-5028,-4567,-4125,-3705,-3307,-2933,-2585,-2262,-1967,-1700,-1466,-1266,-1104,-982,-902,-868,-887,-964,-1104,-1311,-1593,-1960,-2420,-2986,-3667,-4476,-5428,-6540,-7834,-9329,-11044,-13001,-15225,-17740,-20564,-23708,-27171,-30940,-34989,-39271,-43714,-48231,-52727,-57114,-61314,-65260,-68904,-72218,-75194,-77840,-80171,-82202,-83952,-85446,-86706,-87757,-88617,-89302,-89826,-90204,-90451,-90579,-90597,-90511,-90329,-90059,-89709,-89284,-88787,-88223,-87595,-86908,-86167,-85375,-84534,-83646,-82713,-81741,-80732,-79688,-78612,-77504,-76367,-75207,-74024,-72822,-71601,-70364,-69113,-67853,-66584,-65310,-64031,-62749,-61467,-60188,-58913,-57645,-56383,-55129,-53887,-52657,-51441,-50239,-49052,-47880,-46727,-45592,-44476,-43380,-42302,-41244,-40206,-39189,-38194,-37218,-36262,-35326,-34410,-33516,-32641,-31784,-30946,-30126,-29325,-28542,-27776,-27026,-26292,-25573,-24870,-24182,-23508,-22847,-22199,-21563,-20940,-20329,-19729,-19139,-18560,-17991,-17433,-16885,-16345,-15815,-15293,-14782,-14280,-13788,-13305,-12831,-12367,-11915,-11474,-11044,-10626,-10221,-9830,-9455,-9097,-8756,-8433,-8130,-7851,-7597,-7371,-7173,-7007,-6876,-6786,-6740,-6742,-6796,-6907,-7084,-7336,-7669,-8092,-8615,-9249,-10013,-10921,-11988,-13233,-14676,-16340,-18253,-20436,-22908,-25683,-28772,-32177,-35882,-39847,-44009,-48293,-52612,-56876,-60988,-64869,-68455,-71713,-74629,-77197,-79424,-81324,-82918,-84236,-85302,-86137,-86762,-87194,-87454,-87563,-87534,-87380,-87110,-86736,-86269,-85722,-85099,-84409,-83656,-82846,-81988,-81089,-80151,-79180,-78177,-77148,-76098,-75032,-73952,-72859,-71757,-70648,-69538,-68427,-67318,-66211,-65108,-64012,-62925,-61849,-60784,-59729,-58687,-57659,-56647,-55651,-54670,-53704,-52754,-51821,-50906,-50009,-49128,-48263,-47414,-46583,-45769,-44971,-44188,-43419,-42666,-41928,-41204,-40494,-39796,-39109,-38435,-37773,-37122,-36481,-35849,-35225,-34610,-34003,-33404,-32811,-32224,-31641,-31064,-30492,-29924,-29359,-28796,-28235,-27677,-27121,-26567,-26012,-25458,-24904,-24351,-23799,-23246,-22691,-22137,-21581,-21026,-20472,-19916,-19359,-18802,-18246,-17691,-17137,-16583,-16030,-15479,-14931,-14387,-13846,-13309,-12777,-12250,-11731,-11221,-10719,-10226,-9744,-9275,-8823,-8387,-7970,-7572,-7197,-6850,-6535,-6255,-6011,-5810,-5659,-5565,-5538,-5582,-5708,-5926,-6251,-6701,-7292,-8038,-8959,-10080,-11427,-13028,-14903,-17071,-19547,-22344,-25459,-28868,-32521,-36350,-40276,-44212,-48061,-51732,-55149,-58264,-61055,-63514,-65642,-67450,-68958,-70195,-71191,-71969,-72553,-72960,-73214,-73334,-73339,-73244,-73057,-72791,-72455,-72062,-71619,-71134,-70609,-70051,-69465,-68857,-68232,-67592,-66938,-66273,-65600,-64924,-64246,-63565,-62883,-62202,-61523,-60848,-60178,-59512,-58851,-58195,-57545,-56903,-56268,-55639,-55016,-54400,-53791,-53189,-52594,-52005,-51420,-50842,-50269,-49702,-49139,-48580,-48023,-47471,-46921,-46374,-45829,-45283,-44739,-44194,-43650,-43105,-42558,-42008,-41456,-40901,-40342,-39780,-39212,-38639,-38060,-37476,-36886,-36289,-35683,-35070,-34449,-33820,-33183,-32536,-31880,-31214,-30539,-29855,-29161,-28456,-27741,-27015,-26279,-25534,-24778,-24012,-23234,-22446,-21648,-20841,-20023,-19195,-18356,-17507,-16651,-15785,-14910,-14026,-13133,-12233,-11328,-10416,-9497,-8573,-7645,-6714,-5783,-4853,-3923,-2995,-2072,-1158,-255,634,1510,2366,3200,4003,4773,5506,6198,6840,7425,7942,8384,8744,9011,9171,9209,9107,8850,8422,7800,6961,5873,4510,2849,865,-1465,-4163,-7235,-10665,-14417,-18432,-22634,-26932,-31216,-35378,-39329,-43004,-46366,-49394,-52083,-54440,-56487,-58252,-59764,-61048,-62125,-63019,-63753,-64348,-64821,-65187,-65455,-65638,-65748,-65795,-65787,-65728,-65623,-65479,-65302,-65095,-64863,-64606,-64328,-64030,-63717,-63390,-63050,-62698,-62334,-61960,-61578,-61188,-60791,-60385,-59971,-59551,-59125,-58693,-58253,-57806,-57352,-56891,-56423,-55948,-55465,-54973,-54472,-53963,-53445,-52917,-52379,-51830,-51269,-50698,-50116,-49522,-48914,-48292,-47658,-47010,-46348,-45672,-44980,-44272,-43549,-42811,-42057,-41286,-40499,-39694,-38873,-38035,-37181,-36309,-35419,-34512,-33589,-32649,-31693,-30719,-29728,-28721,-27698,-26661,-25609,-24540,-23457,-22361,-21253,-20133,-19001,-17857,-16703,-15541,-14372,-13198,-12017,-10831,-9643,-8454,-7267,-6083,-4901,-3725,-2557,-1399,-255,875,1990,3087,4163,5213,6236,7231,8194,9124,10014,10862,11664,12418,13120,13765,14347,14859,15297,15656,15928,16104,16173,16125,15947,15630,15157,14509,13664,12602,11301,9739,7886,5715,3201,329,-2907,-6498,-10424,-14640,-19071,-23623,-28190,-32672,-36979,-41037,-44790,-48208,-51283,-54025,-56452,-58584,-60445,-62061,-63459,-64665,-65700,-66581,-67326,-67950,-68469,-68895,-69238,-69505,-69704,-69842,-69928,-69966,-69959,-69912,-69827,-69708,-69559,-69382,-69177,-68946,-68691,-68413,-68114,-67795,-67455,-67095,-66715,-66317,-65900,-65466,-65012,-64539,-64048,-63539,-63012,-62466,-61900,-61314,-60710,-60086,-59443,-58779,-58094,-57389,-56662,-55916,-55148,-54359,-53548,-52714,-51859,-50983,-50086,-49166,-48224,-47261,-46276,-45272,-44246,-43199,-42132,-41045,-39941,-38818,-37677,-36519,-35344,-34154,-32950,-31734,-30505,-29263,-28012,-26752,-25486,-24214,-22936,-21655,-20372,-19089,-17808,-16530,-15256,-13987,-12726,-11474,-10235,-9007,-7792,-6593,-5410,-4246,-3103,-1980,-880,198,1250,2274,3269,4236,5173,6078,6949,7784,8582,9343,10064,10743,11378,11964,12501,12987,13419,13791,14098,14337,14502,14589,14591,14498,14300,13988,13551,12978,12252,11355,10267,8968,7439,5655,3590,1217,-1484,-4525,-7910,-11633,-15669,-19973,-24471,-29074,-33685,-38211,-42565,-46676,-50491,-53980,-57139,-59973,-62497,-64729,-66691,-68409,-69909,-71214,-72343,-73313,-74142,-74844,-75435,-75926,-76325,-76640,-76879,-77051,-77160,-77213,-77212,-77161,-77063,-76922,-76741,-76522,-76265,-75972,-75645,-75286,-74895,-74474,-74021,-73538,-73026,-72485,-71917,-71320,-70694,-70039,-69357,-68648,-67911,-67147,-66355,-65535,-64688,-63816,-62917,-61991,-61038,-60059,-59056,-58028,-56976,-55900,-54799,-53676,-52533,-51369,-50186,-48983,-47761,-46524,-45272,-44006,-42728,-41437,-40137,-38828,-37514,-36195,-34872,-33546,-32220,-30896,-29575,-28260,-26949,-25646,-24351,-23068,-21797,-20540,-19297,-18069,-16857,-15664,-14491,-13338,-12205,-11092,-10003,-8937,-7895,-6877,-5882,-4913,-3970,-3053,-2164,-1301,-465,344,1124,1874,2594,3285,3946,4575,5171,5733,6259,6750,7205,7619,7990,8317,8597,8828,9007,9127,9184,9173,9089,8927,8676,8329,7873,7298,6595,5746,4736,3544,2150,536,-1322,-3448,-5866,-8598,-11657,-15046,-18758,-22772,-27046,-31516,-36097,-40696,-45221,-49589,-53730,-57588,-61131,-64346,-67238,-69820,-72107,-74119,-75879,-77412,-78741,-79886,-80863,-81688,-82377,-82943,-83399,-83754,-84015,-84189,-84285,-84308,-84265,-84159,-83991,-83767,-83489,-83162,-82787,-82366,-81898,-81387,-80834,-80242,-79611,-78940,-78232,-77486,-76705,-75890,-75040,-74157,-73240,-72292,-71313,-70304,-69267,-68201,-67107,-65986,-64842,-63675,-62486,-61275,-60044,-58795,-57530,-56251,-54959,-53654,-52339,-51017,-49689,-48357,-47023,-45686,-44351,-43018,-41691,-40370,-39055,-37750,-36454,-35172,-33903,-32649,-31410,-30187,-28981,-27794,-26628,-25481,-24354,-23248,-22163,-21101,-20062,-19044,-18048,-17075,-16124,-15197,-14293,-13410,-12550,-11712,-10896,-10103,-9333,-8583,-7855,-7148,-6464,-5802,-5162,-4542,-3944,-3368,-2816,-2287,-1781,-1298,-839,-406,-1,376,725,1043,1330,1580,1793,1965,2095,2180,2214,2192,2108,1958,1737,1436,1046,556,-44,-766,-1621,-2627,-3803,-5168,-6743,-8547,-10603,-12937,-15570,-18519,-21791,-25381,-29272,-33432,-37806,-42316,-46870,-51377,-55751,-59918,-63817,-67406,-70665,-73593,-76200,-78500,-80512,-82254,-83752,-85030,-86108,-87005,-87735,-88312,-88753,-89070,-89275,-89374,-89374,-89284,-89110,-88860,-88537,-88145,-87687,-87168,-86590,-85959,-85277,-84543,-83761,-82933,-82063,-81154,-80205,-79218,-78195,-77139,-76053,-74939,-73797,-72629,-71437,-70225,-68994,-67747,-66485,-65209,-63922,-62627,-61327,-60022,-58715,-57406,-56099,-54795,-53497,-52207,-50924,-49651,-48389,-47140,-45906,-44688,-43484,-42298,-41129,-39979,-38850,-37740,-36650,-35579,-34530,-33502,-32496,-31510,-30546,-29601,-28677,-27775,-26893,-26031,-25188,-24364,-23559,-22774,-22006,-21256,-20523,-19805,-19105,-18421,-17753,-17100,-16460,-15835,-15224,-14628,-14046,-13475,-12918,-12373,-11843,-11326,-10821,-10329,-9850,-9386,-8936,-8502,-8082,-7677,-7289,-6920,-6571,-6242,-5934,-5649,-5389,-5158,-4958,-4790,-4657,-4562,-4510,-4507,-4556,-4662,-4830,-5067,-5384,-5788,-6290,-6898,-7626,-8488,-9503,-10689,-12063,-13644,-15457,-17527,-19878,-22528,-25489,-28766,-32356,-36237,-40367,-44677,-49086,-53501,-57834,-61999,-65919,-69538,-72824,-75768,-78373,-80646,-82603,-84264,-85656,-86803,-87728,-88449,-88984,-89348,-89562,-89639,-89592,-89428,-89158,-88790,-88335,-87800,-87192,-86515,-85773,-84973,-84122,-83224,-82282,-81299,-80279,-79227,-78148,-77044,-75918,-74772,-73609,-72434,-71249,-70057,-68860,-67659,-66457,-65257,-64061,-62871,-61688,-60513,-59347,-58194,-57054,-55928,-54817,-53720,-52639,-51576,-50532,-49506,-48497,-47506,-46534,-45581,-44648,-43734,-42837,-41958,-41098,-40256,-39432,-38625,-37834,-37058,-36299,-35556,-34828,-34113,-33412,-32723,-32048,-31384,-30733,-30091,-29459,-28837,-28224,-27621,-27025,-26436,-25854,-25278,-24709,-24146,-23588,-23034,-22485,-21940,-21399,-20863,-20330,-19800,-19273,-18750,-18232,-17717,-17205,-16696,-16191,-15691,-15197,-14707,-14223,-13745,-13273,-12810,-12356,-11912,-11476,-11052,-10641,-10245,-9866,-9502,-9157,-8833,-8533,-8261,-8017,-7805,-7626,-7487,-7395,-7352,-7365,-7438,-7578,-7798,-8108,-8518,-9038,-9683,-10469,-11417,-12549,-13884,-15442,-17246,-19324,-21698,-24383,-27379,-30676,-34251,-38064,-42050,-46120,-50176,-54123,-57882,-61386,-64582,-67437,-69939,-72097,-73932,-75461,-76706,-77690,-78438,-78981,-79340,-79536,-79583,-79498,-79298,-78999,-78613,-78150,-77617,-77023,-76377,-75689,-74963,-74205,-73418,-72606,-71777,-70934,-70080,-69217,-68346,-67471,-66596,-65722,-64851,-63983,-63119,-62262,-61412,-60572,-59741,-58920,-58107,-57306,-56516,-55739,-54973,-54218,-53474,-52742,-52023,-51316,-50619,-49933,-49257,-48593,-47939,-47294,-46659,-46032,-45413,-44802,-44199,-43604,-43014,-42428,-41848,-41273,-40703,-40136,-39571,-39008,-38447,-37887,-37329,-36770,-36210,-35649,-35087,-34523,-33957,-33388,-32814,-32237,-31656,-31071,-30482,-29886,-29285,-28678,-28066,-27449,-26825,-26194,-25556,-24911,-24261,-23605,-22942,-22271,-21594,-20910,-20220,-19525,-18823,-18115,-17399,-16680,-15955,-15226,-14492,-13752,-13007,-12260,-11511,-10760,-10006,-9249,-8492,-7738,-6986,-6237,-5491,-4750,-4018,-3298,-2592,-1900,-1226,-573,51,643,1197,1710,2176,2584,2924,3186,3360,3437,3401,3234,2915,2424,1743,849,-285,-1691,-3399,-5429,-7798,-10516,-13586,-16992,-20692,-24614,-28670,-32764,-36800,-40685,-44336,-47693,-50725,-53426,-55800,-57861,-59626,-61120,-62370,-63407,-64255,-64933,-65459,-65853,-66132,-66313,-66407,-66422,-66369,-66256,-66092,-65886,-65641,-65360,-65050,-64713,-64355,-63979,-63587,-63180,-62761,-62331,-61893,-61450,-61000,-60544,-60083,-59619,-59153,-58685,-58214,-57741,-57265,-56789,-56312,-55833,-55352,-54869,-54383,-53896,-53407,-52915,-52418,-51918,-51414,-50906,-50394,-49876,-49352,-48821,-48284,-47740,-47189,-46630,-46061,-45483,-44896,-44299,-43692,-43074,-42444,-41802,-41149,-40484,-39806,-39115,-38409,-37690,-36958,-36212,-35452,-34677,-33886,-33081,-32262,-31428,-30579,-29714,-28834,-27940,-27031,-26108,-25170,-24216,-23248,-22267,-21273,-20266,-19245,-18211,-17165,-16108,-15042,-13965,-12879,-11783,-10680,-9573,-8461,-7345,-6226,-5106,-3988,-2873,-1765,-662,432,1515,2583,3633,4662,5670,6653,7606,8525,9405,10244,11038,11783,12472,13096,13651,14131,14529,14837,15042,15133,15098,14925,14600,14106,13418,12515,11375,9974,8288,6286,3941,1233,-1844,-5286,-9071,-13162,-17489,-21961,-26470,-30909,-35186,-39225,-42965,-46371,-49431,-52152,-54554,-56658,-58487,-60066,-61423,-62584,-63573,-64409,-65107,-65684,-66154,-66533,-66830,-67053,-67210,-67308,-67354,-67355,-67316,-67238,-67126,-66982,-66812,-66617,-66398,-66158,-65896,-65615,-65317,-65003,-64673,-64327,-63965,-63588,-63198,-62794,-62377,-61944,-61496,-61035,-60560,-60071,-59568,-59048,-58513,-57963,-57398,-56818,-56220,-55605,-54972,-54323,-53657,-52973,-52270,-51547,-50806,-50047,-49268,-48470,-47652,-46813,-45954,-45077,-44179,-43261,-42323,-41364,-40386,-39390,-38374,-37339,-36285,-35212,-34122,-33016,-31894,-30755,-29599,-28430,-27248,-26054,-24848,-23631,-22404,-21169,-19927,-18681,-17430,-16175,-14918,-13662,-12409,-11159,-9914,-8674,-7442,-6221,-5013,-3818,-2638,-1474,-328,796,1897,2975,4027,5052,6049,7013,7942,8837,9695,10515,11294,12026,12711,13346,13929,14456,14922,15322,15651,15905,16079,16165,16152,16031,15793,15428,14922,14259,13419,12384,11133,9645,7896,5857,3502,811,-2227,-5615,-9348,-13399,-17716,-22222,-26825,-31425,-35928,-40247,-44310,-48066,-51492,-54584,-57352,-59808,-61974,-63873,-65531,-66977,-68232,-69314,-70242,-71033,-71703,-72267,-72734,-73113,-73413,-73641,-73806,-73914,-73969,-73974,-73932,-73849,-73727,-73569,-73377,-73150,-72892,-72604,-72288,-71945,-71574,-71176,-70752,-70302,-69829,-69330,-68807,-68257,-67684,-67086,-66464,-65818,-65147,-64450,-63728,-62983,-62214,-61419,-60599,-59754,-58884,-57990,-57072,-56130,-55163,-54171,-53157,-52120,-51061,-49980,-48876,-47751,-46607,-45444,-44263,-43064,-41847,-40616,-39370,-38113,-36843,-35563,-34273,-32975,-31673,-30366,-29056,-27743,-26430,-25119,-23812,-22511,-21215,-19926,-18646,-17377,-16121,-14880,-13652,-12440,-11245,-10069,-8913,-7779,-6665,-5573,-4505,-3461,-2444,-1453,-487,451,1362,2242,3092,3912,4701,5458,6182,6870,7523,8138,8717,9256,9753,10205,10610,10967,11273,11524,11714,11839,11894,11876,11777,11588,11299,10902,10385,9737,8944,7987,6846,5504,3939,2130,50,-2325,-5017,-8039,-11396,-15082,-19078,-23343,-27811,-32397,-37007,-41551,-45942,-50106,-53988,-57554,-60792,-63708,-66311,-68620,-70652,-72434,-73990,-75344,-76515,-77520,-78375,-79096,-79699,-80194,-80590,-80896,-81118,-81266,-81345,-81361,-81316,-81214,-81059,-80855,-80604,-80309,-79970,-79589,-79167,-78707,-78210,-77677,-77107,-76502,-75861,-75188,-74482,-73743,-72971,-72166,-71330,-70465,-69569,-68643,-67688,-66703,-65690,-64651,-63586,-62495,-61378,-60237,-59074,-57891,-56687,-55463,-54221,-52962,-51689,-50403,-49106,-47797,-46479,-45154,-43825,-42493,-41159,-39824,-38490,-37160,-35835,-34518,-33208,-31906,-30615,-29337,-28073,-26825,-25591,-24374,-23175,-21994,-20834,-19695,-18576,-17477,-16400,-15347,-14317,-13309,-12325,-11363,-10425,-9511,-8622,-7757,-6914,-6096,-5301,-4532,-3787,-3066,-2369,-1697,-1050,-429,166,735,1278,1794,2280,2737,3162,3556,3917,4243,4531,4778,4982,5142,5253,5310,5309,5243,5110,4901,4610,4227,3740,3140,2416,1553,535,-657,-2044,-3644,-5479,-7573,-9949,-12631,-15633,-18958,-22604,-26551,-30763,-35181,-39724,-44301,-48821,-53199,-57363,-61253,-64832,-68083,-71008,-73616,-75924,-77948,-79710,-81236,-82548,-83668,-84612,-85394,-86031,-86537,-86924,-87204,-87382,-87466,-87464,-87383,-87229,-87006,-86715,-86362,-85950,-85483,-84963,-84393,-83772,-83104,-82391,-81635,-80838,-80000,-79122,-78207,-77255,-76270,-75252,-74203,-73122,-72012,-70875,-69715,-68530,-67324,-66096,-64849,-63587,-62311,-61022,-59721,-58411,-57094,-55773,-54450,-53125,-51801,-50478,-49159,-47848,-46545,-45250,-43966,-42694,-41434,-40191,-38964,-37753,-36558,-35382,-34226,-33090,-31975,-30879,-29805,-28751,-27719,-26709,-25722,-24755,-23809,-22885,-21982,-21101,-20241,-19401,-18580,-17779,-16998,-16237,-15495,-14770,-14063,-13375,-12704,-12051,-11416,-10796,-10192,-9606,-9036,-8484,-7948,-7427,-6924,-6438,-5971,-5522,-5091,-4678,-4287,-3917,-3571,-3249,-2951,-2680,-2439,-2230,-2056,-1918,-1820,-1766,-1761,-1810,-1917,-2088,-2328,-2648,-3056,-3562,-4176,-4910,-5777,-6796,-7985,-9362,-10947,-12761,-14829,-17176,-19823,-22783,-26061,-29652,-33541,-37690,-42038,-46501,-50991,-55416,-59692,-63743,-67509,-70951,-74057,-76827,-79270,-81400,-83236,-84800,-86118,-87214,-88107,-88814,-89349,-89731,-89974,-90092,-90093,-89985,-89776,-89476,-89092,-88631,-88097,-87493,-86824,-86097,-85315,-84482,-83601,-82674,-81705,-80697,-79656,-78582,-77478,-76346,-75190,-74012,-72817,-71606,-70381,-69143,-67897,-66645,-65389,-64132,-62873,-61616,-60363,-59117,-57879,-56650,-55431,-54223,-53029,-51849,-50686,-49539,-48408,-47294,-46199,-45125,-44069,-43033,-42016,-41018,-40041,-39085,-38149,-37232,-36333,-35454,-34595,-33754,-32932,-32127,-31339,-30567,-29813,-29075,-28352,-27643,-26948,-26267,-25599,-24945,-24302,-23670,-23049,-22439,-21839,-21249,-20668,-20095,-19531,-18975,-18428,-17889,-17356,-16830,-16311,-15800,-15298,-14802,-14313,-13831,-13357,-12893,-12438,-11991,-11554,-11127,-10712,-10311,-9923,-9549,-9190,-8849,-8527,-8228,-7951,-7698,-7472,-7276,-7115,-6992,-6910,-6871,-6881,-6948,-7079,-7279,-7555,-7916,-8373,-8940,-9630,-10457,-11436,-12585,-13927,-15488,-17288,-19348,-21689,-24330,-27287,-30561,-34135,-37973,-42020,-46210,-50456,-54660,-58725,-62567,-66128,-69369,-72268,-74814,-77011,-78878,-80441,-81725,-82751,-83541,-84117,-84503,-84720,-84786,-84715,-84518,-84208,-83801,-83308,-82737,-82096,-81389,-80627,-79817,-78966,-78078,-77157,-76207,-75233,-74241,-73235,-72217,-71188,-70151,-69111,-68071,-67032,-65996,-64964,-63937,-62917,-61908,-60910,-59922,-58946,-57982,-57031,-56096,-55176,-54270,-53378,-52501,-51640,-50796,-49967,-49153,-48353,-47568,-46798,-46043,-45303,-44575,-43860,-43157,-42468,-41791,-41125,-40469,-39823,-39186,-38559,-37941,-37331,-36727,-36129,-35538,-34953,-34373,-33797,-33224,-32654,-32087,-31524,-30962,-30400,-29839,-29278,-28717,-28157,-27595,-27032,-26467,-25900,-25332,-24763,-24190,-23615,-23036,-22456,-21873,-21288,-20700,-20109,-19515,-18920,-18323,-17725,-17124,-16521,-15917,-15314,-14711,-14108,-13506,-12903,-12303,-11707,-11115,-10527,-9942,-9363,-8792,-8231,-7681,-7141,-6613,-6101,-5608,-5137,-4690,-4269,-3878,-3523,-3211,-2948,-2739,-2590,-2511,-2515,-2615,-2823,-3152,-3617,-4241,-5047,-6059,-7302,-8795,-10565,-12638,-15037,-17769,-20825,-24178,-27791,-31603,-35532,-39480,-43341,-47029,-50479,-53641,-56484,-58991,-61165,-63027,-64600,-65910,-66978,-67828,-68485,-68974,-69317,-69532,-69631,-69627,-69536,-69370,-69140,-68853,-68514,-68132,-67712,-67261,-66785,-66286,-65766,-65229,-64679,-64120,-63553,-62979,-62399,-61815,-61230,-60645,-60061,-59477,-58893,-58312,-57734,-57161,-56591,-56024,-55460,-54899,-54344,-53792,-53245,-52700,-52157,-51618,-51081,-50548,-50016,-49485,-48955,-48426,-47897,-47369,-46839,-46307,-45774,-45238,-44700,-44160,-43614,-43064,-42508,-41948,-41383,-40811,-40231,-39644,-39049,-38447,-37836,-37217,-36587,-35947,-35297,-34638,-33969,-33288,-32595,-31891,-31176,-30450,-29712,-28962,-28199,-27423,-26636,-25838,-25027,-24204,-23368,-22519,-21660,-20789,-19906,-19011,-18103,-17185,-16257,-15319,-14371,-13411,-12442,-11465,-10482,-9491,-8494,-7490,-6482,-5472,-4462,-3452,-2443,-1436,-437,554,1532,2496,3445,4375,5280,6155,6997,7802,8566,9282,9943,10539,11066,11515,11879,12144,12298,12326,12215,11950,11515,10883,10031,8934,7568,5908,3926,1594,-1107,-4182,-7619,-11387,-15441,-19706,-24087,-28472,-32753,-36841,-40669,-44188,-47370,-50206,-52706,-54893,-56794,-58431,-59830,-61016,-62014,-62849,-63540,-64103,-64551,-64899,-65160,-65347,-65466,-65524,-65529,-65486,-65402,-65284,-65132,-64951,-64742,-64510,-64259,-63988,-63701,-63398,-63079,-62747,-62403,-62049,-61683,-61307,-60919,-60522,-60117,-59702,-59278,-58843,-58399,-57945,-57483,-57010,-56527,-56032,-55527,-55010,-54483,-53944,-53392,-52826,-52248,-51656,-51051,-50432,-49797,-49147,-48481,-47800,-47104,-46390,-45659,-44911,-44146,-43365,-42565,-41747,-40911,-40056,-39184,-38294,-37386,-36459,-35514,-34550,-33570,-32572,-31557,-30525,-29475,-28409,-27329,-26233,-25123,-23998,-22859,-21708,-20546,-19374,-18192,-17000,-15801,-14596,-13386,-12174,-10958,-9741,-8524,-7311,-6103,-4902,-3707,-2521,-1346,-187,956,2081,3188,4273,5334,6366,7369,8341,9280,10183,11046,11864,12637,13361,14034,14650,15203,15689,16103,16441,16695,16857,16917,16864,16690,16383,15929,15309,14504,13494,12259,10776,9019,6957,4567,1831,-1263,-4714,-8511,-12621,-16980,-21505,-26096,-30654,-35084,-39299,-43235,-46848,-50124,-53064,-55681,-57992,-60019,-61786,-63324,-64658,-65809,-66796,-67636,-68347,-68945,-69443,-69851,-70177,-70428,-70616,-70745,-70822,-70851,-70835,-70777,-70682,-70554,-70395,-70205,-69985,-69738,-69467,-69172,-68853,-68511,-68146,-67759,-67352,-66924,-66475,-66005,-65513,-65001,-64469,-63917,-63343,-62748,-62131,-61492,-60833,-60153,-59450,-58724,-57976,-57206,-56414,-55599,-54761,-53900,-53015,-52109,-51180,-50229,-49255,-48258,-47240,-46200,-45140,-44060,-42958,-41837,-40697,-39540,-38366,-37175,-35968,-34747,-33512,-32267,-31010,-29744,-28468,-27185,-25897,-24606,-23312,-22016,-20721,-19427,-18137,-16853,-15576,-14306,-13046,-11796,-10560,-9340,-8134,-6945,-5774,-4622,-3492,-2386,-1302,-241,794,1802,2781,3730,4650,5540,6398,7221,8008,8758,9471,10146,10779,11368,11911,12406,12850,13242,13576,13848,14053,14186,14245,14220,14103,13885,13556,13107,12525,11796,10900,9819,8535,7027,5272,3242,913,-1736,-4720,-8044,-11705,-15684,-19939,-24403,-28990,-33606,-38160,-42561,-46734,-50622,-54192,-57434,-60351,-62954,-65261,-67291,-69072,-70629,-71985,-73159,-74169,-75032,-75765,-76381,-76894,-77310,-77638,-77887,-78066,-78179,-78232,-78228,-78171,-78064,-77913,-77718,-77483,-77207,-76893,-76542,-76157,-75738,-75286,-74801,-74283,-73734,-73155,-72546,-71906,-71236,-70536,-69806,-69049,-68263,-67447,-66603,-65730,-64829,-63903,-62949,-61967,-60959,-59925,-58867,-57785,-56679,-55550,-54398,-53225,-52033,-50823,-49595,-48349,-47088,-45813,-44527,-43230,-41924,-40608,-39287,-37961,-36633,-35304,-33975,-32647,-31323,-30004,-28692,-27389,-26095,-24812,-23541,-22284,-21044,-19819,-18610,-17420,-16248,-15098,-13968,-12860,-11774,-10709,-9668,-8652,-7660,-6693,-5749,-4830,-3938,-3072,-2232,-1418,-630,132,865,1569,2245,2893,3513,4102,4659,5183,5674,6131,6553,6936,7279,7578,7833,8041,8198,8298,8337,8311,8214,8042,7783,7430,6972,6399,5700,4860,3863,2688,1317,-270,-2094,-4179,-6552,-9234,-12237,-15568,-19222,-23182,-27410,-31845,-36405,-40999,-45536,-49932,-54113,-58018,-61613,-64882,-67826,-70457,-72788,-74838,-76631,-78191,-79542,-80704,-81692,-82523,-83213,-83777,-84227,-84571,-84818,-84974,-85049,-85048,-84979,-84842,-84642,-84383,-84068,-83701,-83284,-82819,-82305,-81746,-81144,-80501,-79817,-79093,-78329,-77528,-76691,-75819,-74913,-73972,-72999,-71993,-70959,-69896,-68804,-67686,-66541,-65372,-64181,-62970,-61739,-60490,-59223,-57942,-56649,-55345,-54031,-52709,-51382,-50051,-48718,-47386,-46055,-44726,-43402,-42086,-40778,-39481,-38194,-36918,-35657,-34411,-33182,-31970,-30775,-29598,-28440,-27304,-26189,-25094,-24020,-22967,-21937,-20929,-19944,-18980,-18038,-17118,-16220,-15345,-14491,-13659,-12847,-12056,-11287,-10539,-9811,-9104,-8415,-7747,-7100,-6473,-5866,-5278,-4709,-4161,-3635,-3130,-2646,-2184,-1744,-1328,-937,-573,-236,74,353,599,809,980,1112,1201,1242,1229,1158,1024,822,544,181,-278,-842,-1520,-2327,-3278,-4391,-5686,-7181,-8896,-10854,-13080,-15598,-18425,-21571,-25036,-28810,-32867,-37160,-41615,-46146,-50661,-55073,-59302,-63280,-66956,-70305,-73321,-76009,-78383,-80457,-82252,-83792,-85102,-86204,-87114,-87850,-88426,-88859,-89162,-89348,-89422,-89394,-89270,-89060,-88770,-88405,-87968,-87464,-86895,-86268,-85586,-84852,-84066,-83232,-82353,-81432,-80472,-79474,-78440,-77372,-76273,-75147,-73995,-72819,-71620,-70400,-69164,-67913,-66650,-65377,-64094,-62804,-61510,-60215,-58921,-57628,-56338,-55054,-53777,-52510,-51253,-50008,-48775,-47556,-46354,-45168,-44000,-42849,-41717,-40603,-39511,-38439,-37387,-36355,-35343,-34353,-33384,-32436,-31508,-30599,-29711,-28842,-27994,-27164,-26353,-25560,-24784,-24025,-23285,-22560,-21851,-21156,-20477,-19812,-19162,-18525,-17901,-17288,-16689,-16102,-15527,-14963,-14410,-13868,-13337,-12817,-12310,-11812,-11325,-10849,-10386,-9935,-9497,-9072,-8659,-8262,-7880,-7517,-7171,-6843,-6536,-6251,-5992,-5761,-5558,-5386,-5248,-5149,-5094,-5086,-5128,-5226,-5386,-5617,-5928,-6324,-6817,-7416,-8135,-8993,-10003,-11183,-12550,-14127,-15939,-18012,-20366,-23016,-25977,-29256,-32847,-36724,-40835,-45112,-49475,-53834,-58096,-62171,-65984,-69488,-72658,-75484,-77966,-80113,-81943,-83482,-84755,-85787,-86597,-87202,-87624,-87882,-87993,-87970,-87823,-87563,-87200,-86747,-86211,-85600,-84917,-84170,-83366,-82511,-81611,-80670,-79689,-78674,-77630,-76562,-75474,-74367,-73243,-72106,-70960,-69809,-68655,-67498,-66341,-65186,-64036,-62893,-61759,-60633,-59517,-58413,-57323,-56248,-55188,-54142,-53112,-52099,-51103,-50126,-49167,-48224,-47299,-46392,-45503,-44633,-43780,-42944,-42124,-41320,-40534,-39764,-39009,-38269,-37542,-36829,-36130,-35445,-34771,-34107,-33455,-32813,-32182,-31560,-30946,-30340,-29741,-29149,-28565,-27986,-27411,-26841,-26276,-25715,-25158,-24604,-24052,-23502,-22955,-22410,-21867,-21325,-20784,-20244,-19706,-19170,-18636,-18102,-17569,-17037,-16509,-15984,-15461,-14940,-14422,-13909,-13402,-12900,-12404,-11913,-11431,-10957,-10495,-10044,-9604,-9177,-8766,-8372,-8000,-7648,-7319,-7016,-6743,-6505,-6306,-6148,-6036,-5976,-5978,-6049,-6198,-6433,-6763,-7205,-7776,-8492,-9370,-10428,-11689,-13180,-14927,-16954,-19276,-21904,-24845,-28095,-31626,-35385,-39297,-43277,-47236,-51084,-54734,-58114,-61177,-63905,-66294,-68352,-70091,-71528,-72693,-73614,-74319,-74829,-75163,-75340,-75382,-75308,-75131,-74863,-74513,-74093,-73612,-73081,-72507,-71894,-71246,-70570,-69871,-69155,-68424,-67680,-66925,-66164,-65398,-64632,-63865,-63098,-62333,-61571,-60815,-60066,-59322,-58586,-57856,-57134,-56422,-55719,-55025,-54339,-53662,-52994,-52336,-51687,-51047,-50415,-49790,-49174,-48566,-47965,-47371,-46782,-46199,-45622,-45050,-44483,-43920,-43358,-42800,-42244,-41691,-41138,-40586,-40033,-39479,-38925,-38370,-37813,-37252,-36687,-36119,-35548,-34972,-34391,-33804,-33211,-32612,-32007,-31395,-30776,-30148,-29513,-28871,-28221,-27562,-26895,-26218,-25533,-24840,-24139,-23428,-22709,-21979,-21242,-20497,-19743,-18980,-18208,-17428,-16640,-15846,-15043,-14233,-13414,-12589,-11759,-10923,-10083,-9236,-8385,-7531,-6676,-5821,-4965,-4110,-3258,-2412,-1574,-748,68,870,1652,2411,3142,3839,4502,5122,5692,6203,6645,7011,7293,7478,7550,7491,7286,6918,6368,5611,4618,3361,1814,-45,-2240,-4792,-7713,-10995,-14604,-18485,-22569,-26766,-30975,-35087,-39006,-42663,-46015,-49040,-51729,-54086,-56129,-57885,-59383,-60649,-61706,-62575,-63280,-63842,-64281,-64610,-64841,-64985,-65054,-65058,-65007,-64907,-64760,-64574,-64354,-64106,-63833,-63537,-63220,-62885,-62535,-62173,-61799,-61415,-61021,-60619,-60209,-59794,-59374,-58948,-58516,-58078,-57637,-57192,-56743,-56289,-55829,-55364,-54896,-54422,-53944,-53458,-52966,-52468,-51964,-51453,-50934,-50406,-49869,-49323,-48769,-48206,-47631,-47045,-46448,-45840,-45220,-44588,-43942,-43283,-42610,-41924,-41224,-40509,-39779,-39033,-38272,-37496,-36705,-35897,-35073,-34233,-33376,-32505,-31617,-30713,-29792,-28854,-27902,-26934,-25951,-24952,-23938,-22909,-21866,-20811,-19742,-18660,-17564,-16458,-15343,-14218,-13085,-11942,-10793,-9639,-8482,-7323,-6163,-5002,-3843,-2689,-1542,-404,724,1841,2943,4026,5088,6127,7141,8128,9082,10000,10877,11712,12502,13241,13924,14544,15096,15576,15977,16292,16508,16617,16608,16470,16191,15753,15137,14320,13285,12009,10467,8628,6465,3956,1087,-2148,-5742,-9672,-13887,-18309,-22841,-27378,-31823,-36083,-40084,-43772,-47122,-50130,-52807,-55170,-57238,-59038,-60596,-61941,-63098,-64085,-64921,-65623,-66208,-66691,-67083,-67393,-67630,-67800,-67914,-67977,-67993,-67967,-67901,-67801,-67669,-67509,-67322,-67109,-66872,-66613,-66334,-66035,-65718,-65382,-65027,-64655,-64267,-63863,-63442,-63003,-62548,-62076,-61589,-61085,-60564,-60024,-59468,-58893,-58302,-57693,-57065,-56417,-55750,-55065,-54361,-53636,-52891,-52125,-51339,-50533,-49706,-48859,-47989,-47099,-46187,-45256,-44304,-43331,-42337,-41322,-40288,-39235,-38163,-37073,-35963,-34835,-33692,-32533,-31360,-30171,-28968,-27752,-26526,-25290,-24046,-22792,-21532,-20266,-18998,-17728,-16457,-15186,-13917,-12652,-11393,-10142,-8900,-7666,-6445,-5237,-4046,-2872,-1715,-578,538,1630,2697,3737,4751,5736,6690,7611,8497,9347,10161,10936,11669,12356,12997,13589,14130,14616,15043,15405,15698,15919,16063,16121,16084,15943,15689,15313,14802,14138,13304,12282,11054,9597,7888,5898,3603,981,-1981,-5290,-8944,-12923,-17180,-21646,-26234,-30849,-35397,-39785,-43937,-47796,-51333,-54539,-57418,-59983,-62249,-64242,-65988,-67513,-68839,-69987,-70973,-71816,-72534,-73139,-73642,-74054,-74381,-74634,-74819,-74944,-75012,-75026,-74992,-74912,-74792,-74632,-74435,-74201,-73933,-73633,-73303,-72943,-72552,-72132,-71684,-71208,-70705,-70176,-69619,-69035,-68424,-67788,-67126,-66437,-65721,-64978,-64209,-63415,-62596,-61749,-60877,-59978,-59053,-58105,-57131,-56133,-55110,-54062,-52992,-51900,-50785,-49650,-48493,-47316,-46121,-44910,-43682,-42438,-41179,-39908,-38626,-37334,-36034,-34726,-33412,-32095,-30775,-29455,-28136,-26819,-25505,-24197,-22896,-21605,-20324,-19052,-17794,-16550,-15322,-14111,-12918,-11742,-10586,-9451,-8338,-7248,-6181,-5137,-4117,-3123,-2156,-1215,-301,587,1446,2276,3076,3846,4586,5296,5973,6615,7223,7796,8333,8831,9289,9703,10072,10395,10669,10889,11051,11149,11181,11141,11022,10816,10513,10104,9579,8928,8134,7180,6047,4718,3172,1388,-662,-3001,-5651,-8626,-11931,-15566,-19514,-23736,-28171,-32737,-37344,-41900,-46319,-50523,-54454,-58073,-61368,-64339,-66996,-69354,-71431,-73252,-74843,-76226,-77422,-78446,-79316,-80048,-80658,-81156,-81552,-81853,-82068,-82205,-82271,-82270,-82206,-82082,-81902,-81670,-81390,-81063,-80689,-80271,-79811,-79310,-78771,-78194,-77577,-76924,-76234,-75510,-74752,-73960,-73134,-72275,-71384,-70462,-69510,-68529,-67517,-66476,-65409,-64316,-63198,-62055,-60887,-59698,-58489,-57261,-56015,-54752,-53474,-52182,-50880,-49567,-48247,-46920,-45587,-44251,-42914,-41579,-40246,-38915,-37590,-36272,-34964,-33666,-32379,-31105,-29844,-28598,-27370,-26160,-24967,-23793,-22638,-21504,-20392,-19302,-18232,-17185,-16160,-15158,-14180,-13225,-12292,-11382,-10495,-9632,-8792,-7975,-7181,-6409,-5660,-4935,-4233,-3553,-2896,-2262,-1652,-1066,-505,33,546,1033,1493,1924,2327,2700,3042,3350,3622,3856,4048,4199,4303,4355,4351,4285,4154,3952,3669,3298,2826,2246,1546,713,-270,-1422,-2762,-4308,-6081,-8106,-10406,-13006,-15919,-19154,-22710,-26572,-30712,-35073,-39580,-44143,-48673,-53084,-57297,-61247,-64893,-68212,-71203,-73874,-76236,-78307,-80108,-81665,-83001,-84138,-85090,-85875,-86509,-87006,-87381,-87642,-87798,-87855,-87823,-87708,-87518,-87255,-86923,-86525,-86066,-85551,-84982,-84359,-83686,-82964,-82197,-81386,-80535,-79642,-78710,-77740,-76736,-75700,-74633,-73535,-72408,-71254,-70076,-68877,-67658,-66419,-65163,-63892,-62609,-61316,-60014,-58705,-57391,-56074,-54757,-53442,-52130,-50822,-49520,-48226,-46942,-45671,-44411,-43165,-41933,-40717,-39519,-38339,-37177,-36034,-34911,-33807,-32726,-31666,-30626,-29606,-28608,-27632,-26678,-25744,-24832,-23939,-23066,-22215,-21384,-20572,-19779,-19004,-18247,-17509,-16789,-16086,-15399,-14727,-14073,-13435,-12812,-12205,-11611,-11032,-10468,-9920,-9387,-8867,-8361,-7871,-7396,-6939,-6497,-6070,-5661,-5271,-4900,-4551,-4223,-3918,-3636,-3383,-3159,-2967,-2809,-2687,-2605,-2569,-2583,-2651,-2777,-2968,-3232,-3578,-4015,-4552,-5198,-5969,-6880,-7949,-9192,-10629,-12279,-14168,-16321,-18761,-21503,-24558,-27931,-31615,-35585,-39790,-44159,-48609,-53051,-57394,-61552,-65452,-69047,-72309,-75232,-77819,-80078,-82027,-83688,-85087,-86249,-87193,-87937,-88499,-88896,-89147,-89263,-89256,-89133,-88905,-88581,-88171,-87681,-87115,-86478,-85775,-85014,-84199,-83334,-82422,-81465,-80468,-79437,-78373,-77281,-76162,-75019,-73854,-72674,-71480,-70274,-69058,-67834,-66605,-65375,-64146,-62919,-61695,-60476,-59264,-58062,-56872,-55693,-54526,-53373,-52236,-51116,-50012,-48926,-47857,-46807,-45775,-44764,-43772,-42799,-41844,-40909,-39993,-39098,-38221,-37362,-36520,-35696,-34891,-34103,-33331,-32575,-31833,-31107,-30395,-29698,-29014,-28342,-27682,-27033,-26397,-25770,-25154,-24546,-23947,-23357,-22775,-22201,-21634,-21072,-20517,-19969,-19427,-18891,-18359,-17832,-17311,-16795,-16285,-15780,-15279,-14784,-14294,-13812,-13337,-12868,-12406,-11952,-11507,-11073,-10649,-10237,-9836,-9449,-9079,-8726,-8392,-8078,-7785,-7517,-7279,-7071,-6896,-6758,-6660,-6609,-6610,-6669,-6791,-6983,-7253,-7615,-8080,-8658,-9362,-10207,-11215,-12407,-13804,-15425,-17294,-19433,-21868,-24615,-27675,-31038,-34679,-38559,-42616,-46763,-50902,-54937,-58783,-62376,-65663,-68610,-71201,-73444,-75355,-76958,-78271,-79317,-80121,-80709,-81107,-81334,-81407,-81340,-81150,-80852,-80461,-79986,-79435,-78816,-78139,-77412,-76643,-75837,-74997,-74128,-73236,-72327,-71403,-70468,-69523,-68571,-67616,-66661,-65708,-64757,-63810,-62867,-61933,-61008,-60093,-59188,-58293,-57410,-56539,-55682,-54838,-54007,-53189,-52383,-51592,-50816,-50053,-49303,-48565,-47839,-47127,-46428,-45741,-45064,-44397,-43741,-43096,-42461,-41834,-41216,-40604,-40000,-39403,-38813,-38228,-37647,-37070,-36498,-35929,-35363,-34799,-34235,-33673,-33111,-32550,-31989,-31425,-30860,-30293,-29725,-29154,-28580,-28002,-27420,-26835,-26246,-25653,-25056,-24453,-23845,-23233,-22616,-21995,-21369,-20737,-20100,-19459,-18815,-18166,-17512,-16854,-16192,-15527,-14860,-14190,-13516,-12840,-12162,-11485,-10807,-10129,-9450,-8773,-8099,-7430,-6766,-6107,-5454,-4810,-4179,-3563,-2963,-2380,-1819,-1284,-782,-317,108,486,811,1070,1254,1352,1354,1248,1016,636,88,-647,-1592,-2771,-4215,-5954,-8011,-10400,-13128,-16193,-19578,-23242,-27113,-31100,-35107,-39039,-42810,-46342,-49579,-52489,-55067,-57322,-59269,-60924,-62312,-63459,-64395,-65145,-65729,-66164,-66469,-66659,-66753,-66762,-66696,-66563,-66371,-66129,-65846,-65526,-65173,-64792,-64385,-63958,-63516,-63059,-62590,-62109,-61619,-61124,-60624,-60121,-59614,-59104,-58592,-58080,-57569,-57058,-56547,-56035,-55524,-55015,-54508,-54001,-53494,-52986,-52480,-51974,-51468,-50961,-50452,-49941,-49429,-48916,-48400,-47880,-47355,-46827,-46295,-45758,-45215,-44665,-44109,-43545,-42975,-42396,-41810,-41213,-40606,-39990,-39365,-38729,-38082,-37422,-36751,-36068,-35373,-34667,-33946,-33212,-32465,-31705,-30932,-30146,-29345,-28530,-27701,-26859,-26003,-25134,-24250,-23352,-22440,-21517,-20580,-19630,-18666,-17690,-16702,-15704,-14694,-13674,-12642,-11601,-10553,-9497,-8436,-7368,-6294,-5218,-4142,-3067,-1993,-923,143,1200,2245,3275,4290,5286,6261,7209,8126,9007,9851,10653,11407,12106,12742,13311,13806,14220,14542,14760,14861,14836,14670,14349,13851,13152,12233,11071,9641,7914,5862,3457,687,-2453,-5955,-9794,-13922,-18260,-22710,-27162,-31516,-35682,-39588,-43181,-46432,-49339,-51913,-54174,-56144,-57847,-59309,-60558,-61622,-62520,-63270,-63890,-64393,-64797,-65113,-65352,-65520,-65626,-65676,-65679,-65640,-65562,-65449,-65303,-65129,-64932,-64711,-64470,-64208,-63927,-63630,-63319,-62993,-62653,-62299,-61931,-61551,-61160,-60757,-60341,-59912,-59472,-59020,-58556,-58080,-57590,-57087,-56571,-56042,-55500,-54943,-54371,-53784,-53181,-52564,-51931,-51282,-50615,-49931,-49230,-48512,-47776,-47021,-46248,-45455,-44645,-43816,-42968,-42100,-41213,-40306,-39380,-38436,-37473,-36491,-35489,-34469,-33432,-32377,-31305,-30215,-29109,-27987,-26851,-25702,-24538,-23361,-22172,-20973,-19764,-18548,-17324,-16093,-14857,-13618,-12379,-11139,-9900,-8663,-7430,-6205,-4988,-3782,-2585,-1402,-234,916,2045,3154,4242,5304,6340,7345,8318,9259,10165,11033,11860,12643,13379,14067,14704,15285,15805,16258,16642,16952,17181,17322,17364,17298,17117,16810,16361,15755,14972,13995,12805,11379,9690,7711,5416,2786,-193,-3527,-7212,-11222,-15506,-19987,-24576,-29175,-33685,-38016,-42093,-45864,-49306,-52414,-55194,-57659,-59829,-61732,-63393,-64840,-66093,-67173,-68097,-68885,-69553,-70113,-70578,-70954,-71252,-71480,-71646,-71756,-71813,-71821,-71784,-71708,-71594,-71446,-71265,-71051,-70807,-70535,-70237,-69914,-69564,-69188,-68788,-68366,-67920,-67451,-66959,-66443,-65904,-65343,-64760,-64153,-63522,-62868,-62191,-61492,-60769,-60022,-59251,-58455,-57636,-56795,-55929,-55039,-54125,-53187,-52227,-51244,-50238,-49209,-48157,-47083,-45990,-44876,-43743,-42589,-41417,-40228,-39023,-37803,-36569,-35320,-34059,-32789,-31509,-30222,-28928,-27628,-26324,-25019,-23714,-22411,-21109,-19810,-18518,-17233,-15958,-14693,-13439,-12197,-10970,-9760,-8568,-7394,-6238,-5103,-3990,-2900,-1836,-795,221,1210,2171,3102,4004,4876,5717,6527,7302,8041,8745,9412,10042,10631,11177,11678,12133,12539,12894,13193,13431,13604,13709,13740,13691,13552,13315,12971,12510,11920,11186,10291,9216,7943,6453,4721,2722,430,-2175,-5108,-8378,-11984,-15911,-20119,-24548,-29114,-33730,-38302,-42739,-46962,-50910,-54548,-57861,-60849,-63520,-65891,-67980,-69816,-71422,-72821,-74034,-75076,-75967,-76724,-77360,-77888,-78315,-78651,-78905,-79084,-79196,-79244,-79232,-79163,-79043,-78875,-78662,-78405,-78105,-77764,-77385,-76969,-76517,-76030,-75507,-74949,-74359,-73737,-73083,-72396,-71677,-70927,-70147,-69337,-68497,-67627,-66727,-65799,-64842,-63859,-62849,-61811,-60747,-59658,-58545,-57410,-56252,-55072,-53871,-52651,-51415,-50163,-48895,-47613,-46318,-45014,-43701,-42381,-41055,-39724,-38391,-37058,-35727,-34398,-33073,-31754,-30441,-29139,-27847,-26567,-25300,-24046,-22808,-21587,-20385,-19200,-18034,-16888,-15763,-14660,-13580,-12522,-11486,-10472,-9483,-8519,-7579,-6663,-5770,-4902,-4060,-3243,-2452,-1685,-943,-227,463,1125,1760,2369,2951,3503,4025,4516,4976,5404,5798,6155,6473,6750,6984,7174,7314,7400,7426,7390,7286,7108,6847,6494,6039,5472,4784,3959,2980,1829,487,-1065,-2847,-4886,-7206,-9829,-12769,-16033,-19622,-23519,-27693,-32085,-36617,-41202,-45749,-50171,-54391,-58346,-61994,-65319,-68318,-71000,-73377,-75467,-77294,-78883,-80256,-81433,-82431,-83267,-83958,-84517,-84958,-85290,-85519,-85656,-85707,-85680,-85580,-85411,-85176,-84879,-84523,-84114,-83653,-83141,-82579,-81970,-81317,-80621,-79884,-79106,-78287,-77430,-76537,-75609,-74647,-73651,-72623,-71564,-70477,-69363,-68222,-67056,-65866,-64655,-63425,-62176,-60912,-59631,-58338,-57034,-55721,-54402,-53078,-51749,-50418,-49088,-47761,-46439,-45121,-43809,-42507,-41215,-39937,-38671,-37418,-36181,-34960,-33757,-32573,-31408,-30261,-29135,-28029,-26945,-25884,-24843,-23823,-22825,-21848,-20895,-19964,-19053,-18164,-17295,-16448,-15622,-14817,-14032,-13266,-12519,-11793,-11086,-10398,-9728,-9075,-8441,-7826,-7230,-6651,-6090,-5546,-5021,-4516,-4031,-3564,-3116,-2690,-2285,-1904,-1547,-1215,-908,-630,-383,-170,8,149,249,304,308,257,148,-26,-272,-598,-1014,-1530,-2154,-2898,-3780,-4815,-6022,-7418,-9024,-10861,-12955,-15331,-18008,-20997,-24305,-27928,-31850,-36030,-40403,-44889,-49399,-53845,-58139,-62206,-65986,-69445,-72572,-75365,-77834,-79992,-81858,-83457,-84815,-85953,-86888,-87639,-88222,-88654,-88950,-89121,-89176,-89122,-88969,-88726,-88401,-87997,-87519,-86971,-86358,-85686,-84959,-84178,-83346,-82467,-81543,-80579,-79578,-78541,-77470,-76367,-75237,-74082,-72906,-71708,-70491,-69258,-68013,-66757,-65494,-64223,-62948,-61670,-60393,-59118,-57849,-56584,-55325,-54076,-52838,-51613,-50401,-49202,-48019,-46852,-45702,-44572,-43460,-42366,-41292,-40237,-39204,-38191,-37198,-36225,-35272,-34339,-33427,-32535,-31663,-30808,-29972,-29155,-28357,-27576,-26812,-26063,-25331,-24614,-23913,-23226,-22553,-21892,-21245,-20610,-19988,-19377,-18777,-18186,-17607,-17038,-16479,-15929,-15387,-14855,-14331,-13818,-13313,-12817,-12330,-11851,-11383,-10925,-10478,-10041,-9615,-9202,-8802,-8418,-8048,-7694,-7357,-7040,-6746,-6475,-6229,-6010,-5820,-5665,-5548,-5472,-5439,-5455,-5526,-5659,-5861,-6139,-6499,-6952,-7512,-8191,-9004,-9965,-11091,-12402,-13924,-15678,-17688,-19973,-22551,-25441,-28651,-32171,-35973,-40009,-44215,-48514,-52812,-57009,-61015,-64761,-68202,-71309,-74066,-76473,-78541,-80294,-81757,-82954,-83904,-84630,-85153,-85497,-85680,-85716,-85619,-85400,-85072,-84649,-84140,-83552,-82891,-82165,-81382,-80550,-79674,-78757,-77804,-76819,-75809,-74777,-73728,-72663,-71584,-70495,-69402,-68305,-67208,-66111,-65016,-63925,-62841,-61767,-60702,-59647,-58603,-57571,-56554,-55552,-54564,-53592,-52634,-51693,-50769,-49862,-48972,-48098,-47239,-46398,-45573,-44765,-43972,-43194,-42431,-41683,-40949,-40230,-39524,-38829,-38146,-37476,-36817,-36169,-35530,-34900,-34279,-33666,-33062,-32464,-31872,-31285,-30704,-30128,-29557,-28989,-28423,-27860,-27299,-26741,-26185,-25629,-25073,-24517,-23962,-23408,-22853,-22296,-21739,-21181,-20622,-20064,-19504,-18943,-18381,-17818,-17256,-16694,-16132,-15569,-15007,-14447];   // residuals ×1000

function marsT(JD) {
  const idx_f = (JD - _MARS_JD0) / _MARS_STEP;
  const i = Math.floor(idx_f);
  const frac = idx_f - i;
  const N = _MARS_R.length;
  if (i < 1 || i >= N - 2) {
    // Linear fallback at edges
    const ii = Math.max(0, Math.min(i, N-2));
    const r = (_MARS_R[ii] + (_MARS_R[ii+1]-_MARS_R[ii])*frac) / 1000;
    return n360(_MARS_L0 + _MARS_N*(ii*_MARS_STEP + frac*_MARS_STEP) + r);
  }
  // Catmull-Rom cubic interpolation on residuals
  const p0 = _MARS_R[i-1]/1000, p1 = _MARS_R[i]/1000;
  const p2 = _MARS_R[i+1]/1000, p3 = _MARS_R[i+2]/1000;
  const t = frac;
  const rInterp = 0.5*((2*p1) + (-p0+p2)*t + (2*p0-5*p1+4*p2-p3)*t*t + (-p0+3*p1-3*p2+p3)*t*t*t);
  return n360(_MARS_L0 + _MARS_N*(i*_MARS_STEP + t*_MARS_STEP) + rInterp);
}

function jupiterT(JD) {
  function jL(tau){const L0=_vsop([[59954691,0,0],[9695899,5.0619179,529.6909651],[573610,1.444062,1059.381930],[306389,5.417347,522.577418],[97178,4.14264,1589.07290],[72903,3.64043,536.80451],[64264,3.41145,103.09277],[39806,2.29377,419.48464],[38858,1.27232,316.39187],[27965,1.78455,7.11355],[13590,5.77481,1162.47470],[8769,3.6301,206.1855],[8246,3.5823,1052.2684],[7368,5.0810,525.7588],[6263,0.0250,522.5774],[6250,4.9296,1898.3512]],tau);const L1=_vsop([[52933090425,0,0],[226916,3.13915,529.69097],[7963,3.1835,1059.3819],[1399,4.4753,1589.0729],[1136,2.0656,536.8045],[706,0.678,7.114],[345,1.782,522.578],[316,1.330,1066.495],[328,0.859,1052.268],[232,1.734,533.623]],tau)*tau;const L2=_vsop([[202778,2.48094,529.69097],[4354,5.9365,1059.38193],[1286,1.2657,536.80451],[384,2.692,1066.495],[349,5.765,7.114],[305,3.792,1052.268]],tau)*tau*tau;return(L0+L1+L2)/1e8;}
  function jR(tau){return _vsop([[520887429,0,0],[25209327,3.4914580,529.6909651],[610600,3.858761,1059.381930],[282029,2.744279,632.783739],[187647,2.076340,522.577418],[86793,0.71001,536.80451],[72063,0.21466,403.57234],[65517,5.97996,316.39187],[56116,3.62251,7.11355],[49796,4.96992,1589.07290],[42822,3.91960,419.48464],[37702,4.89389,1052.26838]],tau)/1e8;}
  return _geoLT(jL, jR, JD);
}

// Saturn — JPL Keplerian elements + perturbation corrections (DE431-calibrated)
// Replaces truncated VSOP87 (L0+L1+L2 only) which had ~1.5° error for historical dates.
// This method matches Swiss Ephemeris / DrikPanchang to within ~0.3° across 1800–2100,
// correctly resolving nakshatra pada boundaries.
function saturnT(JD) {
  const T  = (JD - 2451545.0) / 36525.0;
  const T2 = T * T;
  // Keplerian elements (J2000.0)
  const a  = 9.53667594  + (-0.0000213190) * T;
  const e  = 0.05386179  + (-0.000013618)  * T;
  const I  = 2.48599187  +   0.00193609    * T;
  const L  = n360( 49.95424423 + 1222.49362201 * T);
  const lp = n360( 92.59887831 +    1.9440399  * T);
  const Om = n360(113.66242448 +   (-0.28867794)* T);
  const w  = n360(lp - Om);
  // Mean anomaly + JPL perturbation terms (Table 2b — Saturn)
  const M  = n360(L - lp + 0.00025*T2 - 0.13594*Math.cos(26.4189*T*R) + 0.87519*Math.sin(26.4189*T*R));
  // Eccentric anomaly (Kepler's equation, Newton iteration)
  let E = M + (180/Math.PI) * e * Math.sin(M*R);
  for (let i = 0; i < 10; i++) {
    const dE = (M - E + (180/Math.PI) * e * Math.sin(E*R)) / (1 - e * Math.cos(E*R));
    E += dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  const Er = E * R;
  const xp = a * (Math.cos(Er) - e);
  const yp = a * Math.sqrt(1 - e*e) * Math.sin(Er);
  // Rotate to ecliptic
  const wr = w*R, Or = Om*R, Ir = I*R;
  const xS = (Math.cos(wr)*Math.cos(Or) - Math.sin(wr)*Math.sin(Or)*Math.cos(Ir))*xp
           + (-Math.sin(wr)*Math.cos(Or) - Math.cos(wr)*Math.sin(Or)*Math.cos(Ir))*yp;
  const yS = (Math.cos(wr)*Math.sin(Or) + Math.sin(wr)*Math.cos(Or)*Math.cos(Ir))*xp
           + (-Math.sin(wr)*Math.sin(Or) + Math.cos(wr)*Math.cos(Or)*Math.cos(Ir))*yp;
  // Earth heliocentric (same Keplerian method for consistency)
  const aE  = 1.00000261 + 0.00000562*T;
  const eE  = 0.01671123 + (-0.00004392)*T;
  const LE  = n360(100.46457166 + 35999.37244981*T);
  const lpE = n360(102.93768193 +    0.32327364  *T);
  const ME  = n360(LE - lpE);
  let EE = ME + (180/Math.PI) * eE * Math.sin(ME*R);
  for (let i = 0; i < 10; i++) {
    const dE = (ME - EE + (180/Math.PI)*eE*Math.sin(EE*R)) / (1 - eE*Math.cos(EE*R));
    EE += dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  const EEr = EE * R;
  const xpE = aE * (Math.cos(EEr) - eE);
  const ypE = aE * Math.sqrt(1 - eE*eE) * Math.sin(EEr);
  const wpE = lpE * R;  // Om=0 for Earth
  const xE  =  Math.cos(wpE)*xpE - Math.sin(wpE)*ypE;
  const yE  =  Math.sin(wpE)*xpE + Math.cos(wpE)*ypE;
  // Geocentric tropical longitude
  return n360(Math.atan2(yS - yE, xS - xE) / R);
}

// Rahu — MEAN ascending node (DrikPanchang uses mean node; validated to 0.01° accuracy)
function rahuT(JD) {
  const T  = (JD - 2451545.0) / 36525;
  const T2 = T*T, T3 = T2*T;
  return n360(125.04455 - 1934.136261*T + 0.0020708*T2 + T3/450000);
}

// ─── Ascendant / Lagna — GMST + standard spherical formula ──────────────────
// IMPORTANT: atan2 formula gives the DESCENDANT (western horizon).
// Adding 180° corrects it to the Ascendant (eastern horizon). Validated ✓
function lagnaT(JD, lat, lon) {
  const T = (JD - 2451545.0) / 36525.0;
  const GMST = n360(280.46061837
    + 360.98564736629 * (JD - 2451545.0)
    + 0.000387933 * T * T
    - T * T * T / 38710000.0);
  const LST  = n360(GMST + lon);
  const eps0 = 23.0 + 26.0/60.0 + 21.448/3600.0
    - (46.8150/3600.0)*T - (0.00059/3600.0)*T*T + (0.001813/3600.0)*T*T*T;
  const Om   = n360(125.04452 - 1934.136261*T);
  const eps  = eps0 + 0.00256 * Math.cos(Om * R);
  const latR = lat * R, epsR = eps * R, LSTR = LST * R;
  const Y = -Math.cos(LSTR);
  const X =  Math.sin(LSTR) * Math.cos(epsR) + Math.tan(latR) * Math.sin(epsR);
  // +180° converts from Descendant to Ascendant
  return n360(Math.atan2(Y, X) / R + 180);
}

// ─── Reference Data ───────────────────────────────────
const NAKS = [
  {n:'Ashwini',      l:'Ketu',   d:'Ashwini Kumaras', s:'Horse Head',   g:'Deva',     na:'Vata'},
  {n:'Bharani',      l:'Venus',  d:'Yama',            s:'Yoni',         g:'Manushya', na:'Pitta'},
  {n:'Krittika',     l:'Sun',    d:'Agni',            s:'Razor/Flame',  g:'Rakshasa', na:'Kapha'},
  {n:'Rohini',       l:'Moon',   d:'Brahma',          s:'Chariot',      g:'Manushya', na:'Kapha'},
  {n:'Mrigashira',   l:'Mars',   d:'Soma',            s:'Deer Head',    g:'Deva',     na:'Pitta'},
  {n:'Ardra',        l:'Rahu',   d:'Rudra',           s:'Teardrop',     g:'Manushya', na:'Vata'},
  {n:'Punarvasu',    l:'Jupiter',d:'Aditi',           s:'Bow & Quiver', g:'Deva',     na:'Vata'},
  {n:'Pushya',       l:'Saturn', d:'Brihaspati',      s:'Flower/Udder', g:'Deva',     na:'Pitta'},
  {n:'Ashlesha',     l:'Mercury',d:'Nagas',           s:'Serpent',      g:'Rakshasa', na:'Kapha'},
  {n:'Magha',        l:'Ketu',   d:'Pitris',          s:'Royal Throne', g:'Rakshasa', na:'Kapha'},
  {n:'Purva Phalguni',l:'Venus', d:'Bhaga',           s:'Front Legs/Hammock',g:'Manushya',na:'Pitta'},
  {n:'Uttara Phalguni',l:'Sun',  d:'Aryaman',         s:'Bed/Back Legs',g:'Manushya', na:'Vata'},
  {n:'Hasta',        l:'Moon',   d:'Savitar',         s:'Hand',         g:'Deva',     na:'Vata'},
  {n:'Chitra',       l:'Mars',   d:'Tvashtar',        s:'Bright Jewel', g:'Rakshasa', na:'Pitta'},
  {n:'Swati',        l:'Rahu',   d:'Vayu',            s:'Coral/Sword',  g:'Deva',     na:'Kapha'},
  {n:'Vishakha',     l:'Jupiter',d:'Indra-Agni',      s:'Triumphal Arch',g:'Rakshasa',na:'Kapha'},
  {n:'Anuradha',     l:'Saturn', d:'Mitra',           s:'Lotus',        g:'Deva',     na:'Pitta'},
  {n:'Jyeshtha',     l:'Mercury',d:'Indra',           s:'Earring/Umbrella',g:'Rakshasa',na:'Vata'},
  {n:'Moola',        l:'Ketu',   d:'Nirriti',         s:'Roots/Bundle', g:'Rakshasa', na:'Kapha'},
  {n:'Purva Ashadha',l:'Venus',  d:'Apas',            s:'Elephant Tusk',g:'Manushya', na:'Pitta'},
  {n:'Uttara Ashadha',l:'Sun',   d:'Vishvedevas',     s:'Elephant Tusk',g:'Manushya', na:'Vata'},
  {n:'Shravana',     l:'Moon',   d:'Vishnu',          s:'Ear/Three Steps',g:'Deva',   na:'Kapha'},
  {n:'Dhanishtha',   l:'Mars',   d:'Eight Vasus',     s:'Drum/Flute',   g:'Rakshasa', na:'Pitta'},
  {n:'Shatabhisha',  l:'Rahu',   d:'Varuna',          s:'Empty Circle', g:'Rakshasa', na:'Vata'},
  {n:'Purva Bhadra', l:'Jupiter',d:'Aja Ekapada',     s:'Sword/Front Legs',g:'Manushya',na:'Vata'},
  {n:'Uttara Bhadra',l:'Saturn', d:'Ahir Budhnya',    s:'Back Legs/Twins',g:'Manushya',na:'Pitta'},
  {n:'Revati',       l:'Mercury',d:'Pushan',          s:'Fish/Drum',    g:'Deva',     na:'Kapha'},
];
// Naming letters for each nakshatra's 4 padas
// Order matches NAKS array (Ashwini → Revati)
const NAK_NAMING = [
  ['Chu','Che','Cho','La'],          // Ashwini
  ['Li','Lu','Le','Lo'],          // Bharani
  ['A','I','U','E'],             // Krittika
  ['O','Va','Vi','Vu'],           // Rohini
  ['Ve','Vo','Ka','Ki'],          // Mrigashira
  ['Ku','Gha','Nga','Cha'],            // Ardra
  ['Ke','Ko','Ha','Hi'],          // Punarvasu
  ['Hu','He','Ho','Da'],          // Pushya
  ['Di','Du','De','Do'],          // Ashlesha
  ['Ma','Mi','Mu','Me'],          // Magha
  ['Mo','Ta','Ti','Tu'],          // Purva Phalguni
  ['Te','To','Pa','Pi'],          // Uttara Phalguni
  ['Pu','Sha','Na','Tha'],            // Hasta
  ['Pe','Po','Ra','Ri'],          // Chitra
  ['Ru','Re','Ro','Ta'],          // Swati
  ['Ti','Tu','Te','To'],          // Vishakha
  ['Na','Ni','Nu','Ne'],          // Anuradha
  ['No','Ya','Yi','Yu'],          // Jyeshtha
  ['Ye','Yo','Bha','Bhi'],          // Moola
  ['Bhu','Dha','Pha','Dha2'],          // Purva Ashadha
  ['Bhe','Bho','Ja','Ji'],          // Uttara Ashadha
  ['Ju','Je','Jo','Kha'],          // Shravana
  ['Ga','Gi','Gu','Ge'],          // Dhanishtha
  ['Go','Sa','Si','Su'],          // Shatabhisha
  ['Se','So','Da','Di'],          // Purva Bhadra
  ['Du','Tha','Jha','Nya'],             // Uttara Bhadra
  ['De','Do','Cha','Chi'],          // Revati
];

const RASHI    = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const RASHI_L  = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const YOGAS    = ['Vishkambha','Preeti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarman','Dhriti',
  'Shoola','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyan',
  'Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
const TITHI_N  = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami',
  'Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi'];
const KAR_MOV  = ['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti'];
const KAR_FIX  = ['Shakuni','Chatushpada','Naga','Kimstughna'];
const D_ORDER  = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const D_YEARS  = {Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17};

// ─── Helpers ──────────────────────────────────────────
function getNak(sidMoon) {
  const sp = 360/27;
  const i  = Math.floor(sidMoon / sp) % 27;
  const fr = (sidMoon - i*sp) / sp;
  const p  = Math.min(Math.floor(fr*4) + 1, 4);
  return { i, fr, p, nak: NAKS[i] };
}
function getRashi(sl) {
  const i = Math.floor(sl / 30) % 12;
  const d = sl - i*30;
  const deg = Math.floor(d), mn = Math.floor((d-deg)*60), sc = Math.floor(((d-deg)*60-mn)*60);
  return { i, r:RASHI[i], en:RASHI_EN[i], lord:RASHI_L[i], dms:`${deg}°${mn}'${sc}"` };
}

// Tithi: elongation in Nirayana space, each 12°
function getTithi(ms, ss) {
  const e = n360(ms - ss);
  const t = Math.floor(e / 12); // 0–29
  const nameIdx = t % 15;
  const name = nameIdx === 14 ? (t < 15 ? 'Purnima' : 'Amavasya') : TITHI_N[nameIdx];
  const paksha = t < 15 ? 'Shukla Paksha (Waxing)' : 'Krishna Paksha (Waning)';
  return { name, paksha, num: t+1 };
}

// Yoga: (Moon + Sun) sum in Nirayana, each 13°20' = 360/27
function getYoga(ms, ss) {
  const sum = n360(ms + ss);
  return YOGAS[Math.floor(sum / (360/27)) % 27];
}

// Karana: elongation / 6°, 60 half-tithis
function getKarana(ms, ss) {
  const e  = n360(ms - ss);
  const kn = Math.floor(e / 6); // 0–59
  // kn=0 → Kimstughna (fixed, 1st half of Shukla 1)
  if (kn === 0) return KAR_FIX[3];
  // kn 57–59 → last 3 fixed karanas
  if (kn >= 57) return KAR_FIX[kn - 57];
  // kn 1–56 → cycle of 7 movable
  return KAR_MOV[(kn - 1) % 7];
}

// Vimshottari Dasha
function getDasha(nakI, fr, year, month) {
  const lord = NAKS[nakI].l;
  const li   = D_ORDER.indexOf(lord);
  const remYr = (1 - fr) * D_YEARS[lord];
  const seq  = [];
  let y = year, m = month;
  for (let i = 0; i < 9; i++) {
    const dl  = D_ORDER[(li + i) % 9];
    const yrs = i === 0 ? remYr : D_YEARS[dl];
    const ey  = y + Math.floor(yrs);
    const em  = m + Math.round((yrs % 1) * 12);
    const eyA = ey + (em > 12 ? 1 : 0);
    const emA = em > 12 ? em - 12 : em;
    seq.push({ lord:dl, total:D_YEARS[dl], endY:eyA, endM:emA });
    y = eyA; m = emA;
  }
  return { lord, rem: remYr.toFixed(2), seq };
}

// ─── MASTER COMPUTE ───────────────────────────────────
function computeVedic(year, month, day, h24, min, tz, place, lat, lon) {
  let hUT = h24 + min/60 - tz;
  let dy  = day;
  if (hUT < 0)   { hUT += 24; dy -= 1; }
  if (hUT >= 24) { hUT -= 24; dy += 1; }

  const JD   = jd(year, month, dy, hUT);
  const ayan = lahiri(JD);

  // Tropical
  const tSun  = sunT(JD);
  const tMoon = moonT(JD);

  // Nirayana (sidereal via Lahiri)
  const sMoon = sid(tMoon, JD);
  const sSun  = sid(tSun,  JD);

  // All planets — Nirayana
  const sLagna   = sid(lagnaT(JD, lat, lon), JD);
  const sMars    = sid(marsT(JD),    JD);
  const sMercury = sid(mercuryT(JD), JD);
  const sVenus   = sid(venusT(JD),   JD);
  const sJupiter = sid(jupiterT(JD), JD);
  const sSaturn  = sid(saturnT(JD),  JD);
  const sRahu    = sid(rahuT(JD),    JD);
  const sKetu    = n360(sRahu + 180);

  const nk  = getNak(sMoon);
  const mRashi = getRashi(sMoon);
  const sRashi = getRashi(sSun);
  const tithi  = getTithi(sMoon, sSun);
  const yoga   = getYoga(tMoon, tSun);   // Yoga uses tropical longitudes
  const karana = getKarana(sMoon, sSun);
  const dasha  = getDasha(nk.i, nk.fr, year, month);

  const MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const ampm = h24 < 12 ? 'AM' : 'PM';
  const h12  = h24 % 12 || 12;

  // Build planet list for kundali
  // Retrograde detection: compare tropical longitude at JD vs JD+1 (1-day forward difference)
  // A planet is retrograde if its daily motion is negative (moving backwards in ecliptic longitude)
  function isRetro(fn, jd) {
    const l0 = fn(jd);
    const l1 = fn(jd + 1);
    let diff = l1 - l0;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff < 0;
  }
  // Sun, Moon, Lagna, Rahu, Ketu are never shown as retrograde in Jyotisha
  const retroMars    = isRetro(marsT,    JD);
  const retroMercury = isRetro(mercuryT, JD);
  const retroJupiter = isRetro(jupiterT, JD);
  const retroVenus   = isRetro(venusT,   JD);
  const retroSaturn  = isRetro(saturnT,  JD);

  const planets = [
    { name:'Lagna', abbr:'Lg', lon: sLagna, rashi: getRashi(sLagna), retro: false },
    { name:'Sun',   abbr:'Su', lon: sSun,   rashi: getRashi(sSun),   retro: false },
    { name:'Moon',  abbr:'Mo', lon: sMoon,  rashi: getRashi(sMoon),  retro: false },
    { name:'Mars',  abbr:'Ma', lon: sMars,  rashi: getRashi(sMars),  retro: retroMars    },
    { name:'Mercury',abbr:'Me',lon: sMercury,rashi:getRashi(sMercury),retro: retroMercury },
    { name:'Jupiter',abbr:'Ju',lon: sJupiter,rashi:getRashi(sJupiter),retro: retroJupiter },
    { name:'Venus', abbr:'Ve', lon: sVenus, rashi: getRashi(sVenus), retro: retroVenus   },
    { name:'Saturn',abbr:'Sa', lon: sSaturn,rashi: getRashi(sSaturn),retro: retroSaturn  },
    { name:'Rahu',  abbr:'Ra', lon: sRahu,  rashi: getRashi(sRahu),  retro: false },
    { name:'Ketu',  abbr:'Ke', lon: sKetu,  rashi: getRashi(sKetu),  retro: false },
  ];

  return {
    place,
    dateStr: `${day} ${MN[month-1]} ${year}`,
    timeStr: `${String(h12).padStart(2,'0')}:${String(min).padStart(2,'0')} ${ampm}`,
    ayan: ayan.toFixed(4),
    sMoon: sMoon.toFixed(4),
    sSun:  sSun.toFixed(4),
    tz,
    lat: lat || 16.02,
    lon: lon || 80.83,
    birthYear: year, birthMonth: month, birthDay: day,
    birthJD: JD,
    nk, mRashi, sRashi, tithi, yoga, karana, dasha,
    planets, sLagna,
  };
}

// ─── RENDER ───────────────────────────────────────────
function renderResults(r) {
  const MNAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const rows = r.dasha.seq.map((d,i) => `
    <tr class="${i===0?'dasha-cur':''}">
      <td>${d.lord}</td>
      <td>${d.total} yrs</td>
      <td>${i===0 ? `<b>${r.dasha.rem} yrs left</b>` : `${d.endY} ${MNAMES[(d.endM-1)%12]}`}</td>
    </tr>`).join('');



  // ─── Helper: sidereal Moon at a given JD ──────────────
  function sidMoonAt(jdVal) {
    return sid(moonT(jdVal), jdVal);
  }

  // ─── Helper: find JD when sidereal Moon crosses targetDeg ─
  // Search within [jdLow, jdHigh]. Moon must be moving forward through targetDeg.
  function findCrossing(targetDeg, jdGuess, searchDays) {
    // Binary search: find JD where sidMoon == targetDeg
    // We search ±searchDays around jdGuess
    let lo = jdGuess - searchDays;
    let hi = jdGuess + searchDays;

    // Make sure target is in range — handle 0°/360° wrap
    function diff(jd) {
      let m = sidMoonAt(jd);
      let d = m - targetDeg;
      // Normalise to [-180, 180] to handle wrap
      while (d >  180) d -= 360;
      while (d < -180) d += 360;
      return d;
    }

    // Bisect 50 times → precision < 1 second
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (diff(mid) > 0) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  }

  // ─── Format JD → local date/time string ───────────────
  function fmtDateTime(jdVal) {
    const jdLocal = jdVal + (r.tz / 24);
    const z = Math.floor(jdLocal + 0.5);
    const f = jdLocal + 0.5 - z;
    let A;
    if (z < 2299161) { A = z; }
    else { const alpha = Math.floor((z - 1867216.25) / 36524.25); A = z + 1 + alpha - Math.floor(alpha/4); }
    const B = A + 1524;
    const C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D) / 30.6001);
    const dayF = B - D - Math.floor(30.6001 * E) + f;
    const month = E < 14 ? E - 1 : E - 13;
    const year  = month > 2 ? C - 4716 : C - 4715;
    const day   = Math.floor(dayF);
    const hF = (dayF - day) * 24;
    const h  = Math.floor(hF);
    const mF = (hF - h) * 60;
    const m  = Math.floor(mF);
    const ampm = h < 12 ? 'AM' : 'PM';
    const h12  = h % 12 || 12;
    return `${day} ${MNAMES[month-1]} ${year}<br>${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
  }

  // ─── Compute nakshatra & pada boundaries ──────────────
  const NK_SPAN   = 360 / 27;
  const PADA_SPAN = NK_SPAN / 4;
  const birthJD   = r.birthJD;
  const nkIdx     = r.nk.i;

  // Degree boundaries
  const nkStartDeg = nkIdx * NK_SPAN;
  const nkEndDeg   = nkStartDeg + NK_SPAN;

  // Binary-search for exact crossing JDs
  // Moon travels ~13°/day, so nakshatra ~1 day, pada ~6 hours
  const nkStartJD = findCrossing(nkStartDeg, birthJD - 0.5, 2);
  const nkEndJD   = findCrossing(nkEndDeg,   birthJD + 0.5, 2);

  // Pada timings
  const padaRows = [1,2,3,4].map(p => {
    const pStartDeg = nkStartDeg + (p-1) * PADA_SPAN;
    const pEndDeg   = nkStartDeg + p     * PADA_SPAN;
    const pStartJD  = findCrossing(pStartDeg, birthJD - 0.5 + (p-1)*0.25, 1.5);
    const pEndJD    = findCrossing(pEndDeg,   birthJD - 0.5 + p*0.25,     1.5);
    return { p, startJD: pStartJD, endJD: pEndJD, isBirth: p === r.nk.p };
  });

  const nakNaming = NAK_NAMING[nkIdx] || ['—','—','—','—'];
  const padaTableRows = padaRows.map(pr => {
    const cls   = pr.isBirth ? ' class="birth-pada"' : '';
    const badge = pr.isBirth ? '<span class="pada-badge">BIRTH</span>' : '';
    const letter = nakNaming[pr.p - 1] || '—';
    return `<tr${cls}>
      <td class="pada-num">${pr.p}${badge}</td>
      <td>${fmtDateTime(pr.startJD)}</td>
      <td>${fmtDateTime(pr.endJD)}</td>
      <td style="font-size:14px;font-weight:800;color:#2e7d32">${letter}</td>
    </tr>`;
  }).join('');

  // Populate the birth info bar (date · time · place as highlighted chips)
  const bar = document.getElementById('res-birth-bar');
  bar.style.display = 'block';
  bar.innerHTML = `<div class="rbb-inner">
    <span class="rbb-chip rbb-chip-date">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>
      ${r.dateStr}
    </span>
    <span class="rbb-chip rbb-chip-time">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      ${r.timeStr}
    </span>
    <span class="rbb-chip rbb-chip-place">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      ${r.place}
    </span>
  </div>`;

  // Compute sunrise/sunset for hero card display
  const _ss = computeSunriseSunset(r.birthYear, r.birthMonth, r.birthDay, r.lat, r.lon, r.tz);
  function _fmtH(h) {
    h = ((h % 24) + 24) % 24;
    const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    const hA = mm === 60 ? hh+1 : hh, mA = mm === 60 ? 0 : mm;
    return `${String(hA%12||12).padStart(2,'0')}:${String(mA).padStart(2,'0')} ${hA<12?'AM':'PM'}`;
  }
  const heroSunrise = _fmtH(_ss.sunrise);
  const heroSunset  = _fmtH(_ss.sunset);

  document.getElementById('results-content').innerHTML = `
    <div class="res-hero">
      <div class="res-hero-label">Janma Nakshatra · Nirayana</div>
      <div class="res-hero-name">${r.nk.nak.n}</div>
      <div class="res-hero-timing">
        <div class="timing-block timing-block-start">
          <span class="timing-label">Start</span>
          <span class="timing-val">${fmtDateTime(nkStartJD)}</span>
        </div>
        <div class="timing-divider">
          <div class="timing-divider-dot"></div>
          <div class="timing-divider-line"></div>
          <div class="timing-divider-dot"></div>
        </div>
        <div class="timing-block timing-block-end">
          <span class="timing-label">End</span>
          <span class="timing-val">${fmtDateTime(nkEndJD)}</span>
        </div>
      </div>
      <div class="res-meta-row">
        <span class="res-meta-chip">🪐 Lord: ${r.nk.nak.l}</span>
        <span class="res-meta-chip">🔱 Gana: ${r.nk.nak.g}</span>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 4px 0;gap:8px">
      <div style="display:flex;align-items:center;gap:6px;flex:1;justify-content:center">
        <span style="font-size:18px">🌅</span>
        <div style="display:flex;flex-direction:column;align-items:flex-start">
          <span style="font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase">Sunrise</span>
          <span style="font-size:15px;font-weight:800;color:var(--text-dark)">${heroSunrise}</span>
        </div>
      </div>
      <div style="width:1px;height:32px;background:rgba(58,45,143,0.15)"></div>
      <div style="display:flex;align-items:center;gap:6px;flex:1;justify-content:center">
        <span style="font-size:18px">🌇</span>
        <div style="display:flex;flex-direction:column;align-items:flex-start">
          <span style="font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase">Sunset</span>
          <span style="font-size:15px;font-weight:800;color:var(--text-dark)">${heroSunset}</span>
        </div>
      </div>
    </div>

    <div class="pada-section">
      <div class="pada-section-title">Pada Timings</div>
      <table class="pada-table">
        <thead><tr><th>Pada</th><th>Start</th><th>End</th><th>Letter</th></tr></thead>
        <tbody>${padaTableRows}</tbody>
      </table>
    </div>

    <div class="rasi-card">
      <div class="rasi-label">Your Rasi</div>
      <div class="rasi-val">${r.mRashi.r}</div>
      <div class="rasi-sub">${r.mRashi.en} · Lord: ${r.mRashi.lord}</div>
    </div>

    <div style="display:flex;gap:10px">
      <button class="nav-btn-back" style="flex:1" onclick="showScreen('screen-birth')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M15 18l-6-6 6-6"/></svg> Back</button>
      <button class="check-doshas-btn" style="flex:1;width:auto;padding:14px 0" onclick="openDoshaScreen()">✦ Check Doshas</button>
    </div>`;
  _lastResult = r;
}
</script>
