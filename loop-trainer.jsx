import { useState, useRef, useCallback, useEffect } from "react";

const MODES = ["OFF", "V AC", "V DC", "mA DC", "Ω"];

const DROP_ZONES = {
  breakA: { x: 268, y: 158, label: "A" },
  breakB: { x: 322, y: 158, label: "B" },
};

const SNAP_RADIUS = 28;

const HOME = {
  red: { x: 505, y: 488 },
  black: { x: 455, y: 488 },
};

export default function LoopTrainer() {
  const [tankLevel, setTankLevel] = useState(50);
  const [modeIdx, setModeIdx] = useState(0);
  const [leads, setLeads] = useState({
    red: { ...HOME.red, zone: null },
    black: { ...HOME.black, zone: null },
  });
  const [dragging, setDragging] = useState(null);
  const [blownFuse, setBlownFuse] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const svgRef = useRef(null);

  const mA = 4 + (tankLevel / 100) * 16;
  const mode = MODES[modeIdx];

  const bothConnected = leads.red.zone && leads.black.zone;
  const isSeriesCorrect =
    bothConnected &&
    ((leads.red.zone === "breakA" && leads.black.zone === "breakB") ||
      (leads.red.zone === "breakB" && leads.black.zone === "breakA"));

  let displayText = "";
  let displayUnit = "";
  if (mode === "OFF") {
    displayText = "";
    displayUnit = "";
  } else if (blownFuse) {
    displayText = "FUSE";
    displayUnit = "";
  } else if (!bothConnected) {
    displayText = "OL";
    displayUnit = mode === "mA DC" ? "mA" : mode === "V DC" ? "V" : mode === "V AC" ? "V" : "Ω";
  } else if (isSeriesCorrect) {
    if (mode === "mA DC") {
      displayText = mA.toFixed(2);
      displayUnit = "mA";
    } else if (mode === "V DC") {
      displayText = "0.00";
      displayUnit = "V";
    } else if (mode === "Ω") {
      displayText = "OL";
      displayUnit = "Ω";
    } else {
      displayText = "0.00";
      displayUnit = "V";
    }
  } else {
    displayText = "ERR";
    displayUnit = "";
  }

  useEffect(() => {
    if (isSeriesCorrect && mode === "mA DC" && !blownFuse) {
      setShowSuccess(true);
    } else {
      setShowSuccess(false);
    }
  }, [isSeriesCorrect, mode, blownFuse]);

  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = 900 / rect.width;
    const scaleY = 620 / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const findZone = useCallback((x, y, otherLeadZone) => {
    for (const [id, zone] of Object.entries(DROP_ZONES)) {
      if (id === otherLeadZone) continue;
      const dx = x - zone.x;
      const dy = y - zone.y;
      if (Math.sqrt(dx * dx + dy * dy) < SNAP_RADIUS) return id;
    }
    return null;
  }, []);

  const handlePointerDown = useCallback((color) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(color);
    if (blownFuse) setBlownFuse(false);
  }, [blownFuse]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const pt = getSVGPoint(e);
    setLeads((prev) => ({
      ...prev,
      [dragging]: { ...prev[dragging], x: pt.x, y: pt.y, zone: null },
    }));
  }, [dragging, getSVGPoint]);

  const handlePointerUp = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const pt = getSVGPoint(e);
    const otherColor = dragging === "red" ? "black" : "red";
    const otherZone = leads[otherColor].zone;
    const zone = findZone(pt.x, pt.y, otherZone);

    if (zone) {
      const zonePos = DROP_ZONES[zone];
      setLeads((prev) => ({
        ...prev,
        [dragging]: { x: zonePos.x, y: zonePos.y, zone },
      }));
    } else {
      setLeads((prev) => ({
        ...prev,
        [dragging]: { ...HOME[dragging], zone: null },
      }));
    }
    setDragging(null);
  }, [dragging, leads, findZone, getSVGPoint]);

  useEffect(() => {
    const onMove = (e) => handlePointerMove(e);
    const onUp = (e) => handlePointerUp(e);
    if (dragging) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  const resetLeads = () => {
    setLeads({
      red: { ...HOME.red, zone: null },
      black: { ...HOME.black, zone: null },
    });
    setBlownFuse(false);
  };

  const liquidHeight = (tankLevel / 100) * 160;
  const liquidY = 90 + (160 - liquidHeight);

  // Wire path helper
  const wireColor = "#444";
  const wireWidth = 3;

  // Feedback message
  let feedback = "";
  let feedbackColor = "#94a3b8";
  if (blownFuse) {
    feedback = "⚡ BLOWN FUSE — You connected the meter in parallel across a power source!";
    feedbackColor = "#ef4444";
  } else if (showSuccess) {
    feedback = `✅ Correct! Meter reads ${mA.toFixed(2)} mA — that's ${tankLevel}% of span (4–20 mA range)`;
    feedbackColor = "#22c55e";
  } else if (bothConnected && !isSeriesCorrect) {
    feedback = "❌ Incorrect wiring. The meter must be IN SERIES with the loop (break the circuit, insert the meter).";
    feedbackColor = "#f59e0b";
  } else if (isSeriesCorrect && mode !== "mA DC") {
    feedback = `⚠️ Leads are correct, but set the dial to mA DC to read current! (Currently: ${mode})`;
    feedbackColor = "#f59e0b";
  } else if (!leads.red.zone && !leads.black.zone) {
    feedback = "Drag the red and black leads to the loop break points (A and B) to measure current in series.";
  } else if (leads.red.zone && !leads.black.zone) {
    feedback = "Now connect the other lead to complete the measurement...";
  } else if (!leads.red.zone && leads.black.zone) {
    feedback = "Now connect the other lead to complete the measurement...";
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Cascadia Code', monospace",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "12px",
      userSelect: "none",
      touchAction: "none",
    }}>
      {/* Title */}
      <div style={{
        textAlign: "center",
        marginBottom: "8px",
        width: "100%",
        maxWidth: 900,
      }}>
        <h1 style={{
          fontSize: "clamp(16px, 3vw, 22px)",
          fontWeight: 800,
          margin: 0,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          background: "linear-gradient(90deg, #f59e0b, #f97316)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          4–20 mA Loop Measurement Trainer
        </h1>
        <p style={{
          fontSize: "clamp(11px, 1.8vw, 13px)",
          color: "#94a3b8",
          margin: "2px 0 0 0",
        }}>
          Break the loop • Insert meter in SERIES • Read current
        </p>
      </div>

      {/* Main SVG */}
      <div style={{ width: "100%", maxWidth: 900, position: "relative" }}>
        <svg
          ref={svgRef}
          viewBox="0 0 900 620"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 12,
            background: "linear-gradient(180deg, #1a2332 0%, #141c28 100%)",
            border: "1px solid #2d3a4d",
            cursor: dragging ? "grabbing" : "default",
          }}
        >
          <defs>
            <linearGradient id="tankGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="50%" stopColor="#4b5563" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
            <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="psuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d1d5db" />
              <stop offset="100%" stopColor="#9ca3af" />
            </linearGradient>
            <linearGradient id="meterBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="30%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.4" />
            </filter>
            <clipPath id="tankClip">
              <rect x="560" y="60" width="190" height="200" rx="6" />
            </clipPath>
          </defs>

          {/* ===== 24V DC POWER SUPPLY ===== */}
          <g filter="url(#shadow)">
            <rect x="60" y="120" width="130" height="90" rx="6" fill="url(#psuGrad)" stroke="#6b7280" strokeWidth="2" />
            <rect x="68" y="128" width="114" height="50" rx="3" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
            <text x="125" y="149" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1f2937">24V DC</text>
            <text x="125" y="167" textAnchor="middle" fontSize="10" fill="#6b7280">POWER SUPPLY</text>
            {/* Terminal labels */}
            <circle cx="95" cy="196" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
            <text x="95" y="200" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">+</text>
            <circle cx="155" cy="196" r="6" fill="#1f2937" stroke="#fff" strokeWidth="1.5" />
            <text x="155" y="200" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">−</text>
          </g>

          {/* ===== TANK ===== */}
          <g filter="url(#shadow)">
            {/* Tank body */}
            <rect x="560" y="60" width="190" height="200" rx="6" fill="url(#tankGrad)" stroke="#6b7280" strokeWidth="2" />
            {/* Liquid inside tank */}
            <g clipPath="url(#tankClip)">
              <rect x="562" y={liquidY} width="186" height={liquidHeight + 2} fill="url(#liquidGrad)" />
              {/* Liquid surface wave */}
              <path
                d={`M 562 ${liquidY} Q 600 ${liquidY - 4} 655 ${liquidY} Q 710 ${liquidY + 4} 748 ${liquidY}`}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                opacity="0.6"
              />
            </g>
            {/* Tank outline again for layering */}
            <rect x="560" y="60" width="190" height="200" rx="6" fill="none" stroke="#6b7280" strokeWidth="2" />
            {/* Level markings */}
            {[0, 25, 50, 75, 100].map((pct) => {
              const markY = 250 - (pct / 100) * 160;
              return (
                <g key={pct}>
                  <line x1="752" y1={markY} x2="760" y2={markY} stroke="#9ca3af" strokeWidth="1" />
                  <text x="765" y={markY + 3} fontSize="8" fill="#9ca3af">{pct}%</text>
                </g>
              );
            })}
            {/* Tank label */}
            <text x="655" y="52" textAnchor="middle" fontSize="12" fontWeight="700" fill="#94a3b8" letterSpacing="0.1em">PROCESS TANK</text>
          </g>

          {/* ===== PRESSURE TRANSMITTER ===== */}
          <g filter="url(#shadow)">
            {/* Mounting pipe from tank */}
            <rect x="544" y="235" width="22" height="12" rx="2" fill="#6b7280" />
            {/* Transmitter body */}
            <rect x="480" y="218" width="68" height="55" rx="5" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
            {/* Display window */}
            <rect x="490" y="225" width="48" height="22" rx="3" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1" />
            <text x="514" y="240" textAnchor="middle" fontSize="11" fontWeight="700" fill="#22d3ee">{mA.toFixed(1)}</text>
            {/* Label */}
            <text x="514" y="264" textAnchor="middle" fontSize="7" fontWeight="600" fill="#93c5fd">PRESSURE</text>
            <text x="514" y="271" textAnchor="middle" fontSize="6" fill="#93c5fd">XMTR</text>
            {/* Terminal block on top */}
            <rect x="494" y="210" width="40" height="12" rx="2" fill="#374151" stroke="#4b5563" strokeWidth="1" />
            {/* Terminal screws */}
            <circle cx="506" cy="216" r="3.5" fill="#9ca3af" stroke="#6b7280" strokeWidth="1" />
            <text x="506" y="219" textAnchor="middle" fontSize="5" fontWeight="700" fill="#1f2937">+</text>
            <circle cx="522" cy="216" r="3.5" fill="#9ca3af" stroke="#6b7280" strokeWidth="1" />
            <text x="522" y="219" textAnchor="middle" fontSize="5" fontWeight="700" fill="#1f2937">−</text>
          </g>

          {/* ===== WIRING - BOTTOM RETURN WIRE (complete, no break) ===== */}
          {/* PSU(-) to Transmitter(-) via bottom path */}
          <path
            d="M 155 196 L 155 310 L 522 310 L 522 216"
            fill="none"
            stroke="#1f2937"
            strokeWidth={wireWidth + 2}
          />
          <path
            d="M 155 196 L 155 310 L 522 310 L 522 216"
            fill="none"
            stroke={wireColor}
            strokeWidth={wireWidth}
            strokeDasharray="none"
          />
          {/* Wire label */}
          <text x="340" y="324" textAnchor="middle" fontSize="9" fill="#64748b">RETURN (−)</text>

          {/* ===== WIRING - TOP WIRE WITH BREAK ===== */}
          {/* PSU(+) going right to break point A */}
          <path
            d={`M 95 196 L 95 158 L ${DROP_ZONES.breakA.x - 16} 158`}
            fill="none"
            stroke="#1f2937"
            strokeWidth={wireWidth + 2}
          />
          <path
            d={`M 95 196 L 95 158 L ${DROP_ZONES.breakA.x - 16} 158`}
            fill="none"
            stroke={wireColor}
            strokeWidth={wireWidth}
          />

          {/* Break point B to Transmitter(+) */}
          <path
            d={`M ${DROP_ZONES.breakB.x + 16} 158 L 506 158 L 506 216`}
            fill="none"
            stroke="#1f2937"
            strokeWidth={wireWidth + 2}
          />
          <path
            d={`M ${DROP_ZONES.breakB.x + 16} 158 L 506 158 L 506 216`}
            fill="none"
            stroke={wireColor}
            strokeWidth={wireWidth}
          />

          {/* Wire label */}
          <text x="410" y="148" textAnchor="middle" fontSize="9" fill="#64748b">SIGNAL (+)</text>

          {/* ===== BREAK GAP VISUAL ===== */}
          {/* Gap indicator */}
          <rect
            x={DROP_ZONES.breakA.x - 20}
            y={DROP_ZONES.breakA.y - 22}
            width={DROP_ZONES.breakB.x - DROP_ZONES.breakA.x + 40}
            height="44"
            rx="8"
            fill={isSeriesCorrect && mode === "mA DC" ? "#22c55e10" : "#f59e0b10"}
            stroke={isSeriesCorrect && mode === "mA DC" ? "#22c55e40" : "#f59e0b40"}
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text
            x={(DROP_ZONES.breakA.x + DROP_ZONES.breakB.x) / 2}
            y={DROP_ZONES.breakA.y - 28}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="#f59e0b"
            opacity="0.8"
          >
            ← BREAK LOOP HERE →
          </text>

          {/* ===== DROP ZONES ===== */}
          {Object.entries(DROP_ZONES).map(([id, zone]) => {
            const isOccupied = leads.red.zone === id || leads.black.zone === id;
            const isTarget = dragging && !isOccupied;
            return (
              <g key={id}>
                {/* Pulse ring when dragging */}
                {isTarget && (
                  <circle
                    cx={zone.x}
                    cy={zone.y}
                    r={SNAP_RADIUS}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    opacity="0.5"
                  >
                    <animate attributeName="r" values={`${SNAP_RADIUS - 4};${SNAP_RADIUS + 4};${SNAP_RADIUS - 4}`} dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Terminal dot */}
                <circle
                  cx={zone.x}
                  cy={zone.y}
                  r="8"
                  fill={isOccupied ? "#334155" : "#475569"}
                  stroke={isTarget ? "#f59e0b" : "#94a3b8"}
                  strokeWidth={isTarget ? 2.5 : 1.5}
                />
                {/* Wire end nub */}
                <rect
                  x={id === "breakA" ? zone.x - 16 : zone.x + 2}
                  y={zone.y - 2}
                  width="8"
                  height="4"
                  fill={wireColor}
                  rx="1"
                />
                {/* Label */}
                <text
                  x={zone.x}
                  y={zone.y + 22}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill={isTarget ? "#f59e0b" : "#94a3b8"}
                >
                  {zone.label}
                </text>
              </g>
            );
          })}

          {/* ===== MULTIMETER ===== */}
          <g filter="url(#shadow)">
            {/* Body */}
            <rect x="410" y="370" width="140" height="220" rx="12" fill="url(#meterBody)" stroke="#92400e" strokeWidth="2" />
            {/* Rubber bumper edges */}
            <rect x="406" y="374" width="8" height="212" rx="4" fill="#374151" />
            <rect x="546" y="374" width="8" height="212" rx="4" fill="#374151" />

            {/* Screen */}
            <rect x="430" y="388" width="100" height="52" rx="4" fill="#1a2e1a" stroke="#374151" strokeWidth="1" />
            {/* LCD display */}
            <text
              x="524"
              y="420"
              textAnchor="end"
              fontSize="28"
              fontWeight="700"
              fontFamily="'Courier New', monospace"
              fill={showSuccess ? "#4ade80" : blownFuse ? "#ef4444" : "#22c55e"}
              filter={showSuccess ? "url(#glow)" : "none"}
            >
              {displayText || "----"}
            </text>
            <text
              x="526"
              y="434"
              textAnchor="end"
              fontSize="12"
              fill="#4ade80"
              opacity="0.7"
            >
              {displayUnit}
            </text>

            {/* Mode dial */}
            <circle
              cx="480"
              cy="474"
              r="28"
              fill="#374151"
              stroke="#4b5563"
              strokeWidth="2"
              style={{ cursor: "pointer" }}
              onClick={() => setModeIdx((i) => (i + 1) % MODES.length)}
            />
            {/* Dial position markers */}
            {MODES.map((m, i) => {
              const angle = -90 + (i / (MODES.length - 1)) * 180;
              const rad = (angle * Math.PI) / 180;
              const lx = 480 + Math.cos(rad) * 38;
              const ly = 474 + Math.sin(rad) * 38;
              return (
                <text
                  key={m}
                  x={lx}
                  y={ly + 3}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight={i === modeIdx ? "800" : "400"}
                  fill={i === modeIdx ? "#fbbf24" : "#9ca3af"}
                  style={{ cursor: "pointer" }}
                  onClick={() => setModeIdx(i)}
                >
                  {m}
                </text>
              );
            })}
            {/* Dial pointer */}
            {(() => {
              const angle = -90 + (modeIdx / (MODES.length - 1)) * 180;
              const rad = (angle * Math.PI) / 180;
              const px = 480 + Math.cos(rad) * 22;
              const py = 474 + Math.sin(rad) * 22;
              return (
                <line x1="480" y1="474" x2={px} y2={py} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
              );
            })()}
            <circle cx="480" cy="474" r="5" fill="#fbbf24" />
            <text x="480" y="510" textAnchor="middle" fontSize="8" fill="#1f2937" fontWeight="600">▲ CLICK DIAL</text>

            {/* Jack labels */}
            <text x="455" y="534" textAnchor="middle" fontSize="8" fill="#1f2937" fontWeight="700">COM</text>
            <text x="505" y="534" textAnchor="middle" fontSize="8" fill="#1f2937" fontWeight="700">mA</text>

            {/* Jack holes */}
            <circle cx="455" cy="543" r="7" fill="#1f2937" stroke="#374151" strokeWidth="2" />
            <circle cx="505" cy="543" r="7" fill="#8b0000" stroke="#374151" strokeWidth="2" />
          </g>

          {/* ===== LEAD WIRES (from jacks to tips) ===== */}
          {/* Black lead wire */}
          <path
            d={`M 455 543 Q 455 ${(543 + leads.black.y) / 2 + 30} ${leads.black.x} ${leads.black.y}`}
            fill="none"
            stroke="#1f2937"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d={`M 455 543 Q 455 ${(543 + leads.black.y) / 2 + 30} ${leads.black.x} ${leads.black.y}`}
            fill="none"
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Red lead wire */}
          <path
            d={`M 505 543 Q 505 ${(543 + leads.red.y) / 2 + 30} ${leads.red.x} ${leads.red.y}`}
            fill="none"
            stroke="#7f1d1d"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d={`M 505 543 Q 505 ${(543 + leads.red.y) / 2 + 30} ${leads.red.x} ${leads.red.y}`}
            fill="none"
            stroke="#dc2626"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* ===== DRAGGABLE LEAD TIPS ===== */}
          {/* Black probe tip */}
          <g
            style={{ cursor: dragging === "black" ? "grabbing" : "grab" }}
            onPointerDown={handlePointerDown("black")}
            onTouchStart={handlePointerDown("black")}
          >
            {/* Probe body */}
            <rect
              x={leads.black.x - 5}
              y={leads.black.y - 18}
              width="10"
              height="24"
              rx="3"
              fill="#1f2937"
              stroke="#4b5563"
              strokeWidth="1.5"
            />
            {/* Metal tip */}
            <line
              x1={leads.black.x}
              y1={leads.black.y + 6}
              x2={leads.black.x}
              y2={leads.black.y + 16}
              stroke="#d1d5db"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Invisible larger hit area */}
            <circle
              cx={leads.black.x}
              cy={leads.black.y}
              r="20"
              fill="transparent"
            />
          </g>

          {/* Red probe tip */}
          <g
            style={{ cursor: dragging === "red" ? "grabbing" : "grab" }}
            onPointerDown={handlePointerDown("red")}
            onTouchStart={handlePointerDown("red")}
          >
            {/* Probe body */}
            <rect
              x={leads.red.x - 5}
              y={leads.red.y - 18}
              width="10"
              height="24"
              rx="3"
              fill="#dc2626"
              stroke="#991b1b"
              strokeWidth="1.5"
            />
            {/* Metal tip */}
            <line
              x1={leads.red.x}
              y1={leads.red.y + 6}
              x2={leads.red.x}
              y2={leads.red.y + 16}
              stroke="#d1d5db"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Invisible larger hit area */}
            <circle
              cx={leads.red.x}
              cy={leads.red.y}
              r="20"
              fill="transparent"
            />
          </g>

          {/* ===== LABELS ===== */}
          <text x="125" y="110" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">24V DC</text>
          <text x="514" y="290" textAnchor="middle" fontSize="9" fill="#94a3b8">4–20 mA Transmitter</text>
          <text x="480" y="362" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">MULTIMETER</text>

          {/* Tank level info box */}
          <rect x="660" y="280" width="110" height="50" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="715" y="298" textAnchor="middle" fontSize="10" fill="#94a3b8">Tank Level</text>
          <text x="715" y="320" textAnchor="middle" fontSize="18" fontWeight="800" fill="#3b82f6">{tankLevel}%</text>

          {/* Expected mA info */}
          <rect x="660" y="340" width="110" height="50" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="715" y="358" textAnchor="middle" fontSize="10" fill="#94a3b8">Expected mA</text>
          <text x="715" y="380" textAnchor="middle" fontSize="18" fontWeight="800" fill="#22d3ee">{mA.toFixed(2)}</text>

          {/* Connection diagram hint */}
          {showHint && (
            <g>
              <rect x="150" y="380" width="230" height="100" rx="8" fill="#1e293bee" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="265" y="400" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f59e0b">HOW TO WIRE IN SERIES:</text>
              <text x="265" y="418" textAnchor="middle" fontSize="10" fill="#e2e8f0">1. Break the loop at one point</text>
              <text x="265" y="434" textAnchor="middle" fontSize="10" fill="#e2e8f0">2. Connect RED lead to point A</text>
              <text x="265" y="450" textAnchor="middle" fontSize="10" fill="#e2e8f0">3. Connect BLACK lead to point B</text>
              <text x="265" y="466" textAnchor="middle" fontSize="10" fill="#e2e8f0">4. Set dial to "mA DC"</text>
            </g>
          )}
        </svg>
      </div>

      {/* Controls below SVG */}
      <div style={{
        width: "100%",
        maxWidth: 900,
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        {/* Feedback bar */}
        <div style={{
          padding: "10px 16px",
          borderRadius: 8,
          background: "#1e293b",
          border: `1px solid ${feedbackColor}40`,
          fontSize: "clamp(12px, 2vw, 14px)",
          color: feedbackColor,
          fontWeight: 600,
          minHeight: 40,
          display: "flex",
          alignItems: "center",
        }}>
          {feedback}
        </div>

        {/* Tank Level Slider + Buttons */}
        <div style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          padding: "8px 12px",
          borderRadius: 8,
          background: "#1e293b",
          border: "1px solid #334155",
        }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", whiteSpace: "nowrap" }}>
            TANK LEVEL:
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={tankLevel}
            onChange={(e) => setTankLevel(Number(e.target.value))}
            style={{ flex: 1, minWidth: 120, accentColor: "#3b82f6" }}
          />
          <span style={{ fontSize: 14, fontWeight: 800, color: "#3b82f6", minWidth: 40 }}>{tankLevel}%</span>

          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button
              onClick={resetLeads}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid #475569",
                background: "#334155",
                color: "#e2e8f0",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ↺ RESET LEADS
            </button>
            <button
              onClick={() => setShowHint((h) => !h)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: `1px solid ${showHint ? "#f59e0b" : "#475569"}`,
                background: showHint ? "#f59e0b20" : "#334155",
                color: showHint ? "#f59e0b" : "#e2e8f0",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {showHint ? "✕ HIDE HINT" : "💡 HINT"}
            </button>
          </div>
        </div>

        {/* Quick reference */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 8,
        }}>
          <div style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "#1e293b",
            border: "1px solid #334155",
            fontSize: 11,
            color: "#94a3b8",
          }}>
            <strong style={{ color: "#f59e0b" }}>⚡ SERIES:</strong> Break the loop, insert meter in the gap. Current flows THROUGH the meter.
          </div>
          <div style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "#1e293b",
            border: "1px solid #334155",
            fontSize: 11,
            color: "#94a3b8",
          }}>
            <strong style={{ color: "#ef4444" }}>⛔ PARALLEL:</strong> Never connect ammeter across a source — this shorts the circuit and blows the fuse!
          </div>
          <div style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "#1e293b",
            border: "1px solid #334155",
            fontSize: 11,
            color: "#94a3b8",
          }}>
            <strong style={{ color: "#22d3ee" }}>📐 4–20 mA:</strong> 4 mA = 0% · 12 mA = 50% · 20 mA = 100% — always proportional to the process variable.
          </div>
        </div>
      </div>
    </div>
  );
}
