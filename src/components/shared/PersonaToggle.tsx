"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Briefcase, Camera } from "lucide-react";

export function PersonaToggle() {
    const pathname = usePathname();
    const isProfessional = pathname?.startsWith("/professional") || pathname === "/";
    const isPersonal = pathname?.startsWith("/personal");

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center p-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                <Link
                    href="/professional"
                    className={cn(
                        "relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-300",
                        isProfessional ? "text-white" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    )}
                >
                    {isProfessional && (
                        <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-neutral-900 dark:bg-white rounded-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span className={cn(isProfessional ? "text-white dark:text-black" : "")}>Professional</span>
                    </span>
                </Link>

                <Link
                    href="/personal"
                    className={cn(
                        "relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-300",
                        isPersonal ? "text-white" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    )}
                >
                    {isPersonal && (
                        <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-neutral-900 dark:bg-white rounded-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        <span className={cn(isPersonal ? "text-white dark:text-black" : "")}>Personal</span>
                    </span>
                </Link>
            </div>
        </div>
    );
}
