import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const DEFAULT_SETTINGS: Record<string, string> = {
  company_name: "Acme Corp",
  support_email: "it-support@acme.com",
  record_audio: "true",
  stealth_mode: "false",
  video_quality: "1080p",
  retention_days: "90",
};

async function ensureDefaults() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db
      .insert(settingsTable)
      .values({ key, value })
      .onConflictDoNothing();
  }
}

router.get("/settings", async (req, res): Promise<void> => {
  await ensureDefaults();
  const rows = await db.select().from(settingsTable).orderBy(settingsTable.key);
  const obj = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
  res.json(obj);
});

router.put("/settings", async (req, res): Promise<void> => {
  const data = req.body as Record<string, unknown>;
  if (typeof data !== "object" || data === null) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  for (const [key, value] of Object.entries(data)) {
    await db
      .insert(settingsTable)
      .values({ key, value: String(value) })
      .onConflictDoUpdate({
        target: settingsTable.key,
        set: { value: String(value), updatedAt: new Date() },
      });
  }
  const rows = await db.select().from(settingsTable).orderBy(settingsTable.key);
  const obj = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
  res.json(obj);
});

export default router;
