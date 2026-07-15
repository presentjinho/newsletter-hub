import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { Preferences } from '../types';

interface PreferenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interests: string[], prefs: Preferences) => void;
  currentInterests: string[];
  currentPrefs: Preferences;
  availableInterests: string[];
}

export default function PreferenceDialog({
  isOpen,
  onClose,
  onSave,
  currentInterests,
  currentPrefs,
  availableInterests
}: PreferenceDialogProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<Preferences['frequency']>('all');
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedInterests(currentInterests);
      setFrequency(currentPrefs.frequency);
      setPaused(currentPrefs.paused);
    }
  }, [isOpen, currentInterests, currentPrefs]);

  if (!isOpen) return null;

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length < 3) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedInterests, { frequency, paused });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/55 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#f6f0e3] dark:bg-[var(--surface)] text-ink border border-line-alpha p-8 md:p-10 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-ink/5 dark:hover:bg-white/5 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5 text-secondary" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-xs font-bold tracking-wider text-forest-green dark:text-[var(--green)]">
          <Settings className="w-4 h-4 text-accent-red" />
          <span>YOUR PREFERENCE CENTER</span>
        </div>

        <h2 className="font-serif text-3xl tracking-tight leading-tight mb-4 text-ink">
          받는 부담은<br />내가 정해요.
        </h2>

        <p className="text-xs text-secondary mb-6 leading-relaxed">
          이 설정은 브라우저에 저장되어 추천과 정렬에만 맞춤 적용됩니다.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interests */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest-green dark:text-[var(--green)] mb-3">
              관심 분야 (최대 3개)
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map(interest => {
                const isChecked = selectedInterests.includes(interest);
                const isDisabled = !isChecked && selectedInterests.length >= 3;
                return (
                  <label
                    key={interest}
                    className={`
                      px-3 py-1.5 text-xs font-medium border cursor-pointer select-none transition-all duration-200
                      ${isChecked
                        ? 'chip-active border'
                        : 'border-line-alpha hover:border-ink dark:hover:border-white text-ink'
                      }
                      ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() => handleInterestToggle(interest)}
                    />
                    {interest}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest-green dark:text-[var(--green)] mb-3">
              선호 발행 빈도
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {[
                { label: '상관없음', value: 'all' },
                { label: '매일', value: 'daily' },
                { label: '주 1회', value: 'weekly' },
                { label: '가끔만', value: 'occasional' }
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`
                    flex-1 min-w-[80px] p-2.5 text-center text-xs font-medium border cursor-pointer select-none transition-all duration-200
                    ${frequency === opt.value
                      ? 'chip-active border'
                      : 'border-line-alpha hover:border-ink dark:hover:border-white text-ink'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="pref-frequency"
                    className="sr-only"
                    value={opt.value}
                    checked={frequency === opt.value}
                    onChange={() => setFrequency(opt.value as Preferences['frequency'])}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Pause */}
          <div className="pt-2 border-t border-line-alpha">
            <label className="flex items-center gap-3 text-xs font-medium text-ink cursor-pointer select-none">
              <input
                type="checkbox"
                checked={paused}
                onChange={(e) => setPaused(e.target.checked)}
                className="w-4 h-4 accent-accent-red"
              />
              <span>관심사 추천 잠시 멈추기 (홈 화면에서 숨김)</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 text-center font-bold text-xs text-white bg-accent-red hover:bg-accent-red/90 transition-all duration-200"
          >
            설정 저장 및 반영
          </button>
        </form>
      </div>
    </div>
  );
}
