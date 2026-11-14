import React, { useState } from 'react';
import { FeudQuestion } from '../types/game';
import { Sparkles, X, Loader2, MessageSquare, AlertCircle } from 'lucide-react';

interface CustomDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (newQuestion: FeudQuestion) => void;
}

const PRESET_TOPICS = [
  'Leaving lights on in empty rooms',
  'Who walks the dog in the cold rain',
  'Disagreement over how to load the dishwasher',
  'Arriving late vs arriving 15 minutes early',
  'Picking a movie on Netflix for 45 minutes',
  'Thermostat temperature setting (AC vs Heat)',
];

export const CustomDisputeModal: React.FC<CustomDisputeModalProps> = ({
  isOpen,
  onClose,
  onAddQuestion,
}) => {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (selectedTopic?: string) => {
    const topicToUse = selectedTopic || topic;
    if (!topicToUse.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-feud-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse.trim(),
          context: context.trim() || 'Everyday couple or friend disagreement',
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const raw = json.data;
        const newQ: FeudQuestion = {
          id: raw.id || `custom_${Date.now()}`,
          category: 'Custom Dispute',
          question: raw.question,
          counselorTip: raw.counselorTip,
          answers: (raw.answers || []).map((a: { text: string; points: number; synonyms?: string[] }, i: number) => ({
            id: `ans_${Date.now()}_${i}`,
            text: a.text,
            points: a.points || 15,
            synonyms: a.synonyms || [],
            isRevealed: false,
          })),
        };

        onAddQuestion(newQ);
        onClose();
      } else {
        throw new Error(json.error || 'Failed to generate question');
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        'Could not generate with AI. You can still use the rich built-in question library or try again!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl p-6 sm:p-7">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Our Real Argument AI</h3>
            <p className="text-xs text-slate-400">
              Turn your actual conflict or pet peeve into an instant Feud round!
            </p>
          </div>
        </div>

        <div className="space-y-4 my-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              What dispute or argument do you want to resolve?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. He leaves wet towels on the floor..."
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Or pick an infamous couple debate:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTopic(t);
                    handleGenerate(t);
                  }}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-amber-400/50 transition-colors cursor-pointer"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Extra context (optional):
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. We have been living together for 2 years and it happens every Friday"
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-500 leading-tight">
            🛡️ <strong>Google Play Safety Policy:</strong> Content promoting harassment, hate speech, or explicit themes is strictly prohibited. Generated scenarios are subject to in-app user flagging and developer moderation.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={!topic.trim() || isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Surveying 100 Counselors...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Feud Board</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
