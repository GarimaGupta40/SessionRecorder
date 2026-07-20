import { Router, type IRouter } from "express";
import { eq, ilike, sql, or } from "drizzle-orm";
import { db, usersTable, devicesTable, sessionsTable } from "@workspace/db";
import { ListUsersQueryParams, GetUserParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users", async (req, res): Promise<void> => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { page = 1, limit = 20, search } = parsed.data;
  const offset = (page - 1) * limit;

  const whereClause =
    search
      ? or(
          ilike(usersTable.name, `%${search}%`),
          ilike(usersTable.email, `%${search}%`)
        )
      : undefined;

  const [users, totalResult] = await Promise.all([
    db
      .select()
      .from(usersTable)
      .where(whereClause)
      .orderBy(usersTable.name)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(whereClause),
  ]);

  res.json({
    data: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isOnline: u.isOnline,
      avatarUrl: u.avatarUrl ?? null,
      department: u.department ?? null,
      lastSeenAt: u.lastSeenAt ?? null,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })),
    total: totalResult[0]?.count ?? 0,
    page,
    limit,
  });
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, params.data.id))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [deviceCountResult, sessionCountResult, storageResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(devicesTable)
      .where(eq(devicesTable.userId, user.id)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, user.id)),
    db
      .select({ total: sql<number>`coalesce(sum(recording_size_bytes), 0)::bigint` })
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, user.id)),
  ]);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isOnline: user.isOnline,
    avatarUrl: user.avatarUrl ?? null,
    department: user.department ?? null,
    lastSeenAt: user.lastSeenAt ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deviceCount: deviceCountResult[0]?.count ?? 0,
    sessionCount: sessionCountResult[0]?.count ?? 0,
    totalStorageBytes: Number(storageResult[0]?.total ?? 0),
  });
});

export default router;
