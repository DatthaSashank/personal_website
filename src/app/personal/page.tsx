"use client";

import { motion } from "framer-motion";

const photos = [
    { id: 1, height: "h-96", color: "bg-neutral-800" },
    { id: 2, height: "h-64", color: "bg-neutral-700" },
    { id: 3, height: "h-80", color: "bg-neutral-900" },
    { id: 4, height: "h-72", color: "bg-neutral-800" },
    { id: 5, height: "h-96", color: "bg-neutral-700" },
    { id: 6, height: "h-64", color: "bg-neutral-900" },
];

export default function PersonalPage() {
    return (
        <div className="space-y-32">
            <section className="pt-32 px-4 text-center space-y-8">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="text-6xl md:text-9xl font-bold tracking-tighter text-white/90"
                >
                    CAPTURED
                </motion.h1>
                <p className="text-xl md:text-2xl text-neutral-400 font-light tracking-wide max-w-2xl mx-auto">
                    A collection of moments, shadows, and light.
                </p>
            </section>

            <section className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 px-4">
                {photos.map((photo, i) => (
                    <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className={`w-full ${photo.height} ${photo.color} rounded-lg overflow-hidden relative group cursor-zoom-in`}
                    >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                        <div className="absolute bottom-0 left-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                            <p className="text-white font-medium text-lg">Untitled {photo.id}</p>
                            <p className="text-neutral-300 text-sm">2024</p>
                        </div>
                    </motion.div>
                ))}
            </section>
        </div>
    );
}
