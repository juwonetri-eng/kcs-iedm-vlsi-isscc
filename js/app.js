/* 반도체 4대 학회 기술동향 대시보드 — view logic (Plotly) */
(function () {
  const A = DASH.areas;                       // [{code,name,tier}]
  const S = DASH.seasons;                      // 3 seasons
  const N = S.length;
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
      ["총 세션", total], ["국내 KCS", cf.KCS], ["해외 3대", ovs],
      ["학회", 4], ["시즌", N],
    ];
    document.getElementById("kpis").innerHTML = items.map(
      ([l, v]) => `<div class="kpi"><div class="v">${v}</div><div class="l">${l}</div></div>`
    ).join("");
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
      `(${DASH.totalDomestic[r.a.code]}세션)<br>해외 ${r.oShare.toFixed(1)}% ` +
      `(${DASH.totalOverseas[r.a.code]}세션)<br>차이 ${r.gap >= 0 ? "+" : ""}${r.gap.toFixed(1)}pp`);

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
  function drawScatter(g) {
    const grid = gridFor(g);
    const pts = A.map(a => {
      const seq = S.map(s => grid[a.code][s]);
      const total = seq.reduce((x, y) => x + y, 0);
      const last2 = seq[N - 1] + (seq[N - 2] || 0);
      const activity = total ? (last2 / total) * (N / 2) : 0;
      return { a, total, activity };
    }).filter(p => p.total > 0);

    const scales = pts.map(p => p.total).sort((x, y) => x - y);
    const xmed = scales[Math.floor(scales.length / 2)] || 1;
    const ymax = Math.max(1.6, ...pts.map(p => p.activity)) + 0.1;
    const xmax = Math.max(...pts.map(p => p.total)) * 1.15;

    const traces = Object.keys(TIERCOL).map(t => {
      const sub = pts.filter(p => p.a.tier === t);
      return {
        type: "scatter", mode: "markers+text", name: tierShort(t),
        x: sub.map(p => p.total), y: sub.map(p => +p.activity.toFixed(2)),
        text: sub.map(p => p.a.code), textposition: "top center", textfont: { size: 10 },
        marker: { size: sub.map(p => 12 + p.total * 0.6), color: TIERCOL[t], opacity: .8, line: { color: "#fff", width: 1 } },
        hovertext: sub.map(p => `<b>${codeName(p.a)}</b><br>누적 ${p.total}세션<br>활동지수 ${p.activity.toFixed(2)}`),
        hoverinfo: "text",
      };
    });

    const quad = (x, y, txt, col) => ({ x, y, xref: "x", yref: "y", text: txt, showarrow: false, font: { size: 12, color: col }, opacity: .55 });
    Plotly.newPlot("chart-scatter", traces, Object.assign({}, layoutBase, {
      xaxis: { title: "누적 세션수 (SCALE)", range: [0, xmax], zeroline: false },
      yaxis: { title: "활동지수 (ACTIVITY)", range: [0, ymax] },
      legend: { orientation: "h", y: 1.08 },
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
      xaxis: { title: "" }, yaxis: { title: "세션 비중 (%)" },
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
  wire("toggle-scatter", drawScatter);
  wire("toggle-trend", drawTrend);
  drawScatter("all");
  drawTrend("all");
})();
