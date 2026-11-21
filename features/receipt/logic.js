(function () {
  'use strict';
  window.CK_FEATURES = window.CK_FEATURES || {};
  const feat = window.CK_FEATURES["receipt"] || { id: "receipt", state: {} };
  feat.markMounted = function () { feat.mountedAt = Date.now(); };

  const V_SPEC = [
    null,
    { size: 21, dataBytes: 19, ecBytes: 7, align: [], fmt: 0x77c4 },
    { size: 25, dataBytes: 34, ecBytes: 10, align: [6, 18], fmt: 0x77c4 },
    { size: 29, dataBytes: 55, ecBytes: 15, align: [6, 22], fmt: 0x77c4 },
    { size: 33, dataBytes: 80, ecBytes: 20, align: [6, 26], fmt: 0x77c4 },
    { size: 37, dataBytes: 108, ecBytes: 26, align: [6, 30], fmt: 0x77c4 },
    { size: 41, dataBytes: 136, ecBytes: 18, blocks: 2, align: [6, 34], fmt: 0x77c4 }
  ];

  const GF_EXP = new Uint8Array(512);
  const GF_LOG = new Uint8Array(256);
  (function initGf() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      GF_EXP[i] = x;
      GF_LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
  })();

  function gfMul(a, b) {
    return (a === 0 || b === 0) ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];
  }

  function rsEncode(data, ecLen) {
    let gen = [1];
    for (let i = 0; i < ecLen; i++) {
      const next = new Array(gen.length + 1).fill(0);
      const factor = GF_EXP[i];
      for (let j = 0; j < gen.length; j++) {
        next[j] ^= gen[j];
        next[j + 1] ^= gfMul(gen[j], factor);
      }
      gen = next;
    }
    const msg = new Uint8Array(data.length + ecLen);
    msg.set(data, 0);
    for (let i = 0; i < data.length; i++) {
      const coef = msg[i];
      if (coef !== 0) {
        for (let j = 0; j < gen.length; j++) {
          msg[i + j] ^= gfMul(gen[j], coef);
        }
      }
    }
    return msg.slice(data.length);
  }

  feat.qrSvgDataUri = function (text) {
    const bytes = new TextEncoder().encode(String(text || ''));
    let ver = 1;
    while (ver <= 6 && bytes.length + 2 > V_SPEC[ver].dataBytes) ver++;
    if (ver > 6) ver = 6;
    const spec = V_SPEC[ver];
    const maxData = spec.dataBytes;
    const payload = bytes.slice(0, maxData - 2);
    const bits = [];
    const pushBits = (val, len) => {
      for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
    };
    pushBits(0b0100, 4);
    pushBits(payload.length, 8);
    for (let i = 0; i < payload.length; i++) pushBits(payload[i], 8);
    for (let i = 0; i < 4 && bits.length < maxData * 8; i++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);
    const dataWords = new Uint8Array(maxData);
    for (let i = 0; i < bits.length / 8; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
      dataWords[i] = b;
    }
    let padIdx = Math.floor(bits.length / 8);
    let padToggle = true;
    while (padIdx < maxData) {
      dataWords[padIdx++] = padToggle ? 0xec : 0x11;
      padToggle = !padToggle;
    }
    const allBits = [];
    const appendByte = v => { for (let i = 7; i >= 0; i--) allBits.push((v >> i) & 1); };
    if (spec.blocks === 2) {
      const half = maxData / 2;
      const b1 = dataWords.slice(0, half);
      const b2 = dataWords.slice(half);
      const ec1 = rsEncode(b1, spec.ecBytes);
      const ec2 = rsEncode(b2, spec.ecBytes);
      for (let i = 0; i < half; i++) { appendByte(b1[i]); appendByte(b2[i]); }
      for (let i = 0; i < spec.ecBytes; i++) { appendByte(ec1[i]); appendByte(ec2[i]); }
    } else {
      const ecWords = rsEncode(dataWords, spec.ecBytes);
      for (let i = 0; i < dataWords.length; i++) appendByte(dataWords[i]);
      for (let i = 0; i < ecWords.length; i++) appendByte(ecWords[i]);
    }

    const N = spec.size;
    const grid = Array.from({ length: N }, () => new Int8Array(N).fill(-1));
    const isFunc = Array.from({ length: N }, () => new Uint8Array(N));
    const setMod = (r, c, v) => {
      if (r >= 0 && r < N && c >= 0 && c < N) {
        grid[r][c] = v ? 1 : 0;
        isFunc[r][c] = 1;
      }
    };
    const placeFinder = (r0, c0) => {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const on = (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) ||
                     (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6)) ||
                     (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
          setMod(r0 + dr, c0 + dc, on ? 1 : 0);
        }
      }
    };
    placeFinder(0, 0);
    placeFinder(0, N - 7);
    placeFinder(N - 7, 0);
    for (let i = 8; i < N - 8; i++) {
      setMod(6, i, i % 2 === 0 ? 1 : 0);
      setMod(i, 6, i % 2 === 0 ? 1 : 0);
    }
    if (spec.align.length) {
      const [a0, a1] = spec.align;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const on = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setMod(a1 + dr, a1 + dc, on ? 1 : 0);
        }
      }
    }
    setMod(N - 8, 8, 1);
    for (let i = 0; i < 9; i++) {
      if (!isFunc[8][i]) isFunc[8][i] = 1;
      if (!isFunc[i][8]) isFunc[i][8] = 1;
    }
    for (let i = 0; i < 8; i++) {
      isFunc[8][N - 1 - i] = 1;
      isFunc[N - 1 - i][8] = 1;
    }

    let bitIdx = 0;
    let up = true;
    for (let col = N - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      for (let step = 0; step < N; step++) {
        const r = up ? (N - 1 - step) : step;
        for (let dc = 0; dc < 2; dc++) {
          const c = col - dc;
          if (!isFunc[r][c]) {
            const b = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
            grid[r][c] = ((r + c) % 2 === 0) ? (b ^ 1) : b;
          }
        }
      }
      up = !up;
    }

    const fmt = spec.fmt;
    const fBits = [];
    for (let i = 0; i < 15; i++) fBits.push((fmt >> i) & 1);
    const fPos1 = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
    const fPos2 = [[N-1,8],[N-2,8],[N-3,8],[N-4,8],[N-5,8],[N-6,8],[N-7,8],[8,N-8],[8,N-7],[8,N-6],[8,N-5],[8,N-4],[8,N-3],[8,N-2],[8,N-1]];
    for (let i = 0; i < 15; i++) {
      grid[fPos1[i][0]][fPos1[i][1]] = fBits[i];
      grid[fPos2[i][0]][fPos2[i][1]] = fBits[i];
    }

    const margin = 2;
    const total = N + margin * 2;
    let pathD = '';
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (grid[r][c] === 1) pathD += `M${c + margin},${r + margin}h1v1h-1z`;
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#fff"/><path d="${pathD}" fill="#111"/></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };

  window.CK_FEATURES["receipt"] = feat;
})();
