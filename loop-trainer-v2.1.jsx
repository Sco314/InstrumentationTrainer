import { useState, useRef, useCallback, useEffect } from "react";

// ─── CONSTANTS ───
const W = 1100;
const H = 720;
const SNAP_RADIUS = 22;
const MODES = ["OFF", "V DC", "mA DC", "Ω"];

// ─── DETAILED ROSEMOUNT (pasted component, adapted) ───
function RosemountTransmitter({ x = 0, y = 0, mA = 12.0, scale = 1, tag = "PT-101", showLabel = true }) {
  const s = scale;
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <defs>
        <linearGradient id="txBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67aee3" />
          <stop offset="35%" stopColor="#3e89c8" />
          <stop offset="70%" stopColor="#2f74ad" />
          <stop offset="100%" stopColor="#255d8d" />
        </linearGradient>
        <linearGradient id="txBlueDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4b97d0" />
          <stop offset="100%" stopColor="#20537d" />
        </linearGradient>
        <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5a5f66" />
          <stop offset="20%" stopColor="#9aa3ab" />
          <stop offset="50%" stopColor="#d7dde2" />
          <stop offset="80%" stopColor="#8c949b" />
          <stop offset="100%" stopColor="#585e65" />
        </linearGradient>
        <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0f1820" />
          <stop offset="100%" stopColor="#202f3c" />
        </linearGradient>
        <linearGradient id="lcdGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10271b" />
          <stop offset="100%" stopColor="#0a1710" />
        </linearGradient>
        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="1.5" dy="2.2" stdDeviation="2" floodColor="#000" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Bottom process neck */}
      <g filter="url(#softShadow)">
        <rect x="58" y="110" width="24" height="22" rx="4" fill="url(#metal)" stroke="#4d5258" strokeWidth="1.2" />
        <rect x="52" y="128" width="36" height="8" rx="2" fill="#737a81" stroke="#4f565d" strokeWidth="1" />
      </g>

      {/* Main body */}
      <g filter="url(#softShadow)">
        <path d="M34 44 Q34 32 46 32 L120 32 Q132 32 132 44 L132 95 Q132 108 118 108 L48 108 Q34 108 34 95 Z"
          fill="url(#txBlue)" stroke="#1f537e" strokeWidth="2" />
        <path d="M40 40 Q45 35 52 35 L117 35 Q125 35 128 43 L128 49 L39 49 Z"
          fill="rgba(255,255,255,0.16)" stroke="none" />
        {/* Right endcap / conduit */}
        <rect x="130" y="47" width="18" height="28" rx="4" fill="url(#txBlueDark)" stroke="#1f537e" strokeWidth="1.4" />
        <rect x="145" y="51" width="18" height="20" rx="3" fill="url(#metal)" stroke="#4d5258" strokeWidth="1" />
        {/* Left endcap */}
        <rect x="20" y="48" width="18" height="26" rx="4" fill="url(#txBlueDark)" stroke="#1f537e" strokeWidth="1.4" />
        <rect x="5" y="52" width="18" height="18" rx="3" fill="url(#metal)" stroke="#4d5258" strokeWidth="1" />
        {/* Display bezel */}
        <rect x="49" y="46" width="68" height="26" rx="4" fill="#1b242d" stroke="#617a8d" strokeWidth="1.2" />
        <rect x="52" y="49" width="62" height="20" rx="3" fill="url(#glass)" stroke="#334756" strokeWidth="0.8" />
        <rect x="54" y="51" width="58" height="16" rx="2" fill="url(#lcdGlow)" />
        <text x="83" y="63.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5df58b" fontFamily="Consolas, 'Courier New', monospace" letterSpacing="0.8">
          {mA.toFixed(2)}
        </text>
        <text x="108" y="63.5" textAnchor="start" fontSize="6" fontWeight="700" fill="#78f7a0" fontFamily="Consolas, 'Courier New', monospace">mA</text>
        <text x="83" y="87" textAnchor="middle" fontSize="7" fontWeight="700" fill="#d9eefc" letterSpacing="0.6">ROSEMOUNT 3051</text>
        <text x="83" y="96" textAnchor="middle" fontSize="5" fill="#b8d8ef">SMART PRESSURE TRANSMITTER</text>
        {/* Orange latch */}
        <rect x="132" y="58" width="5" height="18" rx="2" fill="#f26b1d" stroke="#b14c14" strokeWidth="0.8" />
      </g>

      {/* Terminal head */}
      <g filter="url(#softShadow)">
        <circle cx="30" cy="70" r="34" fill="url(#txBlue)" stroke="#1f537e" strokeWidth="2.2" />
        <circle cx="30" cy="70" r="27.5" fill="#d8e0e7" stroke="#8f9aa5" strokeWidth="1.2" />
        <path d="M7 60 Q7 48 18 48 L42 48 Q53 48 53 60 L53 82 Q53 91 44 91 L16 91 Q7 91 7 82 Z"
          fill="#30353a" stroke="#171a1d" strokeWidth="1.1" />
        {/* Ground screw */}
        <circle cx="30" cy="43" r="4.2" fill="#b6bec6" stroke="#6f7880" strokeWidth="1" />
        <text x="30" y="45.5" textAnchor="middle" fontSize="6.5" fill="#333">⏚</text>
        {/* Terminal screws */}
        {[{ cx: 18, label: "+" }, { cx: 30, label: "−" }, { cx: 42, label: "T" }].map((t, i) => (
          <g key={i}>
            <circle cx={t.cx} cy="69" r="4.9" fill="#d9dde1" stroke="#8a8f94" strokeWidth="1" />
            <line x1={t.cx - 2.3} y1="66.7" x2={t.cx + 2.3} y2="71.3" stroke="#6f7277" strokeWidth="0.9" />
            <line x1={t.cx + 2.3} y1="66.7" x2={t.cx - 2.3} y2="71.3" stroke="#6f7277" strokeWidth="0.9" />
            <text x={t.cx} y="79.8" textAnchor="middle" fontSize="5.4" fill="#f5f7f8" fontWeight="700">{t.label}</text>
          </g>
        ))}
        <text x="24" y="87.5" textAnchor="middle" fontSize="4.6" fill="#dfe6eb">PWR/COMM</text>
        <text x="42" y="87.5" textAnchor="middle" fontSize="4.6" fill="#dfe6eb">TEST</text>
        {/* Conduit hub */}
        <rect x="-10" y="60" width="12" height="20" rx="3" fill="url(#metal)" stroke="#4d5258" strokeWidth="1" />
      </g>

      {/* Corner fasteners */}
      {[[42, 38], [124, 38], [42, 102], [124, 102]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.4" fill="#c9d0d6" stroke="#767d84" strokeWidth="0.8" />
      ))}

      {/* Tag label */}
      {showLabel && (
        <text x="83" y="150" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1f2937">{tag}</text>
      )}
    </g>
  );
}

// ─── OTHER COMPONENTS (unchanged from v2) ───

function Tank({ x, y, level }) {
  const tankH = 320, tankW = 160, wallR = 30;
  const liquidH = (level / 100) * (tankH - 20);
  const liquidY = y + tankH - liquidH - 10;
  const glassX = x + tankW - 8, glassW = 14;
  return (
    <g>
      <rect x={x} y={y + wallR} width={tankW} height={tankH - wallR * 2} fill="#8a8a8a" stroke="#666" strokeWidth="2.5" />
      <ellipse cx={x + tankW / 2} cy={y + wallR} rx={tankW / 2} ry={wallR} fill="#999" stroke="#666" strokeWidth="2.5" />
      <ellipse cx={x + tankW / 2} cy={y + tankH - wallR} rx={tankW / 2} ry={wallR} fill="#7a7a7a" stroke="#666" strokeWidth="2.5" />
      <clipPath id="tankBodyClip">
        <rect x={x + 2} y={y + wallR} width={tankW - 4} height={tankH - wallR * 2} />
        <ellipse cx={x + tankW / 2} cy={y + tankH - wallR} rx={tankW / 2 - 2} ry={wallR - 2} />
      </clipPath>
      <rect x={x + 2} y={liquidY} width={tankW - 4} height={y + tankH - liquidY} fill="#d97706" opacity="0.75" clipPath="url(#tankBodyClip)" />
      <line x1={x + 12} y1={liquidY} x2={x + tankW - 12} y2={liquidY} stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
      <rect x={glassX} y={y + wallR + 10} width={glassW} height={tankH - wallR * 2 - 20} rx="3" fill="#1a2e1a" stroke="#555" strokeWidth="1.5" opacity="0.7" />
      <rect x={glassX + 2} y={Math.max(liquidY, y + wallR + 12)} width={glassW - 4}
        height={Math.max(0, y + tankH - wallR - 12 - Math.max(liquidY, y + wallR + 12))} fill="#d97706" opacity="0.6" rx="2" />
      {[0, 25, 50, 75, 100].map((pct) => {
        const markY = y + tankH - 10 - (pct / 100) * (tankH - 20);
        return (<g key={pct}><line x1={x + tankW + 8} y1={markY} x2={x + tankW + 16} y2={markY} stroke="#9ca3af" strokeWidth="1" />
          <text x={x + tankW + 20} y={markY + 3} fontSize="8" fill="#78716c">{pct}%</text></g>);
      })}
      <text x={x + tankW / 2} y={y + 60} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" opacity="0.7">Gas</text>
      <text x={x + tankW / 2} y={y + tankH - 60} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" opacity="0.8">Liquid</text>
      <text x={x + tankW / 2} y={y - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#78716c" letterSpacing="0.08em">PROCESS VESSEL</text>
      {/* Bottom nozzle */}
      <rect x={x + 30} y={y + tankH - wallR + 10} width="20" height="30" fill="#777" stroke="#555" strokeWidth="1.5" rx="2" />
      <rect x={x + 24} y={y + tankH - wallR + 38} width="32" height="8" fill="#888" stroke="#666" strokeWidth="1" rx="1" />
    </g>
  );
}

function ImpulseLine({ x1, y1, x2, y2 }) {
  return (
    <g>
      <path d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`} fill="none" stroke="#888" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`} fill="none" stroke="#aaa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function Conduit({ points }) {
  if (points.length < 2) return null;
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) d += ` L ${points[i][0]} ${points[i][1]}`;
  return (<g>
    <path d={d} fill="none" stroke="#555" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke="#777" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </g>);
}

function PowerSupply({ x, y }) {
  return (<g>
    <rect x={x} y={y} width="70" height="90" rx="4" fill="#d1d5db" stroke="#9ca3af" strokeWidth="2" />
    <rect x={x + 6} y={y + 6} width="58" height="36" rx="2" fill="#e5e7eb" stroke="#aaa" strokeWidth="1" />
    <text x={x + 35} y={y + 22} textAnchor="middle" fontSize="11" fontWeight="800" fill="#1f2937">24V</text>
    <text x={x + 35} y={y + 35} textAnchor="middle" fontSize="9" fill="#6b7280">DC</text>
    <rect x={x + 10} y={y + 82} width="50" height="6" rx="1" fill="#9ca3af" />
    <circle cx={x + 22} cy={y + 58} r="5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
    <text x={x + 22} y={y + 61} textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">+</text>
    <circle cx={x + 48} cy={y + 58} r="5" fill="#1f2937" stroke="#fff" strokeWidth="1.5" />
    <text x={x + 48} y={y + 61} textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">−</text>
    <text x={x + 35} y={y + 76} textAnchor="middle" fontSize="7" fill="#6b7280">POWER SUPPLY</text>
  </g>);
}

function PLCRack({ x, y }) {
  return (<g>
    <rect x={x} y={y} width="100" height="80" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="2" />
    <rect x={x + 5} y={y + 5} width="25" height="70" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
    <rect x={x + 8} y={y + 10} width="19" height="8" rx="1" fill="#06b6d4" opacity="0.6" />
    <text x={x + 17} y={y + 30} textAnchor="middle" fontSize="5" fill="#94a3b8">CPU</text>
    <rect x={x + 33} y={y + 5} width="25" height="70" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
    <rect x={x + 36} y={y + 10} width="19" height="8" rx="1" fill="#06b6d4" opacity="0.6" />
    <text x={x + 45} y={y + 30} textAnchor="middle" fontSize="5" fill="#94a3b8">AI</text>
    {[0, 1, 2, 3].map((i) => (<circle key={i} cx={x + 39 + i * 5} cy={y + 42} r="2" fill={i === 0 ? "#22c55e" : "#334155"} />))}
    <rect x={x + 61} y={y + 5} width="25" height="70" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
    <rect x={x + 33} y={y + 58} width="25" height="14" rx="1" fill="#374151" stroke="#475569" strokeWidth="0.8" />
    {[0, 1, 2, 3].map((i) => (<rect key={i} x={x + 36 + i * 5} y={y + 61} width="3" height="8" rx="0.5" fill="#9ca3af" />))}
    <text x={x + 50} y={y - 5} textAnchor="middle" fontSize="8" fill="#78716c" fontWeight="600">PLC</text>
  </g>);
}

function HMIScreen({ x, y, level, mA }) {
  return (<g>
    <rect x={x} y={y} width="140" height="100" rx="6" fill="#6b7280" stroke="#4b5563" strokeWidth="2" />
    <rect x={x + 6} y={y + 6} width="128" height="72" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
    <text x={x + 70} y={y + 22} textAnchor="middle" fontSize="8" fill="#94a3b8">TANK LEVEL</text>
    <rect x={x + 14} y={y + 28} width="16" height="42" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
    <rect x={x + 16} y={y + 30 + 38 * (1 - level / 100)} width="12" height={38 * (level / 100)}
      fill={level > 80 ? "#ef4444" : level > 60 ? "#f59e0b" : "#22c55e"} rx="1" />
    <text x={x + 80} y={y + 42} textAnchor="middle" fontSize="18" fontWeight="800" fill="#22d3ee" fontFamily="'Courier New', monospace">{level.toFixed(1)}%</text>
    <text x={x + 80} y={y + 56} textAnchor="middle" fontSize="10" fill="#94a3b8">{mA.toFixed(2)} mA</text>
    <text x={x + 80} y={y + 68} textAnchor="middle" fontSize="8" fill={level > 80 ? "#ef4444" : "#22c55e"}>{level > 80 ? "⚠ HIGH" : "● NORMAL"}</text>
    {[0, 1, 2, 3].map((i) => (<rect key={i} x={x + 16 + i * 30} y={y + 84} width="20" height="8" rx="2" fill="#4b5563" stroke="#6b7280" strokeWidth="0.5" />))}
    <text x={x + 70} y={y + 110} textAnchor="middle" fontSize="7" fill="#78716c">HMI PANEL</text>
  </g>);
}

function Multimeter({ x, y, displayText, displayUnit, mode, modeIdx, onModeClick, showSuccess, blownFuse }) {
  return (<g>
    <rect x={x} y={y} width="110" height="175" rx="10" fill="url(#meterBody)" stroke="#92400e" strokeWidth="2" />
    <rect x={x - 3} y={y + 4} width="6" height="167" rx="3" fill="#374151" />
    <rect x={x + 107} y={y + 4} width="6" height="167" rx="3" fill="#374151" />
    <rect x={x + 14} y={y + 12} width="82" height="42" rx="3" fill="#1a2e1a" stroke="#374151" strokeWidth="1" />
    <text x={x + 90} y={y + 40} textAnchor="end" fontSize="22" fontWeight="700" fontFamily="'Courier New', monospace"
      fill={showSuccess ? "#4ade80" : blownFuse ? "#ef4444" : "#22c55e"}>{displayText || "----"}</text>
    <text x={x + 92} y={y + 50} textAnchor="end" fontSize="10" fill="#4ade80" opacity="0.7">{displayUnit}</text>
    <circle cx={x + 55} cy={y + 82} r="22" fill="#374151" stroke="#4b5563" strokeWidth="1.5" style={{ cursor: "pointer" }} onClick={onModeClick} />
    {MODES.map((m, i) => {
      const angle = -90 + (i / (MODES.length - 1)) * 180;
      const rad = (angle * Math.PI) / 180;
      return (<text key={m} x={x + 55 + Math.cos(rad) * 30} y={y + 82 + Math.sin(rad) * 30 + 3} textAnchor="middle" fontSize="7"
        fontWeight={i === modeIdx ? "800" : "400"} fill={i === modeIdx ? "#fbbf24" : "#9ca3af"} style={{ cursor: "pointer" }} onClick={onModeClick}>{m}</text>);
    })}
    {(() => { const a = -90 + (modeIdx / (MODES.length - 1)) * 180, r = (a * Math.PI) / 180;
      return <line x1={x + 55} y1={y + 82} x2={x + 55 + Math.cos(r) * 17} y2={y + 82 + Math.sin(r) * 17} stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />; })()}
    <circle cx={x + 55} cy={y + 82} r="4" fill="#fbbf24" />
    <text x={x + 55} y={y + 112} textAnchor="middle" fontSize="7" fill="#1f2937" fontWeight="600">▲ CLICK DIAL</text>
    <text x={x + 35} y={y + 130} textAnchor="middle" fontSize="7" fill="#1f2937" fontWeight="700">COM</text>
    <circle cx={x + 35} cy={y + 140} r="6" fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
    <text x={x + 75} y={y + 130} textAnchor="middle" fontSize="7" fill="#1f2937" fontWeight="700">mA</text>
    <circle cx={x + 75} cy={y + 140} r="6" fill="#8b0000" stroke="#374151" strokeWidth="1.5" />
    <text x={x + 55} y={y - 6} textAnchor="middle" fontSize="9" fill="#78716c" fontWeight="600">MULTIMETER</text>
  </g>);
}

function SignalWire({ points, color = "#444", width = 3, dashed = false }) {
  if (points.length < 2) return null;
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) d += ` L ${points[i][0]} ${points[i][1]}`;
  return (<g>
    <path d={d} fill="none" stroke="#0008" strokeWidth={width + 2} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? "6 4" : "none"} />
  </g>);
}

// ─── MAIN APP ───
export default function InstrumentationTrainer() {
  const [tankLevel, setTankLevel] = useState(50);
  const [modeIdx, setModeIdx] = useState(0);
  const [stage, setStage] = useState(0);
  const [leads, setLeads] = useState({ red: { x: 150, y: 590, zone: null }, black: { x: 110, y: 590, zone: null } });
  const [dragging, setDragging] = useState(null);
  const [blownFuse, setBlownFuse] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const svgRef = useRef(null);

  const mA = 4 + (tankLevel / 100) * 16;
  const mode = MODES[modeIdx];

  // Positions — transmitter scaled down and placed near tank bottom
  const tankPos = { x: 780, y: 80 };
  const xmtrPos = { x: 590, y: 370 }; // adjusted for the larger detailed component
  const xmtrScale = 1.3;
  const psuPos = { x: 80, y: 200 };
  const plcPos = { x: 60, y: 340 };
  const hmiPos = { x: 40, y: 470 };
  const meterPos = { x: 75, y: 50 };

  // Break points
  const breakA = { x: 400, y: 270 };
  const breakB = { x: 450, y: 270 };

  const bothConnected = leads.red.zone && leads.black.zone;
  const isSeriesCorrect = bothConnected && (
    (leads.red.zone === "breakA" && leads.black.zone === "breakB") ||
    (leads.red.zone === "breakB" && leads.black.zone === "breakA")
  );

  let displayText = "", displayUnit = "";
  if (mode === "OFF") { displayText = ""; displayUnit = ""; }
  else if (blownFuse) { displayText = "FUSE"; }
  else if (!bothConnected) { displayText = "OL"; displayUnit = mode === "mA DC" ? "mA" : "V"; }
  else if (isSeriesCorrect && mode === "mA DC") { displayText = mA.toFixed(2); displayUnit = "mA"; }
  else if (isSeriesCorrect) { displayText = "0.00"; displayUnit = mode === "V DC" ? "V" : "Ω"; }
  else { displayText = "ERR"; }

  const showSuccess = isSeriesCorrect && mode === "mA DC" && !blownFuse;

  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * (W / rect.width), y: (cy - rect.top) * (H / rect.height) };
  }, []);

  const handleDown = useCallback((color) => (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragging(color);
    if (blownFuse) setBlownFuse(false);
  }, [blownFuse]);

  const handleMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const pt = getSVGPoint(e);
    setLeads((prev) => ({ ...prev, [dragging]: { x: pt.x, y: pt.y, zone: null } }));
  }, [dragging, getSVGPoint]);

  const handleUp = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const pt = getSVGPoint(e);
    const otherZone = leads[dragging === "red" ? "black" : "red"].zone;
    const zones = { breakA, breakB };
    let snapped = null;
    for (const [id, z] of Object.entries(zones)) {
      if (id === otherZone) continue;
      if (Math.hypot(pt.x - z.x, pt.y - z.y) < SNAP_RADIUS) { snapped = id; break; }
    }
    if (snapped) {
      setLeads((prev) => ({ ...prev, [dragging]: { x: zones[snapped].x, y: zones[snapped].y, zone: snapped } }));
    } else {
      const home = dragging === "red" ? { x: 150, y: 540 } : { x: 110, y: 540 };
      setLeads((prev) => ({ ...prev, [dragging]: { ...home, zone: null } }));
    }
    setDragging(null);
  }, [dragging, leads, getSVGPoint]);

  useEffect(() => {
    if (!dragging) return;
    const m = (e) => handleMove(e), u = (e) => handleUp(e);
    window.addEventListener("pointermove", m); window.addEventListener("pointerup", u);
    window.addEventListener("touchmove", m, { passive: false }); window.addEventListener("touchend", u);
    return () => { window.removeEventListener("pointermove", m); window.removeEventListener("pointerup", u);
      window.removeEventListener("touchmove", m); window.removeEventListener("touchend", u); };
  }, [dragging, handleMove, handleUp]);

  const resetLeads = () => { setLeads({ red: { x: 150, y: 540 }, black: { x: 110, y: 540 } }); setBlownFuse(false); };

  let feedback = "", fbColor = "#94a3b8";
  if (blownFuse) { feedback = "⚡ BLOWN FUSE — meter was connected incorrectly!"; fbColor = "#ef4444"; }
  else if (showSuccess) { feedback = `✅ Reading ${mA.toFixed(2)} mA = ${tankLevel}% level (4–20 mA range)`; fbColor = "#22c55e"; }
  else if (bothConnected && !isSeriesCorrect) { feedback = "❌ Incorrect — insert meter IN SERIES (break the loop, meter bridges the gap)"; fbColor = "#f59e0b"; }
  else if (isSeriesCorrect && mode !== "mA DC") { feedback = `⚠️ Leads correct! Now set dial to mA DC (currently: ${mode})`; fbColor = "#f59e0b"; }
  else if (stage === 2) { feedback = "Drag the red and black probes to break points A and B in the signal wire."; }
  else { feedback = "Select a stage above, or adjust the tank level to explore the loop."; }

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(180deg, #0c1220 0%, #162032 100%)",
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace", color: "#e2e8f0",
      display: "flex", flexDirection: "column", alignItems: "center", padding: "8px",
      userSelect: "none", touchAction: "none",
    }}>
      <div style={{ textAlign: "center", marginBottom: 6, width: "100%", maxWidth: W }}>
        <h1 style={{ fontSize: "clamp(15px, 2.5vw, 20px)", fontWeight: 800, margin: 0, letterSpacing: "0.06em", textTransform: "uppercase",
          background: "linear-gradient(90deg, #3b82f6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Instrumentation Loop Trainer
        </h1>
        <p style={{ fontSize: "clamp(10px, 1.5vw, 12px)", color: "#64748b", margin: "2px 0 0 0" }}>
          Tank → Transmitter → Wiring → Controller → Measurement
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {["Overview", "Wire Transmitter", "Test with Meter"].map((label, i) => (
          <button key={i} onClick={() => { setStage(i); resetLeads(); }} style={{
            padding: "5px 14px", borderRadius: 6, border: `1px solid ${stage === i ? "#3b82f6" : "#334155"}`,
            background: stage === i ? "#3b82f620" : "#1e293b", color: stage === i ? "#60a5fa" : "#94a3b8",
            fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: W }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{
          width: "100%", height: "auto", borderRadius: 10,
          background: "linear-gradient(180deg, #f5f0e8 0%, #e8e0d4 100%)",
          border: "1px solid #334155",
        }}>
          <defs>
            <linearGradient id="meterBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="30%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
            <filter id="compShadow">
              <feDropShadow dx="2" dy="3" stdDeviation="4" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background zones */}
          <rect x={520} y={0} width={W - 520} height={H} fill="#e8dfd0" opacity="0.5" />
          <text x={770} y={H - 8} textAnchor="middle" fontSize="10" fill="#a0937f" fontWeight="600" letterSpacing="0.1em">FIELD</text>
          <text x={250} y={H - 8} textAnchor="middle" fontSize="10" fill="#a0937f" fontWeight="600" letterSpacing="0.1em">CONTROL ROOM</text>
          <line x1="520" y1="0" x2="520" y2={H} stroke="#c4b5a0" strokeWidth="2" strokeDasharray="8 4" />

          {/* Tank */}
          <g filter="url(#compShadow)">
            <Tank x={tankPos.x} y={tankPos.y} level={tankLevel} />
          </g>

          {/* Impulse line from tank bottom nozzle to transmitter process connection */}
          <ImpulseLine
            x1={tankPos.x + 40}
            y1={tankPos.y + 320 - 30 + 42}
            x2={xmtrPos.x + 83 * xmtrScale}
            y2={xmtrPos.y + 136 * xmtrScale}
          />

          {/* ROSEMOUNT TRANSMITTER (new detailed version) */}
          <g filter="url(#compShadow)">
            <RosemountTransmitter
              x={xmtrPos.x}
              y={xmtrPos.y}
              mA={mA}
              scale={xmtrScale}
              tag="PT-101"
              showLabel={true}
            />
          </g>

          {/* Conduit from transmitter head to control room */}
          <Conduit points={[
            [xmtrPos.x + (-10) * xmtrScale, xmtrPos.y + 70 * xmtrScale],
            [xmtrPos.x - 40, xmtrPos.y + 70 * xmtrScale],
            [xmtrPos.x - 40, 270],
            [500, 270],
          ]} />

          {/* Signal wires */}
          {stage === 2 ? (
            <>
              <SignalWire points={[[psuPos.x + 22, psuPos.y + 58], [psuPos.x + 22, 270], [breakA.x - 14, 270]]} color="#b45309" width={2.5} />
              <SignalWire points={[[breakB.x + 14, 270], [500, 270]]} color="#b45309" width={2.5} />
              <rect x={breakA.x - 18} y={breakA.y - 20} width={breakB.x - breakA.x + 36} height="40" rx="6"
                fill={showSuccess ? "#22c55e10" : "#f59e0b10"} stroke={showSuccess ? "#22c55e60" : "#f59e0b60"} strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={(breakA.x + breakB.x) / 2} y={breakA.y - 26} textAnchor="middle" fontSize="9" fontWeight="700" fill="#92400e">BREAK POINT</text>
              {[["breakA", breakA], ["breakB", breakB]].map(([id, z]) => {
                const occ = leads.red.zone === id || leads.black.zone === id;
                const tgt = dragging && !occ;
                return (<g key={id}>
                  {tgt && <circle cx={z.x} cy={z.y} r={SNAP_RADIUS} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.4">
                    <animate attributeName="r" values={`${SNAP_RADIUS - 3};${SNAP_RADIUS + 3};${SNAP_RADIUS - 3}`} dur="1s" repeatCount="indefinite" />
                  </circle>}
                  <circle cx={z.x} cy={z.y} r="7" fill={occ ? "#334155" : "#78716c"} stroke={tgt ? "#f59e0b" : "#a8a29e"} strokeWidth={tgt ? 2.5 : 1.5} />
                  <text x={z.x} y={z.y + 20} textAnchor="middle" fontSize="9" fontWeight="700" fill="#78716c">{id === "breakA" ? "A" : "B"}</text>
                </g>);
              })}
            </>
          ) : (
            <SignalWire points={[[psuPos.x + 22, psuPos.y + 58], [psuPos.x + 22, 270], [500, 270]]} color="#b45309" width={2.5} />
          )}

          {/* Return wire */}
          <SignalWire points={[[500, 290], [plcPos.x + 46, 290], [plcPos.x + 46, plcPos.y + 65]]} color="#1e40af" width={2.5} />
          <SignalWire points={[[plcPos.x + 48, plcPos.y + 58], [psuPos.x + 48, plcPos.y + 58], [psuPos.x + 48, psuPos.y + 58]]} color="#1e40af" width={2.5} />

          <text x={310} y={264} textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="600">SIGNAL + (brown)</text>
          <text x={310} y={304} textAnchor="middle" fontSize="8" fill="#1e40af" fontWeight="600">RETURN − (blue)</text>

          {/* Control room equipment */}
          <g filter="url(#compShadow)"><PowerSupply x={psuPos.x} y={psuPos.y} /></g>
          <g filter="url(#compShadow)"><PLCRack x={plcPos.x} y={plcPos.y} /></g>
          <g filter="url(#compShadow)"><HMIScreen x={hmiPos.x} y={hmiPos.y} level={tankLevel} mA={mA} /></g>

          {/* Multimeter (test stage only) */}
          {stage === 2 && (<>
            <g filter="url(#compShadow)">
              <Multimeter x={meterPos.x} y={meterPos.y} displayText={displayText} displayUnit={displayUnit}
                mode={mode} modeIdx={modeIdx} onModeClick={() => setModeIdx((i) => (i + 1) % MODES.length)}
                showSuccess={showSuccess} blownFuse={blownFuse} />
            </g>
            <path d={`M ${meterPos.x + 35} ${meterPos.y + 140} Q ${meterPos.x + 35} ${(meterPos.y + 140 + leads.black.y) / 2 + 30} ${leads.black.x} ${leads.black.y}`}
              fill="none" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
            <path d={`M ${meterPos.x + 75} ${meterPos.y + 140} Q ${meterPos.x + 75} ${(meterPos.y + 140 + leads.red.y) / 2 + 30} ${leads.red.x} ${leads.red.y}`}
              fill="none" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
            {[["black", "#1f2937", "#4b5563"], ["red", "#dc2626", "#991b1b"]].map(([color, fill, stroke]) => (
              <g key={color} style={{ cursor: dragging === color ? "grabbing" : "grab" }}
                onPointerDown={handleDown(color)} onTouchStart={handleDown(color)}>
                <rect x={leads[color].x - 4} y={leads[color].y - 14} width="8" height="20" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
                <line x1={leads[color].x} y1={leads[color].y + 6} x2={leads[color].x} y2={leads[color].y + 14} stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx={leads[color].x} cy={leads[color].y} r="16" fill="transparent" />
              </g>
            ))}
          </>)}

          {stage === 0 && (
            <text x={W / 2} y={H - 20} textAnchor="middle" fontSize="12" fill="#78716c" fontWeight="600">
              Adjust the tank level slider below and watch the signal propagate through the entire loop.
            </text>
          )}
          {stage === 1 && (
            <text x={W / 2} y={H - 20} textAnchor="middle" fontSize="12" fill="#78716c" fontWeight="600">
              🔧 Wiring exercise coming next — drag wires to the correct transmitter terminals.
            </text>
          )}
        </svg>
      </div>

      {/* Controls */}
      <div style={{ width: "100%", maxWidth: W, marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ padding: "8px 14px", borderRadius: 8, background: "#1e293b", border: `1px solid ${fbColor}40`,
          fontSize: "clamp(11px, 1.8vw, 13px)", color: fbColor, fontWeight: 600, minHeight: 36, display: "flex", alignItems: "center" }}>
          {feedback}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
          padding: "6px 10px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155" }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", whiteSpace: "nowrap" }}>TANK LEVEL:</label>
          <input type="range" min="0" max="100" value={tankLevel} onChange={(e) => setTankLevel(Number(e.target.value))} style={{ flex: 1, minWidth: 100, accentColor: "#3b82f6" }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: "#3b82f6", minWidth: 36 }}>{tankLevel}%</span>
          {stage === 2 && (
            <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
              <button onClick={resetLeads} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #475569", background: "#334155",
                color: "#e2e8f0", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>↺ RESET</button>
              <button onClick={() => setShowHint((h) => !h)} style={{ padding: "4px 12px", borderRadius: 6,
                border: `1px solid ${showHint ? "#f59e0b" : "#475569"}`, background: showHint ? "#f59e0b20" : "#334155",
                color: showHint ? "#f59e0b" : "#e2e8f0", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {showHint ? "✕ HINT" : "💡 HINT"}</button>
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 6 }}>
          <div style={{ padding: "6px 10px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", fontSize: 10, color: "#94a3b8" }}>
            <strong style={{ color: "#3b82f6" }}>2-WIRE LOOP:</strong> 24V powers the transmitter through the signal wire. Current (4–20 mA) varies with process.
          </div>
          <div style={{ padding: "6px 10px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", fontSize: 10, color: "#94a3b8" }}>
            <strong style={{ color: "#22d3ee" }}>4 mA = 0%</strong> · 12 mA = 50% · <strong>20 mA = 100%</strong> — linear relationship to measured level.
          </div>
          <div style={{ padding: "6px 10px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", fontSize: 10, color: "#94a3b8" }}>
            <strong style={{ color: "#f59e0b" }}>MEASURE CURRENT:</strong> Set meter to mA DC. Break the loop. Insert meter IN SERIES.
          </div>
        </div>
      </div>
    </div>
  );
}
