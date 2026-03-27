'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileType,
  CheckCircle2,
  Loader2,
  Sparkles,
  X,
  Image as ImageIcon,
  Layers,
  ChevronRight,
} from 'lucide-react';

/* ---------- types & constants ---------- */

interface FileWithStatus {
  file: { name: string; size: number };
  id: string;
  status: 'pending' | 'sorting' | 'completed';
  category?: string;
}

const CATEGORIES = ['Portraits', 'Ceremony', 'Reception', 'Details', 'Family', 'Candid'];

/* ---------- mock seed data (shown on first load so the page isn't empty) ---------- */
const MOCK_FILES: FileWithStatus[] = [
  { file: { name: 'DSC_4821.NEF', size: 28_340_000 }, id: 'mock1', status: 'pending' },
  { file: { name: 'DSC_4822.NEF', size: 27_120_000 }, id: 'mock2', status: 'pending' },
  { file: { name: 'IMG_0091.CR2', size: 31_500_000 }, id: 'mock3', status: 'pending' },
  { file: { name: 'IMG_0092.CR2', size: 29_800_000 }, id: 'mock4', status: 'pending' },
  { file: { name: 'ceremony_wide.jpg', size: 8_420_000 }, id: 'mock5', status: 'pending' },
];

/* ---------- component ---------- */

export default function AISortPage() {
  const [files, setFiles] = useState<FileWithStatus[]>(MOCK_FILES);
  const [isSorting, setIsSorting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- handlers ---- */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsDone(false);
      const newFiles: FileWithStatus[] = Array.from(e.target.files).map((f) => ({
        file: { name: f.name, size: f.size },
        id: Math.random().toString(36).substring(2, 11),
        status: 'pending' as const,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const startSorting = () => {
    if (files.length === 0) return;
    setIsSorting(true);
    setIsDone(false);
    setProgress(0);

    let currentFileIndex = 0;
    const totalFiles = files.length;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (totalFiles * 5);
        if (next >= 100) {
          clearInterval(interval);
          setIsSorting(false);
          setIsDone(true);
          setCurrentAction('Sorting Complete');
          // mark all remaining as completed
          setFiles((prev) =>
            prev.map((f) => ({
              ...f,
              status: 'completed' as const,
              category: f.category || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
            })),
          );
          return 100;
        }
        return next;
      });

      if (Math.random() > 0.7 && currentFileIndex < totalFiles) {
        setFiles((prev) => {
          const updated = [...prev];
          if (updated[currentFileIndex]) {
            updated[currentFileIndex] = {
              ...updated[currentFileIndex],
              status: 'completed',
              category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
            };
          }
          return updated;
        });
        currentFileIndex++;
        setCurrentAction(`Analyzing ${files[currentFileIndex]?.file.name || 'assets'}...`);
      }
    }, 200);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isSorting) return;
    setIsDone(false);
    const droppedFiles: FileWithStatus[] = Array.from(e.dataTransfer.files).map((f) => ({
      file: { name: f.name, size: f.size },
      id: Math.random().toString(36).substring(2, 11),
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  /* ---- render ---- */

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface italic flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Neural Sort
        </h2>
        <p className="text-on-surface-variant font-body mt-2">
          Upload RAW or JPEG assets to automatically categorize your shoot using computer vision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========== Left: Upload & Progress ========== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={[
              'relative border-2 border-dashed border-outline-variant/20 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group overflow-hidden',
              isSorting
                ? 'pointer-events-none opacity-50'
                : 'hover:border-primary/40 hover:bg-primary/5',
            ].join(' ')}
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-headline font-bold text-on-surface">
                Drop RAW/JPEG files here
              </p>
              <p className="text-sm text-on-surface-variant/60">
                or click to browse your local storage
              </p>
            </div>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".jpg,.jpeg,.raw,.cr2,.nef"
            />

            {/* Decorative SVG neural network background */}
            <div className="absolute inset-0 z-[-1] opacity-5 text-on-surface">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 200 100"
                preserveAspectRatio="none"
              >
                <path d="M0,50 Q25,0 50,50 T100,50 T150,50 T200,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0,30 Q25,80 50,30 T100,30 T150,30 T200,30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0,70 Q25,20 50,70 T100,70 T150,70 T200,70" fill="none" stroke="currentColor" strokeWidth="0.5" />
                {/* nodes */}
                <circle cx="25" cy="25" r="2" fill="currentColor" opacity="0.3" />
                <circle cx="75" cy="50" r="2" fill="currentColor" opacity="0.3" />
                <circle cx="125" cy="35" r="2" fill="currentColor" opacity="0.3" />
                <circle cx="175" cy="65" r="2" fill="currentColor" opacity="0.3" />
                <circle cx="50" cy="70" r="1.5" fill="currentColor" opacity="0.2" />
                <circle cx="100" cy="20" r="1.5" fill="currentColor" opacity="0.2" />
                <circle cx="150" cy="80" r="1.5" fill="currentColor" opacity="0.2" />
                {/* connecting lines */}
                <line x1="25" y1="25" x2="75" y2="50" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
                <line x1="75" y1="50" x2="125" y2="35" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
                <line x1="125" y1="35" x2="175" y2="65" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
                <line x1="50" y1="70" x2="100" y2="20" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
                <line x1="100" y1="20" x2="150" y2="80" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
              </svg>
            </div>
          </div>

          {/* Processing state */}
          {isSorting && (
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold mb-1">
                    Neural Processing
                  </p>
                  <h3 className="text-xl font-headline font-bold text-on-surface">
                    {currentAction || 'Initializing Sort...'}
                  </h3>
                </div>
                <p className="text-2xl font-mono font-bold text-primary">
                  {Math.round(progress)}%
                </p>
              </div>

              {/* Progress bar with animated gradient */}
              <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ffb780] to-[#d48441] rounded-full transition-all duration-200 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant/60 uppercase tracking-widest">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Analyzing Metadata
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant/60 uppercase tracking-widest">
                  <Layers className="w-3 h-3" />
                  Clustering Patterns
                </div>
              </div>
            </div>
          )}

          {/* Complete state */}
          <div
            className={[
              'bg-secondary/10 p-8 rounded-3xl border border-secondary/20 flex items-center justify-between transition-all duration-500',
              isDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none h-0 p-0 border-0 overflow-hidden',
            ].join(' ')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-bold text-secondary">
                  Categorization Complete
                </h3>
                <p className="text-sm text-secondary/60">
                  {files.length} assets sorted into {new Set(files.map((f) => f.category).filter(Boolean)).size} neural clusters.
                </p>
              </div>
            </div>
            <button className="px-8 py-3 bg-secondary text-on-secondary rounded-xl font-headline font-bold uppercase tracking-tight shadow-lg hover:shadow-secondary/20 transition-all flex items-center gap-2">
              View Full Gallery
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Start sorting CTA */}
          {files.length > 0 && !isSorting && !isDone && (
            <div className="flex justify-end">
              <button
                onClick={startSorting}
                className="px-8 py-3 bg-gradient-to-br from-[#ffb780] to-[#d48441] text-on-primary rounded-xl font-headline font-bold uppercase tracking-tight shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Begin AI Categorization
              </button>
            </div>
          )}
        </div>

        {/* ========== Right: Processing Queue Sidebar ========== */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden flex flex-col h-[600px]">
            {/* Queue header */}
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50 backdrop-blur-md sticky top-0 z-10">
              <h3 className="text-lg font-headline font-bold text-on-surface">Processing Queue</h3>
              <span className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">
                {files.length} Assets
              </span>
            </div>

            {/* Queue list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/40 gap-4">
                  <ImageIcon className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-headline italic">No assets in queue</p>
                </div>
              ) : (
                files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/5 group transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                        <FileType className="w-5 h-5 text-on-surface-variant/40" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-headline font-bold truncate text-on-surface">
                          {f.file.name}
                        </p>
                        <p className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-widest">
                          {(f.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {f.status === 'completed' ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-mono font-bold uppercase tracking-widest rounded-md">
                            {f.category}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-secondary" />
                        </div>
                      ) : isSorting ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      ) : (
                        <button
                          onClick={() => removeFile(f.id)}
                          className="p-1 hover:bg-tertiary/10 hover:text-tertiary rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
