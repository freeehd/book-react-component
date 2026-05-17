import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const PW = 380;
const PH = 540;
const PD = 24;
const CO = 6;
const SW = 32;

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
    // Sheet 0: Front Cover
    front: { chapterLabel: '', heading: '', body: [], pageNumber: 0 }, // Outside cover (handled by CoverDesign)
    back: {
      // Inside front cover + Page 1
      chapterLabel: 'Welcome', heading: 'Introduction',
      body: [
        'Welcome to your MINE workbook. This is your personal space for discovery, reflection, and growth. Over the following pages, you will journey through a carefully crafted process.',
        'This workbook combines structured exercises with open-ended reflection. Each module builds upon the last, creating a comprehensive map of your inner landscape.',
        'Set aside dedicated time for these exercises. Find a quiet space, grab your favorite pen, and approach each prompt with curiosity rather than judgment.',
      ], pageNumber: 1,
    },
  },
  {
    // Sheet 1: Pages 2-3
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
    // Sheet 2: Pages 4-5
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
    // Sheet 3: Pages 6-7
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
    // Sheet 4: Pages 8-9
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
    // Sheet 5: Pages 10-11
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
    // Sheet 6: Pages 12 + Inside back cover
    front: {
      chapterLabel: 'Reflection', heading: 'Closing Thoughts',
      body: [
        'Remember: this workbook is a living document, not a finished product. The insights you have gained are seeds — they need ongoing attention to grow.',
        'The work you have done here matters. In a world that constantly pulls your attention outward, taking time to look inward is a radical act.',
        'Close this book knowing that the most important journey is the one within. You are already exactly where you need to be.',
      ], pageNumber: 12,
    },
    back: { chapterLabel: '', heading: '', body: [], pageNumber: 0 }, // Inside back cover (blank)
  },
];

const TOTAL_SHEETS = SHEETS.length;
const TOTAL_SPREADS = TOTAL_SHEETS - 1; // Number of visible spreads (pairs of pages)

type BookState = 'closed' | 'opening' | 'open' | 'flipping-forward' | 'flipping-back' | 'closing';

/* ============================================================
   PAGE CONTENT VIEW
   ============================================================ */
function PageContentView({ content, isRightSide }: { content: PageContent; isRightSide?: boolean }) {
  if (!content.heading && !content.chapterLabel) {
    return (
      <div style={{ padding: '48px 40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8' }}>
        <div style={{ width: 60, height: 1, background: '#D5CDB8' }} />
      </div>
    );
  }
  return (
    <div style={{ padding: isRightSide ? '48px 40px 48px 32px' : '48px 32px 48px 40px', height: '100%', display: 'flex', flexDirection: 'column', color: '#1A1A1A', background: '#F5F0E8' }}>
      {content.chapterLabel && <div style={{ fontFamily: '"Inter",sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8A97E', marginBottom: 12 }}>{content.chapterLabel}</div>}
      {content.heading && <h2 style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: 28, fontWeight: 600, letterSpacing: '0.02em', color: '#1A1A1A', margin: '0 0 20px 0', lineHeight: 1.2 }}>{content.heading}</h2>}
      <div style={{ width: 40, height: 1, background: '#D5CDB8', margin: '24px 0' }} />
      {content.body.map((p, i) => <p key={i} style={{ fontFamily: '"Inter",sans-serif', fontSize: 14, lineHeight: 1.7, color: '#1A1A1A', margin: '0 0 16px 0' }}>{p}</p>)}
      {content.pageNumber > 0 && <div style={{ marginTop: 'auto', textAlign: 'center', fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: 14, fontWeight: 500, letterSpacing: '0.05em', color: '#C8A97E', paddingTop: 20 }}>{content.pageNumber}</div>}
    </div>
  );
}

/* ============================================================
   COVER DESIGN
   ============================================================ */
function CoverDesign() {
  return (
    <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 4, overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 40%,#222 0%,#1A1A1A 70%)' }}>
      <div style={{ position: 'absolute', inset: 16, borderRadius: 2, boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.5),inset -1px -1px 3px rgba(255,255,255,0.12),inset -2px -2px 4px rgba(0,0,0,0.5),inset 1px 1px 3px rgba(255,255,255,0.12)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 20, left: 20, width: 12, height: 12, borderTop: '1px solid rgba(200,169,126,0.3)', borderLeft: '1px solid rgba(200,169,126,0.3)' }} />
      <div style={{ position: 'absolute', top: 20, right: 20, width: 12, height: 12, borderTop: '1px solid rgba(200,169,126,0.3)', borderRight: '1px solid rgba(200,169,126,0.3)' }} />
      <div style={{ position: 'absolute', bottom: 20, left: 20, width: 12, height: 12, borderBottom: '1px solid rgba(200,169,126,0.3)', borderLeft: '1px solid rgba(200,169,126,0.3)' }} />
      <div style={{ position: 'absolute', bottom: 20, right: 20, width: 12, height: 12, borderBottom: '1px solid rgba(200,169,126,0.3)', borderRight: '1px solid rgba(200,169,126,0.3)' }} />
      <div style={{ position: 'absolute', top: '42%', left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent 0%,#C8A97E 20%,#C8A97E 80%,transparent 100%)' }} />
      <div style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: 42, fontWeight: 700, letterSpacing: '0.15em', color: '#C8A97E', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(200,169,126,0.25)', textAlign: 'center', position: 'absolute', top: '35%', left: 0, right: 0 }}>MINE</div>
      <div style={{ fontFamily: '"Inter",sans-serif', fontSize: 12, fontWeight: 400, letterSpacing: '0.35em', color: '#6B6560', textTransform: 'uppercase', textAlign: 'center', position: 'absolute', top: '52%', left: 0, right: 0 }}>WORKBOOK</div>
    </div>
  );
}

function BackCoverDesign() {
  return (
    <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 4, overflow: 'hidden', background: '#1A1A1A' }}>
      <div style={{ position: 'absolute', inset: 16, borderRadius: 2, boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.5),inset -1px -1px 3px rgba(255,255,255,0.12)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 20, left: 20, width: 12, height: 12, borderTop: '1px solid rgba(200,169,126,0.3)', borderLeft: '1px solid rgba(200,169,126,0.3)' }} />
      <div style={{ position: 'absolute', top: 20, right: 20, width: 12, height: 12, borderTop: '1px solid rgba(200,169,126,0.3)', borderRight: '1px solid rgba(200,169,126,0.3)' }} />
      <div style={{ position: 'absolute', bottom: 20, left: 20, width: 12, height: 12, borderBottom: '1px solid rgba(200,169,126,0.3)', borderLeft: '1px solid rgba(200,169,126,0.3)' }} />
      <div style={{ position: 'absolute', bottom: 20, right: 20, width: 12, height: 12, borderBottom: '1px solid rgba(200,169,126,0.3)', borderRight: '1px solid rgba(200,169,126,0.3)' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: 0, right: 0, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontSize: 10, letterSpacing: '0.3em', color: '#6B6560', textTransform: 'uppercase' }}>A Personal Journey</div>
    </div>
  );
}

/* ============================================================
   MAIN WORKBOOK COMPONENT
   ============================================================ */
export default function Workbook() {
  const [bookState, setBookState] = useState<BookState>('closed');
  const [currentSpread, setCurrentSpread] = useState(0);
  const [displayedLeftSpread, setDisplayedLeftSpread] = useState(0);
  const [displayedRightSpread, setDisplayedRightSpread] = useState(0);
  const [hoverTilt, setHoverTilt] = useState({ x: 0, y: 0, active: false });
  const [animLock, setAnimLock] = useState(false);
  const [showBookInterior, setShowBookInterior] = useState(false);
  const [flipAngle, setFlipAngle] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  /* ---- Actions ---- */
  const openBook = () => {
    if (bookState !== 'closed' || animLock) return;
    setAnimLock(true);
    setBookState('opening');
    setTimeout(() => { setBookState('open'); setAnimLock(false); setShowBookInterior(true); }, 900);
  };

  const closeBook = () => {
    if (bookState !== 'open' || animLock) return;
    setAnimLock(true);
    setShowBookInterior(false);
    setBookState('closing');
    setTimeout(() => {
      setBookState('closed');
      setCurrentSpread(0);
      setDisplayedLeftSpread(0);
      setDisplayedRightSpread(0);
      setAnimLock(false);
      setShowBookInterior(false);
    }, 900);
  };

  const goNext = () => {
    if (bookState !== 'open' || animLock || currentSpread >= TOTAL_SPREADS - 1) return;
    const nextSpread = currentSpread + 1;
    setAnimLock(true);
    setBookState('flipping-forward');
    setFlipAngle(0);
    setDisplayedRightSpread(nextSpread);
    window.requestAnimationFrame(() => setFlipAngle(-180));
    window.setTimeout(() => {
      setDisplayedLeftSpread(nextSpread);
    }, 325);
    setTimeout(() => {
      setCurrentSpread(nextSpread);
      setBookState('open');
      setAnimLock(false);
    }, 650);
  };

  const goPrev = () => {
    if (bookState !== 'open' || animLock || currentSpread <= 0) return;
    const prevSpread = currentSpread - 1;
    setAnimLock(true);
    setBookState('flipping-back');
    setFlipAngle(0);
    setDisplayedLeftSpread(prevSpread);
    window.requestAnimationFrame(() => setFlipAngle(180));
    window.setTimeout(() => {
      setDisplayedRightSpread(prevSpread);
    }, 325);
    setTimeout(() => {
      setCurrentSpread(prevSpread);
      setBookState('open');
      setAnimLock(false);
    }, 650);
  };

  /* ---- Hover tilt ---- */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      if (bookState !== 'closed') return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setHoverTilt({ x: (e.clientX - cx) / (rect.width / 2), y: (e.clientY - cy) / (rect.height / 2), active: true });
    };
    const onLeave = () => setHoverTilt({ x: 0, y: 0, active: false });
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [bookState]);

  /* ---- Keyboard ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (bookState !== 'open' || animLock) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeBook(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [bookState, animLock, currentSpread, goNext, goPrev, closeBook]);

  /* ---- Derived ---- */
  const isOpen = bookState === 'open' || bookState.startsWith('flipping');
  const isAnimating = bookState === 'opening' || bookState === 'closing' || bookState.startsWith('flipping');
  const isClosed = bookState === 'closed';

  /* ---- Book transform with hover ---- */
  const bookTransform = isOpen || bookState.startsWith('flipping') || bookState === 'opening'
    ? 'rotateX(2deg) scale(1)'
    : `translateX(${-PW / 2}px) rotateX(8deg) scale(0.95)${hoverTilt.active ? ` rotateY(${hoverTilt.x * 8}deg) rotateX(${hoverTilt.y * -6}deg) translateZ(${Math.sqrt(hoverTilt.x ** 2 + hoverTilt.y ** 2) * 4}px)` : ''}`;

  const coverRotation = isOpen || bookState === 'opening' || bookState.startsWith('flipping') ? -180 : 0;
  const frontCoverZ = isClosed || bookState === 'opening' || bookState === 'closing' ? 100 : 20;
  const frontCoverLeft = PW - CO;
  const frontCoverVisible = bookState === 'closed' || bookState === 'opening' || bookState === 'closing';
  const leftPageSpread = SHEETS[displayedLeftSpread + 1] ?? SHEETS[TOTAL_SHEETS - 1];
  const rightPageSpread = SHEETS[displayedRightSpread + 1] ?? SHEETS[TOTAL_SHEETS - 1];
  const activeSpread = SHEETS[currentSpread + 1] ?? SHEETS[TOTAL_SHEETS - 1];
  const prevSpread = SHEETS[Math.max(currentSpread, 1)] ?? SHEETS[1];
  const nextSpread = SHEETS[Math.min(currentSpread + 2, TOTAL_SHEETS - 1)] ?? SHEETS[TOTAL_SHEETS - 1];
  const isFlippingForward = bookState === 'flipping-forward';
  const isFlippingBack = bookState === 'flipping-back';

  return (
    <div ref={viewportRef} role="region" aria-label="MINE Workbook" aria-busy={isAnimating} style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 40%,#141218 0%,#0C0C0C 70%)', perspective: '2000px' }}>

      {/* Book Assembly */}
      <div style={{ position: 'relative', transformStyle: 'preserve-3d', width: PW * 2, height: PH, transition: 'transform 900ms cubic-bezier(0.25,1,0.5,1)', willChange: 'transform', transform: bookTransform }}>

        {/* Floor Shadow */}
        <div style={{ position: 'absolute', width: PW * 2 + 40, height: PH + 40, left: -20, top: -20, background: 'radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0.5) 0%,transparent 70%)', transform: 'translateY(30px) translateZ(-100px)', pointerEvents: 'none', opacity: 0.8 }} />

        {/* Spine */}
        <div style={{ position: 'absolute', left: -SW / 2, top: -CO, width: SW, height: PH + CO * 2, background: 'linear-gradient(90deg,#0a0a0a 0%,#111 30%,#1a1a1a 70%,#0a0a0a 100%)', transform: `translateX(${PW - SW / 2}px) rotateY(-90deg)`, transformStyle: 'preserve-3d', borderRadius: 2 }} />

        {showBookInterior && (
          <>
            {/* Back Cover (left side) */}
            <div style={{ position: 'absolute', left: -CO, top: -CO, width: PW + CO, height: PH + CO * 2, transformStyle: 'preserve-3d', borderRadius: 4, transform: `translateZ(${-PD / 2 - 1}px)` }}>
              <BackCoverDesign />
            </div>

            {/* Active spread only: prevent stale previous pages from stacking on top */}
            <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH, borderRadius: 2, overflow: 'hidden', background: '#F5F0E8', boxShadow: 'inset 8px 0 20px rgba(0,0,0,0.06)', transform: `translateZ(${PD / 2 - 2}px)`, zIndex: 60, pointerEvents: isAnimating ? 'none' : 'auto' }}>
              <PageContentView content={leftPageSpread.front} />
            </div>
            <div style={{ position: 'absolute', left: PW, top: 0, width: PW, height: PH, borderRadius: 2, overflow: 'hidden', background: '#F5F0E8', boxShadow: 'inset -8px 0 20px rgba(0,0,0,0.06)', transform: `translateZ(${PD / 2 - 2}px)`, zIndex: 60, pointerEvents: isAnimating ? 'none' : 'auto' }}>
              <PageContentView content={rightPageSpread.back} isRightSide />
              <div style={{ position: 'absolute', left: 0, top: 0, width: 2, height: '100%', background: 'linear-gradient(180deg,#E8E0D0 0%,#D5CDB8 50%,#E8E0D0 100%)' }} />
            </div>

            {isFlippingForward && (
              <div style={{ position: 'absolute', left: PW, top: 0, width: PW, height: PH, transformOrigin: 'left center', transformStyle: 'preserve-3d', transform: `translateZ(${PD / 2 + 2}px) rotateY(${flipAngle}deg)`, transition: 'transform 650ms cubic-bezier(0.55,0,0.1,1)', zIndex: 90, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 2, overflow: 'hidden', background: '#F5F0E8', boxShadow: 'inset -8px 0 20px rgba(0,0,0,0.08)' }}>
                  <PageContentView content={activeSpread.back} isRightSide />
                </div>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 2, overflow: 'hidden', background: '#F5F0E8', boxShadow: 'inset 8px 0 20px rgba(0,0,0,0.08)' }}>
                  <PageContentView content={nextSpread.front} />
                </div>
              </div>
            )}

            {isFlippingBack && (
              <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH, transformOrigin: 'right center', transformStyle: 'preserve-3d', transform: `translateZ(${PD / 2 + 2}px) rotateY(${flipAngle}deg)`, transition: 'transform 650ms cubic-bezier(0.55,0,0.1,1)', zIndex: 90, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 2, overflow: 'hidden', background: '#F5F0E8', boxShadow: 'inset 8px 0 20px rgba(0,0,0,0.08)' }}>
                  <PageContentView content={activeSpread.front} />
                </div>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 2, overflow: 'hidden', background: '#F5F0E8', boxShadow: 'inset -8px 0 20px rgba(0,0,0,0.08)' }}>
                  <PageContentView content={prevSpread.back} isRightSide />
                </div>
              </div>
            )}
          </>
        )}

        {/* Front Cover */}
        <div onClick={isClosed && !animLock ? openBook : undefined} 
          style={{ 
            position: 'absolute', 
            left: frontCoverLeft, 
            top: -CO, 
            width: PW + CO, 
            height: PH + CO * 2, 
            transformOrigin: 'left center', 
            transformStyle: 'preserve-3d', 
            borderRadius: 4, 
            transform: `translateZ(${PD / 2 + 1}px) rotateY(${coverRotation}deg)`, 
            transition: 'transform 900ms cubic-bezier(0.25,1,0.5,1), left 900ms cubic-bezier(0.25,1,0.5,1), opacity 220ms ease', 
            willChange: 'transform', 
            cursor: isClosed ? 'pointer' : 'default', 
            pointerEvents: frontCoverVisible && !isAnimating ? 'auto' : 'none', 
            zIndex: frontCoverZ,
            opacity: frontCoverVisible ? 1 : 0
          }}>
          <CoverDesign />
          {/* Inside front cover - only visible when cover is rotated open */}
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            backfaceVisibility: 'hidden', 
            borderRadius: 4, 
            overflow: 'hidden', 
            background: '#F5F0E8', 
            transform: 'rotateY(180deg)' 
          }}>
            <div style={{ position: 'absolute', inset: 0, background: '#F5F0E8' }} />
          </div>
        </div>

      </div>

      {/* Nav Controls */}
      <div style={{ display: 'flex', gap: 12, marginTop: 40, opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 400ms cubic-bezier(0.25,1,0.5,1) 200ms, transform 400ms cubic-bezier(0.25,1,0.5,1) 200ms', pointerEvents: isOpen ? 'all' : 'none' }}>
        <button onClick={goPrev} disabled={currentSpread <= 0 || animLock} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontFamily: '"Inter",sans-serif', fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', transition: 'all 300ms', opacity: currentSpread <= 0 || animLock ? 0.25 : 1, pointerEvents: currentSpread <= 0 || animLock ? 'none' : 'auto' }}>
          <ChevronLeft size={16} /><span>Prev Page</span>
        </button>
        <button onClick={closeBook} disabled={animLock} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontFamily: '"Inter",sans-serif', fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', transition: 'all 300ms' }}>
          <X size={16} /><span>Close Book</span>
        </button>
        <button onClick={goNext} disabled={currentSpread >= TOTAL_SPREADS - 1 || animLock} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontFamily: '"Inter",sans-serif', fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', transition: 'all 300ms', opacity: currentSpread >= TOTAL_SPREADS - 1 || animLock ? 0.25 : 1, pointerEvents: currentSpread >= TOTAL_SPREADS - 1 || animLock ? 'none' : 'auto' }}>
          <span>Next Page</span><ChevronRight size={16} />
        </button>
      </div>

      {/* Spread indicator */}
      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Inter",sans-serif', fontSize: 12, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', opacity: isOpen ? 1 : 0, transition: 'opacity 400ms', pointerEvents: 'none' }}>
        {isOpen ? `Spread ${currentSpread + 1} of ${TOTAL_SPREADS}` : ''}
      </div>

      {/* Click hint when closed */}
      <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Inter",sans-serif', fontSize: 12, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', opacity: isClosed ? 1 : 0, transition: 'opacity 600ms', pointerEvents: 'none' }}>
        {isClosed ? 'Click to open' : ''}
      </div>
    </div>
  );
}
