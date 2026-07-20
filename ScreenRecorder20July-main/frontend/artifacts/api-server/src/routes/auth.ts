import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { LoginBody } from "@workspace/api-zod";
import { signUserToken } from "../lib/jwt.js";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user || user.passwordHash !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Update lastSeenAt
  await db
    .update(usersTable)
    .set({ lastSeenAt: new Date(), isOnline: true })
    .where(eq(usersTable.id, user.id));

  const token = await signUserToken(user.id, user.email, user.role);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl ?? null,
    },
  });
});

export default router;
