// First-time setup on your own computer (the start files run this before the shop).
// Asks for the admin password and the Gmail App Password once, and saves them in
// DokyDory-data/settings.txt in your user folder, outside this code folder.
// Not used on Heroku: there the passwords go in Config Vars.
const fs = require("fs");
const { ON_HEROKU, DATA_DIR, SETTINGS_FILE, ADMIN_PASSWORD } = require("./shared/config");

if (ON_HEROKU || ADMIN_PASSWORD) process.exit(0);

// lines typed (or piped) in, one per question
const lines = [], waiting = [];
let reader = null, ended = false;
function nextLine() {
  if (!reader) {
    reader = require("readline").createInterface({ input: process.stdin, terminal: false });
    reader.on("line", l => (waiting.length ? waiting.shift()(l) : lines.push(l)));
    reader.on("close", () => { ended = true; while (waiting.length) waiting.shift()(null); });
  }
  if (lines.length) return Promise.resolve(lines.shift());
  if (ended) return Promise.resolve(null);
  return new Promise(resolve => waiting.push(resolve));
}

// read one answer; on a real keyboard, show * instead of the letters
async function ask(question) {
  process.stdout.write(question);
  const input = process.stdin;
  if (!input.isTTY) {
    const line = await nextLine();
    if (line === null) { console.error("\nSetup ke liye jawab chahiye. Start file dobara chalao aur likho."); process.exit(1); }
    process.stdout.write("\n");
    return line.trim();
  }
  return new Promise(resolve => {
    let text = "";
    input.setRawMode(true); input.resume(); input.setEncoding("utf8");
    const onData = chunk => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") { input.setRawMode(false); input.pause(); input.off("data", onData); process.stdout.write("\n"); return resolve(text.trim()); }
        if (ch === "\u0003") { process.stdout.write("\n"); process.exit(1); } // Ctrl+C
        if (ch === "\u0008" || ch === "\u007f") { if (text) { text = text.slice(0, -1); process.stdout.write("\b \b"); } continue; }
        if (ch >= " ") { text += ch; process.stdout.write("*"); }
      }
    };
    input.on("data", onData);
  });
}

(async () => {
  console.log("");
  console.log("=== Doky Dory: pehli baar ki setup ===");
  console.log("");
  let admin = "";
  for (;;) {
    admin = await ask("Admin panel ka password banao (kam se kam 8 letter/number): ");
    if (admin.length < 8) { console.log("Bahut chhota hai. Kam se kam 8 letter/number rakho.\n"); continue; }
    const again = await ask("Wahi password dobara likho: ");
    if (again === admin) break;
    console.log("Dono password alag hain. Phir se try karo.\n");
  }
  console.log("");
  console.log("Gmail App Password: dokydoryofficial@gmail.com ka 16-letter code (https://myaccount.google.com/apppasswords se),");
  console.log("taaki har naya order aapko email ho.");
  let gmail = (await ask("Yahan paste karo, ya abhi skip karne ke liye bas Enter dabao: ")).replace(/\s+/g, "");
  if (gmail && !/^[a-z]{16}$/i.test(gmail)) console.log("Ye 16-letter App Password jaisa nahi lag raha. Phir bhi save kar diya; email fail hua to admin panel mein dikhega.");

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const text = [
    "# Doky Dory settings for this computer. Keep this file private: never upload it or send it to anyone.",
    "# To change a password, edit the text after = and save, then close the shop window and start it again.",
    "",
    "ADMIN_PASSWORD=" + admin,
    "GMAIL_APP_PASSWORD=" + gmail,
    "",
    "# Optional (remove the # at the start of a line to use it):",
    "# ORDER_EMAIL=dokydoryofficial@gmail.com",
    "# UPI_ID=9953791934.ibz@icici",
    "# PORT=3000",
    "",
  ];
  fs.writeFileSync(SETTINGS_FILE, text.join(process.platform === "win32" ? "\r\n" : "\n"), { mode: 0o600 });
  console.log("");
  console.log("Save ho gaya: " + SETTINGS_FILE);
  console.log(gmail ? "" : "Jab tak is file mein GMAIL_APP_PASSWORD nahi daloge, order email OFF rahega. Orders phir bhi save hote hain aur admin panel mein dikhte hain.");
  console.log("");
  process.exit(0);
})();
