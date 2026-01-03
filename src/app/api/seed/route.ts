import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Skills
        const skills = ["react", "nextjs", "typescript", "ai", "python"];

        for (const skill of skills) {
            await prisma.skill.upsert({
                where: { name: skill },
                update: {},
                create: { name: skill },
            });
        }

        // Expert User
        const expertEmail = "expert@tech.com";
        const existingExpert = await prisma.user.findUnique({ where: { email: expertEmail } });

        if (!existingExpert) {
            const reactSkill = await prisma.skill.findUnique({ where: { name: "react" } });
            const nextSkill = await prisma.skill.findUnique({ where: { name: "nextjs" } });

            await prisma.user.create({
                data: {
                    email: expertEmail,
                    name: "Sashank The Expert",
                    role: "EXPERT",
                    skills: {
                        connect: [
                            { id: reactSkill?.id },
                            { id: nextSkill?.id }
                        ]
                    }
                },
            });
            return NextResponse.json({ message: "Seeded Expert User" });
        }

        return NextResponse.json({ message: "Already Seeded" });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
