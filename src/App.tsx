import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// ─── Utils ────────────────────────────────────────────────────────────────────

const RELATIONSHIP_START = new Date('2022-08-10T03:00:00Z').getTime();
const numberFormatter = new Intl.NumberFormat('pt-BR');
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

function getTimeTogether(now = Date.now()) {
  const elapsed = Math.max(0, now - RELATIONSHIP_START);
  return {
    weeks: Math.floor(elapsed / 604_800_000),
    days: Math.floor(elapsed / 86_400_000),
    hours: Math.floor(elapsed / 3_600_000),
    minutes: Math.floor(elapsed / 60_000),
    seconds: Math.floor(elapsed / 1_000),
  };
}

function useTimeTogether() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return getTimeTogether(now);
}

function scrollToSectionSmoothly(sectionId: string, duration = 1_250) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    target.scrollIntoView();
    window.history.replaceState(null, '', `#${sectionId}`);
    return;
  }

  const startY = window.scrollY;
  const targetY = target.getBoundingClientRect().top + startY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function animate(currentTime: number) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      window.requestAnimationFrame(animate);
    } else {
      window.history.replaceState(null, '', `#${sectionId}`);
    }
  }

  window.requestAnimationFrame(animate);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Seashell SVG ─────────────────────────────────────────────────────────────

function SeashellSVG({
  size = 80,
  className = '',
  style,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      style={style}
    >
      <path d="M11 59C11 34 23 13 40 13S69 34 69 59C58 66 22 66 11 59Z" fill="currentColor" opacity="0.2" />
      <path d="M11 59C11 34 23 13 40 13S69 34 69 59" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M17 58C19 36 28 18 40 14M29 61C30 37 34 21 40 14M51 61C50 37 46 21 40 14M63 58C61 36 52 18 40 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.72" />
      <path d="M10 59C24 67 56 67 70 59" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="40" cy="49" r="5" fill="#F7FCFF" opacity="0.92" />
    </svg>
  );
}

function SunCrestSVG({ size = 58 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="29" r="8" fill="currentColor" opacity="0.92" />
      <circle cx="40" cy="29" r="3.2" fill="#F7FCFF" opacity="0.95" />
      <path d="M8 43C17 35 25 35 34 43C43 51 51 51 72 38" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M10 54C20 46 28 46 38 54C47 61 56 61 70 51" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.72" />
      <path d="M18 64C26 59 34 59 42 64C50 69 57 69 64 65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function PhotoPlaceholder({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className={`photo-placeholder${compact ? ' photo-placeholder--compact' : ''}`} role="img" aria-label={label}>
      <span className="photo-placeholder__mark" aria-hidden="true">✦</span>
      <span className="photo-placeholder__label">{label}</span>
    </div>
  );
}

// ─── Petals ───────────────────────────────────────────────────────────────────

function FallingPetals() {
  const petals = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${4 + Math.random() * 92}%`,
    delay: `${(Math.random() * 2.5).toFixed(2)}s`,
    duration: `${(3.8 + Math.random() * 3.2).toFixed(2)}s`,
    size: 13 + Math.random() * 13,
    initRotate: Math.round(Math.random() * 360),
  }));
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 300,
      }}
    >
      {petals.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: -30,
            animation: `petalFall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        >
          <svg
            width={p.size}
            height={p.size * 1.3}
            viewBox="0 0 24 32"
            fill="none"
            style={{ transform: `rotate(${p.initRotate}deg)` }}
          >
            <path d="M12 32 C4 24 0 12 12 0 C24 12 20 24 12 32Z" fill="#DFF7FF" opacity="0.78" />
          </svg>
        </div>
      ))}
    </div>
  );
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.95s ease ${delay}s, transform 0.95s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Envelope Screen ──────────────────────────────────────────────────────────

function EnvelopeScreen({ onOpen }: { onOpen: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'opening' | 'done'>('idle');

  function handleClick() {
    if (phase !== 'idle') return;
    setPhase('opening');
    setTimeout(() => {
      setPhase('done');
      onOpen();
    }, 1900);
  }

  const flapOpen = phase === 'opening' || phase === 'done';

  return (
    <div
      className="opening-screen iemanja-opening"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 22%, #5B2B7D 0%, #2B103F 38%, #160720 100%)',
        opacity: phase === 'done' ? 0 : 1,
        transition: 'opacity 0.85s ease',
        pointerEvents: phase === 'done' ? 'none' : 'auto',
      }}
    >
      <div className="opening-lantern-field" aria-hidden="true">
        {[
          { left: '8%', top: '19%', delay: '0s', size: 12 },
          { left: '19%', top: '72%', delay: '1.2s', size: 9 },
          { left: '82%', top: '16%', delay: '0.7s', size: 10 },
          { left: '89%', top: '67%', delay: '1.8s', size: 13 },
          { left: '69%', top: '8%', delay: '2.4s', size: 7 },
          { left: '29%', top: '11%', delay: '2s', size: 8 },
        ].map((lantern, index) => (
          <span key={index} style={{ left: lantern.left, top: lantern.top, animationDelay: lantern.delay, width: lantern.size, height: lantern.size * 1.35 }} />
        ))}
      </div>

      {/* Ambient glows */}
      <div style={{
        position: 'absolute', width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,214,125,0.2) 0%, rgba(197,131,214,0.1) 38%, transparent 70%)',
        top: '5%', left: '50%', transform: 'translateX(-50%)',
        animation: 'gentleGlow 4s ease-in-out infinite',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,196,111,0.16) 0%, transparent 70%)',
        bottom: '10%', right: '5%',
        pointerEvents: 'none',
      }}/>

      {/* Corner lilies */}
      <div style={{ position: 'absolute', top: 24, left: 16, opacity: 0.22, pointerEvents: 'none' }}>
        <SeashellSVG size={54} />
      </div>
      <div style={{ position: 'absolute', top: 36, right: 14, opacity: 0.15, pointerEvents: 'none' }}>
        <SeashellSVG size={40} />
      </div>
      <div style={{ position: 'absolute', bottom: 56, left: 20, opacity: 0.17, pointerEvents: 'none' }}>
        <SeashellSVG size={46} />
      </div>
      <div style={{ position: 'absolute', bottom: 72, right: 16, opacity: 0.13, pointerEvents: 'none' }}>
        <SeashellSVG size={36} />
      </div>

      {/* Letter */}
      <div className="opening-letter-wrap" style={{ width: 'min(460px, 92vw, 78vh)', position: 'relative' }}>
        <div
          className="opening-letter-card"
          style={{
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: 12,
            overflow: 'hidden',
            background: 'linear-gradient(150deg, #824DA0 0%, #673784 52%, #4E2868 100%)',
            border: '1px solid rgba(255,240,184,0.62)',
            boxShadow: flapOpen
              ? '0 0 100px rgba(239,203,114,0.35), 0 32px 85px rgba(10,2,18,0.68)'
              : '0 24px 70px rgba(10,2,18,0.62), inset 0 0 0 7px rgba(255,249,245,0.035), inset 0 0 0 9px rgba(239,203,114,0.28)',
            transition: 'box-shadow 0.9s ease, transform 0.9s ease, opacity 0.9s ease',
            transform: flapOpen ? 'translateY(-8px) scale(1.025)' : 'translateY(0) scale(1)',
          }}
        >
          <div className="opening-letter-content" style={{ padding: 'clamp(26px, 5vh, 42px) clamp(30px, 8vw, 48px)', textAlign: 'center' }}>
            <div className="opening-sun-crest">
              <SunCrestSVG size={58} />
            </div>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              color: '#DFF7FF',
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 8,
              opacity: 0.92,
            }}>
              para você
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#FFF9F5',
              fontSize: 26,
              fontStyle: 'italic',
              lineHeight: 1.3,
              marginBottom: 10,
            }}>
              Minha princesa,
            </h2>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              color: '#FFF9F5',
              fontSize: 14,
              lineHeight: 1.65,
              marginBottom: 7,
              opacity: 0.9,
            }}>
              tem um pedacinho do meu coração aqui.
            </p>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              color: '#F5E8FA',
              fontSize: 12.5,
              lineHeight: 1.65,
              opacity: 0.94,
              marginBottom: 22,
            }}>
              Não precisa ser uma data especial para eu lembrar o quanto você é especial para mim.
            </p>
            <button
              onClick={handleClick}
              disabled={phase !== 'idle'}
              style={{
                width: 'min(100%, 285px)',
                padding: '14px 30px',
                borderRadius: 999,
                fontFamily: 'Manrope, sans-serif',
                fontSize: 13.5,
                fontWeight: 500,
                letterSpacing: '0.05em',
                background: phase === 'idle' ? 'linear-gradient(135deg, #FFF0B8, #EFCB72)' : 'rgba(239,203,114,0.45)',
                border: '1px solid rgba(255,240,184,0.7)',
                color: '#4E2868',
                cursor: phase === 'idle' ? 'pointer' : 'default',
                boxShadow: phase === 'idle' ? '0 10px 28px rgba(20,7,34,0.35)' : 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                if (phase === 'idle') (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={e => {
                if (phase === 'idle') (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)';
              }}
            >
              {phase === 'idle' ? 'Abrir meu presente 💙' : '💙'}
            </button>
          </div>

        </div>
      </div>

      <p className="opening-footer" style={{
        marginTop: 22,
        fontFamily: 'Manrope, sans-serif',
        color: '#DFF7FF',
        fontSize: 10.5,
        opacity: 0.38,
        letterSpacing: '0.18em',
      }}>
        feito com amor 💙
      </p>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const time = useTimeTogether();
  const extraTime = [
    { label: 'semanas', value: time.weeks },
    { label: 'horas', value: time.hours },
    { label: 'minutos', value: time.minutes },
    { label: 'segundos', value: time.seconds },
  ];
  return (
    <section className="hero-section" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      background: 'linear-gradient(158deg, #210B36 0%, #43205D 58%, #210B36 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(136,84,208,0.16) 0%, transparent 70%)',
        top: '8%', right: '-12%', pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(198,165,238,0.09) 0%, transparent 70%)',
        bottom: '18%', left: '-6%', pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 180,
        background: 'linear-gradient(to bottom, transparent 0%, rgba(67,32,93,0.55) 58%, #43205D 100%)',
        pointerEvents: 'none',
      }} />

      <div className="hero-shell" style={{ width: '100%', textAlign: 'center', position: 'relative' }}>
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18, opacity: 0.72, color: '#DFF7FF' }}>
            <SunCrestSVG size={48} />
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: '#FFF9F5',
            fontSize: 'clamp(26px, 7vw, 46px)',
            fontStyle: 'italic',
            lineHeight: 1.25,
            marginBottom: 20,
          }}>
            De uma foto no status<br />para a vida que eu<br />sonho com você.
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            color: '#C6A5EE',
            fontSize: 16,
            lineHeight: 1.82,
            marginBottom: 30,
            opacity: 0.9,
          }}>
            Em dezembro de 2021, eu entrei de brincadeira em uma foto sua, só para aparecer. Você postou, eu respondi ao seu status e, sem a gente imaginar, aquela brincadeira virou o começo da nossa história. Olha onde uma simples foto nos trouxe: até aqui, juntos, vivendo um amor que eu quero guardar para sempre.
          </p>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div style={{
            marginBottom: 28,
            padding: '22px 20px',
            borderRadius: 20,
            background: 'rgba(198,165,238,0.07)',
            border: '1px solid rgba(198,165,238,0.14)',
          }}>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              color: '#C6A5EE',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 6,
              opacity: 0.62,
            }}>
              juntos há
            </p>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#FFF9F5',
              fontSize: 'clamp(68px, 18vw, 108px)',
              fontWeight: 300,
              lineHeight: 1,
              margin: '4px 0',
            }}>
              {numberFormatter.format(time.days)}
            </p>
            <p style={{ fontFamily: 'Manrope, sans-serif', color: '#C6A5EE', fontSize: 14, opacity: 0.82, marginTop: 4 }}>
              dias de amor 💙
            </p>
            <div
              aria-label={`${numberFormatter.format(time.weeks)} semanas, ${numberFormatter.format(time.days)} dias, ${numberFormatter.format(time.hours)} horas, ${numberFormatter.format(time.minutes)} minutos e ${numberFormatter.format(time.seconds)} segundos juntos`}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 10,
                marginTop: 20,
              }}
            >
              {extraTime.map(unit => (
                <div key={unit.label} style={{
                  padding: '12px 8px',
                  borderRadius: 14,
                  background: 'rgba(255,249,245,0.055)',
                  border: '1px solid rgba(198,165,238,0.12)',
                }}>
                  <strong aria-hidden="true" style={{
                    display: 'block',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: '#FFF9F5',
                    fontSize: 'clamp(22px, 6vw, 30px)',
                    fontWeight: 400,
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {numberFormatter.format(unit.value)}
                  </strong>
                  <span aria-hidden="true" style={{
                    display: 'block',
                    marginTop: 5,
                    fontFamily: 'Manrope, sans-serif',
                    color: '#C6A5EE',
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    opacity: 0.72,
                  }}>
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: 'Manrope, sans-serif', color: '#C6A5EE', fontSize: 11, opacity: 0.58, marginTop: 16 }}>
              desde 10 de agosto de 2022
            </p>
          </div>
        </FadeIn>

        {/* Photos — substituíveis com fotos reais do casal */}
        <FadeIn delay={0.6}>
          <div style={{ position: 'relative', height: 210, marginBottom: 28 }}>
            <div style={{
              position: 'absolute',
              left: 20, right: 20, top: 0,
              height: 192,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(33,11,54,0.62)',
            }}>
              <PhotoPlaceholder label="Foto principal de vocês" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(33,11,54,0.48) 100%)' }} />
            </div>
            <div style={{
              position: 'absolute', left: 0, bottom: -4,
              width: 88, height: 88,
              borderRadius: 14, overflow: 'hidden',
              boxShadow: '0 10px 28px rgba(33,11,54,0.5)',
              border: '2px solid rgba(198,165,238,0.32)',
            }}>
              <PhotoPlaceholder label="Uma memória" compact />
            </div>
            <div style={{
              position: 'absolute', right: 0, bottom: -4,
              width: 78, height: 78,
              borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 10px 28px rgba(33,11,54,0.48)',
              border: '2px solid rgba(198,165,238,0.24)',
            }}>
              <PhotoPlaceholder label="Outra memória" compact />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.8}>
          <a
            href="#historia"
            onClick={event => {
              event.preventDefault();
              scrollToSectionSmoothly('historia');
            }}
            style={{
              display: 'inline-block',
              padding: '14px 34px',
              borderRadius: 999,
              fontFamily: 'Manrope, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.05em',
              background: 'linear-gradient(135deg, #8854D0, #C6A5EE)',
              color: '#FFF9F5',
              boxShadow: '0 12px 36px rgba(136,84,208,0.42)',
              textDecoration: 'none',
              transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, filter 0.35s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px) scale(1.025)';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 18px 44px rgba(136,84,208,0.55)';
              (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0) scale(1)';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 12px 36px rgba(136,84,208,0.42)';
              (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1)';
            }}
          >
            Vem lembrar comigo 💙
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Timeline Section ─────────────────────────────────────────────────────────

const timelineEvents = [
  {
    period: '2019 / 2020',
    title: 'Quando nossos caminhos se cruzaram',
    text: 'Foi na escola que tudo começou. Entre conversas simples e encontros pelos corredores, a vida já aproximava nossos caminhos sem que a gente imaginasse o quanto ainda viveria junto.',
    icon: '01',
    keepsake: 'Não tenho foto desse momento, mas até hoje consigo lembrar da primeira vez que te vi',
  },
  {
    period: '04/12/2021',
    title: 'A foto que mudou a nossa história',
    text: 'Naquele sarau da escola, apareci em uma foto sua. Você postou, eu respondi e, em uma conversa que parecia comum, nasceu algo que nunca mais deixou de fazer parte dos nossos dias.',
    icon: '02',
    image: assetUrl('/images/sarau.jpeg'),
    imageAlt: 'A foto no sarau da escola que deu início à nossa história',
    imageCaption: 'A foto que deu início à nossa história',
  },
  {
    period: '29/12/2021',
    title: 'Nosso primeiro beijo',
    text: 'Perto de casa, em um bar que poderia ser apenas mais um lugar, aconteceu o nosso primeiro beijo. Desde então, aquele cantinho guarda para sempre uma lembrança só nossa.',
    icon: '03',
    keepsake: 'Seus beijos causam marcas em mim até hoje!',
  },
  {
    period: '16/04/2022',
    title: 'Nosso primeiro encontro',
    text: 'Foi o começo de tantos momentos que ainda viriam. Um dia especial, guardado com carinho, em que estar ao seu lado começou a se tornar o meu lugar preferido.',
    icon: '04',
    image: assetUrl('/images/primeiro-encontro.jpeg'),
    imageAlt: 'Foto do nosso primeiro encontro em uma moldura de coração',
    imageCaption: 'Nosso primeiro encontro — 16/04/2022',
  },
  {
    period: '10/08/2022',
    title: 'O dia em que escolhemos ser nós',
    text: 'Começamos a namorar e demos nome ao sentimento que já crescia entre nós. Desde esse dia, seguimos escrevendo uma história feita de amor, cuidado e sonhos compartilhados.',
    icon: '05',
    image: assetUrl('/images/nosso-aniversario.jpg'),
    imageAlt: 'Nossas mãos com alianças no aniversário de namoro',
    imageCaption: 'Nosso aniversário de namoro',
  },
  {
    period: 'HOJE',
    title: 'Ainda estamos só no começo',
    text: 'Desde o dia em que escolhemos ser nós, seguimos colecionando fins de semana, passeios, risadas e apoio nos dias difíceis. Quando olho para tudo o que vivemos, tenho ainda mais certeza de que escolheria você novamente, em cada capítulo da nossa história.',
    icon: '06',
    image: assetUrl('/images/ainda-no-comeco.jpeg'),
    imageAlt: 'Nós dois juntos diante de um espelho',
    imageCaption: 'E ainda temos uma vida inteira pela frente',
  },
];

function TimelineSection() {
  return (
    <section
      id="historia"
      style={{
        padding: '80px 24px',
        background: 'linear-gradient(162deg, #43205D 0%, #210B36 100%)',
        position: 'relative',
      }}
    >
      <div className="timeline-shell" style={{ margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, opacity: 0.72, color: '#DFF7FF' }}>
              <SunCrestSVG size={42} />
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#FFF9F5',
              fontSize: 'clamp(30px, 9vw, 46px)',
              marginBottom: 14,
            }}>
              Nossa História
            </h2>
            <div style={{ width: 56, height: 1, margin: '0 auto', background: 'linear-gradient(90deg, transparent, #C6A5EE, transparent)' }} />
          </div>
        </FadeIn>

        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: 22, top: 0, bottom: 0,
            width: 1,
            background: 'linear-gradient(to bottom, transparent, #8854D0 6%, rgba(198,165,238,0.35) 90%, transparent)',
          }} />
          {timelineEvents.map((ev, i) => (
            <FadeIn key={i} delay={i * 0.13}>
              <div className="timeline-entry" style={{ gap: 20, marginBottom: 52, position: 'relative' }}>
                <div style={{
                  flexShrink: 0,
                  width: 46, height: 46,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#FFF9F5',
                  background: 'linear-gradient(135deg, #8854D0, #43205D)',
                  border: '2px solid rgba(198,165,238,0.48)',
                  boxShadow: '0 0 22px rgba(136,84,208,0.35)',
                  zIndex: 1,
                }}>
                  {ev.icon}
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <p style={{
                    fontFamily: 'Manrope, sans-serif',
                    color: '#C6A5EE',
                    fontSize: 12,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}>
                    {ev.period}
                  </p>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: '#FFF9F5',
                    fontSize: 20,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}>
                    {ev.title}
                  </h3>
                  <p style={{
                    fontFamily: 'Manrope, sans-serif',
                    color: '#C6A5EE',
                    fontSize: 16,
                    lineHeight: 1.72,
                    opacity: 0.84,
                  }}>
                    {ev.text}
                  </p>
                </div>
                {ev.image ? (
                  <figure className="timeline-photo timeline-photo--real">
                    <img src={ev.image} alt={ev.imageAlt} />
                    <figcaption>{ev.imageCaption}</figcaption>
                  </figure>
                ) : ev.keepsake ? (
                  <div className="timeline-keepsake">
                    <span aria-hidden="true">✦</span>
                    <p>{ev.keepsake}</p>
                  </div>
                ) : (
                  <div className="timeline-photo">
                    <PhotoPlaceholder label={`Foto para “${ev.title}”`} compact />
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <div style={{
            margin: '12px auto 0',
            padding: '30px 24px',
            textAlign: 'center',
            borderTop: '1px solid rgba(198,165,238,0.18)',
          }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#FFF9F5',
              fontSize: 'clamp(24px, 7vw, 34px)',
              fontStyle: 'italic',
              lineHeight: 1.35,
            }}>
              “Algumas datas marcam o calendário. Você marcou a minha vida e a nossa história continua…”
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Gallery Section ──────────────────────────────────────────────────────────

type GalleryItem = {
  title: string;
  caption: string;
  mark: string;
  image: string;
  imageAlt: string;
  position?: string;
  fit?: 'cover' | 'contain';
  aspect?: string;
};

const gallery: GalleryItem[] = [
  {
    title: 'Fins de semana',
    caption: 'Eu amo ter esse tempo com você.',
    mark: '01',
    image: assetUrl('/images/fins-de-semana.jpg'),
    imageAlt: 'Nós dois usando máscaras faciais em um fim de semana juntos',
    position: 'center 42%',
  },
  {
    title: 'Conhecer lugares',
    caption: 'Quero continuar descobrindo lugares ao seu lado.',
    mark: '02',
    image: assetUrl('/images/conhecer-lugares.jpg'),
    imageAlt: 'Nós dois abraçados contemplando a cidade à noite',
    position: 'center 52%',
  },
  {
    title: 'Passeios na Liberdade',
    caption: 'A Liberdade também guarda um pedacinho da nossa história.',
    mark: '03',
    image: assetUrl('/images/liberdade.jpg'),
    imageAlt: 'Nossos pratos de ramen em um passeio na Liberdade',
    position: 'center',
    fit: 'contain',
    aspect: '3 / 4',
  },
  {
    title: 'Nossas viagens',
    caption: 'Cada viagem ao seu lado vira uma lembrança que eu quero guardar para sempre. Ainda temos tantos lugares para descobrir juntos.',
    mark: '04',
    image: assetUrl('/images/nossas-viagens.jpeg'),
    imageAlt: 'Nós dois juntos durante uma viagem, cercados pela natureza',
    position: 'center 45%',
  },
];

function GallerySection() {
  const [active, setActive] = useState<GalleryItem | null>(null);

  return (
    <section
      style={{
        padding: '80px 24px',
        background: 'linear-gradient(158deg, #F1E8FA 0%, #E0CCF5 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 20, right: 10, opacity: 0.13, pointerEvents: 'none' }}>
        <SeashellSVG size={88} className="text-soft-violet" />
      </div>
      <div style={{ position: 'absolute', bottom: 20, left: 10, opacity: 0.09, pointerEvents: 'none' }}>
        <SeashellSVG size={66} className="text-plum" />
      </div>

      <div className="gallery-shell" style={{ margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#210B36',
              fontSize: 'clamp(30px, 9vw, 46px)',
              marginBottom: 14,
            }}>
              Nossas Lembranças
            </h2>
            <div style={{ width: 56, height: 1, margin: '0 auto', background: 'linear-gradient(90deg, transparent, #8854D0, transparent)' }} />
          </div>
        </FadeIn>

        <div className="gallery-grid">
          {gallery.map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <button
                onClick={() => setActive(item)}
                style={{
                  width: '100%',
                  aspectRatio: item.aspect ?? '1',
                  borderRadius: 18,
                  overflow: 'hidden',
                  position: 'relative',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  boxShadow: '0 10px 36px rgba(67,32,93,0.18)',
                  display: 'block',
                }}
              >
                <img
                  className="gallery-card-image"
                  src={item.image}
                  alt={item.imageAlt}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: item.position, objectFit: item.fit ?? 'cover' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(33,11,54,0.88) 0%, transparent 58%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '10px 10px 12px',
                  textAlign: 'left',
                }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 14, marginBottom: 5, letterSpacing: '0.12em', color: '#C6A5EE' }}>{item.mark}</span>
                  <p style={{
                    fontFamily: 'Manrope, sans-serif',
                    color: '#FFF9F5',
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.3,
                  }}>
                    {item.title}
                  </p>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: 18,
          fontFamily: 'Manrope, sans-serif',
          color: '#43205D',
          fontSize: 11,
          opacity: 0.52,
          fontStyle: 'italic',
        }}>
          toque para ver 💙
        </p>
      </div>

      {active && (
        <div
          className="gallery-modal"
          onClick={() => setActive(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 250,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            background: 'rgba(33,11,54,0.96)',
            backdropFilter: 'blur(14px)',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 360, width: '100%' }}>
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: 16,
              boxShadow: '0 30px 80px rgba(33,11,54,0.8)',
            }}>
              <img className="gallery-modal-image" src={active.image} alt={active.imageAlt} />
            </div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#FFF9F5',
              fontSize: 26,
              fontWeight: 500,
              textAlign: 'center',
              marginBottom: 10,
            }}>
              {active.title}
            </h3>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              color: '#C6A5EE',
              fontSize: 16,
              textAlign: 'center',
              lineHeight: 1.72,
              marginBottom: 22,
            }}>
              {active.caption}
            </p>
            <button
              onClick={() => setActive(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 999,
                fontFamily: 'Manrope, sans-serif',
                fontSize: 13,
                background: 'transparent',
                border: '1px solid rgba(198,165,238,0.35)',
                color: '#C6A5EE',
                cursor: 'pointer',
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Favorite portraits ───────────────────────────────────────────────────────

type FavoritePhoto = {
  image?: string;
  imageAlt: string;
  caption: string;
  position?: string;
  fit?: 'cover' | 'contain';
  aspect?: string;
};

const favoritePhotos: FavoritePhoto[] = [
  {
    image: assetUrl('/images/favorita-01.gif'),
    imageAlt: 'Você sorrindo e abraçando um bichinho de pelúcia',
    caption: 'Seu sorriso, seu jeito carinhoso e essa doçura que aparece até nos momentos mais simples — tudo nessa imagem faz meu coração ficar quentinho.',
    position: 'center 45%',
    aspect: '3 / 4',
  },
  {
    image: assetUrl('/images/favorita-02.jpeg'),
    imageAlt: 'Uma selfie sua com os cabelos soltos',
    caption: 'Eu amo essa foto porque ela guarda tantos detalhes seus que me encantam: seus olhos, seu cabelo e esse jeitinho lindo de olhar para a câmera.',
    position: '56% center',
    aspect: '16 / 10',
  },
  {
    image: assetUrl('/images/favorita-03.jpeg'),
    imageAlt: 'Uma selfie sua usando azul e uma flor no cabelo',
    caption: 'Essa flor combina com você: linda, delicada e capaz de deixar tudo ao redor um pouco mais bonito.',
    position: '63% center',
    aspect: '16 / 10',
  },
  {
    image: assetUrl('/images/favorita-04.jpeg'),
    imageAlt: 'Uma selfie sua com os cabelos soltos e roupa preta',
    caption: 'Talvez seja apenas uma foto para você. Para mim, é mais uma prova de que sou completamente apaixonado por cada versão sua.',
    position: 'center 38%',
    aspect: '1 / 1',
  },
];

function FavoritePhotosSection() {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);

  return (
    <section className="favorite-photos-section" id="suas-fotos">
      <div className="favorite-photos-shell">
        <FadeIn>
          <div className="favorite-photos-heading">
            <span>algumas das minhas favoritas</span>
            <h2>Você pelos meus olhos</h2>
            <p>
              Fotos que você tirou sem imaginar que se tornariam algumas das imagens mais bonitas guardadas por mim.
            </p>
          </div>
        </FadeIn>

        <div className="favorite-photos-grid">
          {favoritePhotos.map((photo, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <button
                className={`favorite-photo-card favorite-photo-card--${index + 1}`}
                type="button"
                onClick={() => setActivePhoto(index)}
                aria-label={`Abrir foto preferida ${index + 1}`}
              >
                <span className="favorite-photo-card__image" style={{ aspectRatio: photo.aspect ?? '4 / 5' }}>
                  {photo.image ? (
                    <img
                      src={photo.image}
                      alt={photo.imageAlt}
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: photo.position, objectFit: photo.fit ?? 'cover' }}
                    />
                  ) : (
                    <PhotoPlaceholder label={`Sua foto preferida ${String(index + 1).padStart(2, '0')}`} />
                  )}
                </span>
                <span className="favorite-photo-card__caption">
                  <small>minha favorita</small>
                  <strong>{String(index + 1).padStart(2, '0')}</strong>
                </span>
              </button>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <p className="favorite-photos-note">
            Você enxerga uma fotografia. Eu enxergo a mulher que amo.
          </p>
        </FadeIn>
      </div>

      {activePhoto !== null && (
        <div className="favorite-photo-modal" onClick={() => setActivePhoto(null)}>
          <div className="favorite-photo-modal__content" onClick={event => event.stopPropagation()}>
            <div className="favorite-photo-modal__image">
              {favoritePhotos[activePhoto].image ? (
                <img src={favoritePhotos[activePhoto].image} alt={favoritePhotos[activePhoto].imageAlt} />
              ) : (
                <PhotoPlaceholder label={`Sua foto preferida ${String(activePhoto + 1).padStart(2, '0')}`} />
              )}
            </div>
            <span>foto {String(activePhoto + 1).padStart(2, '0')}</span>
            <p>{favoritePhotos[activePhoto].caption}</p>
            <button type="button" onClick={() => setActivePhoto(null)}>Fechar</button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Notes Section ────────────────────────────────────────────────────────────

const notes = [
  { front: '01 · seus olhos', text: 'Seus olhos castanhos\nSão capazes de iluminar uma cidade\nÀs vezes me pergunto\nSerá que você é de verdade?\nOu apenas uma miragem?\nVocê é um ser tão belo' },
  { front: '02 · seu toque', text: 'Seu cheiro, seu toque, o carinho que você tem… me sinto em casa quando estou com você, neném.' },
  { front: '03 · o carinho entre nós', text: 'O jeito que a gente cuida um do outro é algo que guardo com muito carinho, meu bem.' },
];

function NotesSection() {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <section style={{
      padding: '80px 24px',
      background: 'linear-gradient(158deg, #210B36 0%, #43205D 100%)',
      position: 'relative',
    }}>
      <div className="notes-shell" style={{ margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#FFF9F5',
              fontSize: 'clamp(27px, 8vw, 42px)',
              marginBottom: 10,
            }}>
              Os detalhes que eu amo
            </h2>
            <p style={{ fontFamily: 'Manrope, sans-serif', color: '#E0CCF5', fontSize: 16, opacity: 0.88, marginBottom: 8 }}>
              Tem tanta coisa em você que eu amo.
            </p>
            <p style={{ fontFamily: 'Manrope, sans-serif', color: '#C6A5EE', fontSize: 11, opacity: 0.42, fontStyle: 'italic' }}>
              toque nos bilhetes para descobrir 💙
            </p>
          </div>
        </FadeIn>

        <div className="notes-grid">
          {notes.map((note, i) => {
            const on = revealed.has(i);
            return (
              <FadeIn key={i} delay={i * 0.09}>
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: '100%',
                    minHeight: 118,
                    borderRadius: 18,
                    padding: '16px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: `1.5px solid ${on ? 'rgba(198,165,238,0.52)' : 'rgba(198,165,238,0.11)'}`,
                    background: on
                      ? 'linear-gradient(135deg, rgba(136,84,208,0.24), rgba(198,165,238,0.11))'
                      : 'rgba(198,165,238,0.055)',
                    boxShadow: on ? '0 10px 32px rgba(136,84,208,0.18)' : 'none',
                    transform: on ? 'scale(1.025)' : 'scale(1)',
                    transition: 'all 0.38s ease',
                  }}
                >
                  {on ? (
                    <p style={{ fontFamily: 'Manrope, sans-serif', color: '#F1E8FA', fontSize: 16, lineHeight: 1.68, whiteSpace: 'pre-line' }}>
                      {note.text}
                    </p>
                  ) : (
                    <>
                      <p style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        color: '#C6A5EE',
                        fontSize: 17,
                        fontWeight: 500,
                        marginBottom: 7,
                      }}>
                        {note.front}
                      </p>
                      <p style={{ fontFamily: 'Manrope, sans-serif', color: '#C6A5EE', fontSize: 10, opacity: 0.38 }}>
                        toque para ver
                      </p>
                    </>
                  )}
                </button>
                {on && i === 0 && (
                  <p style={{ marginTop: 16, paddingInline: 14, fontSize: 12, lineHeight: 1.6, color: '#E8D9F7' }}>
                    <cite style={{ fontStyle: 'italic', color: '#BCE9F4' }}>— Geovanna Jainy</cite>
                  </p>
                )}
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Interactive love words ──────────────────────────────────────────────────

const loveWords = [
  {
    word: 'cuidado',
    title: 'Nos dias em que eu mais preciso',
    text: 'Seu apoio faz toda a diferença. Com você, até os dias difíceis ficam um pouco mais leves.',
  },
  {
    word: 'riso',
    title: 'A alegria que encontro em você',
    text: 'Eu amo o jeito que você me faz rir e como os momentos simples ficam especiais quando estamos juntos.',
  },
  {
    word: 'aconchego',
    title: 'O meu lugar preferido',
    text: 'Seu cheiro, seu toque e seu carinho têm uma forma bonita de me fazer sentir em casa.',
  },
  {
    word: 'futuro',
    title: 'Tudo o que ainda quero viver',
    text: 'Quando penso nos meus sonhos, vejo você comigo: construindo nossa família e cuidando do nosso amor.',
  },
  {
    word: 'nós',
    title: 'A minha escolha, todos os dias',
    text: 'Entre tantas possibilidades, eu escolheria nossa conversa, nossa história e você outra vez.',
  },
];

function LoveWordsSection() {
  const [selected, setSelected] = useState(0);
  const message = loveWords[selected];

  return (
    <section className="love-words-section">
      <div className="love-words-shell">
        <FadeIn>
          <div className="love-words-heading">
            <span>um carinho para você</span>
            <h2>Escolha uma palavra</h2>
            <p>Cada uma guarda um pedacinho do que eu sinto.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.18}>
          <div className="love-word-options" role="tablist" aria-label="Escolha uma palavra de amor">
            {loveWords.map((item, index) => (
              <button
                key={item.word}
                type="button"
                role="tab"
                aria-selected={selected === index}
                className={selected === index ? 'is-selected' : ''}
                onClick={() => setSelected(index)}
              >
                {item.word}
              </button>
            ))}
          </div>
        </FadeIn>

        <div key={message.word} className="love-word-message" role="tabpanel">
          <span>{String(selected + 1).padStart(2, '0')}</span>
          <h3>{message.title}</h3>
          <p>{message.text}</p>
        </div>
      </div>
    </section>
  );
}

// ─── Tibitar game ─────────────────────────────────────────────────────────────

const tibitarHints = [
  'É algo que você faz sem precisar dizer uma palavra.',
  'Seu sorriso e o seu jeito conseguem tibitar.',
  'Você faz isso comigo desde que nossa história começou.',
  'O verbo começa com “E” e termina com “R”.',
];

function normalizeGuess(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function TibitarGameSection() {
  const [guess, setGuess] = useState('');
  const [hintCount, setHintCount] = useState(1);
  const [result, setResult] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  function submitGuess(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const answer = normalizeGuess(guess);
    if (!answer) return;

    const isCorrect = ['encantar', 'encanta', 'encantando'].includes(answer);
    setAttempts(current => current + 1);
    setResult(isCorrect ? 'correct' : 'wrong');
  }

  function resetGame() {
    setGuess('');
    setHintCount(1);
    setResult('idle');
    setAttempts(0);
  }

  return (
    <section className="tibitar-section">
      <div className="tibitar-shell">
        <FadeIn>
          <div className="tibitar-intro">
            <span>uma brincadeira que você ama</span>
            <h2>Vamos tibitar?</h2>
            <p>
              Existe algo lindo que você faz comigo todos os dias. Use as pistas e descubra qual é o verbo secreto.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.18}>
          <div className={`tibitar-card${result === 'correct' ? ' is-correct' : ''}`}>
            {result !== 'correct' ? (
              <>
                <div className="tibitar-question">
                  <span>o segredo</span>
                  <p>“O que você faz que consegue me tibitar todos os dias?”</p>
                </div>

                <div className="tibitar-hints" aria-label="Pistas disponíveis">
                  {tibitarHints.slice(0, hintCount).map((hint, index) => (
                    <div key={hint} className="tibitar-hint">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <p>{hint}</p>
                    </div>
                  ))}
                </div>

                {hintCount < tibitarHints.length && (
                  <button
                    type="button"
                    className="tibitar-hint-button"
                    onClick={() => setHintCount(current => Math.min(current + 1, tibitarHints.length))}
                  >
                    Pedir outra pista
                  </button>
                )}

                <form className="tibitar-form" onSubmit={submitGuess}>
                  <label htmlFor="tibitar-answer">Qual é o verbo?</label>
                  <div>
                    <input
                      id="tibitar-answer"
                      value={guess}
                      onChange={event => {
                        setGuess(event.target.value);
                        if (result === 'wrong') setResult('idle');
                      }}
                      placeholder="Digite o verbo no infinitivo"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button type="submit">Tibitar</button>
                  </div>
                </form>

                <div className="tibitar-feedback" aria-live="polite">
                  {result === 'wrong' && (
                    <p>Ainda não, mozi… tente pensar no efeito que o seu jeito tem em mim.</p>
                  )}
                  {attempts > 0 && result !== 'wrong' && result !== 'correct' && <span>{attempts} tentativa</span>}
                </div>
              </>
            ) : (
              <div className="tibitar-success" aria-live="polite">
                <span className="tibitar-success__mark" aria-hidden="true">✦</span>
                <p className="tibitar-success__eyebrow">você acertou</p>
                <h3>Encantar</h3>
                <p>
                  Porque você me encanta com seus olhos, seu humor, seu jeito e até com os pequenos detalhes. E, mesmo depois de todo esse tempo, continua me encantando todos os dias.
                </p>
                <button type="button" onClick={resetGame}>Jogar outra vez</button>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Personal Corner Section ──────────────────────────────────────────────────

const plans = [
  'Vamos ver uma série de sua escolha?',
  'Quer uma massagem relaxante?',
  'Quer um carinho bem gostoso nas suas costas?',
  'Quer que eu faça um macarrãozinho bem gostoso para nós comermos?',
];

const personalTouches = [
  {
    name: 'Conchas',
    caption: 'tesouros que o mar guarda',
    title: 'Concha e Maré',
    description: 'O mar desenha caminhos\nE guarda segredos na areia;\nEm cada concha, um carinho,\nEm cada onda, você clareia.\n\nSeu olhar tem a calmaria\nDo azul quando encontra o luar;\nE o amor que cresce todo dia\nÉ maré que escolhe ficar.\n\nSe a vida mudar de corrente,\nEu sigo ao seu lado, meu bem;\nPorque meu porto é a gente,\nE o meu horizonte é você também.',
    mark: 'shell',
  },
];

function PersonalSection() {
  const [planIdx, setPlanIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [selectedTouch, setSelectedTouch] = useState(0);

  function nextPlan() {
    setAnimating(true);
    setTimeout(() => {
      setPlanIdx(i => (i + 1) % plans.length);
      setAnimating(false);
    }, 280);
  }

  return (
    <section className="personal-section" id="cantinho">
      <div className="personal-orbit personal-orbit--one" aria-hidden="true" />
      <div className="personal-orbit personal-orbit--two" aria-hidden="true" />

      <div className="personal-shell">
        <FadeIn>
          <div className="personal-heading">
            <span>um retrato seu pelos meus olhos</span>
            <h2>Um cantinho com a sua cara</h2>
            <p>
              Um tesouro do mar que me lembra você e um poema para guardar esse carinho.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="personal-portrait" style={{ gridTemplateColumns: '1fr' }}>
            <div className="personal-touch-list" style={{ gridTemplateColumns: '1fr' }} role="list" aria-label="Coisas que lembram você">
              {personalTouches.map((item, index) => (
                <button
                  className={`personal-touch ${selectedTouch === index ? 'is-selected' : ''}`}
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedTouch(index)}
                  aria-pressed={selectedTouch === index}
                >
                  <span className="personal-touch__mark" aria-hidden="true">
                    {item.mark === 'shell' ? <SeashellSVG size={31} className="text-lilac" /> : item.mark}
                  </span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.caption}</small>
                  </span>
                </button>
              ))}
            </div>

            <div className="personal-reveal" key={selectedTouch} aria-live="polite">
              <span className="personal-reveal__number">0{selectedTouch + 1}</span>
              {personalTouches[selectedTouch].title && (
                <h3 style={{ position: 'relative', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, color: '#DFF7FF', margin: '20px 0 18px' }}>
                  {personalTouches[selectedTouch].title}
                </h3>
              )}
              <p style={personalTouches[selectedTouch].title ? { whiteSpace: 'pre-line', fontSize: 'clamp(18px, 4vw, 23px)', lineHeight: 1.6 } : undefined}>{personalTouches[selectedTouch].description}</p>
              <span className="personal-reveal__signature">um detalhe seu que mora em mim</span>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <blockquote className="personal-quote">
            <span aria-hidden="true">“</span>
            <p>
              Se eu pudesse reunir você em uma imagem, ela teria a calma do mar, o brilho das pérolas, o conforto de um filme favorito e a doçura que só o seu jeito tem.
            </p>
          </blockquote>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="personal-date-card">
            <div className="personal-date-card__heading">
              <span>nosso próximo momento</span>
              <h3>Para onde o amor leva a gente hoje?</h3>
            </div>

            <div className="personal-plan" aria-live="polite">
              <span aria-hidden="true">♥</span>
              <p className={animating ? 'is-changing' : ''}>{plans[planIdx]}</p>
            </div>

            <button className="personal-plan-button" type="button" onClick={nextPlan}>
              Sortear um plano para nós
              <span aria-hidden="true">↻</span>
            </button>
            <p className="personal-plan-hint">toque quantas vezes quiser, mozi</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Future Section ───────────────────────────────────────────────────────────

function FutureSection() {
  return (
    <section style={{
      padding: '96px 24px',
      background: 'linear-gradient(145deg, #DCC6F3 0%, #C7A7EA 52%, #B78DDF 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -12, right: '6%', opacity: 0.16, pointerEvents: 'none', transform: 'rotate(8deg)' }}>
        <SeashellSVG size={116} className="text-plum" />
      </div>
      <div style={{ position: 'absolute', bottom: -32, left: '4%', opacity: 0.12, pointerEvents: 'none', transform: 'rotate(-10deg)' }}>
        <SeashellSVG size={138} className="text-plum" />
      </div>

      <div className="future-layout" style={{ margin: '0 auto' }}>
        <FadeIn>
          <div className="future-heading">
            <span style={{ fontFamily: 'Manrope, sans-serif', color: '#5B2B7D', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              O que ainda vamos viver
            </span>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#210B36',
              fontSize: 'clamp(40px, 9vw, 68px)',
              lineHeight: 0.98,
              margin: '14px 0 20px',
            }}>
              Nosso Futuro
            </h2>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#43205D',
              fontSize: 'clamp(22px, 4.5vw, 30px)',
              fontStyle: 'italic',
              lineHeight: 1.25,
            }}>
              Quando eu penso no futuro, imagino você comigo.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="future-card">
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              color: '#35164D', fontSize: 17, lineHeight: 1.8,
            }}>
              Eu sonho em casar com você, ter nossos filhos e construir uma vida digna para a nossa família. Quero um lar com carinho, respeito e espaço para conversar. Quero fazer a minha parte, estar ao seu lado nos dias difíceis e continuar aproveitando as coisas simples: escolher um filme, conhecer um lugar e passar o fim de semana com você.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Letter Section ───────────────────────────────────────────────────────────

function LetterSection() {
  const [revealed, setRevealed] = useState(false);
  const [showPetals, setShowPetals] = useState(false);

  function handleReveal() {
    setRevealed(true);
    setShowPetals(true);
    setTimeout(() => setShowPetals(false), 5500);
  }

  return (
    <section style={{
      padding: '80px 24px',
      background: 'linear-gradient(160deg, #43205D 0%, #210B36 100%)',
      position: 'relative',
    }}>
      {showPetals && <FallingPetals />}

      <div className="letter-shell" style={{ margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#FFF9F5',
              fontSize: 'clamp(30px, 9vw, 44px)',
              fontStyle: 'italic',
              marginBottom: 14,
            }}>
              Carta para você
            </h2>
            <div style={{ width: 56, height: 1, margin: '0 auto', background: 'linear-gradient(90deg, transparent, #C6A5EE, transparent)' }} />
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div
            className="paper-texture"
            style={{
              borderRadius: 24,
              padding: 'clamp(24px, 6vw, 40px)',
              background: 'linear-gradient(140deg, #FFF9F5 0%, #F1E8FA 100%)',
              boxShadow: '0 30px 80px rgba(33,11,54,0.65), inset 0 1px 0 rgba(255,255,255,0.88)',
              border: '1px solid rgba(198,165,238,0.24)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22, opacity: 0.32 }}>
              <SeashellSVG size={30} className="text-soft-violet" />
            </div>

            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#43205D', fontSize: 26, fontStyle: 'italic', marginBottom: 18,
            }}>
              Meu amor,
            </p>

            <div style={{
              fontFamily: 'Manrope, sans-serif',
              color: '#43205D', fontSize: 13.5, lineHeight: 1.9,
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <p>Fiz esse cantinho porque nem sempre consigo colocar em palavras tudo o que sinto.</p>
              <p>Amo seus olhos, seu cabelo, seu cheiro e seu toque. Amo nossos passeios, nossos fins de semana e o apoio nos dias difíceis.</p>
              <p>Eu sonho em casar com você, construir nossa família e cuidar do carinho que temos.</p>
              <p>Essa surpresa não precisa de uma ocasião. Eu só queria te dar um presente que tivesse um pouco de nós.</p>
            </div>

            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#43205D', fontSize: 24, fontStyle: 'italic',
              marginTop: 22, marginBottom: 4,
            }}>
              Eu te amo, minha princesa.
            </p>
            <p style={{ fontFamily: 'Manrope, sans-serif', color: '#8854D0', fontSize: 13, opacity: 0.72 }}>
              Do seu amor 💙
            </p>

            <div style={{
              marginTop: 26, paddingTop: 22,
              borderTop: '1px solid rgba(67,32,93,0.12)',
            }}>
              {!revealed ? (
                <button
                  onClick={handleReveal}
                  style={{
                    width: '100%', padding: '14px',
                    borderRadius: 999,
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: 16, fontWeight: 500,
                    background: 'linear-gradient(135deg, #8854D0, #43205D)',
                    color: '#FFF9F5',
                    boxShadow: '0 10px 30px rgba(136,84,208,0.28)',
                    border: 'none', cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  Só mais uma coisinha... 💙
                </button>
              ) : (
                <div style={{
                  textAlign: 'center',
                  animation: 'fadeSlideUp 0.85s ease forwards',
                }}>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: '#43205D',
                    fontSize: 'clamp(15px, 4.5vw, 21px)',
                    fontStyle: 'italic',
                    lineHeight: 1.55,
                  }}>
                    "Eu te quero para sempre, minha princesa. 💙"
                  </p>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Music player ─────────────────────────────────────────────────────────────

function MusicButton({ enabled }: { enabled: boolean }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      audioRef.current?.pause();
      setPlaying(false);
    }
  }, [enabled]);

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  if (!enabled) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={assetUrl('/audio/so-nos-dois.mp3')}
        aria-label="Só Nós Dois — nossa música"
        loop
        preload="metadata"
        className="music-audio"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      />

      <button
        type="button"
        className={`music-button${playing ? ' is-playing' : ''}`}
        onClick={toggleMusic}
        aria-pressed={playing}
        aria-label={playing ? 'Pausar nossa música' : 'Tocar nossa música: Só Nós Dois'}
        title={playing ? 'Pausar nossa música' : 'Tocar nossa música'}
      >
        <span className="music-button__icon" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span>{playing ? 'Pausar' : 'Nossa música'}</span>
      </button>
    </>
  );
}

// ─── Back to top ──────────────────────────────────────────────────────────────

function BackToTop({ enabled }: { enabled: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    const handleScroll = () => setVisible(window.scrollY > 520);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled]);

  function goToTop() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  return (
    <button
      type="button"
      className="back-to-top-button"
      onClick={goToTop}
      aria-label="Voltar ao início da página"
      title="Voltar ao início"
      tabIndex={visible ? 0 : -1}
      style={{
        position: 'fixed',
        right: 'max(18px, env(safe-area-inset-right))',
        bottom: 'max(18px, env(safe-area-inset-bottom))',
        zIndex: 180,
        width: 52,
        height: 52,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        border: '1px solid rgba(241,232,250,0.36)',
        background: 'linear-gradient(145deg, #9A68DE, #5B2B7D)',
        color: '#FFF9F5',
        boxShadow: '0 12px 34px rgba(33,11,54,0.48), 0 0 24px rgba(136,84,208,0.28)',
        fontFamily: 'Manrope, sans-serif',
        fontSize: 25,
        lineHeight: 1,
        cursor: visible ? 'pointer' : 'default',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.88)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease, transform 0.3s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(33,11,54,0.58), 0 0 30px rgba(198,165,238,0.38)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 12px 34px rgba(33,11,54,0.48), 0 0 24px rgba(136,84,208,0.28)';
      }}
    >
      ↑
    </button>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function LilyBackground({ section }: { section: HTMLElement }) {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = layer.current;
    if (!element) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const move = (event: PointerEvent) => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      const bounds = section.getBoundingClientRect();
      element.style.setProperty('--lily-x', ((event.clientX - bounds.left) / bounds.width * 20 - 10) + 'px');
      element.style.setProperty('--lily-y', ((event.clientY - bounds.top) / bounds.height * 16 - 8) + 'px');
    };
    const reset = () => {
      element.style.setProperty('--lily-x', '0px');
      element.style.setProperty('--lily-y', '0px');
    };
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry.isIntersecting);
    });
    observer.observe(section);
    section.addEventListener('pointermove', move);
    section.addEventListener('pointerleave', reset);
    return () => {
      observer.disconnect();
      section.removeEventListener('pointermove', move);
      section.removeEventListener('pointerleave', reset);
    };
  }, [section]);

  return (
    <div className="lily-background" ref={layer} aria-hidden="true">
      <div className="lily-background__parallax">
        {[0, 1, 2, 3, 4, 5].map(index => (
          <div className={'lily-background__flower lily-background__flower--' + index} key={index}>
            <SeashellSVG size={90 + index % 3 * 28} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionLilyBackgrounds() {
  const [sections, setSections] = useState<HTMLElement[]>([]);
  useEffect(() => {
    setSections(Array.from(document.querySelectorAll<HTMLElement>('.iemanja-theme > section')));
  }, []);
  return <>{sections.map((section, index) => createPortal(<LilyBackground section={section} />, section, String(index)))}</>;
}

export default function App() {
  const [opened, setOpened] = useState(false);

  return (
    <div style={{ minHeight: '100%', fontFamily: 'Manrope, sans-serif' }}>
      <EnvelopeScreen onOpen={() => setOpened(true)} />
      <MusicButton enabled={opened} />
      <BackToTop enabled={opened} />

      <div className="site-content iemanja-theme" style={{
        opacity: opened ? 1 : 0,
        transition: 'opacity 1s ease',
        pointerEvents: opened ? 'auto' : 'none',
      }}>
        <SectionLilyBackgrounds />
        <HeroSection />
        <TimelineSection />
        <GallerySection />
        <FavoritePhotosSection />
        <NotesSection />
        <LoveWordsSection />
        <TibitarGameSection />
        <PersonalSection />
        <FutureSection />
        <LetterSection />

        <footer style={{
          padding: '36px 24px',
          background: '#210B36',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, opacity: 0.58, color: '#DFF7FF' }}>
            <SunCrestSVG size={30} />
          </div>
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            color: '#C6A5EE', fontSize: 10.5, opacity: 0.32,
            letterSpacing: '0.16em',
          }}>
            feito com amor 💙
          </p>
        </footer>
      </div>
    </div>
  );
}
