'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function QuestionnaireBuilderError({ error, reset }: ErrorProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#030305' }}
    >
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Failed to load builder</h2>
        <p className="text-sm text-white/50 mb-6">
          {error.message || 'Something went wrong loading the Questionnaire Builder.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #EC4899, #A855F7)' }}
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
