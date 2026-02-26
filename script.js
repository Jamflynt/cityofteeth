(function () {
  /* ── helpers ───────────────────────────────────────────── */
  function pad(n, width = 6) {
    const s = String(n);
    return s.length >= width ? s : "0".repeat(width - s.length) + s;
  }
  function rand(lo, hi) {
    return lo + Math.random() * (hi - lo);
  }
  function randInt(lo, hi) {
    return Math.floor(rand(lo, hi + 1));
  }
  function pick(arr) {
    return arr[randInt(0, arr.length - 1)];
  }
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /* ── palette ──────────────────────────────────────────── */
  const COLORS = {
    toothWhite: "#e8e3d7",
    toothShade: "#cec9bc",
    toothHighlight: "#f5f2eb",
    outline: "#231f1a",
    gold: "#c7a066",
    goldBright: "#dbb777",
    gumPink: "#d4838a",
    gumDark: "#a85c62",
    eye: "#231f1a",
    eyeWhite: "#ffffff",
    blush: "rgba(212, 131, 138, 0.35)",

    confetti: [
      "#c7a066",
      "#dbb777",
      "#e8e3d7",
      "#d4838a",
      "#7eaac4",
      "#8bc49a",
      "#d4a0c4",
      "#e8c36a",
      "#c46a6a",
      "#6ac4b8",
    ],

    hatRed: "#c44040",
    hatGreen: "#4a8a5c",
    hatBlue: "#4a6a9a",
    hatPurple: "#7a4a8a",
    crownGold: "#dbb777",
  };

  /* ── canvas setup ─────────────────────────────────────── */
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let canvas, ctx, W, H;
  let reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function initCanvas() {
    canvas = document.getElementById("parade-canvas");
    if (!canvas) return false;
    ctx = canvas.getContext("2d");
    resize();
    return true;
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* ── tooth drawing ────────────────────────────────────── */
  const TOOTH_TYPES = ["molar", "incisor", "canine", "premolar"];
  const ACCESSORIES = [
    "none",
    "none",
    "topHat",
    "partyHat",
    "crown",
    "sunglasses",
    "bowtie",
    "flag",
    "headband",
  ];
  const DANCE_STYLES = [
    "bounce",
    "sway",
    "twist",
    "hop",
    "wiggle",
    "disco",
    "wave",
  ];
  const EXPRESSIONS = ["happy", "silly", "excited", "singing", "wink", "cool"];

  function drawTooth(tooth, t) {
    const { x, y, scale, type, accessory, danceStyle, expression, phase, flipX } = tooth;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * (flipX ? -1 : 1), scale);

    // dance transform
    const danceOffset = getDanceTransform(danceStyle, t, phase);
    ctx.translate(danceOffset.tx, danceOffset.ty);
    ctx.rotate(danceOffset.rot);

    // base tooth size reference
    const bw = 30; // body width
    const bh = 22; // body height

    // draw shadow
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(0, bh * 0.6 + 8, bw * 0.45, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // draw legs (behind body)
    drawLegs(ctx, bw, bh, danceStyle, t, phase);

    // draw tooth body
    drawToothBody(ctx, type, bw, bh);

    // draw arms
    drawArms(ctx, bw, bh, danceStyle, t, phase, accessory);

    // draw face
    drawFace(ctx, expression, bw, bh, t, phase);

    // draw accessory
    drawAccessory(ctx, accessory, bw, bh, t, phase);

    ctx.restore();
  }

  function getDanceTransform(style, t, phase) {
    const p = (t * 2.5 + phase) % (Math.PI * 2);
    switch (style) {
      case "bounce":
        return {
          tx: 0,
          ty: Math.abs(Math.sin(p)) * -10,
          rot: Math.sin(p * 0.5) * 0.04,
        };
      case "sway":
        return {
          tx: Math.sin(p) * 5,
          ty: Math.abs(Math.sin(p * 2)) * -3,
          rot: Math.sin(p) * 0.12,
        };
      case "twist":
        return {
          tx: 0,
          ty: Math.abs(Math.sin(p * 1.5)) * -6,
          rot: Math.sin(p) * 0.18,
        };
      case "hop": {
        const hopPhase = p % (Math.PI * 2);
        const hopY =
          hopPhase < Math.PI ? Math.sin(hopPhase) * -16 : 0;
        return { tx: 0, ty: hopY, rot: Math.sin(p * 0.7) * 0.06 };
      }
      case "wiggle":
        return {
          tx: Math.sin(p * 3) * 3,
          ty: Math.abs(Math.sin(p * 2)) * -4,
          rot: Math.sin(p * 3) * 0.08,
        };
      case "disco": {
        const beat = easeInOut((Math.sin(p * 2) + 1) / 2);
        return {
          tx: Math.sin(p) * 4,
          ty: beat * -12,
          rot: Math.sin(p * 1.5) * 0.15,
        };
      }
      case "wave":
        return {
          tx: Math.sin(p * 0.8) * 6,
          ty: Math.sin(p * 1.6) * -5,
          rot: Math.sin(p * 0.8) * 0.1,
        };
      default:
        return { tx: 0, ty: 0, rot: 0 };
    }
  }

  function drawToothBody(ctx, type, bw, bh) {
    ctx.save();
    switch (type) {
      case "molar":
        drawMolar(ctx, bw, bh);
        break;
      case "incisor":
        drawIncisor(ctx, bw, bh);
        break;
      case "canine":
        drawCanine(ctx, bw, bh);
        break;
      case "premolar":
        drawPremolar(ctx, bw, bh);
        break;
    }
    ctx.restore();
  }

  function drawMolar(ctx, bw, bh) {
    const hw = bw * 0.5;

    // roots
    ctx.fillStyle = COLORS.toothShade;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.5;
    // left root
    ctx.beginPath();
    ctx.moveTo(-hw * 0.55, bh * 0.3);
    ctx.lineTo(-hw * 0.65, bh * 0.85);
    ctx.quadraticCurveTo(-hw * 0.5, bh * 1.0, -hw * 0.35, bh * 0.85);
    ctx.lineTo(-hw * 0.25, bh * 0.3);
    ctx.fill();
    ctx.stroke();
    // right root
    ctx.beginPath();
    ctx.moveTo(hw * 0.25, bh * 0.3);
    ctx.lineTo(hw * 0.35, bh * 0.85);
    ctx.quadraticCurveTo(hw * 0.5, bh * 1.0, hw * 0.65, bh * 0.85);
    ctx.lineTo(hw * 0.55, bh * 0.3);
    ctx.fill();
    ctx.stroke();

    // main body
    ctx.fillStyle = COLORS.toothWhite;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.8;
    roundRect(ctx, -hw, -bh * 0.55, bw, bh * 0.9, 7);
    ctx.fill();
    ctx.stroke();

    // highlight
    ctx.fillStyle = COLORS.toothHighlight;
    roundRect(ctx, -hw + 3, -bh * 0.5, bw * 0.35, bh * 0.3, 3);
    ctx.fill();

    // gold band
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(-hw + 2, -bh * 0.1, bw - 4, 3);
    ctx.fillStyle = COLORS.goldBright;
    ctx.fillRect(-hw + 2, -bh * 0.1, bw - 4, 1.2);
  }

  function drawIncisor(ctx, bw, bh) {
    const hw = bw * 0.38;
    const tall = bh * 1.1;

    // single root
    ctx.fillStyle = COLORS.toothShade;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.35, tall * 0.3);
    ctx.lineTo(-hw * 0.15, tall * 0.95);
    ctx.quadraticCurveTo(0, tall * 1.08, hw * 0.15, tall * 0.95);
    ctx.lineTo(hw * 0.35, tall * 0.3);
    ctx.fill();
    ctx.stroke();

    // body - taller and narrower
    ctx.fillStyle = COLORS.toothWhite;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.8;
    roundRect(ctx, -hw, -tall * 0.45, hw * 2, tall * 0.78, 5);
    ctx.fill();
    ctx.stroke();

    // highlight
    ctx.fillStyle = COLORS.toothHighlight;
    roundRect(ctx, -hw + 2, -tall * 0.4, hw * 0.7, tall * 0.25, 3);
    ctx.fill();

    // gold band
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(-hw + 1, -tall * 0.05, hw * 2 - 2, 2.5);
  }

  function drawCanine(ctx, bw, bh) {
    const hw = bw * 0.4;

    // pointy root
    ctx.fillStyle = COLORS.toothShade;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.3, bh * 0.3);
    ctx.lineTo(0, bh * 1.15);
    ctx.lineTo(hw * 0.3, bh * 0.3);
    ctx.fill();
    ctx.stroke();

    // body - slightly angular
    ctx.fillStyle = COLORS.toothWhite;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-hw, -bh * 0.5);
    ctx.lineTo(hw, -bh * 0.5);
    ctx.quadraticCurveTo(hw + 2, 0, hw * 0.6, bh * 0.35);
    ctx.lineTo(-hw * 0.6, bh * 0.35);
    ctx.quadraticCurveTo(-hw - 2, 0, -hw, -bh * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // highlight
    ctx.fillStyle = COLORS.toothHighlight;
    ctx.beginPath();
    ctx.moveTo(-hw + 3, -bh * 0.45);
    ctx.lineTo(-hw * 0.2, -bh * 0.45);
    ctx.lineTo(-hw * 0.35, -bh * 0.15);
    ctx.lineTo(-hw + 2, -bh * 0.15);
    ctx.closePath();
    ctx.fill();

    // gold fang tip highlight
    ctx.fillStyle = COLORS.goldBright;
    ctx.beginPath();
    ctx.arc(0, bh * 0.9, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPremolar(ctx, bw, bh) {
    const hw = bw * 0.42;

    // two small roots
    ctx.fillStyle = COLORS.toothShade;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.3;
    [-0.3, 0.3].forEach((off) => {
      ctx.beginPath();
      ctx.moveTo(hw * (off - 0.15), bh * 0.25);
      ctx.lineTo(hw * off, bh * 0.85);
      ctx.lineTo(hw * (off + 0.15), bh * 0.25);
      ctx.fill();
      ctx.stroke();
    });

    // body - slightly rounded top bumps
    ctx.fillStyle = COLORS.toothWhite;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-hw, bh * 0.3);
    ctx.lineTo(-hw, -bh * 0.25);
    ctx.quadraticCurveTo(-hw * 0.5, -bh * 0.65, 0, -bh * 0.3);
    ctx.quadraticCurveTo(hw * 0.5, -bh * 0.65, hw, -bh * 0.25);
    ctx.lineTo(hw, bh * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // highlight
    ctx.fillStyle = COLORS.toothHighlight;
    ctx.beginPath();
    ctx.moveTo(-hw + 2, -bh * 0.2);
    ctx.quadraticCurveTo(-hw * 0.5, -bh * 0.55, -hw * 0.1, -bh * 0.25);
    ctx.lineTo(-hw * 0.1, -bh * 0.05);
    ctx.lineTo(-hw + 2, -bh * 0.05);
    ctx.closePath();
    ctx.fill();

    // gold band
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(-hw + 1, bh * 0.05, hw * 2 - 2, 2.5);
  }

  /* ── limbs ────────────────────────────────────────────── */
  function drawLegs(ctx, bw, bh, danceStyle, t, phase) {
    const p = (t * 2.5 + phase) % (Math.PI * 2);
    const legLen = 14;
    const footLen = 6;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";

    let leftAngle, rightAngle, leftKick, rightKick;
    switch (danceStyle) {
      case "bounce":
        leftAngle = Math.sin(p) * 0.25;
        rightAngle = Math.sin(p + Math.PI) * 0.25;
        leftKick = Math.max(0, Math.sin(p * 2)) * 0.3;
        rightKick = Math.max(0, Math.sin(p * 2 + Math.PI)) * 0.3;
        break;
      case "sway":
        leftAngle = Math.sin(p) * 0.15;
        rightAngle = Math.sin(p) * 0.15;
        leftKick = 0;
        rightKick = 0;
        break;
      case "twist":
        leftAngle = Math.sin(p) * 0.35;
        rightAngle = Math.sin(p + Math.PI) * 0.35;
        leftKick = Math.abs(Math.sin(p)) * 0.2;
        rightKick = Math.abs(Math.sin(p + Math.PI)) * 0.2;
        break;
      case "hop":
        leftAngle = Math.sin(p * 0.5) * 0.1;
        rightAngle = Math.sin(p * 0.5 + Math.PI) * 0.1;
        leftKick = p % (Math.PI * 2) < Math.PI ? 0.4 : 0;
        rightKick = leftKick;
        break;
      case "disco":
        leftAngle = Math.sin(p) * 0.4;
        rightAngle = Math.sin(p + Math.PI * 0.7) * 0.4;
        leftKick = Math.max(0, Math.sin(p * 2)) * 0.5;
        rightKick = Math.max(0, Math.sin(p * 2 + Math.PI)) * 0.5;
        break;
      default:
        leftAngle = Math.sin(p) * 0.2;
        rightAngle = Math.sin(p + Math.PI) * 0.2;
        leftKick = Math.max(0, Math.sin(p)) * 0.15;
        rightKick = Math.max(0, Math.sin(p + Math.PI)) * 0.15;
    }

    // left leg
    const lx = -6;
    const ly = bh * 0.3;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    const lkneeX = lx + Math.sin(leftAngle) * legLen * 0.6;
    const lkneeY = ly + Math.cos(leftAngle) * legLen * 0.6;
    ctx.lineTo(lkneeX, lkneeY);
    const lfootX = lkneeX + Math.sin(leftAngle + leftKick) * legLen * 0.5;
    const lfootY = lkneeY + Math.cos(leftAngle + leftKick) * legLen * 0.5;
    ctx.lineTo(lfootX, lfootY);
    ctx.stroke();
    // shoe
    ctx.fillStyle = COLORS.outline;
    ctx.beginPath();
    ctx.ellipse(lfootX + 2, lfootY + 1, footLen, 3, leftAngle * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // right leg
    const rx = 6;
    ctx.beginPath();
    ctx.moveTo(rx, ly);
    const rkneeX = rx + Math.sin(rightAngle) * legLen * 0.6;
    const rkneeY = ly + Math.cos(rightAngle) * legLen * 0.6;
    ctx.lineTo(rkneeX, rkneeY);
    const rfootX = rkneeX + Math.sin(rightAngle + rightKick) * legLen * 0.5;
    const rfootY = rkneeY + Math.cos(rightAngle + rightKick) * legLen * 0.5;
    ctx.lineTo(rfootX, rfootY);
    ctx.stroke();
    // shoe
    ctx.fillStyle = COLORS.outline;
    ctx.beginPath();
    ctx.ellipse(rfootX + 2, rfootY + 1, footLen, 3, rightAngle * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawArms(ctx, bw, bh, danceStyle, t, phase, accessory) {
    const p = (t * 2.5 + phase) % (Math.PI * 2);
    const armLen = 12;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    let leftArmAngle, rightArmAngle, leftWave, rightWave;
    switch (danceStyle) {
      case "bounce":
        leftArmAngle = -0.6 + Math.sin(p) * 0.4;
        rightArmAngle = 0.6 + Math.sin(p + Math.PI) * 0.4;
        leftWave = Math.sin(p * 2) * 0.3;
        rightWave = Math.sin(p * 2 + Math.PI) * 0.3;
        break;
      case "disco":
        leftArmAngle = -1.2 + Math.sin(p) * 0.6;
        rightArmAngle = 1.2 + Math.sin(p + Math.PI * 0.5) * 0.6;
        leftWave = Math.sin(p * 3) * 0.4;
        rightWave = Math.sin(p * 3 + Math.PI) * 0.4;
        break;
      case "wave":
        leftArmAngle = -0.8 + Math.sin(p * 0.5) * 0.3;
        rightArmAngle = -1.0 + Math.sin(p) * 0.8; // waving arm
        leftWave = 0;
        rightWave = Math.sin(p * 3) * 0.5;
        break;
      default:
        leftArmAngle = -0.5 + Math.sin(p) * 0.35;
        rightArmAngle = 0.5 + Math.sin(p + Math.PI) * 0.35;
        leftWave = Math.sin(p * 1.5) * 0.2;
        rightWave = Math.sin(p * 1.5 + Math.PI) * 0.2;
    }

    const shoulderY = -bh * 0.1;

    // left arm
    const lsx = -bw * 0.45;
    ctx.beginPath();
    ctx.moveTo(lsx, shoulderY);
    const lelbowX = lsx + Math.sin(leftArmAngle) * armLen * 0.55;
    const lelbowY = shoulderY + Math.cos(leftArmAngle) * armLen * 0.55;
    ctx.lineTo(lelbowX, lelbowY);
    const lhandX = lelbowX + Math.sin(leftArmAngle + leftWave) * armLen * 0.5;
    const lhandY = lelbowY + Math.cos(leftArmAngle + leftWave) * armLen * 0.5;
    ctx.lineTo(lhandX, lhandY);
    ctx.stroke();
    // hand circle
    ctx.fillStyle = COLORS.toothWhite;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(lhandX, lhandY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // right arm
    const rsx = bw * 0.45;
    ctx.beginPath();
    ctx.moveTo(rsx, shoulderY);
    const relbowX = rsx + Math.sin(rightArmAngle) * armLen * 0.55;
    const relbowY = shoulderY + Math.cos(rightArmAngle) * armLen * 0.55;
    ctx.lineTo(relbowX, relbowY);
    const rhandX = relbowX + Math.sin(rightArmAngle + rightWave) * armLen * 0.5;
    const rhandY = relbowY + Math.cos(rightArmAngle + rightWave) * armLen * 0.5;
    ctx.lineTo(rhandX, rhandY);
    ctx.stroke();
    ctx.fillStyle = COLORS.toothWhite;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(rhandX, rhandY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // if holding flag, draw it from right hand
    if (accessory === "flag") {
      drawFlag(ctx, rhandX, rhandY - 2, t, phase);
    }
  }

  /* ── face ─────────────────────────────────────────────── */
  function drawFace(ctx, expression, bw, bh, t, phase) {
    const faceY = -bh * 0.2;
    const eyeSpacing = 6;
    const eyeY = faceY - 2;
    const p = (t * 2.5 + phase) % (Math.PI * 2);

    // blush
    ctx.fillStyle = COLORS.blush;
    ctx.beginPath();
    ctx.ellipse(-eyeSpacing - 3, faceY + 4, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(eyeSpacing + 3, faceY + 4, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    switch (expression) {
      case "happy":
        drawEye(ctx, -eyeSpacing, eyeY, "open", t, phase);
        drawEye(ctx, eyeSpacing, eyeY, "open", t, phase);
        drawMouth(ctx, 0, faceY + 6, "smile");
        break;
      case "silly":
        drawEye(ctx, -eyeSpacing, eyeY - 1, "open", t, phase);
        drawEye(ctx, eyeSpacing, eyeY + 1, "open", t, phase);
        drawMouth(ctx, 0, faceY + 6, "tongue");
        break;
      case "excited":
        drawEye(ctx, -eyeSpacing, eyeY, "wide", t, phase);
        drawEye(ctx, eyeSpacing, eyeY, "wide", t, phase);
        drawMouth(ctx, 0, faceY + 6, "open");
        break;
      case "singing":
        drawEye(ctx, -eyeSpacing, eyeY, "closed", t, phase);
        drawEye(ctx, eyeSpacing, eyeY, "closed", t, phase);
        drawMouth(ctx, 0, faceY + 6, "sing");
        // music note
        if (Math.sin(p * 1.5) > 0.3) {
          drawMusicNote(
            ctx,
            8 + Math.sin(p) * 3,
            faceY - 4 + Math.sin(p * 2) * 2,
            1.5
          );
        }
        break;
      case "wink":
        drawEye(ctx, -eyeSpacing, eyeY, "open", t, phase);
        drawEye(ctx, eyeSpacing, eyeY, "wink", t, phase);
        drawMouth(ctx, 0, faceY + 6, "smirk");
        break;
      case "cool":
        drawEye(ctx, -eyeSpacing, eyeY, "half", t, phase);
        drawEye(ctx, eyeSpacing, eyeY, "half", t, phase);
        drawMouth(ctx, 0, faceY + 6, "grin");
        break;
    }
  }

  function drawEye(ctx, x, y, style, t, phase) {
    const p = (t * 2.5 + phase) % (Math.PI * 2);

    // blink every ~3 seconds
    const blinkCycle = (t * 1.0 + phase * 7) % 4;
    const isBlinking = blinkCycle > 3.85;

    if (isBlinking && style !== "closed" && style !== "wink") {
      // draw blink line
      ctx.strokeStyle = COLORS.eye;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 3, y);
      ctx.lineTo(x + 3, y);
      ctx.stroke();
      return;
    }

    switch (style) {
      case "open":
        // eye white
        ctx.fillStyle = COLORS.eyeWhite;
        ctx.beginPath();
        ctx.ellipse(x, y, 3.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // pupil with slight movement
        const lookX = Math.sin(p * 0.3) * 0.8;
        const lookY = Math.sin(p * 0.5) * 0.4;
        ctx.fillStyle = COLORS.eye;
        ctx.beginPath();
        ctx.arc(x + lookX, y + lookY, 1.8, 0, Math.PI * 2);
        ctx.fill();
        // highlight
        ctx.fillStyle = COLORS.eyeWhite;
        ctx.beginPath();
        ctx.arc(x + lookX + 0.7, y + lookY - 0.7, 0.7, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "wide":
        ctx.fillStyle = COLORS.eyeWhite;
        ctx.beginPath();
        ctx.ellipse(x, y, 4, 3.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = COLORS.eye;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = COLORS.eyeWhite;
        ctx.beginPath();
        ctx.arc(x + 0.8, y - 0.8, 0.9, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "closed":
        ctx.strokeStyle = COLORS.eye;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI);
        ctx.stroke();
        break;
      case "wink":
        ctx.strokeStyle = COLORS.eye;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x - 3, y);
        ctx.lineTo(x + 3, y - 1);
        ctx.stroke();
        break;
      case "half":
        ctx.fillStyle = COLORS.eyeWhite;
        ctx.beginPath();
        ctx.ellipse(x, y, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = COLORS.eye;
        ctx.beginPath();
        ctx.arc(x, y + 0.3, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // eyelid
        ctx.fillStyle = COLORS.toothWhite;
        ctx.beginPath();
        ctx.ellipse(x, y - 1.5, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  function drawMouth(ctx, x, y, style) {
    ctx.strokeStyle = COLORS.eye;
    ctx.fillStyle = COLORS.eye;
    ctx.lineWidth = 1.3;
    ctx.lineCap = "round";

    switch (style) {
      case "smile":
        ctx.beginPath();
        ctx.arc(x, y - 1, 4, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        break;
      case "grin":
        ctx.beginPath();
        ctx.arc(x, y - 1, 5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // tiny teeth in grin
        ctx.fillStyle = COLORS.eyeWhite;
        ctx.fillRect(x - 3, y + 1, 6, 2);
        ctx.strokeStyle = COLORS.eye;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y + 1);
        ctx.lineTo(x, y + 3);
        ctx.stroke();
        break;
      case "open":
        ctx.beginPath();
        ctx.ellipse(x, y + 1, 3.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // tongue
        ctx.fillStyle = COLORS.gumPink;
        ctx.beginPath();
        ctx.ellipse(x, y + 3, 2.5, 1.5, 0, 0, Math.PI);
        ctx.fill();
        break;
      case "tongue":
        ctx.beginPath();
        ctx.arc(x, y - 1, 4, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = COLORS.gumPink;
        ctx.beginPath();
        ctx.ellipse(x + 2, y + 3, 3, 2.2, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = COLORS.gumDark;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x + 1, y + 2);
        ctx.lineTo(x + 2, y + 4.5);
        ctx.stroke();
        break;
      case "sing":
        ctx.beginPath();
        ctx.ellipse(x, y + 1, 2.8, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "smirk":
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.quadraticCurveTo(x, y + 4, x + 4, y - 1);
        ctx.stroke();
        break;
    }
  }

  /* ── accessories ──────────────────────────────────────── */
  function drawAccessory(ctx, accessory, bw, bh, t, phase) {
    const topY = -bh * 0.55;

    switch (accessory) {
      case "topHat":
        drawTopHat(ctx, 0, topY);
        break;
      case "partyHat":
        drawPartyHat(ctx, 0, topY);
        break;
      case "crown":
        drawCrown(ctx, 0, topY);
        break;
      case "sunglasses":
        drawSunglasses(ctx, 0, -bh * 0.24);
        break;
      case "bowtie":
        drawBowtie(ctx, 0, bh * 0.15);
        break;
      case "headband":
        drawHeadband(ctx, 0, topY + 4, t, phase);
        break;
      // flag is drawn from the arm
    }
  }

  function drawTopHat(ctx, x, y) {
    ctx.fillStyle = COLORS.outline;
    // brim
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 14, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    roundRect(ctx, x - 9, y - 16, 18, 18, 2);
    ctx.fill();
    // band
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(x - 9, y - 4, 18, 3);
    ctx.fillStyle = COLORS.goldBright;
    ctx.fillRect(x - 9, y - 4, 18, 1.2);
    // highlight
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(x - 7, y - 15, 4, 13);
  }

  function drawPartyHat(ctx, x, y) {
    const color = pick([COLORS.hatRed, COLORS.hatBlue, COLORS.hatPurple, COLORS.hatGreen]);

    ctx.fillStyle = color;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 2);
    ctx.lineTo(x, y - 20);
    ctx.lineTo(x + 10, y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // stripes
    ctx.strokeStyle = COLORS.goldBright;
    ctx.lineWidth = 1.5;
    for (let i = 1; i < 4; i++) {
      const frac = i / 4;
      const sw = 10 * (1 - frac);
      const sy = y + 2 - (y + 2 - (y - 20)) * frac;
      ctx.beginPath();
      ctx.moveTo(x - sw, sy);
      ctx.lineTo(x + sw, sy);
      ctx.stroke();
    }

    // pom-pom
    ctx.fillStyle = COLORS.toothWhite;
    ctx.beginPath();
    ctx.arc(x, y - 20, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.goldBright;
    ctx.beginPath();
    ctx.arc(x - 1, y - 21, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCrown(ctx, x, y) {
    ctx.fillStyle = COLORS.crownGold;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 3);
    ctx.lineTo(x - 12, y - 6);
    ctx.lineTo(x - 7, y - 2);
    ctx.lineTo(x - 3, y - 10);
    ctx.lineTo(x, y - 4);
    ctx.lineTo(x + 3, y - 10);
    ctx.lineTo(x + 7, y - 2);
    ctx.lineTo(x + 12, y - 6);
    ctx.lineTo(x + 12, y + 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // jewels
    ctx.fillStyle = COLORS.hatRed;
    ctx.beginPath();
    ctx.arc(x, y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.hatBlue;
    ctx.beginPath();
    ctx.arc(x - 7, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 7, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSunglasses(ctx, x, y) {
    ctx.fillStyle = "rgba(30,25,20,0.85)";
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.5;
    // left lens
    roundRect(ctx, x - 11, y - 3, 9, 6, 2);
    ctx.fill();
    ctx.stroke();
    // right lens
    roundRect(ctx, x + 2, y - 3, 9, 6, 2);
    ctx.fill();
    ctx.stroke();
    // bridge
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x - 2, y);
    ctx.lineTo(x + 2, y);
    ctx.stroke();
    // arms
    ctx.beginPath();
    ctx.moveTo(x - 11, y - 1);
    ctx.lineTo(x - 15, y - 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 11, y - 1);
    ctx.lineTo(x + 15, y - 2);
    ctx.stroke();
    // lens reflection
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 1);
    ctx.lineTo(x - 6, y - 1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 4, y - 1);
    ctx.lineTo(x + 7, y - 1);
    ctx.stroke();
  }

  function drawBowtie(ctx, x, y) {
    ctx.fillStyle = COLORS.hatRed;
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 1;
    // left triangle
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 7, y - 4);
    ctx.lineTo(x - 7, y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // right triangle
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 7, y - 4);
    ctx.lineTo(x + 7, y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // center knot
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHeadband(ctx, x, y, t, phase) {
    const p = (t * 2.5 + phase) % (Math.PI * 2);
    // band
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y + 4, 13, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    // bobble on spring
    const bobbleAngle = Math.sin(p * 3) * 0.3;
    const springX = x + Math.sin(bobbleAngle) * 8;
    const springY = y - 10 + Math.sin(p * 4) * 2;
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - 2);
    // spring coils
    for (let i = 0; i < 5; i++) {
      const frac = i / 5;
      const cy = y - 2 - frac * 10;
      ctx.lineTo(x + Math.sin(frac * Math.PI * 4 + p * 2) * 3, cy);
    }
    ctx.lineTo(springX, springY);
    ctx.stroke();
    // bobble
    ctx.fillStyle = COLORS.hatRed;
    ctx.beginPath();
    ctx.arc(springX, springY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.goldBright;
    ctx.beginPath();
    ctx.arc(springX - 1, springY - 1, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFlag(ctx, hx, hy, t, phase) {
    const p = (t * 2.5 + phase) % (Math.PI * 2);
    // pole
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx, hy - 18);
    ctx.stroke();
    // flag (waving)
    const color = pick([COLORS.hatRed, COLORS.hatBlue, COLORS.hatPurple]);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(hx, hy - 18);
    ctx.quadraticCurveTo(
      hx + 8 + Math.sin(p * 3) * 2,
      hy - 16 + Math.sin(p * 2) * 1.5,
      hx + 12,
      hy - 14
    );
    ctx.lineTo(hx, hy - 10);
    ctx.closePath();
    ctx.fill();
    // stripe
    ctx.fillStyle = COLORS.goldBright;
    ctx.beginPath();
    ctx.moveTo(hx, hy - 15);
    ctx.quadraticCurveTo(
      hx + 6 + Math.sin(p * 3) * 1,
      hy - 14,
      hx + 10,
      hy - 13
    );
    ctx.lineTo(hx + 10, hy - 12);
    ctx.quadraticCurveTo(hx + 6, hy - 13, hx, hy - 13.5);
    ctx.closePath();
    ctx.fill();
  }

  function drawMusicNote(ctx, x, y, s) {
    ctx.fillStyle = COLORS.gold;
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(x, y, 2.2 * s, 1.6 * s, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 2 * s, y - 0.5 * s);
    ctx.lineTo(x + 2 * s, y - 7 * s);
    ctx.stroke();
    // flag
    ctx.beginPath();
    ctx.moveTo(x + 2 * s, y - 7 * s);
    ctx.quadraticCurveTo(x + 5 * s, y - 5 * s, x + 2 * s, y - 4 * s);
    ctx.stroke();
  }

  /* ── confetti & particles ─────────────────────────────── */
  class Confetti {
    constructor() {
      this.reset(true);
    }
    reset(initial) {
      this.x = rand(0, W);
      this.y = initial ? rand(-H, 0) : rand(-30, -10);
      this.w = rand(3, 7);
      this.h = rand(2, 5);
      this.color = pick(COLORS.confetti);
      this.speedY = rand(15, 40);
      this.speedX = rand(-10, 10);
      this.rotSpeed = rand(-4, 4);
      this.rot = rand(0, Math.PI * 2);
      this.flutter = rand(1, 3);
      this.flutterSpeed = rand(2, 5);
      this.phase = rand(0, Math.PI * 2);
      this.opacity = rand(0.5, 0.9);
      this.shape = pick(["rect", "circle", "star"]);
    }
    update(dt) {
      this.y += this.speedY * dt;
      this.x += this.speedX * dt + Math.sin(this.phase) * this.flutter * dt;
      this.rot += this.rotSpeed * dt;
      this.phase += this.flutterSpeed * dt;
      if (this.y > H + 10) this.reset(false);
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;

      switch (this.shape) {
        case "rect":
          ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
          break;
        case "circle":
          ctx.beginPath();
          ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "star":
          drawStar(ctx, 0, 0, this.w * 0.6, 5);
          break;
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  class Sparkle {
    constructor() {
      this.reset(true);
    }
    reset(initial) {
      this.x = rand(0, W);
      this.y = rand(0, H);
      this.life = 0;
      this.maxLife = rand(0.6, 1.5);
      this.size = rand(1.5, 4);
      this.delay = initial ? rand(0, 2) : 0;
      this.color = pick([COLORS.gold, COLORS.goldBright, COLORS.toothHighlight, "#fff"]);
    }
    update(dt) {
      if (this.delay > 0) {
        this.delay -= dt;
        return;
      }
      this.life += dt;
      if (this.life > this.maxLife) this.reset(false);
    }
    draw(ctx) {
      if (this.delay > 0) return;
      const progress = this.life / this.maxLife;
      const alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      const s = this.size * (0.5 + alpha * 0.5);

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = this.color;

      // 4-pointed star sparkle
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.25, -s * 0.25);
      ctx.lineTo(s, 0);
      ctx.lineTo(s * 0.25, s * 0.25);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.25, s * 0.25);
      ctx.lineTo(-s, 0);
      ctx.lineTo(-s * 0.25, -s * 0.25);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  class Streamer {
    constructor() {
      this.reset(true);
    }
    reset(initial) {
      this.x = initial ? rand(0, W) : rand(W + 10, W + 60);
      this.y = rand(5, H * 0.5);
      this.length = rand(30, 70);
      this.width = rand(2, 4);
      this.color = pick(COLORS.confetti);
      this.speedX = rand(-30, -60);
      this.amplitude = rand(3, 8);
      this.frequency = rand(2, 5);
      this.phase = rand(0, Math.PI * 2);
      this.opacity = rand(0.3, 0.6);
    }
    update(dt) {
      this.x += this.speedX * dt;
      this.phase += this.frequency * dt;
      if (this.x + this.length < -10) this.reset(false);
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.width;
      ctx.lineCap = "round";
      ctx.beginPath();
      const segments = 12;
      for (let i = 0; i <= segments; i++) {
        const frac = i / segments;
        const sx = this.x + frac * this.length;
        const sy =
          this.y + Math.sin(this.phase + frac * Math.PI * 3) * this.amplitude;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  function drawStar(ctx, x, y, r, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.4;
      const px = x + Math.cos(angle) * rad;
      const py = y + Math.sin(angle) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  /* ── rounded rect utility ─────────────────────────────── */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ── parade state ─────────────────────────────────────── */
  let teeth = [];
  let confetti = [];
  let sparkles = [];
  let streamers = [];
  let lastTime = 0;
  let animTime = 0;

  function createTooth(initialX) {
    const scale = rand(0.9, 1.5);
    const groundY = H * 0.55;
    return {
      x: initialX != null ? initialX : W + rand(30, 80),
      y: groundY,
      scale: scale,
      speed: rand(25, 50),
      type: pick(TOOTH_TYPES),
      accessory: pick(ACCESSORIES),
      danceStyle: pick(DANCE_STYLES),
      expression: pick(EXPRESSIONS),
      phase: rand(0, Math.PI * 2),
      flipX: Math.random() > 0.7,
      depth: rand(0.7, 1.0), // parallax depth
    };
  }

  function initParade() {
    teeth = [];
    confetti = [];
    sparkles = [];
    streamers = [];

    // seed initial teeth across the screen
    const spacing = 65;
    const count = Math.ceil(W / spacing) + 3;
    for (let i = 0; i < count; i++) {
      teeth.push(createTooth(i * spacing + rand(-10, 10)));
    }

    // confetti
    const confettiCount = Math.min(Math.floor(W / 12), 80);
    for (let i = 0; i < confettiCount; i++) {
      confetti.push(new Confetti());
    }

    // sparkles
    const sparkleCount = Math.min(Math.floor(W / 25), 40);
    for (let i = 0; i < sparkleCount; i++) {
      sparkles.push(new Sparkle());
    }

    // streamers
    const streamerCount = Math.min(Math.floor(W / 80), 12);
    for (let i = 0; i < streamerCount; i++) {
      streamers.push(new Streamer());
    }
  }

  /* ── ground / stage ───────────────────────────────────── */
  function drawGround(ctx) {
    const groundY = H * 0.82;

    // gradient floor
    const grd = ctx.createLinearGradient(0, groundY - 5, 0, H);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(0.3, "rgba(0,0,0,0.15)");
    grd.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, groundY - 5, W, H - groundY + 5);

    // subtle line
    ctx.strokeStyle = "rgba(199,160,102,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();
  }

  /* ── main loop ────────────────────────────────────────── */
  function update(dt) {
    animTime += dt;

    // update teeth
    for (let i = teeth.length - 1; i >= 0; i--) {
      const tooth = teeth[i];
      tooth.x -= tooth.speed * tooth.depth * dt;

      // remove if off-screen left
      if (tooth.x < -60) {
        teeth.splice(i, 1);
      }
    }

    // spawn new teeth on the right
    const rightmost = teeth.reduce(
      (max, t) => Math.max(max, t.x),
      -Infinity
    );
    if (rightmost < W + 20) {
      teeth.push(createTooth());
    }

    // update particles
    for (const c of confetti) c.update(dt);
    for (const s of sparkles) s.update(dt);
    for (const st of streamers) st.update(dt);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // background subtle gradient
    const bgGrd = ctx.createLinearGradient(0, 0, 0, H);
    bgGrd.addColorStop(0, "rgba(15,17,20,0)");
    bgGrd.addColorStop(1, "rgba(15,17,20,0.5)");
    ctx.fillStyle = bgGrd;
    ctx.fillRect(0, 0, W, H);

    // draw streamers (behind everything)
    for (const st of streamers) st.draw(ctx);

    // draw ground
    drawGround(ctx);

    // draw teeth sorted by depth (farther first)
    const sorted = [...teeth].sort((a, b) => a.depth - b.depth);
    for (const tooth of sorted) {
      drawTooth(tooth, animTime);
    }

    // draw confetti
    for (const c of confetti) c.draw(ctx);

    // draw sparkles (on top)
    for (const s of sparkles) s.draw(ctx);
  }

  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap dt
    lastTime = timestamp;

    update(dt);
    draw();

    if (!reducedMotion) {
      requestAnimationFrame(loop);
    }
  }

  /* ── init ─────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", () => {
    const strip = document.getElementById("bottom-strip");
    if (strip) strip.style.display = "block";

    // visitor counter
    let count = parseInt(localStorage.getItem("cityOfTeethCounter"), 10);
    if (isNaN(count)) count = 0;
    count++;
    localStorage.setItem("cityOfTeethCounter", count);
    const counterEl = document.querySelector(".visitor-counter-number");
    if (counterEl) counterEl.textContent = pad(count);

    // init parade animation
    if (!initCanvas()) return;
    initParade();

    if (reducedMotion) {
      // draw one static frame
      animTime = 1;
      draw();
    } else {
      requestAnimationFrame(loop);
    }

    // handle resize
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        initParade();
      }, 150);
    });
  });

  // respect dynamic preference changes
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", (e) => {
      reducedMotion = e.matches;
      if (!reducedMotion) {
        lastTime = 0;
        requestAnimationFrame(loop);
      }
    });
})();
