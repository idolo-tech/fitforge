/* FitForge — icônes minimalistes (stroke 1.5) */
import type { CSSProperties, ReactNode } from 'react';

export type IconName =
  | 'home' | 'program' | 'journal' | 'profile' | 'pause' | 'close' | 'check'
  | 'chevronR' | 'chevronL' | 'chevronD' | 'plus' | 'minus' | 'play' | 'flame'
  | 'timer' | 'share' | 'camera' | 'settings' | 'dumbbell' | 'arrowUp'
  | 'arrowDown' | 'swap' | 'moon' | 'download' | 'edit';

interface FFIconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

export function FFIcon({ name, size = 22, color = 'currentColor', strokeWidth = 1.6, style }: FFIconProps) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /></>,
    program: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9.5h16M8 3v4M16 3v4" /></>,
    journal: <><path d="M5 19V10M10.5 19V5.5M16 19v-7M21 19H3" /></>,
    profile: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20c1.2-3.4 3.8-5 7-5s5.8 1.6 7 5" /></>,
    pause: <><path d="M9 5v14M15 5v14" /></>,
    close: <><path d="M6 6l12 12M18 6L6 18" /></>,
    check: <><path d="M5 12.5l4.5 4.5L19 7.5" /></>,
    chevronR: <><path d="M9 5l7 7-7 7" /></>,
    chevronL: <><path d="M15 5l-7 7 7 7" /></>,
    chevronD: <><path d="M5 9l7 7 7-7" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <><path d="M5 12h14" /></>,
    play: <><path d="M8 5.5v13l11-6.5z" /></>,
    flame: <><path d="M12 3c1 3-4 5-4 10a4 4 0 008 0c0-2-1-3.5-1.5-4.5C14 10 12.8 11 13 13" /></>,
    timer: <><circle cx="12" cy="13" r="7.5" /><path d="M12 9.5V13l2.5 2M9.5 3h5" /></>,
    share: <><circle cx="6" cy="12" r="2.4" /><circle cx="17" cy="6" r="2.4" /><circle cx="17" cy="18" r="2.4" /><path d="M8.2 10.9l6.6-3.8M8.2 13.1l6.6 3.8" /></>,
    camera: <><rect x="3" y="7" width="18" height="13" rx="2.5" /><circle cx="12" cy="13.5" r="3.6" /><path d="M8.5 7L10 4.5h4L15.5 7" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" /></>,
    dumbbell: <><path d="M7 8v8M17 8v8M4 9.5v5M20 9.5v5M7 12h10" /></>,
    arrowUp: <><path d="M12 19V5M6 11l6-6 6 6" /></>,
    arrowDown: <><path d="M12 5v14M6 13l6 6 6-6" /></>,
    swap: <><path d="M7 4v12M7 4L4 7M7 4l3 3M17 20V8M17 20l3-3M17 20l-3-3" /></>,
    moon: <><path d="M19 14A8 8 0 1110 5a6.5 6.5 0 009 9z" /></>,
    download: <><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></>,
    edit: <><path d="M4 20h4L18.5 9.5l-4-4L4 16v4z" /><path d="M13 7l4 4" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {paths[name] || <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
