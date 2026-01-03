"use client";

import { useActionState } from "react";
import { submitQuestion } from "@/lib/actions/doubt";
import { Loader2, Sparkles, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DoubtPortal() {
    const [state, action, isPending] = useActionState(submitQuestion, null);

    return (
        <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 p-8 md:p-12">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        Expert Network
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Stuck on a problem?</h2>
                    <p className="text-slate-600">Describe your technical challenge. Our matching engine will connect you with the right expert immediately.</p>
                </div>

                {state?.success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center space-y-4"
                    >
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <Send className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-green-900">Request Sent!</h3>
                            <p className="text-green-700 mt-2">
                                We found {state.matchCount} expert{state.matchCount !== 1 && 's'} matching your query.
                            </p>
                            {state.expertNames && state.expertNames.length > 0 && (
                                <p className="text-sm text-green-600 mt-1">
                                    Notified: {state.expertNames.join(", ")}
                                </p>
                            )}
                        </div>
                        <button onClick={() => window.location.reload()} className="text-sm font-medium text-green-800 hover:underline">
                            Ask another question
                        </button>
                    </motion.div>
                ) : (
                    <form action={action} className="space-y-6 bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/50">
                        <div className="space-y-2">
                            <label htmlFor="content" className="block text-sm font-medium text-slate-700">Your Question</label>
                            <textarea
                                name="content"
                                id="content"
                                rows={4}
                                className="w-full rounded-xl border-slate-200 bg-white/80 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none p-4 text-slate-900 placeholder:text-slate-400"
                                placeholder="How do I optimize Next.js server actions for..."
                                required
                            />
                            {state?.error?.content && <p className="text-red-500 text-sm">{state.error.content[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="tags" className="block text-sm font-medium text-slate-700">Tags (comma separated)</label>
                            <input
                                type="text"
                                name="tags"
                                id="tags"
                                className="w-full rounded-xl border-slate-200 bg-white/80 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all h-12 px-4 text-slate-900 placeholder:text-slate-400"
                                placeholder="react, typescript, performance"
                                required
                            />
                            {state?.error?.tags && <p className="text-red-500 text-sm">{state.error.tags[0]}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-14 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Matching Experts...
                                </>
                            ) : (
                                "Find Expert"
                            )}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
