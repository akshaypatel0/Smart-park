/**
 * Generates and triggers download of a 100% self-contained single-file HTML version
 * of the 3-Slot Smart Parking Dashboard with 3D isometric visualization,
 * Arduino Web Serial at 9600 baud, buzzer pulse indicators, MG995 Gate Servo, and Demo Mode.
 */
export function exportStandaloneHtmlFile(): void {
  const htmlContent = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Parking 3D Dashboard (Single File)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #080c14;
      color: #f1f5f9;
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .tabular-nums { font-variant-numeric: tabular-nums; }
    
    .container { max-width: 1400px; margin: 0 auto; padding: 1.5rem; }
    .header {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 1rem 1.5rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand-title { font-size: 1.15rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 0.5rem; }
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.2s;
    }
    .btn-primary { background: #0891b2; color: #fff; border-color: #06b6d4; }
    .btn-primary:hover { background: #06b6d4; }
    .btn-demo { background: rgba(245, 158, 11, 0.15); color: #fde68a; border-color: rgba(245, 158, 11, 0.4); }
    .btn-demo:hover { background: rgba(245, 158, 11, 0.25); }
    .btn-disconnect { background: rgba(244, 63, 94, 0.15); color: #fda4af; border-color: rgba(244, 63, 94, 0.4); }
    
    .glass-panel {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1rem;
      padding: 1.25rem;
    }

    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .stat-val { font-size: 2rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .perspective-container {
      perspective: 1600px;
      perspective-origin: 50% 45%;
      height: 520px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      border-radius: 1rem;
      background: radial-gradient(circle at 50% 50%, #111827 0%, #060810 100%);
      border: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 1.5rem;
    }
    .parking-lot {
      width: 540px;
      height: 330px;
      border-radius: 1.5rem;
      background: radial-gradient(ellipse at 50% 50%, #171f2f 0%, #0d121c 100%);
      border: 2px solid rgba(255,255,255,0.1);
      box-shadow: 0 30px 60px -12px rgba(0,0,0,0.9), inset 0 2px 4px rgba(255,255,255,0.1);
      transform-style: preserve-3d;
      transform: rotateX(56deg) rotateZ(-30deg);
      transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 1rem;
    }
    .slot-bay {
      flex: 1;
      height: 72%;
      margin: 0 0.5rem;
      border-radius: 1rem;
      border: 2px dashed rgba(255,255,255,0.2);
      transform-style: preserve-3d;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0.5rem;
      cursor: pointer;
      transition: all 0.4s;
    }
    .slot-bay.available {
      border: 2px solid rgba(16, 185, 129, 0.7);
      background: rgba(16, 185, 129, 0.08);
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.35);
    }
    .slot-bay.occupied {
      border: 2px solid rgba(244, 63, 94, 0.7);
      background: rgba(244, 63, 94, 0.08);
      box-shadow: 0 0 25px rgba(244, 63, 94, 0.35);
    }

    .car-3d {
      width: 90px;
      height: 150px;
      border-radius: 18px;
      position: relative;
      transform-style: preserve-3d;
      transform: translateZ(8px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.8);
      animation: carEnter 0.7s cubic-bezier(0.18, 0.89, 0.32, 1.15) forwards;
    }
    .car-hood {
      position: absolute;
      top: 6px;
      left: 10px;
      right: 10px;
      height: 38px;
      border-radius: 12px 12px 4px 4px;
      background: rgba(255,255,255,0.2);
    }
    .car-cabin {
      position: absolute;
      top: 40px;
      left: 12px;
      right: 12px;
      height: 70px;
      border-radius: 10px;
      background: #0f172a;
      border: 1px solid rgba(56, 189, 248, 0.4);
      transform: translateZ(12px);
    }
    .car-headlights {
      position: absolute;
      top: 2px;
      left: 6px;
      right: 6px;
      display: flex;
      justify-content: space-between;
    }
    .headlight {
      width: 12px;
      height: 8px;
      background: #fef08a;
      border-radius: 4px;
      box-shadow: 0 0 10px #fef08a;
    }
    .taillight {
      position: absolute;
      bottom: 2px;
      left: 8px;
      right: 8px;
      height: 5px;
      background: #f43f5e;
      border-radius: 99px;
      box-shadow: 0 0 10px #f43f5e;
    }

    @keyframes carEnter {
      0% { transform: translateY(180px) translateZ(0); opacity: 0; }
      100% { transform: translateY(0) translateZ(8px); opacity: 1; }
    }

    .overhead-sensor {
      position: absolute;
      top: -30px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      transform: translateZ(35px);
      box-shadow: 0 0 18px currentColor;
    }

    /* MG995 Gate Servo */
    .gate-container {
      position: absolute;
      bottom: 12px;
      left: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      transform-style: preserve-3d;
      transform: translateZ(12px);
    }
    .servo-base {
      width: 24px;
      height: 32px;
      background: #111;
      border: 1px solid #64748b;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 6px;
      color: #f59e0b;
      font-family: monospace;
      font-weight: bold;
    }
    .gate-arm {
      height: 8px;
      width: 80px;
      border-radius: 0 4px 4px 0;
      background: repeating-linear-gradient(45deg, #ef4444, #ef4444 8px, #ffffff 8px, #ffffff 16px);
      transform-origin: left center;
      transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .gate-arm.open { transform: rotateZ(-75deg); }
    .gate-arm.closed { transform: rotateZ(0deg); }

    .buzzer-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .pulse-node {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      margin: 0 4px;
      background: rgba(30, 41, 59, 0.8);
      color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.08);
      transition: all 0.2s;
    }
    .pulse-node.active {
      background: #f59e0b;
      color: #000;
      box-shadow: 0 0 16px #f59e0b;
      transform: scale(1.1);
    }

    .slots-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .badge-available { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .badge-occupied { background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.4); }

    .bar-bg { width: 100%; height: 8px; background: #1e293b; border-radius: 99px; overflow: hidden; margin: 0.5rem 0; }
    .bar-fill { height: 100%; transition: width 0.3s; }

    .terminal-box {
      background: #000;
      border: 1px solid #1e293b;
      border-radius: 0.75rem;
      padding: 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      height: 180px;
      overflow-y: auto;
      color: #cbd5e1;
    }

    .tip-banner {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fde68a;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.8rem;
      margin-bottom: 1.5rem;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="brand-title">
      <span style="background: linear-gradient(135deg, #06b6d4, #10b981); width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; color: #000;">P</span>
      <span>SmartPark 3D Dashboard</span>
      <span style="font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace; margin-left: 8px;">Arduino Uno (HC-SR04 + FSR + MG995 + Buzzer)</span>
    </div>
    <div style="display: flex; gap: 0.75rem; align-items: center;">
      <span id="connStatusText" style="font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; color: #94a3b8;">DISCONNECTED</span>
      <button id="btnConnect" class="btn btn-primary">Connect Arduino</button>
      <button id="btnDemo" class="btn btn-demo">Demo Mode</button>
    </div>
  </header>

  <div class="container">
    <!-- Windows 11 Serial Conflict Tip Banner -->
    <div class="tip-banner">
      <strong>Windows 11 Tip:</strong> Please ensure the Arduino IDE <em>Serial Monitor is CLOSED</em> before clicking <strong>Connect Arduino</strong>. COM ports cannot be shared across multiple programs simultaneously on Windows.
    </div>

    <!-- Top Summary -->
    <div class="summary-grid">
      <div class="glass-panel">
        <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Occupied / Total</div>
        <div class="stat-val" style="color: #fff;" id="statOccupiedFraction">0 / 3</div>
        <div style="font-size: 0.75rem; color: #64748b;" id="statEmptyText">3 bays empty</div>
      </div>
      <div class="glass-panel">
        <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">MG995 Gate Servo (D11)</div>
        <div class="stat-val" style="color: #10b981;" id="statGateAngle">0° OPEN</div>
        <div style="font-size: 0.75rem; color: #64748b;">Barrier raised (Entry allowed)</div>
      </div>
      <div class="glass-panel">
        <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Arduino Buzzer (D8)</div>
        <div class="stat-val" style="color: #94a3b8;" id="statBuzzerStatus">OFF</div>
        <div style="font-size: 0.75rem; color: #64748b;">Triggered when all 3 slots occupied</div>
      </div>
      <div class="glass-panel">
        <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Hardware Rule</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: #38bdf8; margin-top: 6px; font-family: monospace;">Dist ≤ 3cm & FSR ≥ 15</div>
        <div style="font-size: 0.75rem; color: #64748b;">HC-SR04 D2-D7 + FSR A0-A2</div>
      </div>
    </div>

    <!-- 3D Isometric Visualization -->
    <div class="perspective-container">
      <div class="parking-lot" id="parkingLot">
        <!-- Slot 1 -->
        <div class="slot-bay available" id="bay1" onclick="toggleSlot(1)">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #cbd5e1;">SLOT 1</div>
          <div class="overhead-sensor" id="sensor1" style="background: #10b981; color: #10b981;"></div>
          <div id="carSlot1">
            <div style="color: rgba(16,185,129,0.3); font-size: 24px; font-weight: bold; font-family: monospace;">1</div>
          </div>
          <div style="font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #94a3b8;" id="bayFooter1">45.0 cm | 0 FSR</div>
        </div>

        <!-- Slot 2 -->
        <div class="slot-bay available" id="bay2" onclick="toggleSlot(2)">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #cbd5e1;">SLOT 2</div>
          <div class="overhead-sensor" id="sensor2" style="background: #10b981; color: #10b981;"></div>
          <div id="carSlot2">
            <div style="color: rgba(16,185,129,0.3); font-size: 24px; font-weight: bold; font-family: monospace;">2</div>
          </div>
          <div style="font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #94a3b8;" id="bayFooter2">42.0 cm | 0 FSR</div>
        </div>

        <!-- Slot 3 -->
        <div class="slot-bay available" id="bay3" onclick="toggleSlot(3)">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #cbd5e1;">SLOT 3</div>
          <div class="overhead-sensor" id="sensor3" style="background: #10b981; color: #10b981;"></div>
          <div id="carSlot3">
            <div style="color: rgba(16,185,129,0.3); font-size: 24px; font-weight: bold; font-family: monospace;">3</div>
          </div>
          <div style="font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #94a3b8;" id="bayFooter3">48.0 cm | 0 FSR</div>
        </div>

        <!-- MG995 3D Gate Barrier -->
        <div class="gate-container">
          <div class="servo-base">MG995</div>
          <div class="gate-arm open" id="gateArm"></div>
        </div>
      </div>
    </div>

    <!-- Common Buzzer Indicator -->
    <div class="glass-panel buzzer-box">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div id="buzzerIcon" style="width: 44px; height: 44px; border-radius: 10px; background: #1e293b; display: flex; align-items: center; justify-content: center; color: #f59e0b; font-size: 20px;">🔔</div>
        <div>
          <div style="font-weight: 700; font-size: 0.95rem;">Common Buzzer Indicator (Pin D8)</div>
          <div style="font-size: 0.75rem; color: #94a3b8;" id="buzzerSubtext">Arduino Buzzer Pattern (1, 2, or 3 Pulses / Continuous on D8)</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; color: #94a3b8;">PULSES:</span>
        <div class="pulse-node" id="pulseNode1">1</div>
        <div class="pulse-node" id="pulseNode2">2</div>
        <div class="pulse-node" id="pulseNode3">3</div>
      </div>

      <div style="display: flex; gap: 0.5rem;">
        <button class="btn" onclick="triggerBuzzer(1)">1 Pulse</button>
        <button class="btn" onclick="triggerBuzzer(2)">2 Pulses</button>
        <button class="btn" onclick="triggerBuzzer(3)">3 Pulses</button>
        <button class="btn" id="btnAudio" onclick="toggleAudio()" style="color: #38bdf8;">Sound: ON</button>
      </div>
    </div>

    <!-- Live Telemetry Slot Cards -->
    <div class="slots-grid">
      <!-- Slot 1 Card -->
      <div class="glass-panel" id="card1">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div>
            <span style="font-weight: 700; font-size: 1.1rem;">SLOT 1</span>
            <div style="font-size: 10px; color: #64748b; font-family: monospace;">TRIG D2 / ECHO D3 · FSR A0</div>
          </div>
          <span class="badge badge-available" id="badge1">AVAILABLE</span>
        </div>
        <div style="font-size: 0.8rem; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Distance (Target: ≤ 3.0cm):</span>
          <span class="font-mono" id="distText1">45.0 cm</span>
        </div>
        <div class="bar-bg"><div class="bar-fill" id="distBar1" style="width: 90%; background: #10b981;"></div></div>
        <div style="font-size: 0.8rem; color: #94a3b8; display: flex; justify-content: space-between; margin-top: 0.5rem;">
          <span>FSR Force (Target: ≥ 15):</span>
          <span class="font-mono" id="pressText1">0 / 1023</span>
        </div>
        <div class="bar-bg"><div class="bar-fill" id="pressBar1" style="width: 0%; background: #64748b;"></div></div>
        <button class="btn" style="width: 100%; margin-top: 1rem; justify-content: center;" onclick="toggleSlot(1)">Toggle Slot 1</button>
      </div>

      <!-- Slot 2 Card -->
      <div class="glass-panel" id="card2">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div>
            <span style="font-weight: 700; font-size: 1.1rem;">SLOT 2</span>
            <div style="font-size: 10px; color: #64748b; font-family: monospace;">TRIG D4 / ECHO D5 · FSR A1</div>
          </div>
          <span class="badge badge-available" id="badge2">AVAILABLE</span>
        </div>
        <div style="font-size: 0.8rem; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Distance (Target: ≤ 3.0cm):</span>
          <span class="font-mono" id="distText2">42.0 cm</span>
        </div>
        <div class="bar-bg"><div class="bar-fill" id="distBar2" style="width: 84%; background: #10b981;"></div></div>
        <div style="font-size: 0.8rem; color: #94a3b8; display: flex; justify-content: space-between; margin-top: 0.5rem;">
          <span>FSR Force (Target: ≥ 15):</span>
          <span class="font-mono" id="pressText2">0 / 1023</span>
        </div>
        <div class="bar-bg"><div class="bar-fill" id="pressBar2" style="width: 0%; background: #64748b;"></div></div>
        <button class="btn" style="width: 100%; margin-top: 1rem; justify-content: center;" onclick="toggleSlot(2)">Toggle Slot 2</button>
      </div>

      <!-- Slot 3 Card -->
      <div class="glass-panel" id="card3">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div>
            <span style="font-weight: 700; font-size: 1.1rem;">SLOT 3</span>
            <div style="font-size: 10px; color: #64748b; font-family: monospace;">TRIG D6 / ECHO D7 · FSR A2</div>
          </div>
          <span class="badge badge-available" id="badge3">AVAILABLE</span>
        </div>
        <div style="font-size: 0.8rem; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Distance (Target: ≤ 3.0cm):</span>
          <span class="font-mono" id="distText3">48.0 cm</span>
        </div>
        <div class="bar-bg"><div class="bar-fill" id="distBar3" style="width: 96%; background: #10b981;"></div></div>
        <div style="font-size: 0.8rem; color: #94a3b8; display: flex; justify-content: space-between; margin-top: 0.5rem;">
          <span>FSR Force (Target: ≥ 15):</span>
          <span class="font-mono" id="pressText3">0 / 1023</span>
        </div>
        <div class="bar-bg"><div class="bar-fill" id="pressBar3" style="width: 0%; background: #64748b;"></div></div>
        <button class="btn" style="width: 100%; margin-top: 1rem; justify-content: center;" onclick="toggleSlot(3)">Toggle Slot 3</button>
      </div>
    </div>

    <!-- Serial Monitor -->
    <div class="glass-panel" style="margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <span style="font-weight: 700; font-size: 0.95rem;">Live Arduino Serial Console (9600 Baud)</span>
        <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.7rem;" onclick="clearConsole()">Clear</button>
      </div>
      <div class="terminal-box" id="terminal"></div>
    </div>
  </div>

  <script>
    const slots = {
      1: { status: 'AVAILABLE', distance: 45.0, fsr: 0, carColor: '#0284c7' },
      2: { status: 'AVAILABLE', distance: 42.0, fsr: 0, carColor: '#2563eb' },
      3: { status: 'AVAILABLE', distance: 48.0, fsr: 0, carColor: '#e11d48' }
    };
    let demoInterval = null;
    let audioEnabled = true;
    let audioCtx = null;
    let serialPort = null;
    let serialReader = null;

    function playBeep(freq = 2400, durMs = 85) {
      if (!audioEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime + durMs/1000 - 0.01);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + durMs/1000);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + durMs/1000);
      } catch (e) { console.warn(e); }
    }

    async function triggerBuzzer(pulseCount) {
      logSerial('[BUZZER] Alert: ' + pulseCount + ' pulse pattern');
      const bIcon = document.getElementById('buzzerIcon');
      bIcon.style.background = '#f59e0b';
      bIcon.style.color = '#000';
      bIcon.style.boxShadow = '0 0 20px #f59e0b';

      for (let p = 1; p <= pulseCount; p++) {
        const node = document.getElementById('pulseNode' + p);
        if (node) node.classList.add('active');
        playBeep(2300, 90);
        await new Promise(r => setTimeout(r, 110));
        if (node) node.classList.remove('active');
        if (p < pulseCount) await new Promise(r => setTimeout(r, 80));
      }

      bIcon.style.background = '#1e293b';
      bIcon.style.color = '#f59e0b';
      bIcon.style.boxShadow = 'none';
    }

    function toggleAudio() {
      audioEnabled = !audioEnabled;
      document.getElementById('btnAudio').textContent = 'Sound: ' + (audioEnabled ? 'ON' : 'OFF');
    }

    function updateUI() {
      let occupiedCount = 0;
      for (let i = 1; i <= 3; i++) {
        const s = slots[i];
        const isOcc = s.status === 'OCCUPIED';
        if (isOcc) occupiedCount++;

        const bay = document.getElementById('bay' + i);
        const sensor = document.getElementById('sensor' + i);
        const carSlot = document.getElementById('carSlot' + i);
        const footer = document.getElementById('bayFooter' + i);

        bay.className = 'slot-bay ' + (isOcc ? 'occupied' : 'available');
        sensor.style.background = isOcc ? '#f43f5e' : '#10b981';
        sensor.style.color = isOcc ? '#f43f5e' : '#10b981';
        footer.textContent = s.distance.toFixed(1) + ' cm | ' + s.fsr + ' FSR';

        if (isOcc) {
          carSlot.innerHTML = '<div class="car-3d" style="background: linear-gradient(135deg, ' + s.carColor + ', #0f172a);"><div class="car-hood"></div><div class="car-cabin"></div><div class="car-headlights"><div class="headlight"></div><div class="headlight"></div></div><div class="taillight"></div></div>';
        } else {
          carSlot.innerHTML = '<div style="color: rgba(16,185,129,0.3); font-size: 24px; font-weight: bold; font-family: monospace;">' + i + '</div>';
        }

        const badge = document.getElementById('badge' + i);
        badge.className = 'badge ' + (isOcc ? 'badge-occupied' : 'badge-available');
        badge.textContent = s.status;

        document.getElementById('distText' + i).textContent = s.distance.toFixed(1) + ' cm';
        const dBar = document.getElementById('distBar' + i);
        const dPct = Math.min(100, Math.max(0, (s.distance / 50) * 100));
        dBar.style.width = dPct + '%';
        dBar.style.background = s.distance <= 3.0 ? '#f43f5e' : '#10b981';

        document.getElementById('pressText' + i).textContent = s.fsr + ' / 1023';
        const pBar = document.getElementById('pressBar' + i);
        const pPct = Math.min(100, Math.max(0, (s.fsr / 1023) * 100));
        pBar.style.width = pPct + '%';
        pBar.style.background = s.fsr >= 15 ? '#f43f5e' : '#64748b';
      }

      const allOccupied = occupiedCount === 3;
      document.getElementById('statOccupiedFraction').textContent = occupiedCount + ' / 3';
      document.getElementById('statEmptyText').textContent = (3 - occupiedCount) + ' bays empty';

      const gateArm = document.getElementById('gateArm');
      const gateText = document.getElementById('statGateAngle');
      if (allOccupied) {
        gateArm.className = 'gate-arm closed';
        gateText.textContent = '90° CLOSED';
        gateText.style.color = '#f43f5e';
      } else {
        gateArm.className = 'gate-arm open';
        gateText.textContent = '0° OPEN';
        gateText.style.color = '#10b981';
      }

      const buzzText = document.getElementById('statBuzzerStatus');
      if (allOccupied) {
        buzzText.textContent = 'ON (D8 ACTIVE)';
        buzzText.style.color = '#f59e0b';
      } else {
        buzzText.textContent = 'OFF';
        buzzText.style.color = '#94a3b8';
      }
    }

    function toggleSlot(id) {
      const s = slots[id];
      const willBeOccupied = s.status !== 'OCCUPIED';
      s.status = willBeOccupied ? 'OCCUPIED' : 'AVAILABLE';
      // Hardware condition: distance <= 3cm AND FSR >= 15
      s.distance = willBeOccupied ? (1.2 + Math.random() * 1.5) : (18.0 + Math.random() * 25);
      s.fsr = willBeOccupied ? Math.floor(40 + Math.random() * 200) : Math.floor(Math.random() * 5);

      const line = 'SLOT ' + id + ' | Distance: ' + s.distance.toFixed(1) + ' cm | FSR: ' + s.fsr + ' | STATUS: ' + s.status;
      logSerial(line);

      if (willBeOccupied) {
        triggerBuzzer(id);
      }
      updateUI();
    }

    function logSerial(msg) {
      const term = document.getElementById('terminal');
      const time = new Date().toLocaleTimeString();
      const div = document.createElement('div');
      div.style.marginBottom = '2px';
      div.textContent = '[' + time + '] ' + msg;
      term.appendChild(div);
      term.scrollTop = term.scrollHeight;
    }

    function clearConsole() {
      document.getElementById('terminal').innerHTML = '';
    }

    function parseSerialLine(line) {
      // 1. Gate / Buzzer line
      const gateMatch = line.match(/(?:GATE|SERVO)[:\\s]+(\\d+)/i);
      const buzzMatch = line.match(/BUZZER[:\\s]+(ON|OFF)/i);
      if (gateMatch || buzzMatch) {
        if (gateMatch) {
          const deg = parseInt(gateMatch[1]);
          const gateArm = document.getElementById('gateArm');
          const gateText = document.getElementById('statGateAngle');
          if (deg >= 45) {
            gateArm.className = 'gate-arm closed';
            gateText.textContent = '90° CLOSED';
            gateText.style.color = '#f43f5e';
          } else {
            gateArm.className = 'gate-arm open';
            gateText.textContent = '0° OPEN';
            gateText.style.color = '#10b981';
          }
        }
        if (buzzMatch) {
          const isBuzzOn = buzzMatch[1].toUpperCase() === 'ON';
          const buzzText = document.getElementById('statBuzzerStatus');
          buzzText.textContent = isBuzzOn ? 'ON (D8 ACTIVE)' : 'OFF';
          buzzText.style.color = isBuzzOn ? '#f59e0b' : '#94a3b8';
        }
        return;
      }

      // 2. Slot telemetry line
      const slotMatch = line.match(/(?:LOT|SLOT)\\s*([1-3])/i);
      const distMatch = line.match(/(?:Distance|Dist):\\s*([\\d.]+)/i);
      const statMatch = line.match(/(?:Status|STATUS):\\s*(EMPTY|OCCUPIED|AVAILABLE|VACANT)/i);
      const fsrMatch = line.match(/(?:FSR|Pressure):\\s*(\\d+)/i);

      if (slotMatch) {
        const id = parseInt(slotMatch[1]);
        const dist = distMatch ? parseFloat(distMatch[1]) : 0;
        const fsr = fsrMatch ? parseInt(fsrMatch[1]) : 0;
        let status = 'AVAILABLE';
        if (statMatch) {
          status = statMatch[1].toUpperCase() === 'OCCUPIED' ? 'OCCUPIED' : 'AVAILABLE';
        } else if (fsrMatch) {
          status = (dist <= 3.0 && fsr >= 15) ? 'OCCUPIED' : 'AVAILABLE';
        }
        
        const prevStatus = slots[id].status;
        slots[id].distance = dist;
        slots[id].fsr = fsr;
        slots[id].status = status;
        
        if (prevStatus !== 'OCCUPIED' && status === 'OCCUPIED') {
          triggerBuzzer(id);
        }
        updateUI();
      }
    }

    function startDemo() {
      if (demoInterval) clearInterval(demoInterval);
      demoInterval = setInterval(() => {
        const randomSlot = (Math.floor(Math.random() * 3) + 1);
        toggleSlot(randomSlot);
      }, 4500);
      document.getElementById('connStatusText').textContent = 'DEMO MODE ACTIVE';
      document.getElementById('connStatusText').style.color = '#38bdf8';
    }

    function stopDemo() {
      if (demoInterval) {
        clearInterval(demoInterval);
        demoInterval = null;
      }
    }

    document.getElementById('btnDemo').onclick = () => {
      if (demoInterval) {
        stopDemo();
        document.getElementById('btnDemo').textContent = 'Demo Mode';
        document.getElementById('connStatusText').textContent = 'DISCONNECTED';
        document.getElementById('connStatusText').style.color = '#94a3b8';
      } else {
        startDemo();
        document.getElementById('btnDemo').textContent = 'Stop Demo';
      }
    };

    document.getElementById('btnConnect').onclick = async () => {
      if (!('serial' in navigator)) {
        alert('Web Serial is only supported in Google Chrome or Microsoft Edge on Windows 11.');
        return;
      }
      try {
        stopDemo();
        serialPort = await navigator.serial.requestPort();
        await serialPort.open({ baudRate: 9600 });
        document.getElementById('connStatusText').textContent = 'ARDUINO UNO CONNECTED @ 9600';
        document.getElementById('connStatusText').style.color = '#34d399';
        document.getElementById('btnConnect').textContent = 'Disconnect';
        document.getElementById('btnConnect').className = 'btn btn-disconnect';
        logSerial('[SYSTEM] Connected to Arduino Uno at 9600 baud');

        const textDecoder = new TextDecoderStream();
        serialPort.readable.pipeTo(textDecoder.writable);
        serialReader = textDecoder.readable.getReader();
        let buffer = '';

        while (true) {
          const { value, done } = await serialReader.read();
          if (done) break;
          buffer += value;
          const lines = buffer.split(/\\r?\\n/);
          buffer = lines.pop();
          for (const l of lines) {
            if (l.trim()) {
              logSerial(l.trim());
              parseSerialLine(l.trim());
            }
          }
        }
      } catch (err) {
        const isLockError = err.message && (err.message.includes('Failed to open') || err.message.includes('Access denied'));
        const displayErr = isLockError
          ? 'Windows COM Port Locked: Please CLOSE Arduino IDE Serial Monitor before connecting.'
          : err.message;
        logSerial('[ERROR] ' + displayErr);
        alert(displayErr);
        document.getElementById('connStatusText').textContent = 'DISCONNECTED';
        document.getElementById('connStatusText').style.color = '#fb7185';
      }
    };

    updateUI();
    logSerial('Smart Parking Dashboard initialized. Ready for Arduino Uno @ 9600.');
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'smart-parking-dashboard-single-file.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
