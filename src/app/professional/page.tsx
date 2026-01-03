"use client";

import { motion } from "framer-motion";
import { ArrowRight, Code2, Database, Globe } from "lucide-react";
import { DoubtPortal } from "@/components/professional/DoubtPortal";

export default function ProfessionalPage() {
    return (
        <div className="space-y-24">
            {/* Hero Section */}
            <section className="relative pt-20 pb-12 md:pt-32 md:pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium border border-indigo-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Available for hire
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                        Building digital ecosystems with <span className="text-indigo-600">purpose</span> and precision.
                    </h1>

                    <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                        I'm Dattha Sashank, a Full Stack Engineer specialized in scalable architecture and intuitive user experiences.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button className="px-8 py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center gap-2 group">
                            View Work
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all">
                            Contact Me
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Skills / Bento Grid Placeholder */}
            <section>
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-bold text-slate-900">Featured Projects</h2>
                    <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">View all &rarr;</a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                    <div className="md:col-span-2 bg-slate-100 rounded-3xl p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500 cursor-pointer group hover:shadow-2xl hover:shadow-indigo-500/10 border border-slate-200">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <Globe className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Enterprise Cloud Platform</h3>
                            <p className="text-slate-600 max-w-md">A scalable microservices architecture serving 1M+ users with 99.99% uptime.</p>
                        </div>
                        <div className="h-64 bg-slate-200 rounded-2xl mt-8 overflow-hidden relative">
                            {/* Image Placeholder */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                        </div>
                    </div>

                    <div className="space-y-6 flex flex-col">
                        <div className="flex-1 bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500 cursor-pointer hover:shadow-2xl">
                            <Code2 className="w-8 h-8 text-indigo-400" />
                            <div>
                                <h3 className="text-xl font-bold mb-2">Open Source</h3>
                                <p className="text-slate-400 text-sm">Contributor to major React libraries.</p>
                            </div>
                        </div>
                        <div className="flex-1 bg-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500 cursor-pointer hover:shadow-2xl">
                            <Database className="w-8 h-8 text-white/80" />
                            <div>
                                <h3 className="text-xl font-bold mb-2">Data Systems</h3>
                                <p className="text-indigo-100 text-sm">High-performance data pipelines.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Doubt Portal */}
            <DoubtPortal />
        </div >
    );
}
