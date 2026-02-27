import { useState, KeyboardEvent } from 'react';
import { Send } from '@/components/ui/icons';

interface AskAcquizitorBubbleProps {
  onSubmit: (question: string) => void;
}

export function AskAcquizitorBubble({ onSubmit }: AskAcquizitorBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const isExpanded = isHovered || isFocused || inputValue.length > 0;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <>
      {/* Orange arc glow above the bubble */}
      <div
        className="fixed z-40 pointer-events-none"
        style={{
          bottom: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '120px',
          background: 'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(255, 71, 22, 0.25) 0%, rgba(255, 71, 22, 0.1) 40%, transparent 70%)',
          filter: 'blur(25px)',
        }}
      />
      
      {/* Bottom shadow/blur effect */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        style={{
          width: '600px',
          height: '150px',
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 50%, transparent 100%)',
          filter: 'blur(15px)',
        }}
      />
      
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed bottom-6 left-1/2 -translate-x-1/2 z-50
          flex items-center
          rounded-2xl
          transition-all duration-300 ease-out
          cursor-text
          ${isExpanded ? 'w-[480px] h-[64px]' : 'w-[320px] h-[56px]'}
        `}
        style={{
          background: '#0a0a0a',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 10px 30px rgba(0, 0, 0, 0.7), 0 4px 16px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Gradient border glow - card-fade-border style orange from top */}
        <span
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            padding: '1.5px',
            background: 'linear-gradient(150deg, rgba(255, 71, 22, 0.5) 0%, rgba(255, 71, 22, 0.2) 35%, transparent 65%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
        
        {/* Inner glow fill - orange from top fading down */}
        <span
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(150deg, rgba(255, 71, 22, 0.12) 0%, rgba(255, 71, 22, 0.04) 30%, transparent 55%)',
          }}
        />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-between w-full px-5 h-full">
        <input
          type="text"
          placeholder="Ask AI"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className={`
            flex-1 bg-transparent border-none outline-none
            text-foreground placeholder:text-muted-foreground
            font-['Inter'] font-normal
            transition-all duration-300
            ${isExpanded ? 'text-base' : 'text-sm'}
          `}
        />
        
        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
          className={`
            flex items-center justify-center rounded-full
            transition-all duration-300
            w-8 h-8
            ${inputValue.trim() 
              ? 'bg-white text-black hover:bg-white/90' 
              : 'bg-muted/60 text-muted-foreground cursor-not-allowed'
            }
          `}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      </div>
    </>
  );
}
