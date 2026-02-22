/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Download, 
  Upload, 
  LayoutDashboard, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Globe,
  Shield,
  Book,
  Users,
  Activity,
  FileText,
  Calendar,
  MessageSquare,
  Briefcase,
  Search,
  Zap,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AppLink {
  id: string;
  title: string;
  url: string;
  displayMode: 'iframe' | 'new_tab';
  color: string;
  icon: string;
}

const ICON_MAP: Record<string, any> = {
  Globe, Shield, Book, Users, Activity, FileText, Calendar, MessageSquare, Briefcase, Zap, Search
};

const APP_COLORS = [
  'from-indigo-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-500',
];

export default function App() {
  const [links, setLinks] = useState<AppLink[]>([]);
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showKilas, setShowKilas] = useState(false);
  const [showPeta, setShowPeta] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [newApp, setNewApp] = useState({ 
    title: '', 
    url: '', 
    displayMode: 'iframe' as 'iframe' | 'new_tab',
    color: APP_COLORS[0],
    icon: 'Globe'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dashboard_links');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration for old data
        const migrated = parsed.map((l: any, idx: number) => ({
          ...l,
          displayMode: l.displayMode || 'iframe',
          color: l.color || APP_COLORS[idx % APP_COLORS.length],
          icon: l.icon || 'Globe'
        }));
        setLinks(migrated);
        if (migrated.length > 0) setActiveLinkId(migrated[0].id);
      } catch (e) {
        console.error('Failed to parse links', e);
      }
    } else {
      // Default links
      const defaults: AppLink[] = [
        { id: '1', title: 'Google Search', url: 'https://www.google.com/search?igu=1', displayMode: 'iframe', color: APP_COLORS[0], icon: 'Search' },
        { id: '2', title: 'Wikipedia', url: 'https://en.wikipedia.org', displayMode: 'iframe', color: APP_COLORS[2], icon: 'Book' },
        { id: '3', title: 'AI Studio', url: 'https://aistudio.google.com', displayMode: 'new_tab', color: APP_COLORS[4], icon: 'Zap' },
      ];
      setLinks(defaults);
      setActiveLinkId(defaults[0].id);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard_links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    if (activeLinkId) {
      const link = links.find(l => l.id === activeLinkId);
      if (link?.displayMode === 'iframe') {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [activeLinkId, links]);

  const activeLink = links.find(l => l.id === activeLinkId);

  const handleLinkClick = (link: AppLink) => {
    setShowKilas(false);
    setShowPeta(false);
    setShowTutorial(false);
    if (link.displayMode === 'new_tab') {
      window.open(link.url, '_blank');
      setActiveLinkId(link.id); // Still set as active to show selection
    } else {
      setActiveLinkId(link.id);
    }
  };

  const addLink = () => {
    if (!newApp.title || !newApp.url) return;
    let url = newApp.url;
    if (!url.startsWith('http')) url = 'https://' + url;
    
    const newLink: AppLink = {
      id: Date.now().toString(),
      title: newApp.title,
      url: url,
      displayMode: newApp.displayMode,
      color: newApp.color,
      icon: newApp.icon
    };
    setLinks([...links, newLink]);
    if (newLink.displayMode === 'iframe') {
      setActiveLinkId(newLink.id);
    } else {
      window.open(newLink.url, '_blank');
      setActiveLinkId(newLink.id);
    }
    setNewApp({ title: '', url: '', displayMode: 'iframe', color: APP_COLORS[links.length % APP_COLORS.length], icon: 'Globe' });
    setShowAddModal(false);
  };

  const removeLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    if (activeLinkId === id) {
      setActiveLinkId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const backupData = () => {
    const dataStr = JSON.stringify(links, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'dashboard_backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setLinks(json);
          if (json.length > 0) setActiveLinkId(json[0].id);
        }
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const copyAppLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5] font-sans overflow-hidden text-slate-800">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        className="glass border-r border-white/20 flex flex-col z-20 relative overflow-hidden m-3 rounded-2xl"
      >
        <div className="p-5 flex items-center justify-between border-b border-black/5 min-w-[280px]">
          <motion.h1 
            className="flex flex-col gap-0.5 font-display"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg shadow-indigo-100 rotate-3 overflow-hidden p-1">
                <img 
                  src="https://iili.io/KDFk4fI.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">SIAP</span>
            </div>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em] leading-none ml-10">Sistem Integrasi Aplikasi Pembinaan</span>
          </motion.h1>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide min-w-[280px]">
          {/* Kilas Menu */}
          <button
            onClick={() => {
              setShowKilas(true);
              setActiveLinkId(null);
            }}
            className={`
              w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-300
              ${showKilas 
                ? `bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] translate-y-[-2px] ring-1 ring-black/5` 
                : 'hover:bg-white/40 text-slate-600'
              }
            `}
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shrink-0 transition-all duration-500 ${showKilas ? 'scale-110 rotate-3' : ''}`}>
              <Book size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-black tracking-tight truncate text-sm ${showKilas ? 'text-slate-900' : 'text-slate-600'}`}>
                Kilas Aplikasi SIAP
              </p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Referensi Dasar</p>
            </div>
          </button>

          {/* Peta Integrasi Menu */}
          <button
            onClick={() => {
              setShowPeta(true);
              setShowKilas(false);
              setActiveLinkId(null);
            }}
            className={`
              w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-300
              ${showPeta 
                ? `bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] translate-y-[-2px] ring-1 ring-black/5` 
                : 'hover:bg-white/40 text-slate-600'
              }
            `}
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white shadow-md shrink-0 transition-all duration-500 ${showPeta ? 'scale-110 rotate-3' : ''}`}>
              <LayoutDashboard size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-black tracking-tight truncate text-sm ${showPeta ? 'text-slate-900' : 'text-slate-600'}`}>
                Peta Integrasi 7KAIH
              </p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Kaitan Karakter</p>
            </div>
          </button>

          {/* Tutorial Menu */}
          <button
            onClick={() => {
              setShowTutorial(true);
              setShowPeta(false);
              setShowKilas(false);
              setActiveLinkId(null);
            }}
            className={`
              w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-300
              ${showTutorial 
                ? `bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] translate-y-[-2px] ring-1 ring-black/5` 
                : 'hover:bg-white/40 text-slate-600'
              }
            `}
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-md shrink-0 transition-all duration-500 ${showTutorial ? 'scale-110 rotate-3' : ''}`}>
              <MessageSquare size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-black tracking-tight truncate text-sm ${showTutorial ? 'text-slate-900' : 'text-slate-600'}`}>
                Tutorial Penggunaan
              </p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Panduan Video</p>
            </div>
          </button>

          <div className="h-px bg-black/5 mx-2" />

          {/* 3D Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="group relative w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl transition-all duration-100 active:translate-y-1 active:shadow-none shadow-[0_4px_0_0_#4338ca] hover:brightness-110 flex items-center justify-center gap-2 text-white font-bold text-sm"
          >
            <Plus size={18} />
            <span>Add New App</span>
          </button>

          <div className="space-y-2 pt-1">
            {links.map((link) => {
              const IconComponent = ICON_MAP[link.icon] || Globe;
              return (
                <div key={link.id} className="relative group">
                  <button
                    onClick={() => handleLinkClick(link)}
                    className={`
                      w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-300
                      ${activeLinkId === link.id 
                        ? `bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] translate-y-[-2px] ring-1 ring-black/5` 
                        : 'hover:bg-white/40 text-slate-600'
                      }
                    `}
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${link.color || 'from-indigo-500 to-blue-600'} flex items-center justify-center text-white shadow-md shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 bg-indigo-500`}>
                      <IconComponent size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-black tracking-tight truncate text-sm ${activeLinkId === link.id ? 'text-slate-900' : 'text-slate-600'}`}>
                        {link.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-full ${activeLinkId === link.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200/50 text-slate-400'}`}>
                          {link.displayMode === 'iframe' ? 'Dashboard' : 'Direct'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Quick External Link Icon */}
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-white rounded-lg shadow-sm"
                      title="Open in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </button>
                  
                  <button
                    onClick={(e) => removeLink(link.id, e)}
                    className="absolute -right-1.5 -top-1.5 opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:text-white bg-white hover:bg-rose-500 rounded-lg shadow-lg border border-slate-100 transition-all z-10"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-black/5 space-y-3 min-w-[280px]">
          {/* App Link Info */}
          <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Link Aplikasi</span>
              <button 
                onClick={copyAppLink}
                className="text-indigo-500 hover:text-indigo-700 transition-colors"
                title="Salin Link"
              >
                {copied ? <span className="text-[8px] font-bold">Tersalin!</span> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[10px] font-mono text-slate-500 break-all leading-tight opacity-80">
              {window.location.href}
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={backupData}
              className="flex-1 p-2 bg-white/50 hover:bg-white text-slate-600 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs font-bold shadow-sm border border-white/20"
            >
              <Download size={14} className="text-indigo-500" />
              Backup
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 p-2 bg-white/50 hover:bg-white text-slate-600 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs font-bold shadow-sm border border-white/20"
            >
              <Upload size={14} className="text-violet-500" />
              Restore
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".json"
          />
        </div>
      </motion.aside>

      {/* Floating Trigger for Hidden Sidebar */}
      {!isSidebarOpen && (
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-6 top-6 z-30 p-2 glass rounded-3xl text-indigo-600 hover:scale-110 transition-all active:scale-90 shadow-2xl overflow-hidden"
        >
          <img 
            src="https://iili.io/KDFk4fI.png" 
            alt="Logo" 
            className="w-12 h-12 object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.button>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative p-3 pl-0">
        <AnimatePresence mode="wait">
          {showTutorial ? (
            <motion.div
              key="tutorial-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-1 flex flex-col glass rounded-[2rem] overflow-y-auto shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-white/40 p-12 scrollbar-hide"
            >
              <div className="max-w-4xl mx-auto space-y-12 w-full">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-2xl shadow-indigo-100 mx-auto rotate-6 overflow-hidden p-2 mb-6">
                    <img 
                      src="https://iili.io/KDFk4fI.png" 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h2 className="text-5xl font-black text-slate-800 tracking-tight font-display leading-none">Tutorial Penggunaan</h2>
                  <p className="text-lg font-black text-indigo-600 uppercase tracking-[0.3em]">Panduan Lengkap Aplikasi SIAP</p>
                </div>

                <div className="bg-white/50 rounded-[2.5rem] border border-white/60 shadow-xl overflow-hidden">
                  <div className="aspect-video w-full bg-slate-900 relative">
                    <iframe 
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/NGNTPlVtm1Q" 
                      title="Tutorial Penggunaan Aplikasi SIAP" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      referrerPolicy="strict-origin-when-cross-origin" 
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-8 space-y-4">
                    <h3 className="text-2xl font-black text-slate-800 font-display">Cara Menggunakan Aplikasi SIAP</h3>
                    <div className="space-y-3">
                      <p className="text-slate-600 leading-relaxed font-medium">
                        Video tutorial ini akan memandu Anda dalam menggunakan Aplikasi SIAP Spanju, mulai dari instalasi hingga penggunaan fitur-fitur utamanya:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex gap-3 text-slate-600 text-sm font-medium">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                          <span>Tautkan link aplikasi menggunakan akun belajar.id yang Anda miliki.</span>
                        </li>
                        <li className="flex gap-3 text-slate-600 text-sm font-medium">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                          <span>Salin link yang tertera di sidebar dan buka di browser perangkat lain (laptop/HP).</span>
                        </li>
                        <li className="flex gap-3 text-slate-600 text-sm font-medium">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                          <span>Pilih menu "Instal Aplikasi" atau "Tambahkan ke Layar Utama" pada browser Anda.</span>
                        </li>
                        <li className="flex gap-3 text-slate-600 text-sm font-medium">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs">4</div>
                          <span>Setelah terinstal, buka aplikasi dan klik tombol "Restore" untuk memuat data aplikasi.</span>
                        </li>
                        <li className="flex gap-3 text-slate-600 text-sm font-medium">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs">5</div>
                          <span>Pilih file backup (.json) yang telah diunduh sebelumnya. Aplikasi SIAP siap digunakan!</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-8">
                  <button 
                    onClick={() => setShowTutorial(false)}
                    className="px-10 py-4 bg-white text-slate-800 rounded-2xl font-black shadow-xl hover:scale-105 transition-all border border-black/5"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          ) : showPeta ? (
            <motion.div
              key="peta-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-1 flex flex-col glass rounded-[2rem] overflow-y-auto shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-white/40 p-12 scrollbar-hide"
            >
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-2xl shadow-indigo-100 mx-auto rotate-6 overflow-hidden p-2 mb-6">
                    <img 
                      src="https://iili.io/KDFk4fI.png" 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h2 className="text-5xl font-black text-slate-800 tracking-tight font-display leading-none">Peta Integrasi SIAP</h2>
                  <p className="text-lg font-black text-indigo-600 uppercase tracking-[0.3em]">Kaitan Aplikasi dengan Nilai 7KAIH</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* A. Terlambat Hadir */}
                  <div className="p-8 bg-white/50 rounded-[2.5rem] border border-white/60 shadow-xl space-y-6 flex flex-col">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                        <Calendar size={24} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 font-display">A. Aplikasi Siswa Terlambat Hadir</h3>
                    </div>
                    <div className="flex-1 space-y-4">
                      <ul className="space-y-2">
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                          Jumlah keterlambatan per bulan
                        </li>
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                          Kelas terbanyak & terendah
                        </li>
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                          Tindak lanjut (teguran, pembinaan, orang tua)
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                      <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">📌 Kaitan 7KAIH:</p>
                      <p className="text-sm font-bold text-rose-700">Kedisiplinan & Karakter</p>
                    </div>
                  </div>

                  {/* B. Izin Siswa */}
                  <div className="p-8 bg-white/50 rounded-[2.5rem] border border-white/60 shadow-xl space-y-6 flex flex-col">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <FileText size={24} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 font-display">B. Aplikasi Izin Siswa</h3>
                    </div>
                    <div className="flex-1 space-y-4">
                      <ul className="space-y-2">
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          Izin sakit / izin keluarga / tanpa keterangan
                        </li>
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          Validasi dokumen
                        </li>
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          Kepatuhan siswa
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">📌 Kaitan 7KAIH:</p>
                      <p className="text-sm font-bold text-emerald-700">Keteraturan & Kejujuran</p>
                    </div>
                  </div>

                  {/* C. BK Peduli Siswa */}
                  <div className="p-8 bg-white/50 rounded-[2.5rem] border border-white/60 shadow-xl space-y-6 flex flex-col">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Users size={24} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 font-display">C. Aplikasi BK Peduli Siswa</h3>
                    </div>
                    <div className="flex-1 space-y-4">
                      <ul className="space-y-2">
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          Jenis permasalahan siswa
                        </li>
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          Jumlah layanan konseling
                        </li>
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          Status penyelesaian kasus
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">📌 Kaitan 7KAIH:</p>
                      <p className="text-sm font-bold text-indigo-700">Karakter, Kemanusiaan, dan Kepedulian</p>
                    </div>
                  </div>

                  {/* D. SI-UKS */}
                  <div className="p-8 bg-white/50 rounded-[2.5rem] border border-white/60 shadow-xl space-y-6 flex flex-col">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                        <Activity size={24} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 font-display">D. Aplikasi SI-UKS</h3>
                    </div>
                    <div className="flex-1 space-y-4">
                      <ul className="space-y-2">
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                          Data siswa sakit
                        </li>
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                          Kunjungan UKS
                        </li>
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                          Edukasi kesehatan
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                      <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">📌 Kaitan 7KAIH:</p>
                      <p className="text-sm font-bold text-rose-700">Kesehatan & Kebersihan</p>
                    </div>
                  </div>

                  {/* E. SIM-Agama */}
                  <div className="p-8 bg-white/50 rounded-[2.5rem] border border-white/60 shadow-xl space-y-6 flex flex-col">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <Shield size={24} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 font-display">E. Aplikasi SIM-Agama</h3>
                    </div>
                    <div className="flex-1 space-y-4">
                      <ul className="space-y-2">
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          Kegiatan keagamaan siswa
                        </li>
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          Pembiasaan ibadah
                        </li>
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          Partisipasi siswa
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">📌 Kaitan 7KAIH:</p>
                      <p className="text-sm font-bold text-amber-700">Keimanan & Akhlak</p>
                    </div>
                  </div>

                  {/* F. SIPENA */}
                  <div className="p-8 bg-white/50 rounded-[2.5rem] border border-white/60 shadow-xl space-y-6 flex flex-col">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Book size={24} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 font-display">F. Aplikasi SIPENA</h3>
                    </div>
                    <div className="flex-1 space-y-4">
                      <ul className="space-y-2">
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          Jumlah kunjungan perpustakaan per bulan
                        </li>
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          Jumlah peminjaman dan pengembalian buku
                        </li>
                        <li className="flex gap-2 text-slate-600 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          Keterlambatan pengembalian dan tindak lanjut
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">📌 Kaitan 7KAIH:</p>
                      <p className="text-sm font-bold text-indigo-700">Kedisiplinan, Karakter, dan Gemar Belajar</p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-8">
                  <button 
                    onClick={() => setShowPeta(false)}
                    className="px-10 py-4 bg-white text-slate-800 rounded-2xl font-black shadow-xl hover:scale-105 transition-all border border-black/5"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          ) : showKilas ? (
            <motion.div
              key="kilas-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-1 flex flex-col glass rounded-[2rem] overflow-y-auto shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-white/40 p-12 scrollbar-hide"
            >
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-2xl shadow-indigo-100 mx-auto rotate-6 overflow-hidden p-2 mb-6">
                    <img 
                      src="https://iili.io/KDFk4fI.png" 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h2 className="text-5xl font-black text-slate-800 tracking-tight font-display leading-none">Kilas Aplikasi SIAP</h2>
                  <p className="text-lg font-black text-indigo-600 uppercase tracking-[0.3em]">Sistem Integrasi Aplikasi Pembinaan</p>
                </div>

                <div className="p-10 bg-white/50 rounded-[2.5rem] border border-white/60 shadow-xl space-y-6">
                  <h3 className="text-2xl font-black text-slate-800 font-display">Ringkasan SIAP Spanju</h3>
                  <p className="text-slate-600 leading-relaxed font-medium text-lg">
                    Penggunaan Aplikasi Pembinaan di SMP Negeri 7 Pasuruan sebagai upaya mendukung penanganan permasalahan siswa secara lebih efektif dan terintegrasi. 
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Aplikasi ini dimanfaatkan untuk mempermudah pendataan, pemantauan, dan tindak lanjut berbagai permasalahan siswa dengan mengedepankan pendekatan pembinaan yang edukatif, humanis, dan kolaboratif antara guru, wali kelas, guru BK, serta orang tua. 
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Melalui Aplikasi SIAP, sekolah berharap tercipta lingkungan belajar yang aman, tertib, dan kondusif guna mendukung tumbuh kembang karakter dan prestasi peserta didik.
                  </p>
                </div>

                <div className="space-y-8">
                  <h3 className="text-3xl font-black text-slate-800 font-display text-center">Daftar Aplikasi SIAP Spanju</h3>
                  
                  <div className="grid grid-cols-1 gap-8">
                    {/* Aplikasi Siswa Terlambat Hadir */}
                    <div className="p-8 bg-white/50 rounded-[2.5rem] border border-white/60 shadow-xl space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                          <Calendar size={24} />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 font-display">Aplikasi Siswa Terlambat Hadir</h4>
                      </div>
                      <div className="space-y-3">
                        <p className="font-black text-xs text-indigo-600 uppercase tracking-widest">Kegunaan:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            "Pendataan keterlambatan yang tertib dan akurat mencatat siswa terlambat secara sistematis sebagai data resmi sekolah.",
                            "Pemantauan disiplin siswa secara berkelanjutan mengetahui frekuensi keterlambatan siswa sebagai dasar pembinaan.",
                            "Dasar tindak lanjut layanan BK dan wali kelas menjadi acuan konseling, pembinaan disiplin, dan pemanggilan orang tua.",
                            "Meningkatkan kedisiplinan dan kesadaran siswa membiasakan siswa bertanggung jawab terhadap waktu hadir di sekolah.",
                            "Bahan evaluasi dan laporan sekolah."
                          ].map((item, i) => (
                            <li key={i} className="flex gap-3 text-slate-600 text-sm font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Aplikasi Izin Siswa */}
                    <div className="p-8 bg-white/50 rounded-[2.5rem] border border-white/60 shadow-xl space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <FileText size={24} />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 font-display">Aplikasi Izin Siswa</h4>
                      </div>
                      <div className="space-y-3">
                        <p className="font-black text-xs text-indigo-600 uppercase tracking-widest">Kegunaan:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            "Mencatat izin siswa secara resmi dan terdata memudahkan pendataan siswa izin sakit, izin keperluan keluarga, atau izin lainnya secara tertib dan terdokumentasi.",
                            "Memverifikasi alasan ketidakhadiran siswa aplikasi menjadi sarana unggah bukti pendukung sehingga izin dapat dipertanggungjawabkan.",
                            "Memudahkan pemantauan kehadiran siswa sekolah dapat membedakan antara siswa izin, sakit, dan tanpa keterangan sebagai dasar pembinaan.",
                            "Mendukung tindak lanjut wali kelas dan guru BK data izin menjadi rujukan dalam layanan konseling, pembinaan, dan komunikasi dengan orang tua.",
                            "Meningkatkan disiplin dan kejujuran siswa siswa terbiasa mengajukan izin secara tertib, jujur, dan sesuai prosedur sekolah.",
                            "Memperkuat komunikasi sekolah dan orang tua orang tua dapat terlibat langsung dalam proses pengajuan izin siswa.",
                            "Sebagai bahan evaluasi dan pelaporan sekolah data izin digunakan untuk laporan kehadiran, evaluasi bulanan, dan arsip administrasi sekolah."
                          ].map((item, i) => (
                            <li key={i} className="flex gap-3 text-slate-600 text-sm font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Aplikasi BK Peduli Siswa */}
                    <div className="p-8 bg-white/50 rounded-[2.5rem] border border-white/60 shadow-xl space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Users size={24} />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 font-display">Aplikasi BK Peduli Siswa</h4>
                      </div>
                      <div className="space-y-3">
                        <p className="font-black text-xs text-indigo-600 uppercase tracking-widest">Kegunaan:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            "Pendataan permasalahan siswa secara terintegrasi membantu mencatat berbagai permasalahan siswa secara sistematis dan rahasia.",
                            "Deteksi dini permasalahan siswa sekolah dapat mengidentifikasi potensi masalah siswa sejak dini sebelum berkembang menjadi lebih serius.",
                            "Mendukung layanan bimbingan dan konseling data dalam aplikasi menjadi dasar guru BK dalam memberikan layanan konseling yang tepat sasaran.",
                            "Memperkuat kolaborasi sekolah dan orang tua sarana komunikasi dan koordinasi antara sekolah, wali kelas, guru BK, dan orang tua.",
                            "Pendampingan siswa secara humanis dan edukatif mengedepankan pembinaan, empati, dan penguatan karakter positif.",
                            "Pemantauan tindak lanjut dan perkembangan siswa setiap langkah pembinaan dan hasil pendampingan dapat dipantau dan dievaluasi.",
                            "Sebagai bahan evaluasi dan pelaporan sekolah data aplikasi digunakan untuk evaluasi program BK, sekolah ramah anak, dan laporan administrasi."
                          ].map((item, i) => (
                            <li key={i} className="flex gap-3 text-slate-600 text-sm font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Aplikasi Si-UKS */}
                      <div className="p-6 bg-white/50 rounded-[2rem] border border-white/60 shadow-xl space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                          <Activity size={20} />
                        </div>
                        <h4 className="text-lg font-black text-slate-800 font-display">Aplikasi Si-UKS</h4>
                        <ul className="space-y-2">
                          {[
                            "Menertibkan administrasi UKS digital.",
                            "Pengelolaan UKS berbasis data.",
                            "Monitoring indikator UKS.",
                            "Layanan kesehatan berkualitas.",
                            "Bukti inovasi & praktik baik."
                          ].map((item, i) => (
                            <li key={i} className="flex gap-2 text-slate-600 text-xs font-medium">
                              <div className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Aplikasi SIM-AGAMA */}
                      <div className="p-6 bg-white/50 rounded-[2rem] border border-white/60 shadow-xl space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                          <Shield size={20} />
                        </div>
                        <h4 className="text-lg font-black text-slate-800 font-display">Aplikasi SIM-AGAMA</h4>
                        <ul className="space-y-2">
                          {[
                            "Pantau keaktifan keagamaan.",
                            "Konsistensi program agama.",
                            "Data akurat untuk pelaporan."
                          ].map((item, i) => (
                            <li key={i} className="flex gap-2 text-slate-600 text-xs font-medium">
                              <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Aplikasi SIPENA */}
                      <div className="p-6 bg-white/50 rounded-[2rem] border border-white/60 shadow-xl space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Book size={20} />
                        </div>
                        <h4 className="text-lg font-black text-slate-800 font-display">Aplikasi SIPENA</h4>
                        <ul className="space-y-2">
                          {[
                            "Pendataan buku perpustakaan.",
                            "Layanan pinjam-kembali cepat.",
                            "Meningkatkan minat baca siswa."
                          ].map((item, i) => (
                            <li key={i} className="flex gap-2 text-slate-600 text-xs font-medium">
                              <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-700" />
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-2xl font-black font-display tracking-tight">Filosofi SIAP Spanju</h3>
                    <p className="text-slate-300 leading-relaxed font-medium text-lg italic">
                      "Sekolah Sigap Menangani Permasalahan Siswa Secara Cepat dan Terdata"
                    </p>
                    <div className="h-px bg-white/10 w-full" />
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Platform ini bukan sekadar kumpulan tautan, melainkan pusat kendali pembinaan karakter yang mengedepankan kecepatan respon dan akurasi data demi masa depan siswa yang lebih baik.
                    </p>
                  </div>
                </div>
                
                <div className="text-center pt-8">
                  <button 
                    onClick={() => setShowKilas(false)}
                    className="px-10 py-4 bg-white text-slate-800 rounded-2xl font-black shadow-xl hover:scale-105 transition-all border border-black/5"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          ) : activeLink ? (
            <motion.div 
              key={activeLink.id}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="flex-1 flex flex-col glass rounded-[2rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-white/40"
            >
              {/* Toolbar */}
              <div className="h-16 bg-white/30 border-b border-white/20 flex items-center justify-between px-8 z-10 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeLink.color || 'from-indigo-500 to-blue-600'} flex items-center justify-center text-white shadow-xl shadow-black/10 bg-indigo-500`}>
                    {(() => {
                      const IconComponent = ICON_MAP[activeLink.icon] || Globe;
                      return <IconComponent size={20} />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-0.5 font-display">{activeLink.title}</h2>
                    <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase opacity-70">
                      {activeLink.url}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => setIsLoading(false), 1000);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-black/5"
                  >
                    <Settings size={18} />
                  </button>
                  <a 
                    href={activeLink.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`px-5 py-2.5 bg-gradient-to-r ${activeLink.color} text-white rounded-xl hover:brightness-110 transition-all flex items-center gap-2 text-xs font-black shadow-xl shadow-black/10 tracking-widest uppercase`}
                  >
                    <ExternalLink size={16} />
                    <span>Buka Penuh</span>
                  </a>
                </div>
              </div>

              {/* Iframe Container */}
              <div className="flex-1 bg-white/60 m-4 rounded-[1.5rem] shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden border border-black/5 relative group">
                {isLoading && (
                  <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-[4px] border-indigo-50 border-t-indigo-600 rounded-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={24} className="text-indigo-600 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-slate-800 tracking-tighter">Menyiapkan Aplikasi</p>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Sinkronisasi data...</p>
                    </div>
                  </div>
                )}
                
                <iframe
                  src={activeLink.url}
                  className="w-full h-full border-none"
                  title={activeLink.title}
                  sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin allow-storage-access-by-user-activation"
                />

                {/* Fallback Message */}
                <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100">
                  <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-6 rotate-3">
                    {(() => {
                      const IconComponent = ICON_MAP[activeLink.icon] || Globe;
                      return <IconComponent size={48} className="text-indigo-500" />;
                    })()}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Situs Memblokir Tampilan</h3>
                  <p className="text-slate-500 max-w-md mb-8 text-base font-medium leading-relaxed">
                    Beberapa situs web memiliki kebijakan keamanan yang melarang mereka dibuka di dalam dashboard.
                  </p>
                  <a 
                    href={activeLink.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`px-8 py-4 bg-gradient-to-r ${activeLink.color} text-white rounded-xl font-black text-base shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3`}
                  >
                    <ExternalLink size={20} />
                    BUKA DI TAB BARU
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-12 glass rounded-[2.5rem] flex flex-col items-center gap-6 border border-white/40 text-center max-w-xl"
              >
                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-indigo-100 rotate-6 overflow-hidden p-2">
                  <img 
                    src="https://iili.io/KDFk4fI.png" 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-2">
                  <h2 className="text-5xl font-black text-slate-800 tracking-tight font-display leading-none">SIAP</h2>
                  <p className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em]">Sistem Integrasi Aplikasi Pembinaan</p>
                  <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto rounded-full my-4" />
                  <p className="text-slate-500 text-base font-medium max-w-md mx-auto leading-relaxed">
                    Sekolah Sigap Menangani Permasalahan Siswa Secara Cepat dan Terdata
                  </p>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-2xl shadow-indigo-200 hover:scale-105 transition-all font-black text-base"
                >
                  Tambah Aplikasi Pertama
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl w-full max-w-lg p-8 border border-white/50"
            >
              <h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tight font-display">Tambah Aplikasi Baru</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nama Aplikasi</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Dashboard Kerja"
                    value={newApp.title}
                    onChange={(e) => setNewApp({...newApp, title: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-slate-100 focus:border-indigo-500 focus:outline-none transition-all text-sm font-bold shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Alamat URL</label>
                  <input 
                    type="text" 
                    placeholder="https://app.anda.com"
                    value={newApp.url}
                    onChange={(e) => setNewApp({...newApp, url: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-slate-100 focus:border-indigo-500 focus:outline-none transition-all text-sm font-bold shadow-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Pilih Ikon</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {Object.keys(ICON_MAP).map((iconName) => {
                        const Icon = ICON_MAP[iconName];
                        return (
                          <button
                            key={iconName}
                            onClick={() => setNewApp({...newApp, icon: iconName})}
                            className={`p-1.5 rounded-lg border-2 transition-all flex items-center justify-center ${newApp.icon === iconName ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 bg-white hover:border-slate-200'}`}
                          >
                            <Icon size={14} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Warna Tema</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {APP_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewApp({...newApp, color})}
                          className={`h-8 rounded-lg bg-gradient-to-br ${color} transition-all ${newApp.color === color ? 'ring-2 ring-offset-1 ring-indigo-500 scale-105 shadow-md' : 'opacity-60 hover:opacity-100'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Mode Tampilan</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setNewApp({...newApp, displayMode: 'iframe'})}
                        className={`p-3 rounded-xl border-2 transition-all text-xs font-black flex flex-col items-center gap-1.5 ${newApp.displayMode === 'iframe' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-100 text-slate-400 bg-white'}`}
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </button>
                      <button
                        onClick={() => setNewApp({...newApp, displayMode: 'new_tab'})}
                        className={`p-3 rounded-xl border-2 transition-all text-xs font-black flex flex-col items-center gap-1.5 ${newApp.displayMode === 'new_tab' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-100 text-slate-400 bg-white'}`}
                      >
                        <ExternalLink size={16} />
                        Tab Baru
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-base transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={addLink}
                    className="flex-1 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-black text-base shadow-2xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                  >
                    Simpan App
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
