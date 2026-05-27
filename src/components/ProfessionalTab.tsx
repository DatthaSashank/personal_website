'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit, Trash2, X, Github, ExternalLink, Award, BrainCircuit, 
  Send, Sparkles, Loader2, ArrowRight 
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  content: string | null;
  image_url: string | null;
  tags: string; // Comma separated
  project_url: string | null;
  github_url: string | null;
}

interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  credential_url: string | null;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface ProfessionalTabProps {
  isAdmin: boolean;
}

export default function ProfessionalTab({ isAdmin }: ProfessionalTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  // CMS state for Projects
  const [isProjOpen, setIsProjOpen] = useState(false);
  const [editProj, setEditProj] = useState<Project | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projContent, setProjContent] = useState('');
  const [projImageUrl, setProjImageUrl] = useState('');
  const [projTags, setProjTags] = useState('');
  const [projUrl, setProjUrl] = useState('');
  const [projGit, setProjGit] = useState('');
  const [projStatus, setProjStatus] = useState('');

  // CMS state for Certifications
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [editCert, setEditCert] = useState<Certification | null>(null);
  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [certStatus, setCertStatus] = useState('');

  // AI Chat States
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Hi! I am Dattha\'s AI Assistant. Ask me about his tech stack, project case studies, or general professional background!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, certRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/certifications')
      ]);

      if (projRes.ok) {
        const projData = await projRes.json();
        if (projData.success) setProjects(projData.data);
      }
      if (certRes.ok) {
        const certData = await certRes.json();
        if (certData.success) setCertifications(certData.data);
      }
    } catch (err) {
      console.error('Error fetching professional data:', err);
    } finally {
      setLoading(false);
    }
  };

  // CMS: Projects
  const handleOpenCreateProj = () => {
    setEditProj(null);
    setProjTitle('');
    setProjDesc('');
    setProjContent('');
    setProjImageUrl('');
    setProjTags('');
    setProjUrl('');
    setProjGit('');
    setProjStatus('');
    setIsProjOpen(true);
  };

  const handleOpenEditProj = (proj: Project) => {
    setEditProj(proj);
    setProjTitle(proj.title);
    setProjDesc(proj.description);
    setProjContent(proj.content || '');
    setProjImageUrl(proj.image_url || '');
    setProjTags(proj.tags);
    setProjUrl(proj.project_url || '');
    setProjGit(proj.github_url || '');
    setProjStatus('');
    setIsProjOpen(true);
  };

  const handleSaveProj = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjStatus('Saving...');
    const payload = {
      id: editProj?.id,
      title: projTitle,
      description: projDesc,
      content: projContent || null,
      image_url: projImageUrl || null,
      tags: projTags,
      project_url: projUrl || null,
      github_url: projGit || null
    };

    try {
      const method = editProj ? 'PUT' : 'POST';
      const res = await fetch('/api/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsProjOpen(false);
        fetchData();
      } else {
        setProjStatus(`Error: ${data.error || 'Failed to save project'}`);
      }
    } catch (err) {
      setProjStatus('Network error.');
    }
  };

  const handleDeleteProj = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // CMS: Certifications
  const handleOpenCreateCert = () => {
    setEditCert(null);
    setCertTitle('');
    setCertIssuer('');
    setCertDate('');
    setCertUrl('');
    setCertStatus('');
    setIsCertOpen(true);
  };

  const handleOpenEditCert = (cert: Certification) => {
    setEditCert(cert);
    setCertTitle(cert.title);
    setCertIssuer(cert.issuer);
    setCertDate(cert.issue_date || '');
    setCertUrl(cert.credential_url || '');
    setCertStatus('');
    setIsCertOpen(true);
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertStatus('Saving...');
    const payload = {
      id: editCert?.id,
      title: certTitle,
      issuer: certIssuer,
      issue_date: certDate || null,
      credential_url: certUrl || null
    };

    try {
      const method = editCert ? 'PUT' : 'POST';
      const res = await fetch('/api/certifications', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsCertOpen(false);
        fetchData();
      } else {
        setCertStatus(`Error: ${data.error || 'Failed to save certification'}`);
      }
    } catch (err) {
      setCertStatus('Network error.');
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Delete this certification?')) return;
    try {
      const res = await fetch(`/api/certifications?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // AI Chat Handlers
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setInputText('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await res.json();
      if (res.ok && data.response) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.response }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error checking that information. Please try again.' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Network connection error.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const suggestions = [
    'What is your tech stack?',
    'Tell me about your recent projects.',
    'What is your experience with AI?'
  ];

  return (
    <div className="fade-in max-w-5xl mx-auto flex flex-col gap-12">
      {/* 1. Projects Section (Bento Grid) */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">Projects Portfolio</h2>
            <p className="text-neutral-500 text-sm">Key architectural platforms and implementations.</p>
          </div>
          {isAdmin && (
            <button onClick={handleOpenCreateProj} className="btn-primary">
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card text-center p-8 border-neutral-100 text-neutral-500">
            No projects added yet.
          </div>
        ) : (
          <div className="bento-grid">
            {projects.map((proj, idx) => {
              // Bento styling: alternate sizes for visual variety
              const isLarge = idx % 3 === 0;
              const colSpan = isLarge ? 'bento-col-4' : 'bento-col-2';
              return (
                <div 
                  key={proj.id}
                  className={`glass-card border-neutral-100/70 p-6 flex flex-col justify-between relative overflow-hidden group ${colSpan}`}
                >
                  <div>
                    {proj.image_url && (
                      <div className="w-full h-40 rounded-xl overflow-hidden mb-4 border border-neutral-100 bg-neutral-50">
                        <img src={proj.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                        {proj.title}
                      </h3>
                      {isAdmin && (
                        <div className="flex items-center gap-1 flex-shrink-0 relative z-10">
                          <button 
                            onClick={() => handleOpenEditProj(proj)}
                            className="w-7 h-7 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-950 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProj(proj.id)}
                            className="w-7 h-7 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:border-red-100 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-neutral-500 text-xs leading-relaxed mb-4">
                      {proj.description}
                    </p>
                  </div>

                  <div>
                    {/* Tags */}
                    {proj.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {proj.tags.split(',').map((tag) => (
                          <span 
                            key={tag} 
                            className="text-[9px] font-semibold bg-neutral-50 text-neutral-600 border border-neutral-100 px-2 py-0.5 rounded-md"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex items-center gap-3">
                      {proj.github_url && (
                        <a 
                          href={proj.github_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-neutral-400 hover:text-neutral-900 transition-colors"
                          title="View Repository"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {proj.project_url && (
                        <a 
                          href={proj.project_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                          title="Live Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Live Site</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Certifications & AI Learning Node Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Certifications */}
        <div className="glass-card border-neutral-100/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" />
                Certifications
              </h3>
              {isAdmin && (
                <button onClick={handleOpenCreateCert} className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-neutral-200" />
              </div>
            ) : certifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-400">
                No credentials listed.
              </div>
            ) : (
              <div className="grid gap-3.5 max-h-[350px] overflow-y-auto pr-1">
                {certifications.map((cert) => (
                  <div 
                    key={cert.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-50 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-neutral-900">{cert.title}</span>
                      <span className="text-[10px] text-neutral-400">{cert.issuer} {cert.issue_date && `• ${new Date(cert.issue_date).toLocaleDateString()}`}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {cert.credential_url && (
                        <a 
                          href={cert.credential_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => handleOpenEditCert(cert)}
                            className="w-7 h-7 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCert(cert.id)}
                            className="w-7 h-7 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-neutral-100 text-[10px] text-neutral-400 font-medium">
            Verifiable cryptographic links attached.
          </div>
        </div>

        {/* Right Side: AI Assistant node */}
        <div className="glass-card border-neutral-100/70 p-6 flex flex-col justify-between h-[450px] relative overflow-hidden bg-neutral-950 text-white">
          {/* Decorative mesh glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Assistant Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <BrainCircuit className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-neutral-200">AI Assistant Node</h4>
                <p className="text-[9px] text-neutral-400">Simulating live LLM inference</p>
              </div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          {/* Messages Container */}
          <div className="flex-grow overflow-y-auto py-4 flex flex-col gap-3 relative z-10 scrollbar-none pr-1">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`max-w-[85%] rounded-2xl p-3 text-[11px] leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-emerald-600 text-white self-end rounded-br-none' 
                    : 'bg-white/5 border border-white/10 text-neutral-200 self-start rounded-bl-none'
                }`}
              >
                {msg.sender === 'ai' ? (
                  <div className="whitespace-pre-wrap article-content-mini">
                    {/* Render basic markdown blocks for the local replies */}
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (line.startsWith('###')) {
                        return <h5 key={lIdx} className="text-xs font-bold text-white mb-1.5 mt-2">{line.replace('###', '').trim()}</h5>;
                      }
                      if (line.startsWith('-')) {
                        return <li key={lIdx} className="ml-2 pl-1 mb-1 list-disc text-neutral-300">{line.replace('-', '').trim()}</li>;
                      }
                      if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                        return <p key={lIdx} className="ml-2 mb-1.5 text-neutral-300 font-mono">{line}</p>;
                      }
                      return <p key={lIdx} className="mb-1 text-neutral-300">{line}</p>;
                    })}
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="bg-white/5 border border-white/10 text-neutral-400 self-start rounded-2xl rounded-bl-none p-3 text-[10px] flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                Assistant thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions & Input */}
          <div className="relative z-10 pt-3 border-t border-white/10 flex flex-col gap-2.5">
            {/* suggestions */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {suggestions.map((sug, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSendMessage(sug)}
                  disabled={chatLoading}
                  className="whitespace-nowrap text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2.5 py-1 text-neutral-300 font-semibold cursor-pointer disabled:opacity-50"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask about my background..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={chatLoading}
                className="flex-grow bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none rounded-xl px-3 py-2 text-xs text-white placeholder-white/30"
              />
              <button
                type="submit"
                disabled={chatLoading || !inputText.trim()}
                className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center flex-shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* MODAL: Create/Edit Project */}
      {isProjOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">{editProj ? 'Edit Project Item' : 'New Project Node'}</h3>
              <button onClick={() => setIsProjOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {projStatus && <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">{projStatus}</div>}

            <form onSubmit={handleSaveProj} className="flex flex-col gap-4">
              <input className="input-field" placeholder="Title" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} required />
              <textarea className="input-field" placeholder="Brief Description" value={projDesc} onChange={(e) => setProjDesc(e.target.value)} rows={3} required />
              <input className="input-field" placeholder="Tags (e.g. Next.js, Tailwind, RAG)" value={projTags} onChange={(e) => setProjTags(e.target.value)} />
              <input className="input-field" placeholder="Image URL (Optional)" value={projImageUrl} onChange={(e) => setProjImageUrl(e.target.value)} />
              <input className="input-field" placeholder="Live Demo Link" value={projUrl} onChange={(e) => setProjUrl(e.target.value)} />
              <input className="input-field" placeholder="Github Repo URL" value={projGit} onChange={(e) => setProjGit(e.target.value)} />

              <div className="flex justify-end gap-2.5 mt-4">
                <button type="button" onClick={() => setIsProjOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create/Edit Certification */}
      {isCertOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">{editCert ? 'Edit Certification' : 'New Certification'}</h3>
              <button onClick={() => setIsCertOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {certStatus && <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">{certStatus}</div>}

            <form onSubmit={handleSaveCert} className="flex flex-col gap-4">
              <input className="input-field" placeholder="Title" value={certTitle} onChange={(e) => setCertTitle(e.target.value)} required />
              <input className="input-field" placeholder="Issuer" value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} required />
              <input className="input-field" type="date" placeholder="Issue Date" value={certDate} onChange={(e) => setCertDate(e.target.value)} />
              <input className="input-field" placeholder="Verification / Credential URL" value={certUrl} onChange={(e) => setCertUrl(e.target.value)} />

              <div className="flex justify-end gap-2.5 mt-4">
                <button type="button" onClick={() => setIsCertOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Credential</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
