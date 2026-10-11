// Doky Dory order site. This file only starts the two panels:
//   customer-panel/  the shop customers use at "/"
//   admin-panel/     your password-protected panel at "/admin"
//   shared/          what both use: settings, saving orders and items, the price list, order emails
const express = require("express");
const { PORT, ON_HEROKU, RETRY_MINUTES, ADMIN_PASSWORD, DATA_DIR } = require("./shared/config");
const { store } = require("./shared/store");
const { getCatalog } = require("./shared/catalog");
const { mailer, mailStatus, orderEmail, retryPendingEmails } = require("./shared/email");
const { normPhone } = require("./shared/helpers");
const customerPanel = require("./customer-panel/routes");
const adminPanel = require("./admin-panel/routes");

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.set({ "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin", "X-Frame-Options": "DENY" });
  if (ON_HEROKU && req.headers["x-forwarded-proto"] === "http") return res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  next();
});
const smallJson = express.json({ limit: "100kb" });
app.use((req, res, next) => (req.path.endsWith("/photo") ? next() : smallJson(req, res, next))); // photo uploads get their own bigger limit

app.use(customerPanel.router);
app.use(adminPanel.router);

app.get("/healthz", async (req, res) => {
  let db = "ok"; try { await store.init(); } catch (e) { db = "error: " + e.message; }
  res.json({ ok: db === "ok", storage: store.kind, database: db, email: mailStatus.login, lastEmailSentAt: mailStatus.lastSentAt, lastEmailError: mailStatus.lastError });
});

// Anything unexpected becomes a clear JSON message instead of an error page.
app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") return res.status(400).json({ error: "Something went wrong with the form. Please refresh the page and try again." });
  console.error("unexpected", err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

// "--open" (used by the start files) opens both panels in the browser once the server is up
function openBrowser(url) {
  const { spawn } = require("child_process");
  const [cmd, args] = process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : [process.platform === "darwin" ? "open" : "xdg-open", [url]];
  try { spawn(cmd, args, { stdio: "ignore", detached: true }).on("error", () => {}).unref(); } catch {}
}

if (require.main === module) {
  store.init().catch(e => console.error("DATABASE NOT READY (will retry on next request):", e.message));
  const server = app.listen(PORT, () => {
    console.log(`Doky Dory orders on :${PORT} (storage: ${store.kind}, email: ${mailer ? "configured" : "OFF"})`);
    if (!ON_HEROKU) {
      console.log("");
      console.log(`  Customer panel (shop):  http://localhost:${PORT}/`);
      console.log(`  Admin panel (only you): http://localhost:${PORT}/admin`);
      if (store.kind === "file") console.log(`  Orders and items are saved in: ${DATA_DIR}`);
      if (!ADMIN_PASSWORD) console.log("  Admin panel is locked: no ADMIN_PASSWORD set yet.");
      console.log("  Keep this window open while you use the shop. Close it (or press Ctrl+C) to stop.");
      console.log("");
      if (process.argv.includes("--open")) { openBrowser(`http://localhost:${PORT}/`); openBrowser(`http://localhost:${PORT}/admin`); }
    }
  });
  server.on("error", e => {
    if (e.code === "EADDRINUSE") console.error(`Port ${PORT} is busy: the shop may already be running in another window. Close that window, or open http://localhost:${PORT}/`);
    else console.error(e);
    process.exit(1);
  });
  const timer = setInterval(retryPendingEmails, RETRY_MINUTES * 60e3);
  setTimeout(retryPendingEmails, 20e3); // also right after a restart
  const stop = () => { clearInterval(timer); server.close(() => store.close().finally(() => process.exit(0))); setTimeout(() => process.exit(0), 8000).unref(); };
  process.on("SIGTERM", stop); process.on("SIGINT", stop);
}
process.on("unhandledRejection", e => console.error("unhandled", e));
module.exports = { app, orderEmail, priceCart: customerPanel.priceCart, normPhone, store, retryPendingEmails, getCatalog };
