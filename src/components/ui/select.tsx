'use client';

/**
 * Custom Select Component
 *
 * 세련된 드롭다운 셀렉트 컴포넌트
 * - 부드러운 애니메이션
 * - 커스텀 스타일링
 * - 접근성 지원
 */

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'violet' | 'teal';
}

export function Select({
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  disabled = false,
  className,
  variant = 'default',
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // 외부 클릭 감지
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = options.findIndex(opt => opt.value === value);
          const nextIndex = Math.min(currentIndex + 1, options.length - 1);
          onChange(options[nextIndex].value);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          const currentIndex = options.findIndex(opt => opt.value === value);
          const prevIndex = Math.max(currentIndex - 1, 0);
          onChange(options[prevIndex].value);
        }
        break;
    }
  };

  const variantStyles = {
    default: {
      focus: 'focus:border-[#94A3B8] focus:ring-[#94A3B8]/20',
      selected: 'bg-gray-50',
      check: 'text-gray-600',
    },
    violet: {
      focus: 'focus:border-violet-500 focus:ring-violet-500/20',
      selected: 'bg-violet-50',
      check: 'text-violet-600',
    },
    teal: {
      focus: 'focus:border-teal-500 focus:ring-teal-500/20',
      selected: 'bg-teal-50',
      check: 'text-teal-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div ref={selectRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'w-full h-12 px-4 text-left',
          'bg-white border border-[#E8E2D9] rounded-xl',
          'flex items-center justify-between gap-2',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2',
          styles.focus,
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          !disabled && 'cursor-pointer hover:border-[#CBD5E1]',
          isOpen && 'ring-2 border-transparent shadow-lg'
        )}
      >
        <span className={cn(
          'truncate text-sm',
          selectedOption ? 'text-[#1E293B]' : 'text-[#94A3B8]'
        )}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[#94A3B8] transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          'absolute z-50 w-full mt-2',
          'bg-white border border-[#E8E2D9] rounded-xl',
          'shadow-xl shadow-black/5',
          'overflow-hidden',
          'transition-all duration-200 ease-out origin-top',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        )}
        role="listbox"
      >
        <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm',
                  'flex items-center justify-between gap-2',
                  'transition-colors duration-100',
                  'focus:outline-none',
                  isSelected
                    ? cn(styles.selected, 'font-medium')
                    : 'hover:bg-gray-50',
                  index === 0 && 'rounded-t-lg',
                  index === options.length - 1 && 'rounded-b-lg'
                )}
              >
                <span className="flex items-center gap-2 truncate text-[#1E293B]">
                  {option.icon}
                  {option.label}
                </span>
                {isSelected && (
                  <Check className={cn('w-4 h-4 flex-shrink-0', styles.check)} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 간편한 사용을 위한 래퍼 컴포넌트들
export function VioletSelect(props: Omit<SelectProps, 'variant'>) {
  return <Select {...props} variant="violet" />;
}

export function TealSelect(props: Omit<SelectProps, 'variant'>) {
  return <Select {...props} variant="teal" />;
}
