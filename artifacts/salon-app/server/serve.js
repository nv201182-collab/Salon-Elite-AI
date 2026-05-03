/**
 * Standalone production server for Expo static builds.
 *
 * Serves the output of build.js (static-build/) with two special routes:
 * - GET / or /manifest with expo-platform header → platform manifest JSON
 * - GET / without expo-platform → landing page HTML
 * Everything else falls through to static file serving from ./static-build/.
 *
 * Auto-build: if static-build is missing, triggers build.js automatically.
 * Zero external dependencies — uses only Node.js built-ins.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");

// ─── Auto-sync from GitHub on every startup ────────────────────
(function autoSync() {
  try {
    const repoRoot = path.resolve(__dirname, "..", "..", "..");
    const dbPath = path.join(repoRoot, "artifacts", "salon-app", "db.json");

    // Backup posts database before reset
    let dbBackup = null;
    try { dbBackup = fs.readFileSync(dbPath, "utf-8"); } catch {}

    execSync("git fetch origin --quiet && git reset --hard origin/main --quiet", {
      cwd: repoRoot,
      timeout: 30000,
      stdio: "pipe",
    });

    // Restore posts database after reset
    if (dbBackup) {
      try { fs.writeFileSync(dbPath, dbBackup); } catch {}
    }

    // Remove old build stamp to force rebuild with latest code
    const stampPath = path.join(repoRoot, "artifacts", "salon-app", "static-build", "src-version.txt");
    try { fs.unlinkSync(stampPath); } catch {}

    console.log("[serve] Auto-synced with GitHub ✓");
  } catch (e) {
    console.warn("[serve] Git sync skipped:", e.message);
  }
})();

const STATIC_ROOT = path.resolve(__dirname, "..", "static-build");
const TEMPLATE_PATH = path.resolve(__dirname, "templates", "landing-page.html");
const BUILD_SCRIPT = path.resolve(__dirname, "..", "scripts", "build.js");
const basePath = (process.env.BASE_PATH || "/").replace(/\/+$/, "");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json",
};

// ─── Shared database & API ─────────────────────────────────────
const UPLOADS_DIR = path.resolve(__dirname, "..", "uploads");
const DB_PATH     = path.resolve(__dirname, "..", "db.json");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const API_USERS = [
  { id: "u_vlad",  phone: "+79855202226", name: "Владислав", initials: "ВЛ", specialty: "Мастер APIA" },
  { id: "u_user2", phone: "+79639703820", name: "Антон",     initials: "АН", specialty: "Мастер APIA" },
];

function dbRead() {
  try   { return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")); }
  catch { return { posts: [] }; }
}
function dbWrite(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
function apiRes(res, status, body) {
  res.writeHead(status, {
    "content-type":                "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers":"content-type, authorization",
    "access-control-allow-methods":"GET, POST, OPTIONS",
  });
  res.end(JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => {
      try {
        const str = Buffer.concat(chunks).toString("utf-8");
        resolve(str ? JSON.parse(str) : {});
      } catch { reject(new Error("invalid json")); }
    });
    req.on("error", reject);
  });
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

async function routeApi(pathname, req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type, authorization",
      "access-control-allow-methods": "GET, POST, OPTIONS",
    });
    return res.end();
  }

  // POST /api/auth/login — check phone exists
  if (pathname === "/api/auth/login" && req.method === "POST") {
    const { phone = "" } = await readBody(req);
    const u = API_USERS.find(u => u.phone === phone.replace(/[\s\-()]/g, ""));
    return u
      ? apiRes(res, 200, { ok: true })
      : apiRes(res, 404, { error: "Номер не зарегистрирован в APIA" });
  }

  // POST /api/auth/verify — mock OTP (any 4-digit code)
  if (pathname === "/api/auth/verify" && req.method === "POST") {
    const { phone = "", code = "" } = await readBody(req);
    const u = API_USERS.find(u => u.phone === phone.replace(/[\s\-()]/g, ""));
    if (!u) return apiRes(res, 404, { error: "Номер не зарегистрирован" });
    if (!/^\d{4}$/.test(code)) return apiRes(res, 400, { error: "Код должен быть 4 цифры" });
    return apiRes(res, 200, { ok: true, user: u });
  }

  // GET /api/posts
  if (pathname === "/api/posts" && req.method === "GET") {
    return apiRes(res, 200, dbRead().posts ?? []);
  }

  // POST /api/posts
  if (pathname === "/api/posts" && req.method === "POST") {
    const body = await readBody(req);
    const db   = dbRead();
    const proto = req.headers["x-forwarded-proto"] ?? "https";
    const host  = req.headers["x-forwarded-host"] ?? req.headers["host"] ?? "localhost";

    let imageUri = null;
    if (body.imageBase64) {
      const fname = `${uid()}.jpg`;
      const data  = body.imageBase64.replace(/^data:[^;]+;base64,/, "");
      fs.writeFileSync(path.join(UPLOADS_DIR, fname), Buffer.from(data, "base64"));
      imageUri = `${proto}://${host}/uploads/${fname}`;
    }

    const post = {
      id:        uid(),
      authorId:  body.authorId ?? "unknown",
      image:     imageUri ? { uri: imageUri } : { uri: `https://picsum.photos/seed/${uid()}/800` },
      caption:   (body.caption ?? "").trim() || "Работа",
      tags:      Array.isArray(body.tags) ? body.tags : [],
      category:  body.category ?? "hair",
      likedBy:   [],
      savedBy:   [],
      comments:  [],
      createdAt: Date.now(),
    };
    db.posts = [post, ...(db.posts ?? [])];
    dbWrite(db);
    return apiRes(res, 201, post);
  }

  // POST /api/posts/:id/(like|save|comment)
  const m = pathname.match(/^\/api\/posts\/([^/]+)\/(like|save|comment)$/);
  if (m && req.method === "POST") {
    const [, id, action] = m;
    const body = await readBody(req);
    const db   = dbRead();
    const post = (db.posts ?? []).find(p => p.id === id);
    if (!post) return apiRes(res, 404, { error: "not found" });
    if (action === "like") {
      post.likedBy = post.likedBy.includes(body.userId)
        ? post.likedBy.filter(x => x !== body.userId)
        : [...post.likedBy, body.userId];
    } else if (action === "save") {
      post.savedBy = post.savedBy.includes(body.userId)
        ? post.savedBy.filter(x => x !== body.userId)
        : [...post.savedBy, body.userId];
    } else if (action === "comment") {
      post.comments = [...(post.comments ?? []),
        { id: uid(), authorId: body.authorId, text: body.text, at: Date.now() }];
    }
    dbWrite(db);
    return apiRes(res, 200, post);
  }

  apiRes(res, 404, { error: "api route not found" });
}

function serveUpload(pathname, res) {
  const fname = path.basename(pathname);
  const fpath = path.join(UPLOADS_DIR, fname);
  if (!fs.existsSync(fpath)) { res.writeHead(404); return res.end(); }
  const ct = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" }[path.extname(fname).toLowerCase()] ?? "application/octet-stream";
  res.writeHead(200, { "content-type": ct, "cache-control": "public, max-age=86400" });
  res.end(fs.readFileSync(fpath));
}
// ──────────────────────────────────────────────────────────────

const SRC_VERSION_PATH  = path.resolve(__dirname, "..", "src-version.txt");
const BUILD_VERSION_PATH = path.resolve(STATIC_ROOT, "src-version.txt");

function readVersion(filePath) {
  try { return fs.readFileSync(filePath, "utf-8").trim(); } catch { return null; }
}

function isUpToDate() {
  const srcV   = readVersion(SRC_VERSION_PATH);
  const buildV = readVersion(BUILD_VERSION_PATH);
  return srcV && buildV && srcV === buildV;
}

// Build state machine
let buildState = "unknown"; // "unknown" | "building" | "ready" | "error"

function isBuilt() {
  return (
    fs.existsSync(path.join(STATIC_ROOT, "ios", "manifest.json")) &&
    fs.existsSync(path.join(STATIC_ROOT, "android", "manifest.json"))
  );
}

function triggerBuild() {
  if (buildState === "building") return;
  buildState = "building";
  console.log("[serve] Starting build...");

  const build = spawn("node", [BUILD_SCRIPT], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
    env: process.env,
  });

  build.on("close", (code) => {
    if (code === 0) {
      // Copy src-version into static-build so next startup skips rebuild
      try {
        const v = readVersion(SRC_VERSION_PATH);
        if (v) fs.writeFileSync(BUILD_VERSION_PATH, v + "\n");
      } catch {}
      buildState = "ready";
      console.log("[serve] Build complete. Serving.");
    } else {
      buildState = "error";
      console.error(`[serve] Build failed (exit ${code}). Check logs above.`);
    }
  });

  build.on("error", (err) => {
    buildState = "error";
    console.error("[serve] Failed to start build process:", err.message);
  });
}

// Check on startup — rebuild if source version changed since last build
if (isBuilt() && isUpToDate()) {
  buildState = "ready";
  console.log("[serve] static-build is up to date. Ready.");
} else if (isBuilt()) {
  console.log("[serve] Source changed since last build — rebuilding...");
  triggerBuild();
} else {
  triggerBuild();
}

function getAppName() {
  try {
    const appJsonPath = path.resolve(__dirname, "..", "app.json");
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveManifest(platform, res) {
  if (buildState === "building") {
    res.writeHead(503, {
      "content-type": "application/json",
      "retry-after": "30",
    });
    res.end(
      JSON.stringify({
        error: "App is building. Please retry in ~2 minutes.",
        state: "building",
      })
    );
    return;
  }

  if (buildState === "error") {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Build failed. Check server logs.",
        state: "error",
      })
    );
    return;
  }

  const manifestPath = path.join(STATIC_ROOT, platform, "manifest.json");

  if (!fs.existsSync(manifestPath)) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(
      JSON.stringify({ error: `Manifest not found for platform: ${platform}` })
    );
    return;
  }

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.writeHead(200, {
    "content-type": "application/json",
    "expo-protocol-version": "1",
    "expo-sfv-version": "0",
  });
  res.end(manifest);
}

function serveLandingPage(req, res, landingPageTemplate, appName) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = forwardedProto || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"];
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  const buildBanner =
    buildState !== "ready"
      ? `<p style="background:#f0ad4e;color:#000;padding:12px;border-radius:8px;margin-bottom:16px;">
           ⏳ Приложение собирается (${buildState}). Это займёт ~2 минуты. Обновите страницу.
         </p>`
      : "";

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName)
    .replace("</body>", `${buildBanner}</body>`);

  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
}

function serveStaticFile(urlPath, res) {
  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(STATIC_ROOT, safePath);

  if (!filePath.startsWith(STATIC_ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { "content-type": contentType });
  res.end(content);
}

const landingPageTemplate = fs.readFileSync(TEMPLATE_PATH, "utf-8");
const appName = getAppName();

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = url.pathname;

  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  if (pathname === "/" || pathname === "/manifest") {
    const platform = req.headers["expo-platform"];
    if (platform === "ios" || platform === "android") {
      return serveManifest(platform, res);
    }

    if (pathname === "/") {
      return serveLandingPage(req, res, landingPageTemplate, appName);
    }
  }

  if (pathname.startsWith("/api/")) {
    return routeApi(pathname, req, res).catch(err => apiRes(res, 500, { error: err.message }));
  }
  if (pathname.startsWith("/uploads/")) {
    return serveUpload(pathname, res);
  }
  serveStaticFile(pathname, res);
});

const port = parseInt(process.env.PORT || "3000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`[serve] Listening on port ${port}`);
  if (buildState === "building") {
    console.log("[serve] Build in progress — manifest requests will return 503 until done.");
  }
});
