/* 반도체 4대 학회 기술동향 대시보드 — view logic (Plotly) */
(function () {
  const A = DASH.areas;                       // [{code,name,tier}]
  const S = DASH.seasons;                      // 3 seasons
  const N = S.length;
  const UL = DASH.unit === "papers" ? "논문" : "세션";   // unit label
  const TIERCOL = {
    "Devices & Process Technology": "#2563eb",
    "Circuits & Systems": "#ea580c",
    "Cross-cutting / Emerging Computing": "#16a34a",
  };
  const tierShort = t => t.startsWith("Devices") ? "소자·공정"
    : t.startsWith("Circuits") ? "회로·시스템" : "교차·신흥컴퓨팅";
  const codeName = a => a.code + " " + a.name;

  /* ---------- KPIs ---------- */
  (function kpis() {
    const cf = DASH.confTotals;
    const total = Object.values(cf).reduce((x, y) => x + y, 0);
    const ovs = DASH.overseas.reduce((s, c) => s + cf[c], 0);
    const items = [
      ["총 " + UL, total], ["국내 KCS", cf.KCS], ["해외 3대", ovs],
      ["학회", 4], ["시즌", N],
    ];
    document.getElementById("kpis").innerHTML = items.map(
      ([l, v]) => `<div class="kpi"><div class="v">${v}</div><div class="l">${l}</div></div>`
    ).join("");
  })();

  /* ---------- ★ auto insights ---------- */
  (function insights() {
    const el = document.getElementById("insights");
    if (!el) return;
    const aname = c => { const a = A.find(x => x.code === c); return a ? a.name : c; };
    // domestic emphasis gap (국내 강점/편중)
    const gd = DASH.grandDomestic, go = DASH.grandOverseas;
    const gaps = A.map(a => ({ c: a.code, g: 100 * DASH.totalDomestic[a.code] / gd - 100 * DASH.totalOverseas[a.code] / go }))
      .sort((x, y) => y.g - x.g);
    const domTop = gaps.slice(0, 3), domBot = gaps.slice(-3).reverse();
    // intl participation by area (한국 국제 경쟁력)
    let instBlock = "";
    if (typeof INST !== "undefined") {
      const ir = Object.keys(INST.korByArea).map(a => ({ c: a, ...INST.korByArea[a], r: 100 * INST.korByArea[a].kor / INST.korByArea[a].tot }))
        .filter(x => x.tot >= 12);
      const hi = ir.slice().sort((a, b) => b.r - a.r).slice(0, 3);
      const lo = ir.slice().sort((a, b) => a.r - b.r).slice(0, 3);
      const totK = DASH.overseas.reduce((s, c) => s + (INST.korByConf[c] ? INST.korByConf[c].kor : 0), 0);
      const totP = DASH.overseas.reduce((s, c) => s + (INST.korByConf[c] ? INST.korByConf[c].tot : 0), 0);
      instBlock = `
      <div class="ins"><h3>🌏 해외 학회 속 한국 (실제 경쟁력)</h3>
        <ul>
        <li>해외 3대 학회 논문의 <b>${(100 * totK / totP).toFixed(0)}%</b>에 한국 기관 참여 (삼성·KAIST·SK하이닉스 주도)</li>
        <li>국제적으로 <span class="up">강한</span> 영역: ${hi.map(x => `${aname(x.c)}(${x.r.toFixed(0)}%)`).join(", ")}</li>
        <li>국제적으로 <span class="down">약한</span> 영역: ${lo.map(x => `${aname(x.c)}(${x.r.toFixed(0)}%)`).join(", ")}</li>
        </ul></div>`;
    }
    // keyword strength
    let kwBlock = "";
    if (typeof KW !== "undefined") {
      const kr = KW.labels.map(l => {
        const h = KW.hitsGroup[l] || {}; const d = (h.domestic || 0) / KW.groupTotalDom, o = (h.overseas || 0) / KW.groupTotalOvs;
        return { l, g: d - o };
      });
      const ku = kr.slice().sort((a, b) => b.g - a.g).slice(0, 5).map(x => x.l);
      const kd = kr.slice().sort((a, b) => a.g - b.g).slice(0, 5).map(x => x.l);
      kwBlock = `
      <div class="ins"><h3>🔑 키워드로 본 무게중심</h3>
        <ul>
        <li>국내 집중 키워드: <b>${ku.join(", ")}</b></li>
        <li>해외 집중 키워드: <b>${kd.join(", ")}</b></li>
        </ul></div>`;
    }
    el.innerHTML = `
      <div class="ins"><h3>🇰🇷 국내(KCS) 무게중심</h3>
        <ul>
        <li>국내 편중(해외比 ↑): ${domTop.map(x => `${aname(x.c)}(+${x.g.toFixed(1)}pp)`).join(", ")}</li>
        <li>국내 희소(해외比 ↓): ${domBot.map(x => `${aname(x.c)}(${x.g.toFixed(1)}pp)`).join(", ")}</li>
        <li>→ 국내 학회는 <b>소재·공정·소자물리</b> 중심</li>
        </ul></div>
      ${instBlock}
      ${kwBlock}
      <div class="ins"><h3>📌 종합 해석</h3>
        <ul>
        <li>한국은 <b>신소자·소재·메모리/디스플레이</b>에서 국내·국제 모두 강함</li>
        <li><b>RF·아날로그·신뢰성/모델링·양자</b>는 국제 참여율도 낮아 <span class="down">실질 약점</span> 후보</li>
        <li>전력관리 등 일부는 국내 학회엔 적지만 국제선 강함 → 발표 채널 차이</li>
        </ul></div>`;
  })();

  const layoutBase = {
    margin: { l: 60, r: 24, t: 16, b: 48 },
    font: { family: "Segoe UI, Malgun Gothic, sans-serif", size: 12, color: "#0f172a" },
    paper_bgcolor: "#fff", plot_bgcolor: "#fff",
    hoverlabel: { bgcolor: "#0f172a", font: { color: "#fff" } },
  };
  const CONFIG = { responsive: true, displayModeBar: false };

  /* ---------- 01. domestic vs overseas gap ---------- */
  (function gap() {
    const gd = DASH.grandDomestic, go = DASH.grandOverseas;
    const rows = A.map(a => {
      const dShare = 100 * DASH.totalDomestic[a.code] / gd;
      const oShare = 100 * DASH.totalOverseas[a.code] / go;
      return { a, dShare, oShare, gap: dShare - oShare };
    }).sort((x, y) => x.gap - y.gap);          // overseas-leaning at bottom

    const y = rows.map(r => codeName(r.a));
    const x = rows.map(r => +r.gap.toFixed(1));
    const colors = rows.map(r => r.gap >= 0 ? "#2563eb" : "#ea580c");
    const hover = rows.map(r =>
      `<b>${codeName(r.a)}</b><br>국내 ${r.dShare.toFixed(1)}% ` +
      `(${DASH.totalDomestic[r.a.code]}${UL})<br>해외 ${r.oShare.toFixed(1)}% ` +
      `(${DASH.totalOverseas[r.a.code]}${UL})<br>차이 ${r.gap >= 0 ? "+" : ""}${r.gap.toFixed(1)}pp`);

    Plotly.newPlot("chart-gap", [{
      type: "bar", orientation: "h", x, y, marker: { color: colors },
      hovertext: hover, hoverinfo: "text",
      text: x.map(v => (v >= 0 ? "+" : "") + v), textposition: "auto", textfont: { size: 10 },
    }], Object.assign({}, layoutBase, {
      xaxis: { title: "국내% − 해외%  (pp)", zeroline: true, zerolinecolor: "#94a3b8", zerolinewidth: 2 },
      yaxis: { automargin: true, tickfont: { size: 11 } },
      margin: { l: 250, r: 24, t: 10, b: 44 },
      annotations: [
        { x: 0, y: 1.04, xref: "paper", yref: "paper", text: "← 해외 집중", showarrow: false, font: { color: "#ea580c", size: 12 } },
        { x: 1, y: 1.04, xref: "paper", yref: "paper", text: "국내 집중 →", showarrow: false, font: { color: "#2563eb", size: 12 }, xanchor: "right" },
      ],
    }), CONFIG);
  })();

  /* ---------- 02. activity scatter ---------- */
  function gridFor(g) {
    return g === "domestic" ? DASH.bySeasonDomestic
      : g === "overseas" ? DASH.bySeasonOverseas : DASH.bySeasonAll;
  }
  const KWGROUPS = ["Logic/Device", "Memory", "Packaging", "Process", "Power/RF",
                    "Sensor/Bio", "Compute/AI", "Circuit", "Quantum", "Security", "Reliability"];
  const KWCOL = { "Logic/Device": "#2563eb", "Memory": "#7c3aed", "Packaging": "#0891b2",
    "Process": "#0d9488", "Power/RF": "#ca8a04", "Sensor/Bio": "#16a34a", "Compute/AI": "#dc2626",
    "Circuit": "#ea580c", "Quantum": "#9333ea", "Security": "#64748b", "Reliability": "#475569" };
  let curGroup = "all", curDim = "area";

  function activity(seq) {
    const total = seq.reduce((x, y) => x + y, 0), last2 = seq[N - 1] + (seq[N - 2] || 0);
    return { total, act: total ? (last2 / total) * (N / 2) : 0 };
  }
  function areaPoints(group) {
    const grid = gridFor(group);
    return A.map(a => {
      const m = activity(S.map(s => grid[a.code][s]));
      return { label: a.code, full: codeName(a), ck: a.tier, cn: tierShort(a.tier), total: m.total, act: m.act };
    }).filter(p => p.total > 0);
  }
  function kwPoints(group) {
    if (typeof KW === "undefined") return [];
    return KW.labels.map(l => {
      const dom = KW.hitsSeasonDom[l] || {}, ovs = KW.hitsSeasonOvs[l] || {};
      const m = activity(S.map(s => group === "domestic" ? (dom[s] || 0)
        : group === "overseas" ? (ovs[s] || 0) : ((dom[s] || 0) + (ovs[s] || 0))));
      const g = KW.groups[l] || "Reliability";
      return { label: l, full: l, ck: g, cn: g, total: m.total, act: m.act };
    }).filter(p => p.total >= 6);
  }
  function drawScatter() {
    const dim = curDim, group = curGroup;
    const pts = dim === "keyword" ? kwPoints(group) : areaPoints(group);
    if (!pts.length) { document.getElementById("chart-scatter").innerHTML = "<p style='padding:20px;color:#64748b'>데이터 없음</p>"; return; }
    const scales = pts.map(p => p.total).sort((a, b) => a - b);
    const xmed = scales[Math.floor(scales.length / 2)] || 1;
    const ymax = Math.max(1.6, ...pts.map(p => p.act)) + 0.15;
    const xmax = Math.max(...pts.map(p => p.total)) * 1.15;
    const thr = pts.map(p => p.total).sort((a, b) => b - a)[Math.min(13, pts.length - 1)] || 0; // label top ~14
    const colMap = dim === "keyword" ? KWCOL : TIERCOL;
    const glist = dim === "keyword" ? KWGROUPS : Object.keys(TIERCOL);
    const ss = dim === "keyword" ? 0.22 : 0.6;
    const traces = glist.map(gk => {
      const sub = pts.filter(p => p.ck === gk);
      if (!sub.length) return null;
      return {
        type: "scatter", mode: "markers+text", name: sub[0].cn,
        x: sub.map(p => p.total), y: sub.map(p => +p.act.toFixed(2)),
        text: sub.map(p => p.total >= thr ? p.label : ""), textposition: "top center", textfont: { size: 9 },
        marker: { size: sub.map(p => 10 + p.total * ss), color: colMap[gk] || "#888", opacity: .78, line: { color: "#fff", width: 1 } },
        hovertext: sub.map(p => `<b>${p.full}</b><br>누적 ${p.total}<br>활동지수 ${p.act.toFixed(2)}`),
        hoverinfo: "text",
      };
    }).filter(Boolean);
    const quad = (x, y, txt, col) => ({ x, y, xref: "x", yref: "y", text: txt, showarrow: false, font: { size: 12, color: col }, opacity: .55 });
    Plotly.newPlot("chart-scatter", traces, Object.assign({}, layoutBase, {
      xaxis: { title: "누적 " + (dim === "keyword" ? "키워드 적중" : UL) + "수 (SCALE)", range: [0, xmax], zeroline: false },
      yaxis: { title: "활동지수 (ACTIVITY)", range: [0, ymax] },
      legend: { font: { size: 9 } }, margin: { l: 56, r: dim === "keyword" ? 140 : 24, t: 16, b: 44 },
      shapes: [
        { type: "line", x0: xmed, x1: xmed, y0: 0, y1: ymax, line: { color: "#cbd5e1", dash: "dot" } },
        { type: "line", x0: 0, x1: xmax, y0: 1, y1: 1, line: { color: "#cbd5e1", dash: "dot" } },
      ],
      annotations: [
        quad(xmed * 0.4, ymax * 0.93, "Emerging", "#16a34a"),
        quad(xmax * 0.82, ymax * 0.93, "Core Rising", "#2563eb"),
        quad(xmed * 0.4, 0.12, "Niche", "#94a3b8"),
        quad(xmax * 0.82, 0.12, "Mature", "#64748b"),
      ],
    }), CONFIG);
  }

  /* ---------- 03. season trend (share%) ---------- */
  function drawTrend(g) {
    const grid = gridFor(g);
    const colTot = S.map(s => A.reduce((sum, a) => sum + grid[a.code][s], 0));
    const traces = A.map(a => ({
      type: "scatter", mode: "lines+markers", name: codeName(a),
      x: S, y: S.map((s, i) => colTot[i] ? +(100 * grid[a.code][s] / colTot[i]).toFixed(2) : 0),
      line: { color: TIERCOL[a.tier], width: 2 }, marker: { size: 6 },
      legendgroup: a.tier,
    }));
    Plotly.newPlot("chart-trend", traces, Object.assign({}, layoutBase, {
      xaxis: { title: "" }, yaxis: { title: UL + " 비중 (%)" },
      legend: { font: { size: 10 } }, margin: { l: 56, r: 200, t: 10, b: 36 },
      hovermode: "closest",
    }), CONFIG);
  }

  /* ---------- toggles ---------- */
  function wire(id, fn) {
    const box = document.getElementById(id);
    box.addEventListener("click", e => {
      if (e.target.tagName !== "BUTTON") return;
      box.querySelectorAll("button").forEach(b => b.classList.remove("on"));
      e.target.classList.add("on");
      fn(e.target.dataset.g);
    });
  }
  /* ---------- 04. per-conference year trend ---------- */
  function drawConfYear(conf) {
    const years = DASH.confYears[conf];
    const grid = DASH.byConfYear[conf];                 // area -> {year:count}
    const colTot = years.map(y => A.reduce((s, a) => s + (grid[a.code][y] || 0), 0));
    const traces = A.map(a => ({
      type: "scatter", mode: "lines+markers", name: codeName(a),
      x: years,
      y: years.map((y, i) => colTot[i] ? +(100 * (grid[a.code][y] || 0) / colTot[i]).toFixed(2) : 0),
      line: { color: TIERCOL[a.tier], width: 2 }, marker: { size: 6 }, legendgroup: a.tier,
    }));
    Plotly.newPlot("chart-confyear", traces, Object.assign({}, layoutBase, {
      xaxis: { title: conf + " 개최연도", type: "category" },
      yaxis: { title: UL + " 비중 (%)" },
      legend: { font: { size: 10 } }, margin: { l: 56, r: 200, t: 16, b: 40 },
      hovermode: "closest",
    }), CONFIG);
  }

  /* ---------- 05. keyword analysis (国내 vs 해외) ---------- */
  function drawKw(view) {
    const labels = KW.labels;
    const dTot = KW.groupTotalDom, oTot = KW.groupTotalOvs;
    const rows = labels.map(l => {
      const d = (KW.hitsGroup[l] || {}).domestic || 0;
      const o = (KW.hitsGroup[l] || {}).overseas || 0;
      return { l, d, o, dShare: 100 * d / dTot, oShare: 100 * o / oTot, tot: d + o };
    }).filter(r => r.tot >= 8);                 // drop very rare keywords

    if (view === "trend") {
      const seasons = KW.seasons;
      const tot = seasons.map(s => KW.labels.reduce((acc, l) =>
        acc + (KW.hitsSeasonDom[l][s] || 0) + (KW.hitsSeasonOvs[l][s] || 0), 0));
      const top = KW.labels.map(l => ({ l, n: (KW.hitsGroup[l].domestic || 0) + (KW.hitsGroup[l].overseas || 0) }))
        .sort((a, b) => b.n - a.n).slice(0, 10).map(x => x.l);
      const traces = top.map(l => ({
        type: "scatter", mode: "lines+markers", name: l, x: seasons,
        y: seasons.map((s, i) => tot[i] ? +(100 * ((KW.hitsSeasonDom[l][s] || 0) + (KW.hitsSeasonOvs[l][s] || 0)) / tot[i]).toFixed(2) : 0),
        line: { width: 2 }, marker: { size: 6 },
      }));
      Plotly.newPlot("chart-kw", traces, Object.assign({}, layoutBase, {
        xaxis: { title: "시즌" }, yaxis: { title: "키워드 적중 비중 (%)" },
        legend: { font: { size: 10 } }, margin: { l: 56, r: 160, t: 16, b: 40 },
      }), CONFIG);
      return;
    }
    if (view === "top") {
      const r = rows.slice().sort((a, b) => a.tot - b.tot).slice(-24);
      Plotly.newPlot("chart-kw", [
        { type: "bar", orientation: "h", name: "국내 KCS", y: r.map(x => x.l), x: r.map(x => x.d),
          marker: { color: "#2563eb" }, hovertemplate: "%{y}<br>국내 %{x} 적중<extra></extra>" },
        { type: "bar", orientation: "h", name: "해외 3대", y: r.map(x => x.l), x: r.map(x => x.o),
          marker: { color: "#ea580c" }, hovertemplate: "%{y}<br>해외 %{x} 적중<extra></extra>" },
      ], Object.assign({}, layoutBase, {
        barmode: "stack", xaxis: { title: "키워드 적중 수 (제목)" },
        yaxis: { automargin: true, tickfont: { size: 11 } },
        legend: { orientation: "h", y: 1.05 }, margin: { l: 170, r: 20, t: 30, b: 44 },
      }), CONFIG);
      return;
    }
    // gap view: domestic share% − overseas share%
    const r = rows.slice().sort((a, b) => (a.dShare - a.oShare) - (b.dShare - b.oShare));
    const y = r.map(x => x.l), x = r.map(x => +(x.dShare - x.oShare).toFixed(2));
    Plotly.newPlot("chart-kw", [{
      type: "bar", orientation: "h", x, y, marker: { color: x.map(v => v >= 0 ? "#2563eb" : "#ea580c") },
      hovertext: r.map(x => `<b>${x.l}</b><br>국내 ${x.dShare.toFixed(1)}% (${x.d})<br>해외 ${x.oShare.toFixed(1)}% (${x.o})`),
      hoverinfo: "text",
    }], Object.assign({}, layoutBase, {
      xaxis: { title: "국내% − 해외%  (키워드 적중 비중, pp)", zeroline: true, zerolinecolor: "#94a3b8", zerolinewidth: 2 },
      yaxis: { automargin: true, tickfont: { size: 11 } }, margin: { l: 170, r: 20, t: 30, b: 44 },
      annotations: [
        { x: 0, y: 1.03, xref: "paper", yref: "paper", text: "← 해외 집중", showarrow: false, font: { color: "#ea580c", size: 12 } },
        { x: 1, y: 1.03, xref: "paper", yref: "paper", text: "국내 집중 →", showarrow: false, font: { color: "#2563eb", size: 12 }, xanchor: "right" },
      ],
    }), CONFIG);
  }

  /* ---------- 06. institution analysis (Korea share in overseas) ---------- */
  const areaTier = {};
  A.forEach(a => { areaTier[a.code] = a.tier; });
  function drawInst(view) {
    if (typeof INST === "undefined") return;
    if (view === "inst") {
      const tcol = { company: "#dc2626", university: "#2563eb", institute: "#16a34a" };
      const tname = { company: "기업", university: "대학", institute: "연구소" };
      const r = INST.topInstitutions.slice(0, 16).reverse();
      const types = r.map(([n]) => INST.instTypeName[n] || "university");
      Plotly.newPlot("chart-inst", [{
        type: "bar", orientation: "h", y: r.map(x => x[0]), x: r.map(x => x[1]),
        marker: { color: types.map(t => tcol[t]) },
        text: r.map(x => x[1]), textposition: "auto",
        hovertext: r.map((x, i) => `${x[0]} (${tname[types[i]]})<br>해외 학회 ${x[1]}편 참여`), hoverinfo: "text",
      }], Object.assign({}, layoutBase, {
        xaxis: { title: "해외 학회 참여 논문 수 (IEDM+ISSCC+VLSI)" },
        yaxis: { automargin: true, tickfont: { size: 11 } }, margin: { l: 130, r: 20, t: 16, b: 44 },
        title: { text: "🔴기업 🔵대학 🟢연구소", font: { size: 11 }, x: 0.99, xanchor: "right", y: 0.98 },
      }), CONFIG);
      return;
    }
    if (view === "trend") {
      const confs = ["IEDM", "ISSCC", "VLSI"];
      const col = { IEDM: "#2563eb", ISSCC: "#ea580c", VLSI: "#16a34a" };
      const traces = confs.map(c => {
        const yrs = Object.keys(INST.korByConfYear[c]).sort();
        return {
          type: "scatter", mode: "lines+markers", name: c, line: { color: col[c], width: 2.5 }, marker: { size: 7 },
          x: yrs, y: yrs.map(y => { const d = INST.korByConfYear[c][y]; return d.tot ? +(100 * d.kor / d.tot).toFixed(1) : 0; }),
        };
      });
      Plotly.newPlot("chart-inst", traces, Object.assign({}, layoutBase, {
        xaxis: { title: "개최연도", type: "category" }, yaxis: { title: "한국 기관 참여율 (%)", rangemode: "tozero" },
        legend: { orientation: "h", y: 1.1 }, margin: { l: 56, r: 24, t: 20, b: 40 },
      }), CONFIG);
      return;
    }
    // area view: Korea participation rate per area (overseas), sorted desc
    const rows = Object.keys(INST.korByArea).map(a => {
      const d = INST.korByArea[a]; return { a, rate: 100 * d.kor / d.tot, kor: d.kor, tot: d.tot };
    }).filter(r => r.tot >= 8).sort((x, y) => x.rate - y.rate);
    Plotly.newPlot("chart-inst", [{
      type: "bar", orientation: "h", y: rows.map(r => r.a + " " + (INST.areaNames[r.a] || "")),
      x: rows.map(r => +r.rate.toFixed(1)),
      marker: { color: rows.map(r => TIERCOL[areaTier[r.a]] || "#888") },
      text: rows.map(r => r.rate.toFixed(0) + "%"), textposition: "auto",
      hovertext: rows.map(r => `${INST.areaNames[r.a]}<br>한국 ${r.kor}/${r.tot}편 (${r.rate.toFixed(1)}%)`), hoverinfo: "text",
    }], Object.assign({}, layoutBase, {
      xaxis: { title: "해외 학회 내 한국 기관 참여율 (%)" },
      yaxis: { automargin: true, tickfont: { size: 10 } }, margin: { l: 250, r: 20, t: 16, b: 44 },
      shapes: [{ type: "line", x0: 21, x1: 21, y0: -0.5, y1: rows.length - 0.5, line: { color: "#94a3b8", dash: "dash" } }],
      annotations: [{ x: 21, y: rows.length - 0.5, text: "전체평균 21%", showarrow: false, font: { size: 10, color: "#64748b" }, yanchor: "bottom" }],
    }), CONFIG);
  }

  /* ---------- 07. Korea capability quadrant ---------- */
  function drawQuadrant() {
    if (typeof INST === "undefined") return;
    const gd = DASH.grandDomestic;
    const pts = A.map(a => {
      const ka = INST.korByArea[a.code];
      if (!ka || ka.tot < 10) return null;
      return { a, intl: 100 * ka.kor / ka.tot, dom: 100 * DASH.totalDomestic[a.code] / gd, ck: a.tier };
    }).filter(Boolean);
    const xmed = 21;                                  // overall intl avg
    const ys = pts.map(p => p.dom).sort((a, b) => a - b);
    const ymed = ys[Math.floor(ys.length / 2)] || 5;
    const xmax = Math.max(...pts.map(p => p.intl)) * 1.12;
    const ymax = Math.max(...pts.map(p => p.dom)) * 1.15;
    const traces = Object.keys(TIERCOL).map(t => {
      const sub = pts.filter(p => p.a.tier === t);
      if (!sub.length) return null;
      return {
        type: "scatter", mode: "markers+text", name: tierShort(t),
        x: sub.map(p => +p.intl.toFixed(1)), y: sub.map(p => +p.dom.toFixed(1)),
        text: sub.map(p => p.a.code), textposition: "top center", textfont: { size: 10 },
        marker: { size: 14, color: TIERCOL[t], opacity: .8, line: { color: "#fff", width: 1 } },
        hovertext: sub.map(p => `<b>${codeName(p.a)}</b><br>국제 참여율 ${p.intl.toFixed(0)}%<br>국내 비중 ${p.dom.toFixed(1)}%`), hoverinfo: "text",
      };
    }).filter(Boolean);
    const lab = (x, y, t, c) => ({ x, y, text: t, showarrow: false, font: { size: 12, color: c }, opacity: .6 });
    Plotly.newPlot("chart-quad", traces, Object.assign({}, layoutBase, {
      xaxis: { title: "해외 학회 내 한국 참여율 (%)", range: [0, xmax] },
      yaxis: { title: "국내 학회(KCS) 비중 (%)", range: [0, ymax] },
      legend: { orientation: "h", y: 1.08 },
      shapes: [
        { type: "line", x0: xmed, x1: xmed, y0: 0, y1: ymax, line: { color: "#cbd5e1", dash: "dot" } },
        { type: "line", x0: 0, x1: xmax, y0: ymed, y1: ymed, line: { color: "#cbd5e1", dash: "dot" } },
      ],
      annotations: [
        lab(xmax * 0.86, ymax * 0.95, "정착 강점", "#16a34a"),
        lab(xmax * 0.86, ymax * 0.04, "산업 주도", "#2563eb"),
        lab(xmax * 0.14, ymax * 0.95, "국내 편중", "#dc2626"),
        lab(xmax * 0.14, ymax * 0.04, "저활동", "#94a3b8"),
      ],
    }), CONFIG);
  }

  wire("toggle-scatter", g => { curGroup = g; drawScatter(); });
  wire("toggle-scatter-dim", g => { curDim = g; drawScatter(); });
  wire("toggle-trend", drawTrend);
  wire("toggle-confyear", drawConfYear);
  const hasKW = typeof KW !== "undefined";
  if (hasKW) wire("toggle-kw", drawKw);
  if (typeof INST !== "undefined") wire("toggle-inst", drawInst);
  if (typeof INST !== "undefined") drawQuadrant();
  drawScatter();
  drawTrend("all");
  drawConfYear("IEDM");
  if (hasKW) drawKw("gap");
  if (typeof INST !== "undefined") drawInst("area");
})();
