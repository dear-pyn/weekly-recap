// Deletes GIF files older than KEEP_DAYS from the `retro-gifs` bucket.
// Text (answers, daisies, gifts) stays; the board shows "GIF ถูกลบไปแล้ว" on those cards.
// Needs SUPABASE_URL and SUPABASE_SERVICE_KEY (secret key — GitHub Actions secret only, never in the page).
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
const keepDays = Number(process.env.KEEP_DAYS || 90);
const dryRun = process.env.DRY_RUN === "true";
if (!url || !key) { console.log("SUPABASE_SERVICE_KEY secret not set — skipping cleanup"); process.exit(0); }

const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const cutoff = Date.now() - keepDays * 86400000;

const old = [];
for (let offset = 0; ; offset += 1000) {
  const res = await fetch(`${url}/storage/v1/object/list/retro-gifs`, {
    method: "POST", headers,
    body: JSON.stringify({ prefix: "", limit: 1000, offset, sortBy: { column: "created_at", order: "asc" } }),
  });
  if (!res.ok) { console.error("List failed", res.status, await res.text()); process.exit(1); }
  const page = await res.json();
  for (const f of page) if (f.id && f.created_at && Date.parse(f.created_at) < cutoff) old.push(f.name);
  if (page.length < 1000) break;
}

console.log(`${old.length} GIF older than ${keepDays} days${dryRun ? " (dry run, nothing deleted)" : ""}`);
if (!old.length || dryRun) process.exit(0);

for (let i = 0; i < old.length; i += 100) {
  const res = await fetch(`${url}/storage/v1/object/retro-gifs`, { method: "DELETE", headers, body: JSON.stringify({ prefixes: old.slice(i, i + 100) }) });
  if (!res.ok) { console.error("Delete failed", res.status, await res.text()); process.exit(1); }
}
console.log("Deleted", old.length);
