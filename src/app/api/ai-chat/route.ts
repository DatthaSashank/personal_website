import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if the user is authenticated and has professional access
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, has_professional_access')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'Admin' && !profile.has_professional_access)) {
      return NextResponse.json({ error: 'Access forbidden to Professional Hub' }, { status: 403 });
    }

    const { message } = await request.json();
    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const query = message.toLowerCase();
    let reply = '';

    if (query.includes('stack') || query.includes('technology') || query.includes('languages') || query.includes('frameworks')) {
      reply = `### Dattha's Core Technology Stack

Dattha Sashank is a full-stack engineer and architect specializing in high-performance web applications and cloud integrations:

- **Frontend**: React, Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Backend & Database**: Node.js, Python, Supabase (PostgreSQL), Prisma, Redis.
- **Cloud & DevOps**: AWS (S3, Lambda, CloudFront, ECS), Docker, GitHub Actions CI/CD.
- **AI & ML Integration**: OpenAI API, Gemini API, LangChain, vector databases (Pinecone, pgvector).`;
    } else if (query.includes('project') || query.includes('portfolio') || query.includes('recent')) {
      reply = `### Highlights of Recent Projects

Dattha has engineered several scalable architectures:

1. **AI-Powered Learning Platform**: A modular Next.js application that integrates multiple LLM endpoints, implements prompt caching, and serves interactive coding challenges.
2. **Autonomous Agent Dashboard**: A real-time monitoring interface for background AI agents with complex tool-calling flows, built using Supabase Realtime and web sockets.
3. **High-Security Enterprise CMS**: A role-based document storage and sharing system utilizing row-level security (RLS), custom cryptography, and MFA workflows.`;
    } else if (query.includes('ai') || query.includes('artificial intelligence') || query.includes('learning') || query.includes('model')) {
      reply = `### AI Integration & Learning Roadmap

Dattha's AI engineering focuses on building practical, agentic integrations rather than just calling simple APIs:

- **Agentic Workflows**: Designing multi-agent systems with specialized sub-tasks, state validation, and memory.
- **Vector Search & RAG**: Implementing Retrieval-Augmented Generation using embeddings pipelines (Cohere/OpenAI) and hybrid postgres searches.
- **LLM Guardrails**: Building custom middleware to validate inputs, intercept injection attempts, and format outputs reliably.
- **API Optimization**: Designing token-efficient prompting strategies, retry backoffs, and local caching servers.`;
    } else if (query.includes('who') || query.includes('about') || query.includes('dattha') || query.includes('sashank')) {
      reply = `### About Dattha Sashank

Dattha is an expert software engineer and system architect. He designs robust engineering platforms, explores autonomous AI networks, and writes about modern web architectures.

- **Focus**: Scalability, Security, AI Integrations, and UX fluidity.
- **Philosophy**: Keep systems clean, modular, and use the right abstraction.
- **Interests**: Vector search, distributed databases, and high-framerate UI interactions.`;
    } else {
      reply = `### Hello! I am Dattha's AI Learning Assistant.

I can tell you all about Dattha's technical background, projects, and AI experience. Try asking me about:
- **"What is his technology stack?"**
- **"Tell me about his recent projects."**
- **"What is his experience with AI and LLMs?"**
- **"Who is Dattha Sashank?"**

*I'm currently running inside a modular future-proof AI integration block, ready to connect to external LLMs and databases as needed!*`;
    }

    return NextResponse.json({ response: reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
