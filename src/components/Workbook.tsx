import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const PW = 380; // Page Width
const PH = 540; // Page Height
const PD = 24;  // Page Depth (Thickness of the book block)
const CO = 6;   // Cover Overhang

interface PageContent {
  chapterLabel: string;
  heading: string;
  body: string[];
  pageNumber: number;
}

interface SheetData {
  front: PageContent;
  back: PageContent;
}

const SHEETS: SheetData[] = [
  {
    front: { chapterLabel: '', heading: '', body: [], pageNumber: 0 },
    back: {
      chapterLabel: 'Welcome', heading: 'Introduction',
      body: [
        'Welcome to your MINE workbook. This is your personal space for discovery, reflection, and growth. Over the following pages, you will journey through a carefully crafted process.',
        'This workbook combines structured exercises with open-ended reflection. Each module builds upon the last, creating a comprehensive map of your inner landscape.',
        'Set aside dedicated time for these exercises. Find a quiet space, grab your favorite pen, and approach each prompt with curiosity rather than judgment.',
      ], pageNumber: 1,
    },
  },
  {
    front: {
      chapterLabel: 'Getting Started', heading: 'How to Use This Book',
      body: [
        'Daily Prompts: Each module contains daily reflection prompts designed to be completed in 10-15 minutes. Set a consistent time each day.',
        'Progress Tracking: Use the progress tracker at the end of this workbook to mark completed exercises. Visualizing your journey helps maintain momentum.',
        'Reflection Exercises: Deeper exercises appear throughout each module. These require 30-45 minutes of focused attention.',
      ], pageNumber: 2,
    },
    back: {
      chapterLabel: 'Module One', heading: 'Discover',
      body: [
        'The first step in any meaningful journey is understanding where you begin. This module focuses on uncovering your core values, motivations, and the underlying patterns that shape your decisions.',
        'Discovery is not about judgment — it is about awareness. You will explore what drives you, what drains you, and what remains when you strip away external expectations.',
        'Through a series of guided exercises, you will begin to map the terrain of your inner world. Be honest, be curious, and above all, be gentle with yourself.',
      ], pageNumber: 3,
    },
  },
  {
    front: {
      chapterLabel: 'Exercise', heading: 'Value Mapping',
      body: [
        'List the ten values that resonate most deeply with you. Do not overthink — write what comes to mind. Examples: authenticity, freedom, creativity, connection, growth.',
        'Narrow your list to five. Ask yourself: "If I could only honor five of these for the rest of my life, which would they be?"',
        'For each of your top five values, write one specific way you honored it this week, and one way you neglected it. Patterns will begin to emerge.',
      ], pageNumber: 4,
    },
    back: {
      chapterLabel: 'Module Two', heading: 'Define',
      body: [
        'With clarity about your values, the next step is setting clear intentions and boundaries. Definition creates structure — and structure creates freedom.',
        'This module explores the art of saying yes to what matters and no to what does not. You will examine where your time and energy currently flow.',
        'Boundaries are not walls — they are the edges that give shape to your life. With them, your priorities become visible and actionable.',
      ], pageNumber: 5,
    },
  },
  {
    front: {
      chapterLabel: 'Exercise', heading: 'Boundary Setting',
      body: [
        'Identify three areas of your life where you feel overstretched. For each area, describe what a healthy boundary would look like.',
        'Write a practice script for communicating one of these boundaries. Start with: "I have realized I need to..." Keep it kind, clear, and firm.',
        'Reflect on what prevents you from setting this boundary. Name the fear, then write a sentence that acknowledges it and moves forward.',
      ], pageNumber: 6,
    },
    back: {
      chapterLabel: 'Module Three', heading: 'Design',
      body: [
        'Now that you know what matters and where your boundaries lie, it is time to design a life that reflects both. This module is about creation.',
        'Design thinking applies to life just as it does to products. You will prototype different approaches, test small experiments, and iterate.',
        'Your design does not need to be perfect. It needs to be honest, flexible, and aligned with your values. Small adjustments create profound change.',
      ], pageNumber: 7,
    },
  },
  {
    front: {
      chapterLabel: 'Exercise', heading: 'Vision Board',
      body: [
        'Close your eyes and imagine your ideal day three years from now. Not a vacation day — a regular Tuesday. Where are you? Who is around you?',
        'Write a detailed description of this day. Include sensory details: the light in the room, the sounds around you, the feeling in your body.',
        'Now identify three small actions you can take this week that move you toward this vision. Progress is built one step at a time.',
      ], pageNumber: 8,
    },
    back: {
      chapterLabel: 'Module Four', heading: 'Develop',
      body: [
        'Design without implementation is just a wish. This final module focuses on building sustainable habits and routines that bring your blueprint to life.',
        'You will explore habit stacking — layering new behaviors onto existing ones — and create systems for consistency.',
        'Development is a long game. The goal is not perfection but persistence. You will learn to treat setbacks as data rather than failures.',
      ], pageNumber: 9,
    },
  },
  {
    front: {
      chapterLabel: 'Exercise', heading: 'Habit Stacking',
      body: [
        'Choose one habit you already have — something automatic like brushing your teeth, drinking morning coffee. This is your anchor.',
        'Now choose one new habit you want to build. Write it in this format: "After I [anchor habit], I will [new habit] for [time period]."',
        'Track this stack for seven days. Note what makes it easier and what gets in the way. Adjust until it feels automatic.',
      ], pageNumber: 10,
    },
    back: {
      chapterLabel: 'Review', heading: 'Progress Tracker',
      body: [
        'Module 1 — Discover: Core values identified and prioritized. Reflection on alignment completed.',
        'Module 2 — Define: Key boundaries established and communicated. Overcommitment patterns recognized.',
        'Module 3 — Design: Personal blueprint drafted. Three-year vision articulated.',
        'Module 4 — Develop: Habit stack created and tracked. Progress metrics baseline recorded.',
      ], pageNumber: 11,
    },
  },
  {
    front: {
      chapterLabel: 'Reflection', heading: 'Closing Thoughts',
      body: [
        'Remember: this workbook is a living document, not a finished product. The insights you have gained are seeds — they need ongoing attention to grow.',
        'The work you have done here matters. In a world that constantly pulls your attention outward, taking time to look inward is a radical act.',
        'Close this book knowing that the most important journey is the one within. You are already exactly where you need to be.',
      ], pageNumber: 12,
    },
    back: { chapterLabel: '', heading: '', body: [], pageNumber: 0 },
  },
];

const TOTAL_SPREADS = SHEETS.length; 

type BookState = 'closed' | 'opening' | 'open' | 'flipping-forward' | 'flipping-back' | 'closing';

/* ============================================================
   PAGE CONTENT VIEW
   ============================================================ */
function PageContentView({ content, isRightSide }: { content: PageContent | null; isRightSide?: boolean }) {
  if (!content || (!content.heading && !content.chapterLabel && content.body.length === 0)) {
    return (
      <div style={{ padding: '40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8' }}>
        <div style={{ width: 60, height: 1, background: '#D5CDB8' }} />
      </div>
    );
  }
  return (
    <div style={{ padding: isRightSide ? '40px 32px 40px 24px' : '40px 24px 40px 32px', height: '100%', display: 'flex', flexDirection: 'column', color: '#1A1A1A', background: '#F5F0E8' }}>
      {content.chapterLabel && <div style={{ fontFamily: '"Inter",sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8A97E', marginBottom: 12 }}>{content.chapterLabel}</div>}
      {content.heading && <h2 style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: 30, fontWeight: 600, letterSpacing: '0.02em', color: '#1A1A1A', margin: '0 0 20px 0', lineHeight: 1.1 }}>{content.heading}</h2>}
      <div style={{ width: 40, height: 2, background: '#D5CDB8', margin: '20px 0 28px 0' }} />
      {content.body.map((p, i) => <p key={i} style={{ fontFamily: '"Inter",sans-serif', fontSize: 15, lineHeight: 1.65, color: '#2A2A2A', margin: '0 0 16px 0' }}>{p}</p>)}
      {content.pageNumber > 0 && <div style={{ marginTop: 'auto', textAlign: isRightSide ? 'right' : 'left', fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: 15, fontWeight: 600, color: '#C8A97E', paddingTop: 20 }}>{content.pageNumber}</div>}
    </div>
  );
}

/* ============================================================
   COVER DESIGNS
   ============================================================ */
function CoverDesign() {
  return (
    <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: 'radial-gradient(ellipse at 50% 40%,#222 0%,#1A1A1A 70%)' }}>
      <div style={{ position: 'absolute', inset: 12, border: '1px solid rgba(200,169,126,0.15)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 20, left: 20, width: 12, height: 12, borderTop: '1px solid rgba(200,169,126,0.5)', borderLeft: '1px solid rgba(200,169,126,0.5)' }} />
      <div style={{ position: 'absolute', top: 20, right: 20, width: 12, height: 12, borderTop: '1px solid rgba(200,169,126,0.5)', borderRight: '1px solid rgba(200,169,126,0.5)' }} />
      <div style={{ position: 'absolute', bottom: 20, left: 20, width: 12, height: 12, borderBottom: '1px solid rgba(200,169,126,0.5)', borderLeft: '1px solid rgba(200,169,126,0.5)' }} />
      <div style={{ position: 'absolute', bottom: 20, right: 20, width: 12, height: 12, borderBottom: '1px solid rgba(200,169,126,0.5)', borderRight: '1px solid rgba(200,169,126,0.5)' }} />
      <div style={{ position: 'absolute', top: '42%', left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent 0%,#C8A97E 20%,#C8A97E 80%,transparent 100%)' }} />
      <div style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: 48, fontWeight: 700, letterSpacing: '0.15em', color: '#C8A97E', textTransform: 'uppercase', textShadow: '0 2px 12px rgba(200,169,126,0.3)', textAlign: 'center', position: 'absolute', top: '34%', left: 0, right: 0 }}>MINE</div>
      <div style={{ fontFamily: '"Inter",sans-serif', fontSize: 13, fontWeight: 500, letterSpacing: '0.35em', color: '#888078', textTransform: 'uppercase', textAlign: 'center', position: 'absolute', top: '52%', left: 0, right: 0 }}>WORKBOOK</div>
    </div>
  );
}

function BackCoverDesign() {
  return (
    <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: '#1A1A1A' }}>
      <div style={{ position: 'absolute', inset: 12, border: '1px solid rgba(200,169,126,0.1)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: 0, right: 0, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontSize: 11, letterSpacing: '0.3em', color: '#6B6560', textTransform: 'uppercase' }}>A Personal Journey</div>
    </div>
  );
}

/* ============================================================
   MAIN WORKBOOK COMPONENT
   ============================================================ */
export default function Workbook() {
  const [bookState, setBookState] = useState<BookState>('closed');
  const [currentSpread, setCurrentSpread] = useState(0);
  const [hoverTilt, setHoverTilt] = useState({ x: 0, y: 0, active: false });
  const [animLock, setAnimLock] = useState(false);
  const [flipAngle, setFlipAngle] = useState(0);
  const [scale, setScale] = useState(1);
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number, y: number } | null>(null);

  /* ---- Data Mappers ---- */
  const getLeftPage = useCallback((index: number) => index === 0 ? null : SHEETS[index].front, []);
  const getRightPage = useCallback((index: number) => SHEETS[index].back, []);

  /* ---- Responsive Scaling ---- */
  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Calculate scale to fit open book (width * 2) + safe padding
      const scaleW = vw / (PW * 2 + 40);
      const scaleH = vh / (PH + 160); // Account for buttons/UI
      setScale(Math.min(1, scaleW, scaleH));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ---- Actions ---- */
  const openBook = useCallback(() => {
    if (bookState !== 'closed' || animLock) return;
    setAnimLock(true);
    setBookState('opening');
    setTimeout(() => { setBookState('open'); setAnimLock(false); }, 900);
  }, [bookState, animLock]);

  const closeBook = useCallback(() => {
    if (bookState !== 'open' || animLock) return;
    setAnimLock(true);
    setBookState('closing');
    setTimeout(() => {
      setBookState('closed');
      setCurrentSpread(0);
      setAnimLock(false);
    }, 900);
  }, [bookState, animLock]);

  const goNext = useCallback(() => {
    if (bookState !== 'open' || animLock || currentSpread >= TOTAL_SPREADS - 1) return;
    setAnimLock(true);
    setBookState('flipping-forward');
    setFlipAngle(0);
    
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setFlipAngle(-180));
    });

    setTimeout(() => {
      setCurrentSpread(prev => prev + 1);
      setBookState('open');
      setAnimLock(false);
    }, 600);
  }, [bookState, animLock, currentSpread]);

  const goPrev = useCallback(() => {
    if (bookState !== 'open' || animLock || currentSpread <= 0) return;
    setAnimLock(true);
    setBookState('flipping-back');
    setFlipAngle(-180);
    
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setFlipAngle(0));
    });

    setTimeout(() => {
      setCurrentSpread(prev => prev - 1);
      setBookState('open');
      setAnimLock(false);
    }, 600);
  }, [bookState, animLock, currentSpread]);

  /* ---- Touch & Hover Interactions ---- */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    // Hover (Desktop Only)
    const onMove = (e: MouseEvent) => {
      if (bookState !== 'closed') return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setHoverTilt({ x: (e.clientX - cx) / (rect.width / 2), y: (e.clientY - cy) / (rect.height / 2), active: true });
    };
    const onLeave = () => setHoverTilt({ x: 0, y: 0, active: false });
    
    // Touch (Mobile Swipes)
    const onTouchStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current || animLock || bookState !== 'open') return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      
      // Horizontal swipe to turn pages
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) goPrev();
        else goNext();
      } 
      // Vertical swipe (down) to close
      else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
        closeBook();
      }
      touchStart.current = null;
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    
    return () => { 
      el.removeEventListener('mousemove', onMove); 
      el.removeEventListener('mouseleave', onLeave); 
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [bookState, animLock, goNext, goPrev, closeBook]);

  /* ---- Keyboard Input ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (bookState !== 'open' || animLock) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      else if (e.key === 'Escape' || e.key === 'ArrowDown') { e.preventDefault(); closeBook(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [bookState, animLock, goNext, goPrev, closeBook]);

  /* ---- State Derived Variables ---- */
  const isOpen = bookState !== 'closed' && bookState !== 'closing';
  const isFlippingForward = bookState === 'flipping-forward';
  const isFlippingBack = bookState === 'flipping-back';
  const isFlipping = isFlippingForward || isFlippingBack;
  
  // Angle of the master cover and left base block
  const coverAngle = isOpen ? -180 : 0;

  // Determine what each static/flipping face should display
  let baseRightSpreadIndex = currentSpread;
  let baseLeftSpreadIndex = currentSpread;
  let flipFrontIndex = currentSpread;
  let flipBackIndex = currentSpread;

  if (isFlippingForward) {
    baseRightSpreadIndex = currentSpread + 1;
    baseLeftSpreadIndex = currentSpread;
    flipFrontIndex = currentSpread;
    flipBackIndex = currentSpread + 1;
  } else if (isFlippingBack) {
    baseRightSpreadIndex = currentSpread;
    baseLeftSpreadIndex = currentSpread - 1;
    flipFrontIndex = currentSpread - 1;
    flipBackIndex = currentSpread;
  }

  const rightPageContent = getRightPage(baseRightSpreadIndex);
  const leftPageContent = getLeftPage(baseLeftSpreadIndex);
  const flipFrontContent = isFlipping ? getRightPage(flipFrontIndex) : null;
  const flipBackContent = isFlipping ? getLeftPage(flipBackIndex) : null;

  /* ---- Transforms ---- */
  // The center of the 3D space is scaled dynamically to fit all screen sizes
  const closedTransform = `translateX(${-PW/2}px) rotateX(${25 - hoverTilt.y * 5}deg) rotateY(${-15 + hoverTilt.x * 5}deg) translateZ(30px)`;
  const openTransform = `translateX(0px) rotateX(4deg) rotateY(0deg) translateZ(0px)`;
  
  // Apply both scale and translation
  const bookTransform = `scale(${scale}) ${bookState === 'closed' || bookState === 'closing' ? closedTransform : openTransform}`;

  return (
    <div ref={viewportRef} style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 40%,#1a181e 0%,#050505 80%)', perspective: '2000px', touchAction: 'none' }}>
      
      {/* 3D BOOK CONTAINER */}
      <div style={{ 
        position: 'relative', 
        width: PW * 2, 
        height: PH + CO * 2, 
        transformStyle: 'preserve-3d', 
        transform: bookTransform, 
        transition: 'transform 900ms cubic-bezier(0.25, 1, 0.4, 1)', 
        willChange: 'transform' 
      }}>

        {/* --- FLOOR SHADOW --- */}
        <div style={{ 
          position: 'absolute', left: PW, top: 0, width: PW, height: PH + CO * 2, 
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.5) 0%, transparent 75%)', 
          transform: `translateZ(-60px) scale(${isOpen ? 1.1 : 1.3})`, 
          transition: 'transform 900ms, width 900ms, left 900ms',
          transformOrigin: 'left center',
          pointerEvents: 'none' 
        }} />

        {/* --- BACK COVER --- */}
        <div style={{ 
          position: 'absolute', left: PW, top: 0, width: PW + CO, height: PH + CO * 2, 
          transform: `translateZ(${-PD/2}px)`, 
          borderRadius: '0 6px 6px 0', overflow: 'hidden', 
          boxShadow: 'inset 2px 2px 10px rgba(0,0,0,0.8), 5px 5px 25px rgba(0,0,0,0.4)' 
        }}>
          <BackCoverDesign />
        </div>

        {/* --- PAPER EDGES (Simulated Book Thickness) --- */}
        <div style={{ 
          position: 'absolute', left: PW, top: CO, width: PD - 4, height: PH, 
          background: 'linear-gradient(90deg, #D5CDB8 0%, #F5F0E8 20%, #E8E0D0 80%, #D5CDB8 100%)', 
          transformOrigin: 'left center', 
          transform: `translateX(${PW}px) translateZ(${-PD/2 + 2}px) rotateY(90deg)` 
        }} />
        <div style={{ 
          position: 'absolute', left: PW, top: CO, width: PW, height: PD - 4, 
          background: 'linear-gradient(180deg, #D5CDB8 0%, #F5F0E8 20%, #E8E0D0 80%, #D5CDB8 100%)', 
          transformOrigin: 'left top', 
          transform: `translateZ(${-PD/2 + 2}px) rotateX(-90deg)` 
        }} />
        <div style={{ 
          position: 'absolute', left: PW, top: CO, width: PW, height: PD - 4, 
          background: 'linear-gradient(0deg, #D5CDB8 0%, #F5F0E8 20%, #E8E0D0 80%, #D5CDB8 100%)', 
          transformOrigin: 'left top', 
          transform: `translateY(${PH}px) translateZ(${-PD/2 + 2}px) rotateX(-90deg)` 
        }} />

        {/* --- BASE RIGHT PAGE --- */}
        <div style={{ 
          position: 'absolute', left: PW, top: CO, width: PW, height: PH, 
          transform: `translateZ(8px)`, 
          background: '#F5F0E8', 
          boxShadow: 'inset 8px 0 20px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          borderRadius: '0 2px 2px 0'
        }}>
          <PageContentView content={rightPageContent} isRightSide />
          {/* Inner spine binding shadow */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '24px', background: 'linear-gradient(90deg, rgba(0,0,0,0.12) 0%, transparent 100%)', pointerEvents: 'none' }} />
        </div>

        {/* --- BASE LEFT PAGE --- */}
        <div style={{ 
          position: 'absolute', left: PW, top: CO, width: PW, height: PH, 
          transformOrigin: 'left center', 
          transform: `translateZ(${isOpen ? 14 : 10}px) rotateY(${coverAngle}deg)`, 
          transition: 'transform 900ms cubic-bezier(0.25, 1, 0.4, 1)', 
          transformStyle: 'preserve-3d', 
          pointerEvents: isOpen ? 'auto' : 'none'
        }}>
          <div style={{ 
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden', 
            background: '#F5F0E8', 
            boxShadow: 'inset -8px 0 20px rgba(0,0,0,0.05)',
            transform: 'rotateY(-180deg)', 
            overflow: 'hidden',
            borderRadius: '2px 0 0 2px',
            opacity: isOpen ? 1 : 0, 
            transition: 'opacity 400ms'
          }}>
            <PageContentView content={leftPageContent} />
            {/* Inner spine binding shadow */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '24px', background: 'linear-gradient(-90deg, rgba(0,0,0,0.12) 0%, transparent 100%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* --- FLIPPING PAGE (Animated turn) --- */}
        {isFlipping && (
          <div style={{ 
            position: 'absolute', left: PW, top: CO, width: PW, height: PH, 
            transformOrigin: 'left center', 
            transform: `translateZ(16px) rotateY(${flipAngle}deg)`, 
            transition: 'transform 600ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
            transformStyle: 'preserve-3d', 
            zIndex: 100,
            pointerEvents: 'none'
          }}>
            {/* Front face of flipping leaf */}
            <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: '#F5F0E8', boxShadow: 'inset 8px 0 20px rgba(0,0,0,0.05), 10px 0 20px rgba(0,0,0,0.1)', borderRadius: '0 2px 2px 0' }}>
              <PageContentView content={flipFrontContent} isRightSide />
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '24px', background: 'linear-gradient(90deg, rgba(0,0,0,0.12) 0%, transparent 100%)' }} />
            </div>
            {/* Back face of flipping leaf */}
            <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: '#F5F0E8', transform: 'rotateY(-180deg)', boxShadow: 'inset -8px 0 20px rgba(0,0,0,0.05), -10px 0 20px rgba(0,0,0,0.1)', borderRadius: '2px 0 0 2px' }}>
              <PageContentView content={flipBackContent} />
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '24px', background: 'linear-gradient(-90deg, rgba(0,0,0,0.12) 0%, transparent 100%)' }} />
            </div>
          </div>
        )}

        {/* --- SPINE --- */}
        <div style={{ 
          position: 'absolute', left: PW, top: 0, width: PD, height: PH + CO * 2, 
          transformOrigin: 'left center', 
          transform: `translateZ(${PD/2}px) rotateY(-90deg)`, 
          background: 'linear-gradient(90deg, #0a0a0a 0%, #222 30%, #1A1A1A 70%, #050505 100%)',
          borderRight: '1px solid rgba(200,169,126,0.1)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
        }} />

        {/* --- FRONT COVER --- */}
        <div 
          onClick={bookState === 'closed' && !animLock ? openBook : undefined}
          style={{ 
            position: 'absolute', left: PW, top: 0, width: PW + CO, height: PH + CO * 2, 
            transformOrigin: 'left center', 
            transform: `translateZ(${PD/2}px) rotateY(${coverAngle}deg)`, 
            transition: 'transform 900ms cubic-bezier(0.25, 1, 0.4, 1)', 
            transformStyle: 'preserve-3d', 
            borderRadius: '0 6px 6px 0', 
            cursor: bookState === 'closed' ? 'pointer' : 'default',
            zIndex: 200
        }}>
          {/* Outside Front Cover */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: '0 6px 6px 0', overflow: 'hidden', boxShadow: bookState === 'closed' ? '8px 8px 25px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.05)' : 'none' }}>
            <CoverDesign />
          </div>
          {/* Inside Front Cover */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: '#111', borderRadius: '6px 0 0 6px', overflow: 'hidden' }}>
            {/* Dark textured inside cover */}
            <div style={{ position: 'absolute', inset: 12, border: '1px solid rgba(255,255,255,0.05)', background: '#161616' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '30px', background: 'linear-gradient(-90deg, rgba(0,0,0,0.5) 0%, transparent 100%)' }} />
          </div>
        </div>

      </div>

      {/* --- UI CONTROLS --- */}
      <div style={{ 
        position: 'absolute', bottom: 32, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16,
        opacity: isOpen ? 1 : 0, 
        transform: isOpen ? 'translateY(0)' : 'translateY(20px)', 
        transition: 'all 500ms cubic-bezier(0.25, 1, 0.5, 1) 400ms', 
        pointerEvents: isOpen ? 'all' : 'none',
        zIndex: 1000
      }}>
        {/* Navigation Buttons are slightly larger for easier mobile tapping */}
        <button onClick={goPrev} disabled={currentSpread <= 0 || animLock} aria-label="Previous Page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#C8A97E', borderRadius: '50%', cursor: 'pointer', transition: 'all 200ms', opacity: currentSpread <= 0 || animLock ? 0.3 : 1, pointerEvents: currentSpread <= 0 || animLock ? 'none' : 'auto', backdropFilter: 'blur(8px)' }}>
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        
        <button onClick={closeBook} disabled={animLock} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontFamily: '"Inter",sans-serif', fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 24px', height: 48, borderRadius: 24, cursor: 'pointer', transition: 'all 200ms', backdropFilter: 'blur(8px)' }}>
          <X size={16} /><span>Close</span>
        </button>
        
        <button onClick={goNext} disabled={currentSpread >= TOTAL_SPREADS - 1 || animLock} aria-label="Next Page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#C8A97E', borderRadius: '50%', cursor: 'pointer', transition: 'all 200ms', opacity: currentSpread >= TOTAL_SPREADS - 1 || animLock ? 0.3 : 1, pointerEvents: currentSpread >= TOTAL_SPREADS - 1 || animLock ? 'none' : 'auto', backdropFilter: 'blur(8px)' }}>
          <ChevronRight size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* --- SPREAD INDICATOR --- */}
      <div style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Inter",sans-serif', fontSize: 12, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', opacity: isOpen ? 1 : 0, transition: 'opacity 400ms', pointerEvents: 'none' }}>
        {isOpen ? `${currentSpread + 1} / ${TOTAL_SPREADS}` : ''}
      </div>

      {/* --- CLICK HINT WHEN CLOSED --- */}
      <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Inter",sans-serif', fontSize: 12, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', opacity: bookState === 'closed' ? 1 : 0, transition: 'opacity 600ms', pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span>Tap to Open</span>
        <div style={{ width: 1, height: 20, background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)' }} />
      </div>
    </div>
  );
}