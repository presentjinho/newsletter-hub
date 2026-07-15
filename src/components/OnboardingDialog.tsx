import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface OnboardingDialogProps {
  isOpen: boolean;
  onClose: (interests: string[]) => void;
  availableInterests: string[];
}

export default function OnboardingDialog({ isOpen, onClose, availableInterests }: OnboardingDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleToggle = (interest: string) => {
    if (selected.includes(interest)) {
      setSelected(selected.filter(i => i !== interest));
    } else {
      if (selected.length < 3) {
        setSelected([...selected, interest]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/55 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#f6f0e3] dark:bg-[#22332b] text-ink border border-line-alpha p-8 md:p-10 shadow-2xl relative animate-fade-in">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold tracking-wider text-forest-green dark:text-green-300">
          <Sparkles className="w-4 h-4 text-accent-red" />
          <span>FIRST, A QUICK PICK</span>
        </div>
        
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight mb-4 text-ink">
          어떤 편지를<br />기다리나요?
        </h2>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
          관심사 1~3개를 고르면, 먼저 볼 5개의 뉴스레터를 추천해 드릴게요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-wrap gap-2.5 my-6">
            {availableInterests.map(interest => {
              const isChecked = selected.includes(interest);
              const isDisabled = !isChecked && selected.length >= 3;
              return (
                <label
                  key={interest}
                  className={`
                    px-4 py-2.5 text-sm font-medium border cursor-pointer select-none transition-all duration-200
                    ${isChecked 
                      ? 'bg-ink text-white border-ink dark:bg-white dark:text-ink dark:border-white' 
                      : 'border-line-alpha hover:border-ink dark:hover:border-white text-ink'
                    }
                    ${isDisabled ? 'opacity-40 cursor-not-allowed hover:border-line-alpha' : ''}
                  `}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => handleToggle(interest)}
                  />
                  {interest}
                </label>
              );
            })}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={selected.length === 0}
              className={`
                w-full py-4 text-center font-bold text-sm text-white bg-accent-red hover:bg-accent-red/90 transition-all duration-200 flex items-center justify-center gap-4
                ${selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span>나를 위한 편지 보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onClose([])}
              className="w-full text-center text-xs text-gray-500 hover:text-ink dark:text-gray-400 dark:hover:text-white underline py-2 cursor-pointer"
            >
              건너뛰기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
