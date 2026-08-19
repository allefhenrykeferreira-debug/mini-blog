const $ = (id) => document.getElementById(id);

const seedInput = $("seed");
const xInput = $("x");
const zInput = $("z");
const radiusInput = $("radius");
const yInput = $("y");
const resultsEl = $("results");
const template = $("resultTemplate");
const testsKey = "bedrockDiamondFinderTests.v1";

function hashString(str) {
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;

  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
       Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
       Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getTests() {
  try {
    return JSON.parse(localStorage.getItem(testsKey) || "{}");
  } catch {
    return {};
  }
}

function saveTest(key, value) {
  const tests = getTests();
  tests[key] = value;
  localStorage.setItem(testsKey, JSON.stringify(tests));
}

function clearTests() {
  localStorage.removeItem(testsKey);
  generate();
}

function pointKey(seed, x, y, z) {
  return `${seed}|${x}|${y}|${z}`;
}

function distance2d(x1, z1, x2, z2) {
  return Math.hypot(x2 - x1, z2 - z1);
}

function generateCandidates(seed, centerX, centerZ, radius, y) {
  const baseHash = hashString(seed);
  const rng = mulberry32(baseHash ^ (centerX * 73856093) ^ (centerZ * 19349663) ^ (radius * 83492791));

  const count = Math.max(16, Math.floor(radius / 4));
  const points = [];

  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = 8 + rng() * (radius - 8);
    const jitterX = Math.round((rng() - 0.5) * 10);
    const jitterZ = Math.round((rng() - 0.5) * 10);

    const x = Math.round(centerX + Math.cos(angle) * dist + jitterX);
    const z = Math.round(centerZ + Math.sin(angle) * dist + jitterZ);

    const localSeed = hashString(`${seed}:${x}:${y}:${z}`);
    const localRng = mulberry32(localSeed);
    const score = Math.round(55 + localRng() * 44);

    points.push({
      x,
      y,
      z,
      score,
      distance: distance2d(centerX, centerZ, x, z)
    });
  }

  const unique = new Map();
  for (const p of points) {
    const key = `${p.x}:${p.z}`;
    if (!unique.has(key) || unique.get(key).score < p.score) unique.set(key, p);
  }

  return [...unique.values()]
    .sort((a, b) => (b.score - a.score) || (a.distance - b.distance))
    .slice(0, 8);
}

function render(points, seed) {
  resultsEl.classList.remove("empty");
  resultsEl.innerHTML = "";
  const tests = getTests();

  points.forEach((p, i) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const key = pointKey(seed, p.x, p.y, p.z);
    const status = tests[key];

    node.querySelector(".rank").textContent = `#${i + 1} • índice ${p.score}/99`;
    node.querySelector(".coords").textContent = `X ${p.x} • Y ${p.y} • Z ${p.z}`;
    node.querySelector(".meta").textContent = `${p.distance.toFixed(1)} blocos do ponto atual`;

    const copyBtn = node.querySelector(".copy");
    const hitBtn = node.querySelector(".hit");
    const missBtn = node.querySelector(".miss");

    if (status === "hit") hitBtn.classList.add("active");
    if (status === "miss") missBtn.classList.add("active");

    copyBtn.addEventListener("click", async () => {
      const text = `${p.x} ${p.y} ${p.z}`;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copiado";
        setTimeout(() => (copyBtn.textContent = "Copiar"), 900);
      } catch {
        alert(text);
      }
    });

    hitBtn.addEventListener("click", () => {
      saveTest(key, "hit");
      hitBtn.classList.add("active");
      missBtn.classList.remove("active");
    });

    missBtn.addEventListener("click", () => {
      saveTest(key, "miss");
      missBtn.classList.add("active");
      hitBtn.classList.remove("active");
    });

    resultsEl.appendChild(node);
  });
}

function generate() {
  const seed = seedInput.value.trim();
  const x = Number(xInput.value);
  const z = Number(zInput.value);
  const radius = Number(radiusInput.value);
  const y = Number(yInput.value);

  if (!seed || Number.isNaN(x) || Number.isNaN(z)) {
    resultsEl.className = "results empty";
    resultsEl.textContent = "Preenche seed, X e Z direito, peste 😑";
    return;
  }

  const points = generateCandidates(seed, x, z, radius, y);
  render(points, seed);
}

$("findBtn").addEventListener("click", generate);
$("clearTests").addEventListener("click", clearTests);

generate();