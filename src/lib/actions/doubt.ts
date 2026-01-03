"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";

const questionSchema = z.object({
    content: z.string().min(10, "Question must be at least 10 characters"),
    tags: z.string().min(1, "At least one tag is required"),
});

export async function submitQuestion(prevState: any, formData: FormData) {
    const rawData = {
        content: formData.get("content"),
        tags: formData.get("tags"),
    };

    const validated = questionSchema.safeParse(rawData);

    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
    }

    const { content, tags } = validated.data;

    // Parse tags (comma separated)
    const tagList = tags.split(",").map((t) => t.trim().toLowerCase());

    // 1. Mock creating a user for now (or get current session user)
    // implementing "User Profiles" implies we should have auth, but for "Doubt Portal" functionality test
    // we will grab the first user or create a guest.
    // For this demo, let's assume a guest user or creating one on the fly if needed.
    // We'll create a dummy user if none exists.

    let user = await prisma.user.findFirst();
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: "guest@example.com",
                name: "Guest User",
                role: "USER"
            }
        });
    }

    // 2. Create Question
    const question = await prisma.question.create({
        data: {
            content,
            tags: tags,
            userId: user.id,
        },
    });

    // 3. Match Experts
    // Logic: Find users with role EXPERT and skills matching tags
    // Since we stored skills in a separate table:
    const experts = await prisma.user.findMany({
        where: {
            role: "EXPERT",
            skills: {
                some: {
                    name: {
                        in: tagList
                    }
                }
            }
        },
        include: {
            skills: true
        }
    });

    // 4. Trigger Notification (Mock)
    if (experts.length > 0) {
        console.log(`[MATCHING ENGINE] Found ${experts.length} experts for tags: ${tagList.join(", ")}`);
        experts.forEach(expert => {
            console.log(`[EMAIL DISPATCH] Sending email to ${expert.email} regarding question ID ${question.id}`);
            // Trigger actual email service here (Resend/SendGrid) in future
        });
        return { success: true, matchCount: experts.length, expertNames: experts.map(e => e.name) };
    } else {
        console.log(`[MATCHING ENGINE] No experts found for tags: ${tagList.join(", ")}`);
        return { success: true, matchCount: 0 };
    }
}
