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
  var isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

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

  function drawTooth(tooth, t, targetCtx) {
    const c = targetCtx || ctx;
    const { x, y, scale, type, accessory, danceStyle, expression, phase, flipX } = tooth;

    c.save();
    c.translate(x, y);
    c.scale(scale * (flipX ? -1 : 1), scale);

    // dance transform
    const danceOffset = getDanceTransform(danceStyle, t, phase);
    c.translate(danceOffset.tx, danceOffset.ty);
    c.rotate(danceOffset.rot);

    // base tooth size reference
    const bw = 30; // body width
    const bh = 22; // body height

    // draw shadow
    c.fillStyle = "rgba(0,0,0,0.18)";
    c.beginPath();
    c.ellipse(0, bh * 0.6 + 8, bw * 0.45, 4, 0, 0, Math.PI * 2);
    c.fill();

    // draw legs (behind body)
    drawLegs(c, bw, bh, danceStyle, t, phase);

    // draw tooth body
    drawToothBody(c, type, bw, bh);

    // draw arms
    drawArms(c, bw, bh, danceStyle, t, phase, accessory);

    // draw face
    drawFace(c, expression, bw, bh, t, phase);

    // draw accessory
    drawAccessory(c, accessory, bw, bh, t, phase);

    c.restore();
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

  /* ═══════════════════════════════════════════════════════
     BACKGROUND CANVAS — stars, clouds, skyline, floating teeth
     ═══════════════════════════════════════════════════════ */
  let bgCanvas, bgCtx, bgW, bgH;
  let bgStars = [];
  let bgClouds = [];
  let bgFloaters = []; // mini teeth floating up
  let bgTime = 0;
  let bgLastTime = 0;

  function initBgCanvas() {
    bgCanvas = document.getElementById("bg-canvas");
    if (!bgCanvas) return false;
    bgCtx = bgCanvas.getContext("2d");
    resizeBg();
    return true;
  }

  function resizeBg() {
    bgW = window.innerWidth;
    bgH = window.innerHeight;
    bgCanvas.width = bgW * DPR;
    bgCanvas.height = bgH * DPR;
    bgCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* ── stars ─────────────────────────────────────────────── */
  class Star {
    constructor() {
      this.x = rand(0, bgW);
      this.y = rand(0, bgH * 0.6);
      this.size = rand(0.5, 2.5);
      this.twinkleSpeed = rand(1, 4);
      this.twinklePhase = rand(0, Math.PI * 2);
      this.baseAlpha = rand(0.2, 0.7);
      this.color = pick(["#e8e3d7", "#dbb777", "#c7a066", "#ffffff", "#7eaac4"]);
    }
    draw(ctx, t) {
      const twinkle = (Math.sin(t * this.twinkleSpeed + this.twinklePhase) + 1) / 2;
      const alpha = this.baseAlpha * (0.3 + twinkle * 0.7);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;

      if (this.size > 1.8) {
        // bigger stars get a cross shape
        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - s);
        ctx.lineTo(this.x + s * 0.2, this.y - s * 0.2);
        ctx.lineTo(this.x + s, this.y);
        ctx.lineTo(this.x + s * 0.2, this.y + s * 0.2);
        ctx.lineTo(this.x, this.y + s);
        ctx.lineTo(this.x - s * 0.2, this.y + s * 0.2);
        ctx.lineTo(this.x - s, this.y);
        ctx.lineTo(this.x - s * 0.2, this.y - s * 0.2);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ── pen-sketch clouds (inspired by the illustration) ── */
  class Cloud {
    constructor(initial) {
      this.reset(initial);
    }
    reset(initial) {
      this.x = initial ? rand(-200, bgW + 200) : bgW + rand(50, 300);
      this.y = rand(bgH * 0.05, bgH * 0.35);
      this.speed = rand(5, 15);
      this.scale = rand(0.6, 1.4);
      this.opacity = rand(0.04, 0.12);
      this.segments = randInt(3, 6);
      this.bumps = [];
      for (let i = 0; i < this.segments; i++) {
        this.bumps.push({
          rx: rand(20, 45) * this.scale,
          ry: rand(12, 25) * this.scale,
          ox: (i - this.segments / 2) * rand(25, 35) * this.scale,
          oy: rand(-5, 5) * this.scale,
        });
      }
      // crosshatch lines (pen-and-ink style)
      this.hatchCount = randInt(4, 10);
      this.hatchAngle = rand(-0.3, 0.3);
    }
    update(dt) {
      this.x -= this.speed * dt;
      if (this.x + this.segments * 50 * this.scale < -100) {
        this.reset(false);
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = this.opacity;

      // cloud body (overlapping ellipses)
      ctx.fillStyle = "#e8e3d7";
      for (const b of this.bumps) {
        ctx.beginPath();
        ctx.ellipse(b.ox, b.oy, b.rx, b.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // crosshatch lines for pen-sketch feel
      ctx.strokeStyle = "rgba(199,160,102,0.3)";
      ctx.lineWidth = 0.5;
      ctx.rotate(this.hatchAngle);
      const totalW = this.segments * 35 * this.scale;
      for (let i = 0; i < this.hatchCount; i++) {
        const frac = i / this.hatchCount;
        const hy = -15 * this.scale + frac * 30 * this.scale;
        ctx.beginPath();
        ctx.moveTo(-totalW * 0.4, hy);
        ctx.lineTo(totalW * 0.4, hy);
        ctx.stroke();
      }

      // outline strokes (sketchy)
      ctx.strokeStyle = "rgba(35,31,26,0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      for (const b of this.bumps) {
        ctx.beginPath();
        ctx.ellipse(b.ox, b.oy, b.rx, b.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  /* ── floating mini-teeth (rise from bottom) ────────── */
  class FloatingTooth {
    constructor() {
      this.reset(true);
    }
    reset(initial) {
      this.x = rand(0, bgW);
      this.y = initial ? rand(bgH * 0.3, bgH) : bgH + rand(10, 40);
      this.size = rand(4, 10);
      this.speedY = rand(8, 20);
      this.drift = rand(-8, 8);
      this.wobble = rand(2, 6);
      this.wobbleSpeed = rand(1, 3);
      this.phase = rand(0, Math.PI * 2);
      this.rot = rand(-0.3, 0.3);
      this.rotSpeed = rand(-1, 1);
      this.opacity = rand(0.08, 0.2);
      this.color = pick(["#e8e3d7", "#cec9bc", "#dbb777", "#c7a066"]);
    }
    update(dt) {
      this.y -= this.speedY * dt;
      this.x += this.drift * dt + Math.sin(this.phase) * this.wobble * dt;
      this.phase += this.wobbleSpeed * dt;
      this.rot += this.rotSpeed * dt;
      if (this.y < -20) this.reset(false);
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = this.opacity;
      const s = this.size;

      // simple tooth silhouette
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(-s, -s * 0.6);
      ctx.lineTo(s, -s * 0.6);
      ctx.quadraticCurveTo(s + s * 0.1, 0, s * 0.5, s * 0.5);
      ctx.lineTo(s * 0.2, s);
      ctx.lineTo(0, s * 0.6);
      ctx.lineTo(-s * 0.2, s);
      ctx.lineTo(-s * 0.5, s * 0.5);
      ctx.quadraticCurveTo(-s - s * 0.1, 0, -s, -s * 0.6);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  /* ── skyline silhouette ────────────────────────────────── */
  function drawSkyline(ctx, w, h, t) {
    const baseY = h * 0.88;
    ctx.save();

    // distant glow
    const glowGrd = ctx.createRadialGradient(w * 0.5, baseY, 0, w * 0.5, baseY, w * 0.5);
    glowGrd.addColorStop(0, "rgba(199,160,102,0.04)");
    glowGrd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glowGrd;
    ctx.fillRect(0, baseY - h * 0.2, w, h * 0.3);

    // buildings
    ctx.fillStyle = "rgba(15,17,20,0.6)";
    const buildings = [
      { x: 0.02, w: 0.04, h: 0.08 },
      { x: 0.07, w: 0.03, h: 0.12 },
      { x: 0.11, w: 0.05, h: 0.06 },
      { x: 0.17, w: 0.025, h: 0.15 },
      { x: 0.20, w: 0.04, h: 0.09 },
      { x: 0.25, w: 0.03, h: 0.18 },
      { x: 0.29, w: 0.05, h: 0.07 },
      { x: 0.35, w: 0.02, h: 0.22 }, // tall tower
      { x: 0.38, w: 0.06, h: 0.1 },
      { x: 0.45, w: 0.04, h: 0.14 },
      { x: 0.50, w: 0.03, h: 0.2 },
      { x: 0.54, w: 0.05, h: 0.08 },
      { x: 0.60, w: 0.025, h: 0.16 },
      { x: 0.63, w: 0.04, h: 0.11 },
      { x: 0.68, w: 0.03, h: 0.19 },
      { x: 0.72, w: 0.06, h: 0.07 },
      { x: 0.79, w: 0.025, h: 0.13 },
      { x: 0.82, w: 0.04, h: 0.09 },
      { x: 0.87, w: 0.03, h: 0.17 },
      { x: 0.91, w: 0.05, h: 0.06 },
      { x: 0.97, w: 0.03, h: 0.11 },
    ];

    for (const b of buildings) {
      const bx = b.x * w;
      const bw = b.w * w;
      const bh = b.h * h;
      ctx.fillRect(bx, baseY - bh, bw, bh);
    }

    // bridge (inspired by the Covington bridge in the image)
    ctx.strokeStyle = "rgba(35,31,26,0.3)";
    ctx.lineWidth = 2;
    // main bridge deck
    ctx.beginPath();
    ctx.moveTo(0, baseY - h * 0.04);
    ctx.lineTo(w, baseY - h * 0.04);
    ctx.stroke();
    // support cables (suspension style)
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(35,31,26,0.15)";
    const towerX1 = w * 0.3;
    const towerX2 = w * 0.7;
    const towerTop = baseY - h * 0.25;
    // towers
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgba(35,31,26,0.25)";
    ctx.beginPath();
    ctx.moveTo(towerX1, baseY);
    ctx.lineTo(towerX1, towerTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(towerX2, baseY);
    ctx.lineTo(towerX2, towerTop);
    ctx.stroke();
    // cables
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = "rgba(35,31,26,0.12)";
    for (let i = 0; i < 12; i++) {
      const frac = i / 11;
      const cx = towerX1 + frac * (towerX2 - towerX1);
      const sag = Math.sin(frac * Math.PI) * h * 0.12;
      // cable from tower1
      if (frac < 0.5) {
        ctx.beginPath();
        ctx.moveTo(towerX1, towerTop);
        ctx.lineTo(cx, baseY - h * 0.04 - sag * 0.3);
        ctx.stroke();
      }
      // cable from tower2
      if (frac > 0.5) {
        ctx.beginPath();
        ctx.moveTo(towerX2, towerTop);
        ctx.lineTo(cx, baseY - h * 0.04 - sag * 0.3);
        ctx.stroke();
      }
    }
    // main catenary
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(35,31,26,0.18)";
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const frac = i / 40;
      const cx = towerX1 + frac * (towerX2 - towerX1);
      const sag = Math.sin(frac * Math.PI) * h * 0.15;
      const cy = towerTop + sag;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // twinkling windows
    for (const b of buildings) {
      const bx = b.x * w;
      const bw = b.w * w;
      const bh = b.h * h;
      const cols = Math.max(1, Math.floor(bw / 6));
      const rows = Math.max(1, Math.floor(bh / 8));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const hash = (b.x * 1000 + r * 13 + c * 7) % 1;
          if (hash > 0.4) continue; // only some windows lit
          const flicker = (Math.sin(t * (1.5 + hash * 3) + hash * 100) + 1) / 2;
          const wx = bx + 3 + c * ((bw - 6) / Math.max(cols - 1, 1));
          const wy = baseY - bh + 4 + r * ((bh - 8) / Math.max(rows - 1, 1));
          ctx.fillStyle = `rgba(219,183,119,${0.15 + flicker * 0.35})`;
          ctx.fillRect(wx, wy, 2, 2.5);
        }
      }
    }

    // ground fade
    const groundGrd = ctx.createLinearGradient(0, baseY - 5, 0, h);
    groundGrd.addColorStop(0, "rgba(15,17,20,0)");
    groundGrd.addColorStop(0.5, "rgba(15,17,20,0.7)");
    groundGrd.addColorStop(1, "rgba(15,17,20,1)");
    ctx.fillStyle = groundGrd;
    ctx.fillRect(0, baseY - 5, w, h - baseY + 5);

    ctx.restore();
  }

  /* ── background draw/update ───────────────────────────── */
  function initBgScene() {
    bgStars = [];
    bgClouds = [];
    bgFloaters = [];

    const starCount = Math.min(Math.floor((bgW * bgH) / 4000), 200);
    for (let i = 0; i < starCount; i++) bgStars.push(new Star());

    const cloudCount = Math.min(Math.floor(bgW / 250), 6);
    for (let i = 0; i < cloudCount; i++) bgClouds.push(new Cloud(true));

    const floaterCount = Math.min(Math.floor(bgW / 60), 25);
    for (let i = 0; i < floaterCount; i++) bgFloaters.push(new FloatingTooth());
  }

  function updateBg(dt) {
    bgTime += dt;
    for (const c of bgClouds) c.update(dt);
    for (const f of bgFloaters) f.update(dt);
  }

  function drawBg() {
    bgCtx.clearRect(0, 0, bgW, bgH);

    // background gradient (replaces the old CSS radial-gradient)
    const bgGrd = bgCtx.createRadialGradient(
      bgW * 0.5, bgH * 0.2, 0,
      bgW * 0.5, bgH * 0.2, Math.max(bgW, bgH) * 0.7
    );
    bgGrd.addColorStop(0, "#15181d");
    bgGrd.addColorStop(0.55, "#0f1114");
    bgGrd.addColorStop(1, "#0f1114");
    bgCtx.fillStyle = bgGrd;
    bgCtx.fillRect(0, 0, bgW, bgH);

    // stars
    for (const s of bgStars) s.draw(bgCtx, bgTime);

    // clouds
    for (const c of bgClouds) c.draw(bgCtx);

    // floating teeth
    for (const f of bgFloaters) f.draw(bgCtx);

    // skyline
    drawSkyline(bgCtx, bgW, bgH, bgTime);
  }

  function bgLoop(timestamp) {
    if (!bgLastTime) bgLastTime = timestamp;
    const dt = Math.min((timestamp - bgLastTime) / 1000, 0.05);
    bgLastTime = timestamp;

    updateBg(dt);
    drawBg();

    if (!reducedMotion) requestAnimationFrame(bgLoop);
  }

  /* ═══════════════════════════════════════════════════════
     CUSTOM CURSOR & MOUSE TRAIL
     ═══════════════════════════════════════════════════════ */
  let mouseX = -100, mouseY = -100;
  let trailThrottle = 0;
  let cursorEl = null;

  function createCursor() {
    cursorEl = document.createElement("div");
    cursorEl.className = "custom-cursor";
    cursorEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 28" width="24" height="28">
      <path d="M4 2 L20 2 Q22 2 22 4 L22 14 Q22 16 20 16 L16 16 L18 24 Q18.5 26 16 26 L14 26 Q13 26 12.5 24 L10.5 16 L8 16 L6 24 Q5.5 26 4 26 L4 26 Q2 26 2.5 24 L4.5 16 L4 16 Q2 16 2 14 L2 4 Q2 2 4 2Z" fill="#e8e3d7" stroke="#231f1a" stroke-width="1.5"/>
      <rect x="4" y="7" width="16" height="2" rx="1" fill="#c7a066"/>
      <circle cx="9" cy="11" r="1.5" fill="#231f1a"/>
      <circle cx="15" cy="11" r="1.5" fill="#231f1a"/>
      <path d="M9 14 Q12 17 15 14" stroke="#231f1a" stroke-width="1" fill="none" stroke-linecap="round"/>
    </svg>`;
    document.body.appendChild(cursorEl);
  }

  function spawnTrailParticle(x, y) {
    const trail = document.getElementById("mouse-trail");
    if (!trail) return;

    // mini tooth svg
    if (Math.random() > 0.6) {
      const el = document.createElement("div");
      el.className = "trail-tooth";
      const hue = pick(["#e8e3d7", "#dbb777", "#c7a066", "#d4838a"]);
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 14" width="12" height="14">
        <path d="M2 1 L10 1 Q11 1 11 2 L11 8 Q11 9 10 9 L9 9 L9.5 12 Q10 13 8 13 L7 13 Q6 13 6 12 L5.5 9 L4 9 L3.5 12 Q3 13 2 13 Q1 13 1.5 12 L2 9 Q1 9 1 8 L1 2 Q1 1 2 1Z" fill="${hue}" stroke="#231f1a" stroke-width="0.8"/>
      </svg>`;
      el.style.left = (x + rand(-8, 8)) + "px";
      el.style.top = (y + rand(-8, 8)) + "px";
      trail.appendChild(el);
      setTimeout(() => el.remove(), 800);
    } else {
      // sparkle dot
      const el = document.createElement("div");
      el.className = "trail-sparkle";
      const size = rand(3, 7);
      const color = pick(["#c7a066", "#dbb777", "#e8e3d7", "#d4838a", "#7eaac4"]);
      el.style.left = (x + rand(-12, 12)) + "px";
      el.style.top = (y + rand(-12, 12)) + "px";
      el.style.width = size + "px";
      el.style.height = size + "px";
      el.style.borderRadius = "50%";
      el.style.background = color;
      trail.appendChild(el);
      setTimeout(() => el.remove(), 600);
    }
  }

  function initMouseTrail() {
    if (reducedMotion || isTouchDevice) return;

    createCursor();

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (cursorEl) {
        cursorEl.style.left = mouseX + "px";
        cursorEl.style.top = mouseY + "px";
      }

      const now = Date.now();
      if (now - trailThrottle > 60) {
        trailThrottle = now;
        spawnTrailParticle(mouseX, mouseY);
      }
    });

    document.addEventListener("mouseleave", () => {
      if (cursorEl) cursorEl.style.display = "none";
    });
    document.addEventListener("mouseenter", () => {
      if (cursorEl) cursorEl.style.display = "";
    });
  }

  /* ═══════════════════════════════════════════════════════
     TITLE SHIMMER EFFECT
     ═══════════════════════════════════════════════════════ */
  function initTitleShimmer() {
    const letters = document.querySelectorAll(".letter");
    let shimmerTime = 0;

    function animateShimmer() {
      shimmerTime += 0.005;
      letters.forEach((el, i) => {
        const offset = i * 25;
        const pos = ((shimmerTime * 100 + offset) % 300);
        el.style.backgroundPosition = `${pos}% 50%`;
      });
      if (!reducedMotion) requestAnimationFrame(animateShimmer);
    }

    // start shimmer after letters have appeared
    setTimeout(() => {
      if (!reducedMotion) requestAnimationFrame(animateShimmer);
    }, 1500);
  }

  /* ── splash / enter page ────────────────────────────── */
  function initSplash(onEnter) {
    if (sessionStorage.getItem("cityOfTeethEntered")) {
      const overlay = document.getElementById("splash-overlay");
      if (overlay) overlay.classList.add("hidden");
      onEnter();
      return;
    }

    const overlay = document.getElementById("splash-overlay");
    const enterBtn = overlay && overlay.querySelector(".splash-enter");
    if (!overlay || !enterBtn) {
      onEnter();
      return;
    }

    enterBtn.addEventListener("click", function () {
      sessionStorage.setItem("cityOfTeethEntered", "1");
      overlay.classList.add("exiting");
      overlay.addEventListener("transitionend", function () {
        overlay.classList.add("hidden");
      }, { once: true });
      setTimeout(function () { overlay.classList.add("hidden"); }, 1000);
      onEnter();
    });
  }

  /* ── click-to-spawn teeth ──────────────────────────── */
  var spawnCanvas, spawnCtx, spawnW, spawnH;
  var spawnedTeeth = [];
  var spawnAnimId = null;
  var spawnTime = 0;
  var spawnLastTime = 0;

  function initSpawnCanvas() {
    spawnCanvas = document.getElementById("spawn-canvas");
    if (!spawnCanvas) return false;
    spawnCtx = spawnCanvas.getContext("2d");
    resizeSpawn();
    return true;
  }

  function resizeSpawn() {
    if (!spawnCanvas) return;
    spawnW = window.innerWidth;
    spawnH = window.innerHeight;
    spawnCanvas.width = spawnW * DPR;
    spawnCanvas.height = spawnH * DPR;
    spawnCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  var SPAWN_GRAVITY = 500;
  var SPAWN_BOUNCE = 0.5;

  function spawnToothAt(cx, cy) {
    spawnedTeeth.push({
      x: cx,
      y: cy,
      vx: rand(-60, 60),
      vy: rand(-250, -80),
      scale: rand(0.8, 1.4),
      type: pick(TOOTH_TYPES),
      accessory: pick(ACCESSORIES),
      danceStyle: pick(DANCE_STYLES),
      expression: pick(EXPRESSIONS),
      phase: rand(0, Math.PI * 2),
      flipX: Math.random() > 0.5,
      life: 0,
      maxLife: rand(3, 5),
      rotation: 0,
      rotSpeed: rand(-3, 3),
      grounded: false,
      bounces: 0,
    });

    if (!spawnAnimId && !reducedMotion) {
      spawnLastTime = 0;
      spawnAnimId = requestAnimationFrame(spawnLoop);
    }
  }

  function spawnLoop(timestamp) {
    if (!spawnLastTime) spawnLastTime = timestamp;
    var dt = Math.min((timestamp - spawnLastTime) / 1000, 0.05);
    spawnLastTime = timestamp;
    spawnTime += dt;

    var groundY = spawnH * 0.85;

    for (var i = spawnedTeeth.length - 1; i >= 0; i--) {
      var st = spawnedTeeth[i];
      st.life += dt;

      if (!st.grounded) {
        st.vy += SPAWN_GRAVITY * dt;
        st.x += st.vx * dt;
        st.y += st.vy * dt;
        st.rotation += st.rotSpeed * dt;

        if (st.y >= groundY) {
          st.y = groundY;
          st.vy *= -SPAWN_BOUNCE;
          st.vx *= 0.7;
          st.rotSpeed *= 0.5;
          st.bounces++;
          if (Math.abs(st.vy) < 20 || st.bounces > 3) {
            st.grounded = true;
            st.vy = 0;
            st.vx = 0;
            st.rotSpeed = 0;
          }
        }
      }

      if (st.life > st.maxLife) {
        spawnedTeeth.splice(i, 1);
      }
    }

    spawnCtx.clearRect(0, 0, spawnW, spawnH);
    for (var j = 0; j < spawnedTeeth.length; j++) {
      var tooth = spawnedTeeth[j];
      var fadeStart = tooth.maxLife - 1;
      var alpha = tooth.life > fadeStart
        ? Math.max(0, 1 - (tooth.life - fadeStart))
        : 1;

      spawnCtx.save();
      spawnCtx.globalAlpha = alpha;
      spawnCtx.translate(tooth.x, tooth.y);
      spawnCtx.rotate(tooth.rotation);
      drawTooth({ x: 0, y: 0, scale: tooth.scale, type: tooth.type,
        accessory: tooth.accessory, danceStyle: tooth.danceStyle,
        expression: tooth.expression, phase: tooth.phase, flipX: tooth.flipX
      }, spawnTime, spawnCtx);
      spawnCtx.restore();
    }

    if (spawnedTeeth.length > 0) {
      spawnAnimId = requestAnimationFrame(spawnLoop);
    } else {
      spawnAnimId = null;
      spawnCtx.clearRect(0, 0, spawnW, spawnH);
    }
  }

  function initClickToSpawn() {
    if (reducedMotion) return;
    if (!initSpawnCanvas()) return;

    function shouldIgnore(target) {
      return target.closest("button, a, .context-menu, #splash-overlay");
    }

    document.addEventListener("click", function (e) {
      if (shouldIgnore(e.target)) return;
      spawnToothAt(e.clientX, e.clientY);
    });

    if (isTouchDevice) {
      document.addEventListener("touchstart", function (e) {
        if (e.touches.length !== 1) return;
        if (shouldIgnore(e.target)) return;
        var touch = e.touches[0];
        spawnToothAt(touch.clientX, touch.clientY);
      }, { passive: true });
    }
  }

  /* ── custom context menu ───────────────────────────── */
  function initContextMenu() {
    var menu = document.getElementById("context-menu");
    if (!menu) return;

    function showMenu(x, y) {
      menu.classList.add("visible");
      menu.setAttribute("aria-hidden", "false");

      var rect = menu.getBoundingClientRect();
      if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 8;
      if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 8;
      if (x < 0) x = 8;
      if (y < 0) y = 8;

      menu.style.left = x + "px";
      menu.style.top = y + "px";
    }

    function hideMenu() {
      menu.classList.remove("visible");
      menu.setAttribute("aria-hidden", "true");
    }

    document.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      showMenu(e.clientX, e.clientY);
    });

    // long-press for touch devices
    if (isTouchDevice) {
      var longPressTimer = null;
      var longPressX = 0;
      var longPressY = 0;

      document.addEventListener("touchstart", function (e) {
        if (e.touches.length !== 1) return;
        if (e.target.closest(".context-menu")) return;
        longPressX = e.touches[0].clientX;
        longPressY = e.touches[0].clientY;
        longPressTimer = setTimeout(function () {
          showMenu(longPressX, longPressY);
        }, 500);
      }, { passive: true });

      document.addEventListener("touchmove", function () {
        clearTimeout(longPressTimer);
      }, { passive: true });

      document.addEventListener("touchend", function () {
        clearTimeout(longPressTimer);
      }, { passive: true });
    }

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".context-menu")) {
        hideMenu();
      }
    });

    document.addEventListener("touchstart", function (e) {
      if (!e.target.closest(".context-menu") && menu.classList.contains("visible")) {
        hideMenu();
      }
    }, { passive: true });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        hideMenu();
      }
    });

    menu.addEventListener("click", function (e) {
      var item = e.target.closest(".context-item");
      if (!item) return;

      var action = item.dataset.action;
      var mx = parseInt(menu.style.left, 10);
      var my = parseInt(menu.style.top, 10);

      switch (action) {
        case "brush":
          ctxMenuSparkles(mx, my, 12);
          break;
        case "extract":
          document.body.style.animation = "extractShake 0.3s ease";
          setTimeout(function () { document.body.style.animation = ""; }, 350);
          break;
        case "floss":
          ctxMenuFloss(my);
          break;
        case "appointment":
          ctxMenuMessage("See you next Tuesday!", mx, my);
          break;
        case "fairy":
          for (var i = 0; i < 20; i++) {
            (function (idx) {
              setTimeout(function () {
                ctxMenuSparkles(rand(0, window.innerWidth), rand(-20, 0), 3);
              }, idx * 50);
            })(i);
          }
          break;
      }

      menu.classList.remove("visible");
      menu.setAttribute("aria-hidden", "true");
    });
  }

  function ctxMenuSparkles(x, y, count) {
    var trail = document.getElementById("mouse-trail");
    if (!trail) return;
    for (var i = 0; i < count; i++) {
      var el = document.createElement("div");
      el.className = "trail-sparkle";
      var size = rand(4, 10);
      var color = pick(["#c7a066", "#dbb777", "#e8e3d7", "#d4838a"]);
      el.style.left = (x + rand(-30, 30)) + "px";
      el.style.top = (y + rand(-30, 30)) + "px";
      el.style.width = size + "px";
      el.style.height = size + "px";
      el.style.borderRadius = "50%";
      el.style.background = color;
      trail.appendChild(el);
      (function (elem) {
        setTimeout(function () { elem.remove(); }, 600);
      })(el);
    }
  }

  function ctxMenuMessage(text, x, y) {
    var msg = document.createElement("div");
    msg.textContent = text;
    msg.style.cssText =
      "position:fixed;left:" + x + "px;top:" + (y - 30) + "px;" +
      "color:#c7a066;font-family:'Poiret One',sans-serif;" +
      "font-size:0.9rem;pointer-events:none;z-index:15001;" +
      "animation:msgFloat 1.5s ease-out forwards;";
    document.body.appendChild(msg);
    setTimeout(function () { msg.remove(); }, 1600);
  }

  function ctxMenuFloss(y) {
    var el = document.createElement("div");
    el.style.cssText =
      "position:fixed;left:-10%;top:" + y + "px;width:120%;" +
      "height:2px;background:linear-gradient(to right,transparent,#c7a066,transparent);" +
      "z-index:15001;pointer-events:none;" +
      "animation:flossSlide 0.6s ease-in-out forwards;";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 700);
  }

  /* ── init ─────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    var strip = document.getElementById("bottom-strip");
    if (strip) strip.style.display = "block";

    // visitor counter (always increment, even before entering)
    var count = parseInt(localStorage.getItem("cityOfTeethCounter"), 10);
    if (isNaN(count)) count = 0;
    count++;
    localStorage.setItem("cityOfTeethCounter", count);
    var counterEl = document.querySelector(".visitor-counter-number");
    if (counterEl) counterEl.textContent = pad(count);

    // splash gate — animations start after entering
    initSplash(function startSite() {
      // parade animation (bottom strip)
      if (initCanvas()) {
        initParade();
        if (reducedMotion) {
          animTime = 1;
          draw();
        } else {
          requestAnimationFrame(loop);
        }
      }

      // background animation
      if (initBgCanvas()) {
        initBgScene();
        if (reducedMotion) {
          bgTime = 1;
          drawBg();
        } else {
          requestAnimationFrame(bgLoop);
        }
      }

      // mouse trail + custom cursor
      initMouseTrail();

      // title shimmer
      initTitleShimmer();

      // click-to-spawn teeth
      initClickToSpawn();

      // custom context menu
      initContextMenu();
    });

    // handle resize
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        initParade();
        resizeBg();
        initBgScene();
        resizeSpawn();
      }, 150);
    });
  });

  // respect dynamic preference changes
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", function (e) {
      reducedMotion = e.matches;
      if (!reducedMotion) {
        lastTime = 0;
        bgLastTime = 0;
        requestAnimationFrame(loop);
        requestAnimationFrame(bgLoop);
      }
    });
})();
