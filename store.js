/* Weekly Retro — data store on Supabase.
 * The board page was first built as a claude.ai artifact and calls `window.claude.use(name)`
 * for `db`, `assets`, `user` and `downloads`. This file provides the same small API on top of
 * Supabase so the page runs anywhere (GitHub Pages) and nobody needs to sign in.
 *
 * Data: one table `retro_docs` (path = "collection/docId", data = JSON) — see schema.sql.
 * Files: public Storage bucket `retro-gifs`.
 */
(function () {
  const cfg = window.RETRO_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseKey || !window.supabase) return; // page shows a "not configured" banner

  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
  const TABLE = "retro_docs";
  const BUCKET = "retro-gifs";
  const rid = () => crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  const toErr = (e) => Object.assign(new Error((e && e.message) || "error"), { code: (e && e.code) || "unavailable" });

  // A per-browser id, so "my reaction" / "I watered this" stay stable without signing in.
  let uid = null;
  try { uid = localStorage.getItem("retro.uid"); } catch {}
  if (!uid) { uid = "u_" + rid(); try { localStorage.setItem("retro.uid", uid); } catch {} }

  // Live updates: one realtime channel; every change reloads the listeners of that collection.
  const listeners = new Set();
  sb.channel("retro-docs")
    .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, (p) => {
      const col = (p.new && p.new.collection) || (p.old && p.old.collection) || null;
      listeners.forEach((l) => l(col));
    })
    .subscribe();
  function watch(col, load) {
    let alive = true;
    const run = () => alive && load(() => alive);
    const l = (c) => { if (!c || c === col) run(); };
    listeners.add(l);
    run();
    return () => { alive = false; listeners.delete(l); };
  }

  function query(col, filters) {
    return {
      where(field, _op, value) { return query(col, [...filters, [field, value]]); },
      onSnapshot(cb, onErr) {
        return watch(col, async (alive) => {
          let q = sb.from(TABLE).select("path,data").eq("collection", col);
          for (const [f, v] of filters) q = f === "week" ? q.eq("week", v) : q.eq("data->>" + f, v);
          const { data, error } = await q;
          if (!alive()) return;
          if (error) { onErr && onErr(toErr(error)); return; }
          cb({ docs: data.map((r) => ({ id: r.path.slice(col.length + 1), data: () => r.data })) });
        });
      },
      async add(data) { const id = rid(); await doc(col + "/" + id).set(data); return { id }; },
    };
  }

  function doc(path) {
    const col = path.split("/")[0];
    return {
      onSnapshot(cb, onErr) {
        return watch(col, async (alive) => {
          const { data, error } = await sb.from(TABLE).select("data").eq("path", path).maybeSingle();
          if (!alive()) return;
          if (error) { onErr && onErr(toErr(error)); return; }
          cb({ exists: !!data, data: () => (data ? data.data : undefined) });
        });
      },
      async set(data) {
        const { error } = await sb.from(TABLE).upsert({ path, collection: col, week: (data && data.week) || null, data, updated_at: new Date().toISOString() });
        if (error) throw toErr(error);
      },
      async delete() {
        const { error } = await sb.from(TABLE).delete().eq("path", path);
        if (error) throw toErr(error);
      },
    };
  }

  const db = { collection: (c) => query(c, []), doc };

  const assets = {
    async upload(file) {
      if (file.size > 5 * 1024 * 1024) throw { code: "too_large" };
      const ext = (file.type.split("/")[1] || "bin").replace("jpeg", "jpg");
      const id = rid() + "." + ext;
      const { error } = await sb.storage.from(BUCKET).upload(id, file, { contentType: file.type, upsert: false, cacheControl: "31536000" } /* file names never change: browsers keep them a year */);
      if (error) throw toErr(error);
      return { id };
    },
  };
  window.retroBlobUrl = (id) => sb.storage.from(BUCKET).getPublicUrl(id).data.publicUrl;

  const user = { id: async () => uid, can: async () => true };

  const downloads = {
    async save({ filename, data }) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
  };

  const caps = { db, assets, user, downloads };
  window.claude = { use: async (name) => caps[name] || null };
})();
