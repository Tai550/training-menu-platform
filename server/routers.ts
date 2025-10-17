import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Consultation router
  consultation: router({
    list: publicProcedure
      .input(z.object({ status: z.enum(["open", "answered", "closed"]).optional() }).optional())
      .query(async ({ input }) => {
        return await db.getConsultations(input?.status);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await db.getConsultationById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        goals: z.string().optional(),
        currentLevel: z.string().optional(),
        tags: z.array(z.string()).optional(),
        amount: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = nanoid();
        await db.createConsultation({
          id,
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          goals: input.goals,
          currentLevel: input.currentLevel,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          amount: input.amount || 0,
          isPaid: false,
          status: "open",
        });
        return { id };
      }),
    
    selectBestAnswer: protectedProcedure
      .input(z.object({
        consultationId: z.string(),
        proposalId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const consultation = await db.getConsultationById(input.consultationId);
        if (!consultation || consultation.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        
        await db.updateConsultation(input.consultationId, {
          bestAnswerId: input.proposalId,
          status: "answered",
        });
        
        await db.updateProposal(input.proposalId, {
          isBestAnswer: true,
        });
        
        return { success: true };
      }),
  }),
  
  // Proposal router
  proposal: router({
    listByConsultation: publicProcedure
      .input(z.object({ consultationId: z.string() }))
      .query(async ({ input }) => {
        return await db.getProposalsByConsultationId(input.consultationId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        consultationId: z.string(),
        title: z.string().min(1),
        content: z.string().min(1),
        program: z.array(z.object({
          day: z.string(),
          exercises: z.array(z.object({
            name: z.string(),
            sets: z.string().optional(),
            reps: z.string().optional(),
            duration: z.string().optional(),
            notes: z.string().optional(),
          })),
        })),
        duration: z.string().optional(),
        frequency: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is an approved trainer
        if (!ctx.user.isApprovedTrainer) {
          throw new Error("トレーナーとして承認されているユーザーのみ提案できます。プロフィールを登録して承認を待ってください。");
        }
        
        const id = nanoid();
        await db.createProposal({
          id,
          consultationId: input.consultationId,
          trainerId: ctx.user.id,
          title: input.title,
          content: input.content,
          program: JSON.stringify(input.program),
          duration: input.duration,
          frequency: input.frequency,
          isBestAnswer: false,
        });
        return { id };
      }),
  }),
  
  // Storage router
  storage: router({    uploadProfilePhoto: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileData, 'base64');
        const filename = `trainer-photos/${ctx.user.id}-${Date.now()}.${input.fileName.split('.').pop()}`;
        const result = await storagePut(filename, buffer, input.mimeType);
        return result;
      }),
  }),
  
  // Admin router
  admin: router({
    getAllUsers: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return await db.getAllUsers();
      }),
    
    approveTrainer: protectedProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await db.updateUser(input.userId, { isApprovedTrainer: true });
        return { success: true };
      }),
    
    revokeTrainer: protectedProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await db.updateUser(input.userId, { isApprovedTrainer: false });
        return { success: true };
      }),
  }),
  
  // Trainer Profile router
  trainer: router({
    getProfile: publicProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await db.getTrainerProfileByUserId(input.userId);
      }),
    
    createOrUpdateProfile: protectedProcedure
      .input(z.object({
        profilePhoto: z.string().optional(),
        bio: z.string().optional(),
        specialties: z.array(z.string()).optional(),
        certifications: z.array(z.object({
          name: z.string(),
          issuer: z.string(),
          year: z.string(),
        })).optional(),
        socialLinks: z.object({
          twitter: z.string().optional(),
          instagram: z.string().optional(),
          facebook: z.string().optional(),
          youtube: z.string().optional(),
          website: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getTrainerProfileByUserId(ctx.user.id);
        
        if (existing) {
          await db.updateTrainerProfile(existing.id, {
            profilePhoto: input.profilePhoto,
            bio: input.bio,
            specialties: input.specialties ? JSON.stringify(input.specialties) : undefined,
            certifications: input.certifications ? JSON.stringify(input.certifications) : undefined,
            socialLinks: input.socialLinks ? JSON.stringify(input.socialLinks) : undefined,
          });
          return { id: existing.id };
        } else {
          const id = nanoid();
          await db.createTrainerProfile({
            id,
            userId: ctx.user.id,
            profilePhoto: input.profilePhoto,
            bio: input.bio,
            specialties: input.specialties ? JSON.stringify(input.specialties) : null,
            certifications: input.certifications ? JSON.stringify(input.certifications) : null,
            socialLinks: input.socialLinks ? JSON.stringify(input.socialLinks) : null,
            isVerified: false,
          });
          return { id };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
