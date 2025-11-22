import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, consultations, proposals, trainerProfiles, userProfiles, InsertConsultation, InsertProposal, InsertTrainerProfile, InsertUserProfile } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: string, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users);
}

export async function getPendingTrainers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).where(eq(users.userType, "trainer"));
}

// Consultation queries
export async function createConsultation(data: InsertConsultation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(consultations).values(data);
}

export async function getConsultations(status?: "open" | "answered" | "closed") {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return await db.select().from(consultations).where(eq(consultations.status, status)).orderBy(consultations.createdAt);
  }
  return await db.select().from(consultations).orderBy(consultations.createdAt);
}

export async function getConsultationById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(consultations).where(eq(consultations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateConsultation(id: string, data: Partial<InsertConsultation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(consultations).set(data).where(eq(consultations.id, id));
}

export async function createProposal(proposal: InsertProposal) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.insert(proposals).values(proposal);
}

export async function getProposalByTrainerAndConsultation(trainerId: string, consultationId: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }
  const result = await db.select().from(proposals)
    .where(and(
      eq(proposals.trainerId, trainerId),
      eq(proposals.consultationId, consultationId)
    ))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProposal(id: string, data: Partial<InsertProposal>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.update(proposals).set(data).where(eq(proposals.id, id));
}

export async function getProposalsByConsultationId(consultationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select({
      id: proposals.id,
      consultationId: proposals.consultationId,
      trainerId: proposals.trainerId,
      title: proposals.title,
      content: proposals.content,
      duration: proposals.duration,
      frequency: proposals.frequency,
      program: proposals.program,
      isBestAnswer: proposals.isBestAnswer,
      createdAt: proposals.createdAt,
      trainerName: users.name,
      trainerPhotoUrl: trainerProfiles.profilePhoto,
    })
    .from(proposals)
    .leftJoin(users, eq(proposals.trainerId, users.id))
    .leftJoin(trainerProfiles, eq(proposals.trainerId, trainerProfiles.userId))
    .where(eq(proposals.consultationId, consultationId))
    .orderBy(proposals.createdAt);
  
  return results;
}

export async function getProposalById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Trainer Profile queries
export async function createTrainerProfile(data: InsertTrainerProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(trainerProfiles).values(data);
}

export async function getTrainerProfileByUserId(userId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(trainerProfiles).where(eq(trainerProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTrainerProfile(id: string, data: Partial<InsertTrainerProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(trainerProfiles).set(data).where(eq(trainerProfiles.id, id));
}

// User Profile queries
export async function createUserProfile(data: InsertUserProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userProfiles).values(data);
}

export async function getUserProfileByUserId(userId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(id: string, data: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userProfiles).set(data).where(eq(userProfiles.id, id));
}
