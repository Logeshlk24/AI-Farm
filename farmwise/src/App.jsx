import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────
const SOIL_DB = {
  tropical_wet: { name:"Red Laterite",   ph:"5.5–6.5", color:"#c0392b", desc:"Iron-rich, porous, leaches quickly. Common in Kerala & coastal Karnataka.", crops:["Rice","Coconut","Rubber","Tea","Coffee"] },
  tropical_dry: { name:"Black Cotton",   ph:"7.5–8.5", color:"#2c2c2c", desc:"High clay, cracks in dry season, retains moisture well. Deccan plateau.",  crops:["Cotton","Sorghum","Wheat","Sunflower","Chickpea"] },
  semi_arid:    { name:"Sandy Loam",     ph:"6.5–7.5", color:"#d4a762", desc:"Light, well-drained, warms quickly. North Karnataka & Rajasthan.",           crops:["Mustard","Groundnut","Millet","Bajra","Maize"] },
  alluvial:     { name:"Alluvial",       ph:"6.8–7.2", color:"#8b7355", desc:"Highly fertile, river-deposited. Indo-Gangetic plains & river deltas.",       crops:["Rice","Wheat","Sugarcane","Potato","Maize"] },
  mountain:     { name:"Forest / Loamy", ph:"5.0–6.0", color:"#4a7c59", desc:"Rich in humus, cool & well-drained. Himalayan foothills & Western Ghats.",   crops:["Tea","Coffee","Cardamom","Ginger","Potato"] },
};

const CROP_DB = [
  { name:"Rice",        emoji:"🌾", cat:"Cereal",     season:"Kharif",   days:"90–150",  rain:"1000–2000mm", seedRate:20,   N:120, P:60,  K:40,  ph:"5.5–7.0", soil:"Red Laterite / Alluvial" },
  { name:"Wheat",       emoji:"🌾", cat:"Cereal",     season:"Rabi",     days:"120–150", rain:"300–500mm",   seedRate:40,   N:120, P:60,  K:40,  ph:"6.0–7.5", soil:"Alluvial / Black Cotton" },
  { name:"Maize",       emoji:"🌽", cat:"Cereal",     season:"Kharif",   days:"80–95",   rain:"600–900mm",   seedRate:8,    N:150, P:75,  K:60,  ph:"6.0–7.5", soil:"Sandy Loam / Alluvial" },
  { name:"Sorghum",     emoji:"🌿", cat:"Cereal",     season:"Kharif",   days:"90–120",  rain:"400–750mm",   seedRate:10,   N:80,  P:40,  K:40,  ph:"6.0–7.5", soil:"Black Cotton" },
  { name:"Millet",      emoji:"🌾", cat:"Cereal",     season:"Kharif",   days:"60–90",   rain:"250–500mm",   seedRate:5,    N:60,  P:30,  K:30,  ph:"6.0–8.0", soil:"Sandy Loam" },
  { name:"Chickpea",    emoji:"🟤", cat:"Pulse",      season:"Rabi",     days:"90–120",  rain:"250–400mm",   seedRate:60,   N:20,  P:40,  K:20,  ph:"6.0–8.0", soil:"Black Cotton" },
  { name:"Soybean",     emoji:"🫘", cat:"Pulse",      season:"Kharif",   days:"90–120",  rain:"600–800mm",   seedRate:30,   N:30,  P:60,  K:40,  ph:"6.0–7.0", soil:"Sandy Loam" },
  { name:"Groundnut",   emoji:"🥜", cat:"Pulse",      season:"Kharif",   days:"90–130",  rain:"500–700mm",   seedRate:80,   N:25,  P:50,  K:50,  ph:"6.0–7.0", soil:"Sandy Loam" },
  { name:"Cotton",      emoji:"🌿", cat:"Cash Crop",  season:"Kharif",   days:"180–200", rain:"500–800mm",   seedRate:2.5,  N:100, P:50,  K:80,  ph:"7.0–8.5", soil:"Black Cotton" },
  { name:"Sugarcane",   emoji:"🎋", cat:"Cash Crop",  season:"Annual",   days:"300–365", rain:"1200–1500mm", seedRate:3,    N:250, P:100, K:120, ph:"6.5–7.5", soil:"Alluvial / Black Cotton" },
  { name:"Coconut",     emoji:"🥥", cat:"Fruit",      season:"Perennial",days:"1825+",   rain:"1500–2500mm", seedRate:0.1,  N:900, P:600, K:1200,ph:"5.5–7.0", soil:"Red Laterite" },
  { name:"Mango",       emoji:"🥭", cat:"Fruit",      season:"Perennial",days:"1800+",   rain:"750–2500mm",  seedRate:0.03, N:600, P:300, K:700, ph:"5.5–7.5", soil:"Alluvial / Laterite" },
  { name:"Banana",      emoji:"🍌", cat:"Fruit",      season:"Perennial",days:"300–365", rain:"1200–2000mm", seedRate:0.25, N:200, P:100, K:300, ph:"6.0–7.5", soil:"Alluvial / Loamy" },
  { name:"Papaya",      emoji:"🍈", cat:"Fruit",      season:"Perennial",days:"210+",    rain:"1000–2000mm", seedRate:0.3,  N:200, P:100, K:200, ph:"6.0–7.0", soil:"Sandy Loam" },
  { name:"Guava",       emoji:"🍐", cat:"Fruit",      season:"Perennial",days:"365+",    rain:"1000–2000mm", seedRate:0.02, N:500, P:250, K:500, ph:"4.5–8.2", soil:"Any well-drained" },
  { name:"Pomegranate", emoji:"🍎", cat:"Fruit",      season:"Perennial",days:"365+",    rain:"500–900mm",   seedRate:0.06, N:625, P:250, K:250, ph:"5.5–7.0", soil:"Sandy Loam" },
  { name:"Watermelon",  emoji:"🍉", cat:"Fruit",      season:"Zaid",     days:"80–90",   rain:"400–600mm",   seedRate:1.5,  N:100, P:75,  K:75,  ph:"6.0–7.0", soil:"Sandy Loam" },
  { name:"Tomato",      emoji:"🍅", cat:"Vegetable",  season:"All",      days:"60–90",   rain:"600–1200mm",  seedRate:0.2,  N:150, P:100, K:150, ph:"6.0–7.0", soil:"Loamy" },
  { name:"Potato",      emoji:"🥔", cat:"Vegetable",  season:"Rabi",     days:"70–120",  rain:"500–700mm",   seedRate:600,  N:150, P:100, K:150, ph:"5.0–6.5", soil:"Loamy" },
  { name:"Onion",       emoji:"🧅", cat:"Vegetable",  season:"Rabi",     days:"90–120",  rain:"500–750mm",   seedRate:10,   N:100, P:50,  K:50,  ph:"6.0–7.5", soil:"Alluvial / Loamy" },
  { name:"Chilli",      emoji:"🌶️", cat:"Vegetable",  season:"Kharif",   days:"120–180", rain:"600–900mm",   seedRate:1,    N:100, P:60,  K:80,  ph:"6.0–7.5", soil:"Sandy Loam" },
  { name:"Cucumber",    emoji:"🥒", cat:"Vegetable",  season:"Zaid",     days:"50–70",   rain:"300–500mm",   seedRate:1.5,  N:120, P:80,  K:80,  ph:"6.0–7.0", soil:"Sandy Loam" },
  { name:"Rose",        emoji:"🌹", cat:"Flower",     season:"All",      days:"365+",    rain:"700–1200mm",  seedRate:0.5,  N:80,  P:60,  K:80,  ph:"5.5–7.0", soil:"Loamy" },
  { name:"Marigold",    emoji:"🌼", cat:"Flower",     season:"All",      days:"60–90",   rain:"400–700mm",   seedRate:1,    N:60,  P:40,  K:40,  ph:"6.0–7.5", soil:"Well-drained" },
  { name:"Jasmine",     emoji:"🌸", cat:"Flower",     season:"Perennial",days:"365+",    rain:"600–1000mm",  seedRate:0.3,  N:60,  P:40,  K:60,  ph:"6.0–7.5", soil:"Sandy Loam" },
  { name:"Sunflower",   emoji:"🌻", cat:"Flower",     season:"Kharif",   days:"90–100",  rain:"500–750mm",   seedRate:5,    N:90,  P:60,  K:30,  ph:"6.0–7.5", soil:"Sandy Loam" },
  { name:"Turmeric",    emoji:"🟡", cat:"Spice",      season:"Kharif",   days:"210–270", rain:"1500–2000mm", seedRate:1200, N:120, P:60,  K:120, ph:"5.5–7.0", soil:"Loamy" },
  { name:"Ginger",      emoji:"🫚", cat:"Spice",      season:"Kharif",   days:"180–240", rain:"1200–1800mm", seedRate:800,  N:75,  P:50,  K:112, ph:"5.5–6.5", soil:"Sandy Loam" },
  { name:"Cardamom",    emoji:"🟢", cat:"Spice",      season:"Perennial",days:"730+",    rain:"1500–3500mm", seedRate:0.5,  N:75,  P:50,  K:75,  ph:"5.0–6.5", soil:"Forest Loam" },
  { name:"Mustard",     emoji:"🌼", cat:"Oilseed",    season:"Rabi",     days:"90–110",  rain:"250–400mm",   seedRate:1.5,  N:80,  P:40,  K:20,  ph:"6.0–7.5", soil:"Sandy Loam" },
  { name:"Coffee",      emoji:"☕", cat:"Plantation", season:"Perennial",days:"1460+",   rain:"1500–2500mm", seedRate:0.4,  N:300, P:150, K:150, ph:"5.5–6.5", soil:"Red Laterite" },
  { name:"Tea",         emoji:"🍵", cat:"Plantation", season:"Perennial",days:"1095+",   rain:"1500–3000mm", seedRate:0.2,  N:150, P:50,  K:100, ph:"4.5–5.5", soil:"Red Laterite" },
];

const MONTHS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TODAY      = new Date();
const RAIN_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

// ─────────────────────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────────────────────
function haversine(a, b) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const x = Math.sin(dLat/2)**2 + Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

function polygonArea(pts) {
  if (pts.length < 3) return 0;
  const cx = pts.reduce((s,p)=>s+p.lat,0)/pts.length;
  const cy = pts.reduce((s,p)=>s+p.lon,0)/pts.length;
  const mPerLat = 111320;
  const mPerLon = 111320 * Math.cos(cx * Math.PI / 180);
  const m = pts.map(p=>({ x:(p.lon-cy)*mPerLon, y:(p.lat-cx)*mPerLat }));
  let area = 0;
  for (let i=0, j=m.length-1; i<m.length; j=i++) area += m[j].x*m[i].y - m[i].x*m[j].y;
  return Math.abs(area / 2);
}

function perimeterM(pts) {
  let p = 0;
  for (let i=0; i<pts.length; i++) p += haversine(pts[i], pts[(i+1)%pts.length]);
  return p;
}

function detectSoil(lat, lon) {
  if (lat < 13 && lon < 76) return "tropical_wet";
  if (lat < 16 && lon > 76) return "tropical_dry";
  if (lat > 20) return "alluvial";
  if (lon < 74) return "semi_arid";
  return "tropical_wet";
}

function detectClimate(lat) {
  if (lat > 25) return "Semi-arid";
  if (lat > 18) return "Tropical Dry/Wet";
  return "Tropical Wet";
}

// ─────────────────────────────────────────────────────────────
//  DATA FETCHERS
// ─────────────────────────────────────────────────────────────
async function fetchAllRainfall(lat, lon) {
  const result = {};
  RAIN_YEARS.forEach(y => { result[y] = Array(12).fill(0); });

  // ERA5 archive: 2020 → 2025
  const archRes  = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2020-01-01&end_date=2025-12-31&daily=precipitation_sum&timezone=auto`);
  const archData = await archRes.json();
  (archData.daily?.time || []).forEach((d, i) => {
    const dt = new Date(d), yr = dt.getFullYear(), mo = dt.getMonth();
    if (result[yr]) result[yr][mo] += (archData.daily.precipitation_sum[i] || 0);
  });

  // 2026 YTD via forecast past_days
  const daysSinceJan1 = Math.floor((TODAY - new Date(TODAY.getFullYear()+"-01-01")) / 86400000) + 1;
  const fRes  = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&timezone=auto&past_days=${daysSinceJan1}&forecast_days=1`);
  const fData = await fRes.json();
  (fData.daily?.time || []).forEach((d, i) => {
    const dt = new Date(d), yr = dt.getFullYear(), mo = dt.getMonth();
    if (yr === TODAY.getFullYear() && result[yr]) result[yr][mo] += (fData.daily.precipitation_sum[i] || 0);
  });

  RAIN_YEARS.forEach(y => { result[y] = result[y].map(v => Math.round(v * 10) / 10); });
  return result;
}

async function fetchWeather(lat, lon) {
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=7`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────
//  CHART COMPONENTS
// ─────────────────────────────────────────────────────────────
function BarChart({ data, labels, color="#4cc9f0", height=100, isYtd=false }) {
  const max = Math.max(...data.map(v=>v||0), 1);
  const cutoff = TODAY.getMonth();
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height }}>
      {data.map((v,i) => {
        const faded = isYtd && i > cutoff;
        const barH  = Math.max(v>0?2:0, Math.round(((v||0)/max)*(height-22)));
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <span style={{ fontSize:8, color:"#7ec8a0", fontWeight:600, minHeight:10 }}>
              {!faded && v > 0 ? Math.round(v) : ""}
            </span>
            <div title={`${labels[i]}: ${v}mm`} style={{ width:"100%", height:barH||2, borderRadius:"3px 3px 0 0", background:faded?"rgba(255,255,255,0.06)":color, border:faded?"1px dashed rgba(255,255,255,0.1)":"none", transition:"height .5s" }}/>
            <span style={{ fontSize:8, color:faded?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.35)" }}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ data, labels, color="#52b788", height=90 }) {
  const vals = data.map(v => parseFloat(v) || 0);
  const max = Math.max(...vals, 1), min = Math.min(...vals, 0);
  const W = 300, H = height;
  const toX = i => (i / (vals.length - 1 || 1)) * W;
  const toY = v => H - ((v - min) / (max - min || 1)) * (H - 20) - 4;
  const pathD = vals.map((v,i) => `${i===0?"M":"L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const fillD = [...vals.map((v,i)=>`${i===0?"M":"L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`), `L${W},${H}`, `L0,${H}`].join(" ");
  const uid = color.replace(/[^a-zA-Z0-9]/g,"");
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id={`lg_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <path d={fillD + " Z"} fill={`url(#lg_${uid})`}/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {vals.map((v,i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(v)} r="4" fill={color} stroke="#0c160c" strokeWidth="2"/>
          <text x={toX(i)} y={toY(v)-9} textAnchor="middle" fill={color} fontSize="9" fontWeight="700">{vals[i]}</text>
          {labels && <text x={toX(i)} y={H} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">{labels[i]}</text>}
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  GPS MAP CANVAS
// ─────────────────────────────────────────────────────────────
function GpsMapCanvas({ points, livePos, height=220 }) {
  const ref = useRef(null);
  const all = livePos ? [...points, livePos] : points;

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const W = c.offsetWidth || 400;
    c.width = W; c.height = height;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, W, height);

    // background + grid
    ctx.fillStyle = "#0d1f0d"; ctx.fillRect(0, 0, W, height);
    ctx.strokeStyle = "rgba(64,145,108,0.1)"; ctx.lineWidth = 1;
    for (let x=0; x<W; x+=24) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke(); }
    for (let y=0; y<height; y+=24) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    if (all.length === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.font = "13px DM Sans, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Walk your land boundary to mark it", W/2, height/2 - 8);
      ctx.fillStyle = "rgba(255,255,255,0.09)"; ctx.font = "11px DM Sans, sans-serif";
      ctx.fillText("Tap  Walk & Mark  to start", W/2, height/2 + 12);
      return;
    }

    const lats = all.map(p=>p.lat), lons = all.map(p=>p.lon);
    const minLat=Math.min(...lats), maxLat=Math.max(...lats);
    const minLon=Math.min(...lons), maxLon=Math.max(...lons);
    const pad = 28;
    const toX = lon => pad + ((lon - minLon) / (maxLon - minLon || 0.00005)) * (W - pad*2);
    const toY = lat => height - pad - ((lat - minLat) / (maxLat - minLat || 0.00005)) * (height - pad*2);

    // polygon
    if (points.length >= 3) {
      ctx.beginPath();
      points.forEach((p,i) => i===0 ? ctx.moveTo(toX(p.lon),toY(p.lat)) : ctx.lineTo(toX(p.lon),toY(p.lat)));
      ctx.closePath();
      ctx.fillStyle = "rgba(64,145,108,0.18)"; ctx.fill();
      ctx.strokeStyle = "#52b788"; ctx.lineWidth = 2.5; ctx.stroke();
      const area = Math.round(polygonArea(points));
      ctx.font = "bold 15px DM Sans, sans-serif"; ctx.textAlign = "center";
      ctx.fillStyle = "rgba(249,199,79,0.92)";
      ctx.fillText(`${area.toLocaleString()} m²`, W/2, height/2);
      ctx.font = "11px DM Sans, sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(`${(area/4046.86).toFixed(3)} acres`, W/2, height/2 + 16);
    }

    // trail
    if (all.length >= 2) {
      ctx.beginPath();
      all.forEach((p,i) => i===0 ? ctx.moveTo(toX(p.lon),toY(p.lat)) : ctx.lineTo(toX(p.lon),toY(p.lat)));
      ctx.strokeStyle = "rgba(249,199,79,0.45)"; ctx.lineWidth = 1.5;
      ctx.setLineDash([5,4]); ctx.stroke(); ctx.setLineDash([]);
    }

    // markers
    points.forEach((p,i) => {
      const x=toX(p.lon), y=toY(p.lat);
      if (i===0) { ctx.beginPath(); ctx.arc(x,y,10,0,2*Math.PI); ctx.fillStyle="rgba(249,199,79,0.12)"; ctx.fill(); }
      ctx.beginPath(); ctx.arc(x,y,5,0,2*Math.PI);
      ctx.fillStyle = i===0 ? "#f9c74f" : "#52b788";
      ctx.fill(); ctx.strokeStyle = "#0f1a0f"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(i+1, x, y-9);
    });

    // live dot
    if (livePos) {
      const x=toX(livePos.lon), y=toY(livePos.lat);
      ctx.beginPath(); ctx.arc(x,y,14,0,2*Math.PI); ctx.fillStyle="rgba(230,57,70,0.18)"; ctx.fill();
      ctx.beginPath(); ctx.arc(x,y,6,0,2*Math.PI); ctx.fillStyle="#e63946"; ctx.fill();
      ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.stroke();
    }
  }, [points, livePos, height]);

  return (
    <canvas ref={ref} height={height}
      style={{ width:"100%", display:"block", borderRadius:10, border:"1px solid rgba(64,145,108,0.2)" }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
//  PH METER
// ─────────────────────────────────────────────────────────────
function PhMeter({ ph }) {
  const [lo, hi] = ph.split("–").map(parseFloat);
  const mid = (lo + hi) / 2;
  const pct = ((mid - 4) / (9 - 4)) * 100;
  const col = mid < 6 ? "#e74c3c" : mid < 7.5 ? "#2ecc71" : "#3498db";
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"rgba(255,255,255,0.3)", marginBottom:4 }}>
        <span>4.0 Acidic</span><span>7.0 Neutral</span><span>9.0 Alkaline</span>
      </div>
      <div style={{ height:10, borderRadius:5, background:"linear-gradient(to right,#e74c3c,#e67e22,#f1c40f,#2ecc71,#27ae60,#3498db,#8e44ad)", position:"relative", marginBottom:8 }}>
        <div style={{ position:"absolute", top:-2, left:`${pct}%`, transform:"translateX(-50%)", width:14, height:14, borderRadius:"50%", background:"#fff", border:`3px solid ${col}`, boxShadow:"0 2px 8px rgba(0,0,0,0.6)" }}/>
      </div>
      <div style={{ textAlign:"center", fontWeight:700, fontSize:13, color:col }}>
        pH {ph} &nbsp;·&nbsp;
        <span style={{ fontWeight:400, color:"rgba(255,255,255,0.4)", fontSize:11 }}>
          {mid < 6 ? "Acidic" : mid < 7.5 ? "Slightly Acidic – Neutral" : "Alkaline"}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  GPS WAITING SCREEN
// ─────────────────────────────────────────────────────────────
function GpsWaitScreen({ status, accuracy, onRetry }) {
  return (
    <div style={{ minHeight:"100vh", background:"#0c160c", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"DM Sans, sans-serif", padding:24, textAlign:"center" }}>
      <style>{`@keyframes ping{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.6);opacity:.3}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={{ position:"relative", width:88, height:88, marginBottom:28 }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"rgba(64,145,108,0.12)", animation:"ping 2s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", inset:12, borderRadius:"50%", background:"rgba(64,145,108,0.2)", animation:"ping 2s ease-in-out infinite .4s" }}/>
        <div style={{ position:"absolute", inset:24, borderRadius:"50%", background:"#40916c", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>📍</div>
      </div>
      <div style={{ fontFamily:"DM Serif Display, serif", fontSize:26, color:"#f9c74f", marginBottom:10 }}>🌾 FarmWise</div>
      <div style={{ fontSize:14, color:"rgba(223,240,216,0.7)", marginBottom:8, animation:"pulse 1.5s infinite" }}>{status}</div>
      {accuracy && (
        <div style={{ fontSize:12, color:"rgba(76,201,240,0.85)", background:"rgba(76,201,240,0.08)", border:"1px solid rgba(76,201,240,0.2)", padding:"5px 14px", borderRadius:20, marginBottom:20 }}>
          📡 GPS accuracy: ±{Math.round(accuracy)}m
        </div>
      )}
      {!accuracy && (
        <div style={{ fontSize:12, color:"rgba(223,240,216,0.3)", maxWidth:290, lineHeight:1.8, marginBottom:24 }}>
          Please allow location access when prompted.<br/>
          FarmWise needs real GPS to measure land, fetch local rainfall & analyse soil.
        </div>
      )}
      {onRetry && (
        <button onClick={onRetry} style={{ background:"#40916c", color:"#fff", border:"none", padding:"11px 26px", borderRadius:9, fontFamily:"DM Sans, sans-serif", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          🔄 Retry GPS
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  THEME & STYLE HELPERS
// ─────────────────────────────────────────────────────────────
const T = {
  bg:"#0c160c", card:"#111e11", border:"rgba(52,130,80,0.2)",
  green:"#40916c", green2:"#52b788", sun:"#f9c74f",
  text:"#dff0d8", muted:"rgba(223,240,216,0.45)", accent:"#74c69d",
  red:"#e63946", sky:"#4cc9f0",
};

const S = {
  card:{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden", marginBottom:14 },
  head:{ padding:"11px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" },
  title:{ fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:7, color:T.text },
  body:{ padding:"13px 16px" },
  badge:(c) => ({ fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:10, background:`${c}22`, color:c, letterSpacing:.8, textTransform:"uppercase" }),
  btn:(c, sm) => ({ background:c, color:"#fff", border:"none", padding:sm?"6px 12px":"9px 18px", borderRadius:8, fontFamily:"DM Sans, sans-serif", fontSize:sm?11:13, fontWeight:700, cursor:"pointer", transition:"opacity .15s" }),
  input:{ background:"rgba(0,0,0,0.35)", border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", color:T.text, fontFamily:"DM Sans, sans-serif", fontSize:13, outline:"none", width:"100%" },
  stat:{ background:"rgba(0,0,0,0.3)", borderRadius:9, padding:"10px 8px", textAlign:"center" },
  val:{ fontFamily:"DM Serif Display, serif", fontSize:21, color:T.green2, lineHeight:1.1 },
  lbl:{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:.6, marginTop:2 },
  g2:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 },
};

// ─────────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  // GPS
  const [gpsState, setGpsState]       = useState("acquiring"); // acquiring | ready | denied
  const [gpsStatus, setGpsStatus]     = useState("Requesting GPS location…");
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const initWatch = useRef(null);

  // Core
  const [tab, setTab]                 = useState("lands");
  const [lands, setLands]             = useState([]);
  const [activeIdx, setActiveIdx]     = useState(null);
  const [userLoc, setUserLoc]         = useState(null);
  const [soilKey, setSoilKey]         = useState(null);

  // Walk
  const [walkMode, setWalkMode]       = useState(false);
  const [walkPts, setWalkPts]         = useState([]);
  const [livePos, setLivePos]         = useState(null);
  const walkWatch = useRef(null);

  // Land UI
  const [showAdd, setShowAdd]         = useState(false);
  const [newName, setNewName]         = useState("");

  // Weather
  const [weather, setWeather]         = useState(null);
  const [wxLoad, setWxLoad]           = useState(false);

  // AI
  const [aiQ, setAiQ]                 = useState("");
  const [aiResp, setAiResp]           = useState("");
  const [aiLoad, setAiLoad]           = useState(false);

  // Crops
  const [cropQ, setCropQ]             = useState("");
  const [cropFilter, setCropFilter]   = useState("All");
  const [selCrop, setSelCrop]         = useState(null);

  // Rain
  const [rainData, setRainData]       = useState(null);
  const [rainLoad, setRainLoad]       = useState(false);
  const [rainErr, setRainErr]         = useState("");
  const [selYear, setSelYear]         = useState(TODAY.getFullYear());

  const activeLand = activeIdx !== null ? lands[activeIdx] : null;
  const soil       = soilKey ? SOIL_DB[soilKey] : null;

  // ── GPS init ──
  function startGps() {
    if (!navigator.geolocation) {
      setGpsState("denied"); setGpsStatus("Geolocation not supported by this browser."); return;
    }
    setGpsState("acquiring"); setGpsStatus("Acquiring GPS signal…"); setGpsAccuracy(null);
    initWatch.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude:lat, longitude:lon, accuracy } = pos.coords;
        setGpsAccuracy(accuracy);
        setGpsStatus(`GPS locked · ±${Math.round(accuracy)}m accuracy`);
        if (accuracy <= 150) {
          navigator.geolocation.clearWatch(initWatch.current);
          setUserLoc({ lat, lon });
          setSoilKey(detectSoil(lat, lon));
          setGpsState("ready");
          loadWeather(lat, lon);
          loadRainfall(lat, lon);
        }
      },
      err => {
        setGpsState("denied");
        setGpsStatus(err.code === 1
          ? "Location access denied. Allow GPS in browser settings and retry."
          : "GPS signal not found. Move to an open area and retry."
        );
      },
      { enableHighAccuracy:true, maximumAge:0, timeout:30000 }
    );
  }

  useEffect(() => {
    startGps();
    return () => { if (initWatch.current) navigator.geolocation.clearWatch(initWatch.current); };
  }, []);

  async function loadWeather(lat, lon) {
    setWxLoad(true);
    try { setWeather(await fetchWeather(lat, lon)); } catch(e) {}
    setWxLoad(false);
  }

  async function loadRainfall(lat, lon) {
    setRainLoad(true); setRainErr("");
    try { setRainData(await fetchAllRainfall(lat, lon)); }
    catch(e) { setRainErr("Could not fetch rainfall data. Check connection."); }
    setRainLoad(false);
  }

  // ── Walk mode ──
  function startWalk(idx) {
    setActiveIdx(idx); setWalkMode(true); setWalkPts([]); setLivePos(null);
    if (!navigator.geolocation) return;
    walkWatch.current = navigator.geolocation.watchPosition(
      p => setLivePos({ lat:p.coords.latitude, lon:p.coords.longitude }),
      () => {}, { enableHighAccuracy:true, maximumAge:0 }
    );
  }

  function dropPoint() {
    if (livePos) setWalkPts(p => [...p, livePos]);
  }

  function cancelWalk() {
    if (walkWatch.current) navigator.geolocation.clearWatch(walkWatch.current);
    setWalkMode(false); setWalkPts([]); setLivePos(null);
  }

  function saveWalk() {
    if (walkWatch.current) navigator.geolocation.clearWatch(walkWatch.current);
    if (walkPts.length < 3) return;
    const area = polygonArea(walkPts), peri = perimeterM(walkPts);
    setLands(prev => prev.map((l,i) => i === activeIdx
      ? { ...l, points:walkPts, area:Math.round(area), acres:area/4046.86, perimeter:Math.round(peri) }
      : l
    ));
    setWalkMode(false); setWalkPts([]); setLivePos(null);
  }

  // ── Land add ──
  function addLand() {
    if (!newName.trim()) return;
    const idx = lands.length;
    setLands(p => [...p, { name:newName.trim(), points:[], area:null, acres:null, perimeter:null }]);
    setActiveIdx(idx); setNewName(""); setShowAdd(false);
  }

  // ── AI ──
  async function askAI() {
    if (!aiQ.trim() || aiLoad) return;
    setAiLoad(true); setAiResp("");
    const ctx = `You are FarmWise AI — a precise Indian agricultural advisor. Farm: "${activeLand?.name||"Farm"}", Area=${activeLand?.area||"?"}m² (${activeLand?.acres?.toFixed(2)||"?"}ac), GPS=(${userLoc?.lat?.toFixed(4)},${userLoc?.lon?.toFixed(4)}), Soil=${soil?.name||"?"}, pH=${soil?.ph||"?"}, Climate=${userLoc ? detectClimate(userLoc.lat) : "?"}. Give 4–5 sentences of precise actionable advice with specific quantities.`;
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:ctx, messages:[{ role:"user", content:aiQ }] })
      });
      const d = await r.json();
      setAiResp(d.content?.[0]?.text || "No response.");
    } catch(e) { setAiResp("⚠️ Connection error. Try again."); }
    setAiLoad(false);
  }

  // ── Rain derived ──
  const yearTotals = rainData ? RAIN_YEARS.map(y => Math.round(rainData[y].reduce((a,b)=>a+b,0))) : null;
  const histYears  = RAIN_YEARS.filter(y => y < TODAY.getFullYear());
  const avgMonthly = rainData ? MONTHS.map((_,mi) => Math.round(histYears.reduce((s,y)=>s+rainData[y][mi],0) / histYears.length * 10) / 10) : null;
  const avgAnnual  = yearTotals ? Math.round(histYears.reduce((s,y,i)=>s+yearTotals[RAIN_YEARS.indexOf(y)],0) / histYears.length) : 900;
  const gwDepth    = parseFloat(Math.max(3, Math.min(20, 15 - avgAnnual/200)).toFixed(1));
  const gwByYear   = rainData ? RAIN_YEARS.map(y => parseFloat(Math.max(3, Math.min(20, 15 - rainData[y].reduce((a,b)=>a+b,0)/200)).toFixed(1))) : null;

  const cats         = ["All", ...new Set(CROP_DB.map(c=>c.cat))];
  const visibleCrops = CROP_DB.filter(c =>
    (cropFilter==="All" || c.cat===cropFilter) &&
    (cropQ==="" || c.name.toLowerCase().includes(cropQ.toLowerCase()))
  );

  // ════════════════════════════════════════════
  //  GPS SCREENS
  // ════════════════════════════════════════════
  if (gpsState === "acquiring") return <GpsWaitScreen status={gpsStatus} accuracy={gpsAccuracy}/>;
  if (gpsState === "denied") return (
    <GpsWaitScreen status={gpsStatus} onRetry={() => startGps()}/>
  );

  // ════════════════════════════════════════════
  //  WALK MODE
  // ════════════════════════════════════════════
  if (walkMode) {
    const area = walkPts.length >= 3 ? Math.round(polygonArea(walkPts)) : 0;
    return (
      <div style={{ background:T.bg, minHeight:"100vh", fontFamily:"DM Sans, sans-serif", color:T.text }}>
        <div style={{ background:"#091409", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, zIndex:10 }}>
          <div style={{ fontFamily:"DM Serif Display, serif", color:T.sun, fontSize:17 }}>📍 Walk Mode — {lands[activeIdx]?.name}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {livePos && <span style={{ fontSize:10, color:T.red, fontWeight:700 }}>● LIVE</span>}
            <span style={{ fontSize:12, background:"rgba(64,145,108,0.2)", color:T.green2, padding:"4px 10px", borderRadius:20, fontWeight:700 }}>{walkPts.length} pts</span>
          </div>
        </div>
        <div style={{ padding:14, display:"flex", flexDirection:"column", gap:12, maxWidth:600, margin:"0 auto" }}>
          <GpsMapCanvas points={walkPts} livePos={livePos} height={260}/>
          {livePos && (
            <div style={{ background:"rgba(230,57,70,0.07)", border:"1px solid rgba(230,57,70,0.2)", borderRadius:9, padding:"7px 12px", fontSize:11, color:T.muted }}>
              <span style={{ color:T.red, fontWeight:700 }}>● LIVE GPS</span>&nbsp; {livePos.lat.toFixed(6)}°N, {livePos.lon.toFixed(6)}°E
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {[[walkPts.length,"Points"],[area>0?area.toLocaleString():"—","sq m"],[area>0?(area/4046.86).toFixed(3):"—","Acres"]].map(([v,l])=>(
              <div key={l} style={S.stat}><div style={S.val}>{v}</div><div style={S.lbl}>{l}</div></div>
            ))}
          </div>
          <button style={{ ...S.btn(T.green), padding:15, fontSize:15 }} onClick={dropPoint} disabled={!livePos}>
            {livePos ? "📍 Drop GPS Point Here" : "⏳ Waiting for GPS signal…"}
          </button>
          <button style={S.btn("#4a3f10")} onClick={()=>setWalkPts(p=>p.slice(0,-1))} disabled={walkPts.length===0}>↩ Undo Last Point</button>
          {walkPts.length >= 3 && (
            <button style={{ ...S.btn("#1b5e38"), padding:13, fontSize:14 }} onClick={saveWalk}>
              ✅ Save Land — {walkPts.length} GPS Points · {area.toLocaleString()} m²
            </button>
          )}
          <button style={{ ...S.btn("#2a1515","sm"), alignSelf:"center" }} onClick={cancelWalk}>✕ Cancel</button>
          <div style={{ fontSize:11, color:T.muted, lineHeight:1.9, background:"rgba(0,0,0,0.2)", borderRadius:9, padding:"10px 14px" }}>
            <strong style={{ color:T.sun }}>How to walk your land:</strong><br/>
            1. Walk to each corner of your farm physically<br/>
            2. Tap <strong style={{ color:"#fff" }}>Drop GPS Point Here</strong> at every corner<br/>
            3. Mark 3+ corners — polygon area calculates automatically<br/>
            4. Tap <strong style={{ color:"#fff" }}>Save Land</strong> when boundary is closed
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  //  MAIN UI
  // ════════════════════════════════════════════
  return (
    <div style={{ background:T.bg, minHeight:"100vh", fontFamily:"DM Sans, sans-serif", color:T.text }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        input::placeholder { color:rgba(223,240,216,0.28); }
        button:hover { opacity:.85; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(64,145,108,0.4); border-radius:2px; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .fi { animation:fadeIn .3s ease; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ background:T.card, borderBottom:`1px solid ${T.border}`, padding:"11px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, gap:10 }}>
        <div style={{ fontFamily:"DM Serif Display, serif", color:T.sun, fontSize:19, whiteSpace:"nowrap" }}>🌾 FarmWise</div>
        <div style={{ display:"flex", gap:3, background:"rgba(0,0,0,0.3)", padding:3, borderRadius:12 }}>
          {[["lands","🗺","Lands"],["crops","🌱","Crops"],["weather","🌧","Rain"],["water","💧","Water"]].map(([k,ic,lb])=>(
            <button key={k} onClick={()=>setTab(k)} style={{ padding:"6px 11px", borderRadius:8, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"inherit", background:tab===k?T.green:"transparent", color:tab===k?"#fff":T.muted }}>
              {ic} {lb}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(230,57,70,0.1)", border:"1px solid rgba(230,57,70,0.25)", padding:"4px 10px", borderRadius:20, whiteSpace:"nowrap" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:T.red, display:"inline-block", animation:"livePulse 1.5s infinite" }}/>
          <span style={{ fontSize:10, color:T.red, fontWeight:700 }}>{userLoc?.lat?.toFixed(3)}°N</span>
        </div>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"14px 13px" }}>

        {/* ══════════ LANDS TAB ══════════ */}
        {tab === "lands" && (
          <div className="fi">
            {/* Plot selector */}
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:13, alignItems:"center" }}>
              {lands.map((l,i) => (
                <button key={i} onClick={()=>setActiveIdx(i)} style={{ padding:"7px 13px", borderRadius:9, border:`1.5px solid ${activeIdx===i?T.green:T.border}`, background:activeIdx===i?"rgba(64,145,108,0.18)":"transparent", color:activeIdx===i?T.green2:T.muted, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  {l.area?"✅":"📐"} {l.name}
                  {l.acres ? <span style={{ marginLeft:5, fontSize:10, opacity:.7 }}>{l.acres.toFixed(2)}ac</span> : null}
                </button>
              ))}
              {showAdd ? (
                <div style={{ display:"flex", gap:6 }}>
                  <input style={{ ...S.input, width:130 }} placeholder="Plot name…" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addLand()} autoFocus/>
                  <button style={S.btn(T.green,"sm")} onClick={addLand}>Add</button>
                  <button style={S.btn("#333","sm")} onClick={()=>setShowAdd(false)}>✕</button>
                </div>
              ) : (
                <button style={S.btn(T.green,"sm")} onClick={()=>setShowAdd(true)}>+ New Plot</button>
              )}
            </div>

            {lands.length === 0 && (
              <div style={S.card}>
                <div style={{ padding:"50px 20px", textAlign:"center" }}>
                  <div style={{ fontSize:52, marginBottom:12 }}>🌾</div>
                  <div style={{ fontFamily:"DM Serif Display, serif", fontSize:22, color:T.sun, marginBottom:8 }}>No farms yet</div>
                  <div style={{ fontSize:13, color:T.muted, marginBottom:20, lineHeight:1.7 }}>Add a plot, then physically walk its boundary to measure it with live GPS</div>
                  <button style={S.btn(T.green)} onClick={()=>setShowAdd(true)}>+ Add Your First Land</button>
                </div>
              </div>
            )}

            {activeLand && (
              <>
                {/* Map card */}
                <div style={S.card}>
                  <div style={S.head}>
                    <div style={S.title}>📍 {activeLand.name}</div>
                    <div style={{ display:"flex", gap:7 }}>
                      {activeLand.area && <span style={S.badge(T.green2)}>Measured</span>}
                      <button style={S.btn(T.green,"sm")} onClick={()=>startWalk(activeIdx)}>🚶 Walk & Mark</button>
                    </div>
                  </div>
                  <div style={S.body}>
                    <GpsMapCanvas points={activeLand.points} height={220}/>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginTop:12 }}>
                      {[
                        [activeLand.area?.toLocaleString()||"—","Sq Meters"],
                        [activeLand.acres?.toFixed(3)||"—","Acres"],
                        [activeLand.perimeter||"—","Perimeter m"],
                        [activeLand.points.length,"GPS Points"],
                      ].map(([v,l]) => (
                        <div key={l} style={S.stat}><div style={S.val}>{v}</div><div style={S.lbl}>{l}</div></div>
                      ))}
                    </div>
                    {!activeLand.area && (
                      <div style={{ marginTop:11, background:"rgba(249,199,79,0.07)", border:"1px solid rgba(249,199,79,0.18)", borderRadius:8, padding:"10px 12px", fontSize:12, color:T.muted, lineHeight:1.7 }}>
                        👆 Tap <strong style={{ color:T.sun }}>Walk & Mark</strong> — walk around your farm perimeter and drop a GPS point at each corner. Area & acres calculate automatically.
                      </div>
                    )}
                  </div>
                </div>

                {/* Soil + pH */}
                {soil && (
                  <div style={S.g2}>
                    <div style={S.card}>
                      <div style={S.head}><div style={S.title}>🪱 Soil Analysis</div><span style={S.badge(T.green)}>GPS-detected</span></div>
                      <div style={S.body}>
                        <div style={{ display:"flex", gap:10, marginBottom:10 }}>
                          <div style={{ width:40, height:40, borderRadius:8, background:soil.color, border:"2px solid rgba(255,255,255,0.12)", flexShrink:0 }}/>
                          <div>
                            <div style={{ fontWeight:700, fontSize:14, color:T.accent }}>{soil.name}</div>
                            <div style={{ fontSize:11, color:T.muted }}>GPS: {userLoc?.lat?.toFixed(2)}°N, {userLoc?.lon?.toFixed(2)}°E</div>
                          </div>
                        </div>
                        <div style={{ fontSize:11, color:T.muted, lineHeight:1.7, marginBottom:10 }}>{soil.desc}</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                          {soil.crops.map(c => (
                            <span key={c} style={{ background:"rgba(64,145,108,0.18)", color:T.green2, padding:"2px 9px", borderRadius:10, fontSize:11, fontWeight:600 }}>{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={S.card}>
                      <div style={S.head}><div style={S.title}>🧪 Soil pH</div><span style={S.badge(T.sun)}>Avg: {soil.ph}</span></div>
                      <div style={S.body}>
                        <PhMeter ph={soil.ph}/>
                        <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                          {[["💧 Drainage","Moderate"],["🌡 Temp","25–35°C"],["🧂 Salinity","Low"],["🌿 Organic","1–2%"]].map(([l,v]) => (
                            <div key={l} style={{ background:"rgba(0,0,0,0.2)", borderRadius:7, padding:"6px 8px" }}>
                              <div style={{ fontSize:10, color:T.muted }}>{l}</div>
                              <div style={{ fontWeight:600, fontSize:12, color:T.text, marginTop:1 }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Today's weather */}
                <div style={S.card}>
                  <div style={S.head}><div style={S.title}>🌡 Today's Conditions</div><span style={S.badge(T.sky)}>Live</span></div>
                  <div style={S.body}>
                    {wxLoad ? (
                      <div style={{ color:T.muted, fontSize:13 }}>Loading…</div>
                    ) : weather ? (
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                        {[["🌡",`${weather.current.temperature_2m}°C`,"Temp"],["💧",`${weather.current.relative_humidity_2m}%`,"Humidity"],["🌬",`${weather.current.wind_speed_10m}km/h`,"Wind"],["🌧",`${weather.current.precipitation}mm`,"Rain Now"]].map(([ic,v,l]) => (
                          <div key={l} style={S.stat}><div style={{ fontSize:20, marginBottom:4 }}>{ic}</div><div style={{ fontWeight:700, fontSize:13, color:T.accent }}>{v}</div><div style={S.lbl}>{l}</div></div>
                        ))}
                      </div>
                    ) : <div style={{ color:T.muted, fontSize:13 }}>Unavailable</div>}
                  </div>
                </div>

                {/* AI Advisor */}
                <div style={S.card}>
                  <div style={S.head}><div style={S.title}>🤖 AI Farm Advisor</div><span style={S.badge(T.sun)}>Claude AI</span></div>
                  <div style={S.body}>
                    <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                      <input style={S.input} placeholder="Best crops? Fertilizer schedule? Irrigation tips?" value={aiQ} onChange={e=>setAiQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAI()}/>
                      <button style={S.btn(T.green)} onClick={askAI} disabled={aiLoad}>
                        {aiLoad ? <span style={{ display:"inline-block", animation:"spin 1s linear infinite" }}>⟳</span> : "Ask ↗"}
                      </button>
                    </div>
                    {aiLoad && <div style={{ color:T.muted, fontSize:12 }}>🌱 Analyzing your farm data…</div>}
                    {aiResp && !aiLoad && (
                      <div className="fi" style={{ background:"rgba(0,0,0,0.28)", borderRadius:9, padding:13, fontSize:13, color:T.text, lineHeight:1.85, border:`1px solid ${T.border}` }}>
                        {aiResp}
                      </div>
                    )}
                    {!aiResp && !aiLoad && (
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {["Best crops for my soil?","How much fertilizer needed?","Irrigation schedule?","Expected yield per acre?"].map(q => (
                          <button key={q} onClick={()=>setAiQ(q)} style={{ padding:"5px 11px", borderRadius:15, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>{q}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════ CROPS TAB ══════════ */}
        {tab === "crops" && (
          <div className="fi">
            <div style={S.card}>
              <div style={S.body}>
                <input style={{ ...S.input, marginBottom:10 }} placeholder="🔍  Search — coconut, rose, wheat, turmeric, cotton…" value={cropQ} onChange={e=>setCropQ(e.target.value)}/>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {cats.map(c => (
                    <button key={c} onClick={()=>setCropFilter(c)} style={{ padding:"4px 11px", borderRadius:16, border:`1.5px solid ${cropFilter===c?T.green:T.border}`, background:cropFilter===c?"rgba(64,145,108,0.18)":"transparent", color:cropFilter===c?T.green2:T.muted, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {selCrop && (
              <div className="fi" style={{ ...S.card, border:`2px solid ${T.green}` }}>
                <div style={S.head}>
                  <div style={S.title}>{selCrop.emoji} {selCrop.name}</div>
                  <button style={S.btn("#2a2a2a","sm")} onClick={()=>setSelCrop(null)}>✕ Close</button>
                </div>
                <div style={S.body}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:13 }}>
                    {[["📅 Season",selCrop.season],["⏱ Duration",selCrop.days],["🌧 Rainfall",selCrop.rain],["🪱 Soil",selCrop.soil],["🧪 pH",selCrop.ph],["🗂 Category",selCrop.cat]].map(([l,v]) => (
                      <div key={l} style={{ background:"rgba(0,0,0,0.22)", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ fontSize:10, color:T.muted }}>{l}</div>
                        <div style={{ fontWeight:600, fontSize:12, color:T.text, marginTop:2 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Seeds */}
                  <div style={{ background:"rgba(64,145,108,0.08)", border:`1px solid rgba(64,145,108,0.2)`, borderRadius:9, padding:12, marginBottom:12 }}>
                    <div style={{ fontWeight:700, fontSize:12, color:T.green2, marginBottom:8 }}>🌱 Seeds Needed</div>
                    {activeLand?.acres ? (
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        <div style={S.stat}><div style={{ ...S.val, fontSize:17 }}>{selCrop.seedRate} kg</div><div style={{ fontSize:9, color:T.sky }}>per acre</div></div>
                        <div style={S.stat}><div style={{ ...S.val, fontSize:17 }}>{(selCrop.seedRate*activeLand.acres).toFixed(2)} kg</div><div style={{ fontSize:9, color:T.sky }}>total for {activeLand.acres.toFixed(2)} ac</div></div>
                      </div>
                    ) : (
                      <div style={{ fontSize:12, color:T.muted, padding:"8px 10px", background:"rgba(249,199,79,0.07)", borderRadius:7 }}>
                        ⚠️ <strong style={{ color:T.sun }}>Measure a plot in the Lands tab</strong> to get exact quantities.
                      </div>
                    )}
                  </div>

                  {/* NPK */}
                  <div style={{ fontWeight:700, fontSize:12, color:T.accent, marginBottom:8 }}>🧪 Fertilizer — per acre → total for your land</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                    {[["N — Nitrogen",selCrop.N,"#2ecc71"],["P — Phosphorus",selCrop.P,"#f39c12"],["K — Potassium",selCrop.K,"#e74c3c"]].map(([l,v,c]) => (
                      <div key={l} style={{ background:`${c}11`, border:`1px solid ${c}44`, borderRadius:9, padding:"10px 8px", textAlign:"center" }}>
                        <div style={{ fontSize:10, color:`${c}cc`, marginBottom:4 }}>{l}</div>
                        <div style={{ fontWeight:800, fontSize:16, color:c }}>{v} <span style={{ fontSize:10, fontWeight:400 }}>kg/ac</span></div>
                        {activeLand?.acres && <div style={{ fontSize:11, color:`${c}99`, marginTop:3 }}>Total: {Math.round(v*activeLand.acres)} kg</div>}
                      </div>
                    ))}
                  </div>

                  <button style={S.btn(T.green)} onClick={() => {
                    setAiQ(`Complete growing guide for ${selCrop.name}: sowing, fertilizer doses, irrigation & pest management for my ${activeLand?.acres?.toFixed(2)||"?"}ac farm`);
                    setTab("lands");
                    setTimeout(askAI, 100);
                  }}>
                    🤖 Full AI Guide for {selCrop.name} ↗
                  </button>
                </div>
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {visibleCrops.map(crop => (
                <div key={crop.name} onClick={()=>setSelCrop(crop)} style={{ background:selCrop?.name===crop.name?"rgba(64,145,108,0.18)":"rgba(0,0,0,0.25)", border:`1.5px solid ${selCrop?.name===crop.name?T.green:T.border}`, borderRadius:11, padding:"10px 11px", cursor:"pointer", transition:"all .18s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                    <span style={{ fontSize:24 }}>{crop.emoji}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{crop.name}</div>
                      <div style={{ fontSize:10, color:T.muted }}>{crop.cat} · {crop.season}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {[["N",crop.N,"#2ecc71"],["P",crop.P,"#f39c12"],["K",crop.K,"#e74c3c"]].map(([l,v,c]) => (
                      <span key={l} style={{ background:`${c}18`, color:c, padding:"2px 7px", borderRadius:6, fontSize:10, fontWeight:700 }}>{l} {v}</span>
                    ))}
                    {activeLand?.acres && <span style={{ background:`${T.sky}18`, color:T.sky, padding:"2px 7px", borderRadius:6, fontSize:10, fontWeight:700 }}>🌱 {(crop.seedRate*activeLand.acres).toFixed(1)}kg</span>}
                    <span style={{ background:"rgba(255,255,255,0.06)", color:T.muted, padding:"2px 7px", borderRadius:6, fontSize:10 }}>{crop.days}d</span>
                  </div>
                </div>
              ))}
            </div>
            {visibleCrops.length === 0 && <div style={{ textAlign:"center", color:T.muted, padding:"40px 0" }}>No crops found for "{cropQ}"</div>}
          </div>
        )}

        {/* ══════════ RAIN TAB ══════════ */}
        {tab === "weather" && (
          <div className="fi">
            {/* 7-day forecast */}
            {weather && (
              <div style={S.card}>
                <div style={S.head}><div style={S.title}>📅 7-Day Forecast</div><span style={S.badge(T.sky)}>Open-Meteo Live</span></div>
                <div style={S.body}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5 }}>
                    {weather.daily.time.map((t,i) => {
                      const wc = weather.daily.weathercode[i];
                      const ic = {0:"☀️",1:"🌤",2:"⛅",3:"🌥",45:"🌫",51:"🌦",61:"🌧",63:"🌧",71:"❄️",80:"🌧",95:"⛈"}[wc] || "🌤";
                      const dn = i===0 ? "Today" : new Date(t).toLocaleDateString("en",{weekday:"short"});
                      return (
                        <div key={t} style={{ background:i===0?"rgba(64,145,108,0.22)":"rgba(0,0,0,0.25)", border:`1px solid ${i===0?T.green:T.border}`, borderRadius:9, padding:"8px 4px", textAlign:"center" }}>
                          <div style={{ fontSize:9, fontWeight:700, color:i===0?T.green2:T.muted }}>{dn}</div>
                          <div style={{ fontSize:18, margin:"4px 0" }}>{ic}</div>
                          <div style={{ fontWeight:700, fontSize:12 }}>{Math.round(weather.daily.temperature_2m_max[i])}°</div>
                          <div style={{ fontSize:9, color:T.sky }}>{(weather.daily.precipitation_sum[i]||0).toFixed(1)}mm</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {rainLoad && <div style={S.card}><div style={S.body}><div style={{ color:T.muted, fontSize:13, textAlign:"center", padding:"24px 0" }}>🌧 Fetching ERA5 + live {TODAY.getFullYear()} rainfall data from Open-Meteo…</div></div></div>}
            {rainErr  && <div style={S.card}><div style={S.body}><div style={{ color:T.red, fontSize:13 }}>⚠️ {rainErr}</div></div></div>}

            {rainData && (
              <>
                {/* Year tabs + monthly bar */}
                <div style={S.card}>
                  <div style={S.head}>
                    <div style={S.title}>🌧 Monthly Rainfall (mm)</div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      {RAIN_YEARS.map(y => (
                        <button key={y} onClick={()=>setSelYear(y)} style={{ padding:"3px 9px", borderRadius:8, border:`1.5px solid ${selYear===y?T.sky:T.border}`, background:selYear===y?"rgba(76,201,240,0.18)":"transparent", color:selYear===y?T.sky:T.muted, fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                          {y}{y===TODAY.getFullYear()?"*":""}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={S.body}>
                    <BarChart data={rainData[selYear]} labels={MONTHS} color={T.sky} height={110} isYtd={selYear===TODAY.getFullYear()}/>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:T.muted, marginTop:8, flexWrap:"wrap", gap:6 }}>
                      <span>📅 <strong style={{ color:T.sky }}>{selYear}</strong>{selYear===TODAY.getFullYear()?" (YTD)":""}</span>
                      <span>Total: <strong style={{ color:T.sky }}>{Math.round(rainData[selYear].reduce((a,b)=>a+b,0))} mm</strong></span>
                      {selYear === TODAY.getFullYear()
                        ? <span style={{ fontSize:10, color:"rgba(76,201,240,0.5)" }}>* YTD Jan–{MONTHS[TODAY.getMonth()]} {TODAY.getDate()} via forecast API</span>
                        : <span>Peak: <strong style={{ color:T.sky }}>{MONTHS[rainData[selYear].indexOf(Math.max(...rainData[selYear]))]} ({Math.round(Math.max(...rainData[selYear]))}mm)</strong></span>
                      }
                    </div>
                    {selYear===TODAY.getFullYear() && <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginTop:4 }}>Faded bars = months not yet reached</div>}
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.15)", marginTop:6 }}>Source: ERA5 reanalysis (2020–2025) + forecast API ({TODAY.getFullYear()} YTD) · {userLoc?.lat?.toFixed(3)}°N, {userLoc?.lon?.toFixed(3)}°E</div>
                  </div>
                </div>

                {/* Annual totals */}
                <div style={S.card}>
                  <div style={S.head}><div style={S.title}>📊 Annual Rainfall 2020–{TODAY.getFullYear()}</div><span style={S.badge(T.green2)}>ERA5 + Live</span></div>
                  <div style={S.body}>
                    <BarChart data={yearTotals} labels={RAIN_YEARS.map(y=>y===TODAY.getFullYear()?""+y+"*":String(y))} color={T.green2} height={110}/>
                    <div style={{ display:"grid", gridTemplateColumns:`repeat(${RAIN_YEARS.length},1fr)`, gap:5, marginTop:10 }}>
                      {RAIN_YEARS.map((y,i) => (
                        <div key={y} style={{ ...S.stat, cursor:"pointer", border:`1px solid ${selYear===y?T.green:T.border}` }} onClick={()=>setSelYear(y)}>
                          <div style={{ fontWeight:700, fontSize:12, color:T.green2 }}>{yearTotals[i]}</div>
                          <div style={{ fontSize:8, color:T.muted }}>{y}{y===TODAY.getFullYear()?"*":""}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.15)", marginTop:8 }}>* {TODAY.getFullYear()} = Jan–{MONTHS[TODAY.getMonth()]} YTD · Click year for monthly breakdown</div>
                  </div>
                </div>

                {/* Avg monthly */}
                <div style={S.card}>
                  <div style={S.head}><div style={S.title}>📅 Historical Monthly Average</div><span style={S.badge(T.muted)}>2020–{TODAY.getFullYear()-1} mean</span></div>
                  <div style={S.body}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:5 }}>
                      {MONTHS.map((m,i) => {
                        const v = avgMonthly[i];
                        const c = v>150?T.sky:v>80?T.green2:v>30?T.accent:T.muted;
                        return (
                          <div key={m} style={{ background:"rgba(0,0,0,0.22)", borderRadius:8, padding:"8px 4px", textAlign:"center" }}>
                            <div style={{ fontSize:10, fontWeight:600, color:T.muted }}>{m}</div>
                            <div style={{ fontWeight:700, fontSize:15, color:c, margin:"2px 0" }}>{v}</div>
                            <div style={{ fontSize:9, color:T.muted }}>mm</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Climate events */}
                <div style={S.card}>
                  <div style={S.head}><div style={S.title}>🌪 Climate Events Log</div><span style={S.badge(T.red)}>Real Anomalies</span></div>
                  <div style={S.body}>
                    {(() => {
                      const evs = [];
                      RAIN_YEARS.slice().reverse().forEach(yr => {
                        rainData[yr].forEach((v,mi) => {
                          if (v > 200) evs.push({ yr, m:MONTHS[mi], v, type:"flood" });
                          else if (v < 5 && [5,6,7,8].includes(mi)) evs.push({ yr, m:MONTHS[mi], v, type:"drought" });
                        });
                      });
                      if (!evs.length) return <div style={{ fontSize:13, color:T.muted }}>No extreme anomalies detected for this location in the data range.</div>;
                      return evs.slice(0,12).map(({ yr,m,v,type }) => (
                        <div key={`${yr}${m}`} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 11px", background:"rgba(0,0,0,0.22)", borderRadius:8, border:`1px solid ${type==="flood"?"rgba(76,201,240,0.2)":"rgba(249,199,79,0.15)"}`, marginBottom:6 }}>
                          <span style={{ fontSize:20 }}>{type==="flood"?"🌊":"🔥"}</span>
                          <div>
                            <span style={{ fontWeight:700, fontSize:12, color:type==="flood"?T.sky:T.sun }}>{yr} {m}: </span>
                            <span style={{ fontSize:12, color:T.muted }}>{type==="flood"?`Heavy — ${v}mm (flood risk)`:`Dry monsoon month — only ${v}mm`}</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════ WATER TAB ══════════ */}
        {tab === "water" && (
          <div className="fi">
            <div style={{ background:"rgba(76,201,240,0.07)", border:"1px solid rgba(76,201,240,0.2)", borderRadius:9, padding:"8px 13px", fontSize:11, color:T.sky, marginBottom:14, lineHeight:1.7 }}>
              💧 Groundwater depth estimated from real ERA5 rainfall (Open-Meteo 2020–{TODAY.getFullYear()}) using soil-recharge correlation for your GPS coordinates ({userLoc?.lat?.toFixed(4)}°N, {userLoc?.lon?.toFixed(4)}°E). For certified borewell decisions consult CGWB.
            </div>

            <div style={S.g2}>
              {/* Depth visual */}
              <div style={S.card}>
                <div style={S.head}><div style={S.title}>💧 Water Table Depth</div><span style={S.badge(T.sky)}>{histYears.length}-yr avg</span></div>
                <div style={S.body}>
                  <div style={{ position:"relative", height:130, background:"linear-gradient(180deg,#6B4F12 0%,#4a3520 20%,#2d1f12 55%,#1a3a5c 100%)", borderRadius:10, overflow:"hidden", marginBottom:10 }}>
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:`${Math.min(90,Math.max(10,100-gwDepth*5))}%`, background:"rgba(76,201,240,0.35)", borderTop:"2px solid rgba(76,201,240,0.8)", transition:"height 1s ease" }}/>
                    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
                      <div style={{ fontFamily:"DM Serif Display, serif", fontSize:28, color:"#fff", textShadow:"0 2px 12px rgba(0,0,0,.7)" }}>{gwDepth}m</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,.55)" }}>avg depth to water table</div>
                    </div>
                    <div style={{ position:"absolute", top:8, left:12, fontSize:10, color:"rgba(255,255,255,.4)" }}>⬆ Surface</div>
                    <div style={{ position:"absolute", bottom:8, left:12, fontSize:10, color:"rgba(76,201,240,.9)" }}>💧 Groundwater</div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
                    {[[`${gwDepth}m`,"Avg Depth"],[gwDepth<8?"Good":"Moderate","Availability"],[gwDepth<8?"High":"Avg","Recharge"]].map(([v,l]) => (
                      <div key={l} style={S.stat}><div style={{ fontWeight:700, fontSize:14, color:T.sky }}>{v}</div><div style={S.lbl}>{l}</div></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GW trend */}
              <div style={S.card}>
                <div style={S.head}><div style={S.title}>📈 GW Depth Trend</div><span style={S.badge(T.green)}>ERA5-derived</span></div>
                <div style={S.body}>
                  {gwByYear ? (
                    <>
                      <LineChart data={gwByYear} labels={RAIN_YEARS.map(y=>y===TODAY.getFullYear()?"'"+String(y).slice(2)+"*":String(y).slice(2))} color={T.sky} height={110}/>
                      <div style={{ fontSize:10, color:T.muted, marginTop:8, lineHeight:1.7 }}>↓ Lower = water table closer to surface (better recharge year).</div>
                      <div style={{ display:"grid", gridTemplateColumns:`repeat(${RAIN_YEARS.length},1fr)`, gap:4, marginTop:10 }}>
                        {RAIN_YEARS.map((y,i) => (
                          <div key={y} style={S.stat}>
                            <div style={{ fontWeight:700, fontSize:11, color:T.sky }}>{gwByYear[i]}m</div>
                            <div style={{ fontSize:8, color:T.muted }}>{y}{y===TODAY.getFullYear()?"*":""}</div>
                            {yearTotals && <div style={{ fontSize:7, color:T.muted }}>{yearTotals[i]}mm</div>}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <div style={{ color:T.muted, fontSize:12 }}>Awaiting rainfall data…</div>}
                </div>
              </div>
            </div>

            {/* Forecast */}
            <div style={S.card}>
              <div style={S.head}><div style={S.title}>🔮 GW Forecast — Jun–Nov {TODAY.getFullYear()}</div><span style={S.badge(T.sun)}>Monsoon model</span></div>
              <div style={S.body}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
                  {[
                    { m:"Jun", d:+(gwDepth+0.6).toFixed(1),  ic:"📉", note:"Pre-monsoon" },
                    { m:"Jul", d:+(gwDepth-1.8).toFixed(1),  ic:"📈", note:"Monsoon" },
                    { m:"Aug", d:+(gwDepth-2.4).toFixed(1),  ic:"📈", note:"Peak" },
                    { m:"Sep", d:+(gwDepth-2.1).toFixed(1),  ic:"➡️", note:"Stable" },
                    { m:"Oct", d:+(gwDepth-1.2).toFixed(1),  ic:"📉", note:"Retreat" },
                    { m:"Nov", d:+(gwDepth-0.3).toFixed(1),  ic:"📉", note:"Post-mon" },
                  ].map(f => (
                    <div key={f.m} style={{ background:"rgba(0,0,0,0.28)", border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 4px", textAlign:"center" }}>
                      <div style={{ fontSize:9, fontWeight:700, color:T.muted }}>{f.m} {TODAY.getFullYear()}</div>
                      <div style={{ fontSize:18, margin:"4px 0" }}>{f.ic}</div>
                      <div style={{ fontWeight:700, fontSize:13, color:T.sky }}>{Math.max(2,f.d).toFixed(1)}m</div>
                      <div style={{ fontSize:9, color:T.muted, marginTop:2 }}>{f.note}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:11, color:T.muted, marginTop:10, padding:"8px 10px", background:"rgba(0,0,0,0.18)", borderRadius:8, lineHeight:1.7 }}>
                  Baseline: <strong style={{ color:T.sun }}>{gwDepth}m</strong> ({histYears.length}-yr ERA5 avg) · Monsoon recharge typically +1.5–3m · GPS: {userLoc?.lat?.toFixed(4)}°N, {userLoc?.lon?.toFixed(4)}°E
                </div>
              </div>
            </div>

            {/* Irrigation guide */}
            <div style={S.card}>
              <div style={S.head}><div style={S.title}>🚿 Irrigation Methods</div><span style={S.badge(T.green)}>Efficiency guide</span></div>
              <div style={S.body}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    { ic:"💧", n:"Drip Irrigation",  eff:"90%", c:T.sky,       best:"Fruits, vegetables, flowers",   note:"Best for water-scarce periods" },
                    { ic:"🌀", n:"Sprinkler",         eff:"75%", c:T.green2,    best:"Wheat, groundnut, pulses",      note:"Good for sandy soils" },
                    { ic:"🌊", n:"Flood / Furrow",    eff:"45%", c:"#f39c12",   best:"Rice, sugarcane",               note:"Needs high water supply" },
                    { ic:"🪣", n:"Check Basin",       eff:"60%", c:T.accent,    best:"Coconut, mango, orchards",      note:"Efficient for tree crops" },
                  ].map(f => (
                    <div key={f.n} style={{ background:"rgba(0,0,0,0.22)", border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        <span style={{ fontSize:22 }}>{f.ic}</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:12 }}>{f.n}</div>
                          <span style={{ background:`${f.c}22`, color:f.c, fontSize:10, padding:"1px 7px", borderRadius:6, fontWeight:700 }}>Eff: {f.eff}</span>
                        </div>
                      </div>
                      <div style={{ fontSize:11, color:T.muted }}>Best: <strong style={{ color:T.accent }}>{f.best}</strong></div>
                      <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{f.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
