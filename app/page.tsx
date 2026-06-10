'use client';

import { useEffect, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin } from 'gsap/all';
import { initScene } from '@/lib/scene';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin);

export default function Home() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rand = gsap.utils.random;

    // ---------------------------------------------------------------- WebGL
    const canvas = document.getElementById('webgl') as HTMLCanvasElement;
    const sceneApi = initScene(canvas);

    // ---------------------------------------------------------------- Smooth scroll
    const smoother = ScrollSmoother.create({
      smooth: reduced ? 0 : 1.2,
      effects: true,
      normalizeScroll: true,
    });

    // feed total page progress to the 3D scene
    ScrollTrigger.create({
      trigger: document.body,
      start: 0,
      end: 'max',
      onUpdate: (self) => sceneApi.setScroll(self.progress),
    });

    // ---------------------------------------------------------------- Custom cursor
    const cursor = document.querySelector('.cursor') as HTMLElement;
    const cursorDot = document.querySelector('.cursor-dot') as HTMLElement;
    if (matchMedia('(hover: hover)').matches) {
      const xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' });
      const yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' });
      const dxTo = gsap.quickTo(cursorDot, 'x', { duration: 0.12, ease: 'power3' });
      const dyTo = gsap.quickTo(cursorDot, 'y', { duration: 0.12, ease: 'power3' });
      window.addEventListener('pointermove', (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
        dxTo(e.clientX);
        dyTo(e.clientY);
      });
      const hoverables = document.querySelectorAll('.hoverable');
      hoverables.forEach((el) => {
        el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
        el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
      });
    }

    // ---------------------------------------------------------------- Random floaters
    const FLOATER_SHAPES = [
      `<svg viewBox="0 0 40 40" width="100%" height="100%"><path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z" fill="COLOR" opacity="0.9"/></svg>`,
      `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="20" cy="20" r="14" fill="none" stroke="COLOR" stroke-width="3"/></svg>`,
      `<svg viewBox="0 0 60 24" width="100%" height="100%"><path d="M2 12 Q 12 2, 22 12 T 42 12 T 58 12" fill="none" stroke="COLOR" stroke-width="3" stroke-linecap="round"/></svg>`,
      `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect x="8" y="8" width="24" height="24" rx="6" fill="none" stroke="COLOR" stroke-width="3" transform="rotate(15 20 20)"/></svg>`,
      `<svg viewBox="0 0 40 40" width="100%" height="100%"><path d="M20 4 Q 34 20, 20 36 Q 6 20, 20 4 Z" fill="COLOR" opacity="0.85"/></svg>`,
    ];
    const FLOATER_COLORS = ['#7dd6ff', '#b48dff', '#ff9d7d', '#9dffb0'];

    function spawnFloaters(container: Element | null, count: number) {
      if (!container || reduced) return;
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'floater';
        const size = rand(14, 44);
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.left = `${rand(3, 94)}%`;
        el.style.top = `${rand(5, 90)}%`;
        el.innerHTML = rand(FLOATER_SHAPES).replaceAll('COLOR', rand(FLOATER_COLORS));
        container.appendChild(el);

        gsap.to(el, { opacity: rand(0.25, 0.8), duration: 1.2, delay: rand(0.5, 2.5) });
        gsap.to(el, {
          y: rand(-90, 90),
          x: rand(-60, 60),
          rotation: rand(-180, 180),
          duration: rand(7, 16),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: rand(0, 3),
        });
      }
    }
    spawnFloaters(document.querySelector('.hero-floaters'), 14);
    spawnFloaters(document.querySelector('.contact-floaters'), 10);

    // ---------------------------------------------------------------- Intro
    const intro = gsap.timeline({ paused: true });

    const heroSplit = new SplitText('.hero-title', { type: 'chars', charsClass: 'char' });
    const subSplit = new SplitText('.hero-sub', { type: 'lines' });

    intro
      .to('.loader', { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' })
      .from(heroSplit.chars, {
        yPercent: 130,
        rotation: () => rand(-14, 14),
        opacity: 0,
        duration: 1.1,
        ease: 'back.out(1.6)',
        stagger: { each: 0.05, from: 'random' },
      }, '-=0.25')
      .from('.hero-kicker', { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.7')
      .from('#squiggle-path', { drawSVG: '0%', duration: 1.1, ease: 'power2.inOut' }, '-=0.5')
      .from(subSplit.lines, { y: 30, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, '-=0.7')
      .from('.hero-cta-row, .scroll-hint', { y: 26, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .from('.nav-pill', { y: -60, opacity: 0, duration: 0.9, ease: 'elastic.out(1, 0.7)' }, '-=0.8');

    // loader glyph spin while assets settle
    gsap.to('.loader-glyph', { rotation: 360, duration: 1.1, repeat: -1, ease: 'none' });

    window.addEventListener('load', () => {
      intro.play();
      sceneApi.intro();
      ScrollTrigger.refresh();
    });
    // fallback if load already fired or hangs
    setTimeout(() => {
      if (!intro.isActive() && intro.progress() === 0) {
        intro.play();
        sceneApi.intro();
      }
    }, 2500);

    // spread the gradient across the chars, then let it shimmer forever
    {
      const chars = heroSplit.chars;
      const n = Math.max(chars.length - 1, 1);
      chars.forEach((c, i) => gsap.set(c, { backgroundPositionX: `${(i / n) * 100}%` }));
      gsap.to(chars, {
        backgroundPositionX: '+=22%',
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.08,
      });
    }

    // scroll hint ball
    gsap.to('.scroll-hint-ball', {
      cy: 34,
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });

    // hero exits with a scrub as you scroll away.
    intro.eventCallback('onComplete', () => {
      gsap.to('.hero-title, .hero-sub, .hero-kicker, .hero-squiggle', {
        yPercent: -40,
        opacity: 0,
        stagger: 0.04,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '70% top',
          scrub: true,
        },
      });
    });

    // ---------------------------------------------------------------- Marquee (velocity-reactive)
    const marqueeTrack = document.querySelector('.marquee-track') as HTMLElement;
    const marqueeTween = gsap.to(marqueeTrack, {
      xPercent: -50,
      duration: 22,
      repeat: -1,
      ease: 'none',
    });
    ScrollTrigger.create({
      trigger: '.marquee',
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const v = self.getVelocity();
        gsap.to(marqueeTween, { timeScale: 1 + Math.min(Math.abs(v) / 900, 5) * Math.sign(v || 1), duration: 0.4, overwrite: true });
        gsap.to(marqueeTrack, { skewX: gsap.utils.clamp(-12, 12, v / 220), duration: 0.4, overwrite: 'auto' });
        gsap.to(marqueeTrack, { skewX: 0, duration: 0.8, delay: 0.15 });
      },
    });

    // ---------------------------------------------------------------- About
    const aboutLines = gsap.utils.toArray('.about-heading .line') as Element[];
    aboutLines.forEach((line, i) => {
      gsap.from(line, {
        yPercent: 110,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: { trigger: line, start: 'top 85%' },
        delay: i * 0.12,
      });
    });

    ScrollTrigger.batch('.reveal', {
      start: 'top 88%',
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: 'power3.out', overwrite: true }
        ),
    });

    // counters
    const statNums = gsap.utils.toArray('.stat-num') as Element[];
    statNums.forEach((el) => {
      const target = +(el as HTMLElement).dataset.value!;
      gsap.fromTo(
        el,
        { innerText: 0 },
        {
          innerText: target,
          duration: 1.8,
          snap: { innerText: 1 },
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        }
      );
    });

    // ---------------------------------------------------------------- Work: pinned horizontal scroll
    const track = document.querySelector('.work-track') as HTMLElement;
    const workTween = gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth + window.innerWidth * 0.06),
      ease: 'none',
      scrollTrigger: {
        trigger: '.work',
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => '+=' + (track.scrollWidth - window.innerWidth),
        invalidateOnRefresh: true,
      },
    });

    // each card tilts in as it enters from the right
    const projects = gsap.utils.toArray('.project') as Element[];
    projects.forEach((card) => {
      gsap.from(card, {
        rotationY: 24,
        rotationZ: 3,
        scale: 0.86,
        opacity: 0.4,
        transformPerspective: 900,
        ease: 'none',
        scrollTrigger: {
          containerAnimation: workTween,
          trigger: card,
          start: 'left 105%',
          end: 'left 55%',
          scrub: true,
        },
      });
      // number drifts inside the card for depth
      gsap.fromTo(
        card.querySelector('.project-num'),
        { xPercent: -28 },
        {
          xPercent: 28,
          ease: 'none',
          scrollTrigger: {
            containerAnimation: workTween,
            trigger: card,
            start: 'left right',
            end: 'right left',
            scrub: true,
          },
        }
      );
    });

    // ---------------------------------------------------------------- Experience: stagger in cards
    gsap.from('.process-heading', {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#experience', start: 'top 75%' },
    });

    // ---------------------------------------------------------------- Contact
    const contactLines = gsap.utils.toArray('.contact-heading .line') as Element[];
    contactLines.forEach((line, i) => {
      gsap.from(line, {
        yPercent: 115,
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.contact-heading', start: 'top 78%' },
        delay: i * 0.12,
      });
    });

    return () => {
      // Cleanup
      smoother.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      {/* SVG DEFS: liquid lens filters */}
      <svg className="svg-defs" aria-hidden="true">
        <defs>
          <filter id="liquid-lens" x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
            <feTurbulence id="lens-turb" type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
            <feDisplacementMap id="lens-disp" in="SourceGraphic" in2="softNoise" scale="46" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="liquid-lens-strong" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feTurbulence id="lens-turb-strong" type="fractalNoise" baseFrequency="0.008 0.02" numOctaves="3" seed="42" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="1.5" result="softNoise" />
            <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="72" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="liquid-lens-chroma" x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.014 0.02" numOctaves="2" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="34" xChannelSelector="R" yChannelSelector="G" result="disp" />
            <feColorMatrix in="disp" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
            <feOffset in="red" dx="2" dy="0" result="redShift" />
            <feColorMatrix in="disp" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan" />
            <feBlend in="redShift" in2="cyan" mode="screen" />
          </filter>
        </defs>
      </svg>

      {/* WebGL canvas */}
      <canvas id="webgl"></canvas>

      {/* Film grain */}
      <div className="grain" aria-hidden="true"></div>

      {/* Custom cursor */}
      <div className="cursor" aria-hidden="true"></div>
      <div className="cursor-dot" aria-hidden="true"></div>

      {/* Loader */}
      <div className="loader">
        <div className="loader-inner">
          <span className="loader-glyph">◌</span>
          <span className="loader-text">bending light…</span>
        </div>
      </div>

      {/* NAV */}
      <header className="nav">
        <nav className="nav-pill glass glass-strong">
          <a className="nav-logo hoverable" href="#top">
            A<span>.</span>
          </a>
          <div className="nav-links">
            <a className="hoverable" href="#about">
              About
            </a>
            <a className="hoverable" href="#work">
              Work
            </a>
            <a className="hoverable" href="#experience">
              Experience
            </a>
          </div>
          <a className="nav-cta hoverable" href="#contact">
            Let&apos;s talk
          </a>
        </nav>
      </header>

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main id="top">
            {/* HERO */}
            <section className="hero">
              <div className="hero-floaters" aria-hidden="true"></div>

              <p className="hero-kicker">
                <span className="kicker-dot"></span> AI Engineer — LLMs, Agents &amp; AI
              </p>

              <h1 className="hero-title" aria-label="ABHIJITH">
                ABHIJITH H
              </h1>

              <svg className="hero-squiggle" viewBox="0 0 600 60" fill="none" aria-hidden="true">
                <path
                  id="squiggle-path"
                  d="M5 35 Q 60 5, 120 32 T 240 30 T 360 34 T 480 28 T 595 32"
                  stroke="url(#squiggle-grad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="squiggle-grad" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#7dd6ff" />
                    <stop offset="0.5" stopColor="#b48dff" />
                    <stop offset="1" stopColor="#ff9d7d" />
                  </linearGradient>
                </defs>
              </svg>

              <p className="hero-sub">
                I build systems that are fun, intelligent and impactful.<br />
                Currently engineering at <em>nuvae</em>.
              </p>

              <div className="hero-cta-row">
                <a href="#work" className="btn-glass glass hoverable">
                  <span>See the work</span>
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12 4v14m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>

              <div className="scroll-hint" aria-hidden="true">
                <svg viewBox="0 0 30 50" width="26" height="44" fill="none">
                  <rect x="2" y="2" width="26" height="46" rx="13" stroke="rgba(255,255,255,.45)" strokeWidth="2.5" />
                  <circle className="scroll-hint-ball" cx="15" cy="14" r="4" fill="#7dd6ff" />
                </svg>
                <span>scroll</span>
              </div>
            </section>

            {/* MARQUEE */}
            <div className="marquee" aria-hidden="true">
              <div className="marquee-track">
                <span>REFRACT&nbsp;✦&nbsp;DISPERSE&nbsp;✦&nbsp;DISTORT&nbsp;✦&nbsp;DISSOLVE&nbsp;✦&nbsp;</span>
                <span>REFRACT&nbsp;✦&nbsp;DISPERSE&nbsp;✦&nbsp;DISTORT&nbsp;✦&nbsp;DISSOLVE&nbsp;✦&nbsp;</span>
                <span>REFRACT&nbsp;✦&nbsp;DISPERSE&nbsp;✦&nbsp;DISTORT&nbsp;✦&nbsp;DISSOLVE&nbsp;✦&nbsp;</span>
                <span>REFRACT&nbsp;✦&nbsp;DISPERSE&nbsp;✦&nbsp;DISTORT&nbsp;✦&nbsp;DISSOLVE&nbsp;✦&nbsp;</span>
              </div>
            </div>

            {/* ABOUT */}
            <section className="about" id="about">
              <div className="about-card glass reveal">
                <p className="section-tag">01 / About</p>
                <h2 className="about-heading">
                  <span className="line">Merging curiosity</span>
                  <span className="line">
                    with <i>code</i>.
                  </span>
                </h2>
                <p className="about-body reveal">
                  I thrive on turning complex problems into elegant, functional products and am always exploring new frontiers in generative AI and software engineering.
                </p>
                <div className="stats">
                  <div className="stat reveal">
                    <span className="stat-num" data-value="2">
                      0
                    </span>
                    <span className="stat-suffix">yrs</span>
                    <p>Experience</p>
                  </div>
                  <div className="stat reveal">
                    <span className="stat-num" data-value="10">
                      0
                    </span>
                    <span className="stat-suffix">+</span>
                    <p>shipped projects</p>
                  </div>
                  <div className="stat reveal">
                    <span className="stat-num" data-value="120">
                      0
                    </span>
                    <span className="stat-suffix">fps</span>
                    <p>or we don&apos;t ship</p>
                  </div>
                </div>
              </div>
            </section>

            {/* WORK */}
            <section className="work" id="work">
              <div className="work-header">
                <p className="section-tag">02 / Selected work</p>
                <h2 className="work-heading">Things I&apos;ve worked on recently</h2>
              </div>
              <div className="work-track">
                <article className="project glass hoverable" data-hue="195">
                  <div className="project-visual visual-a">
                    <span className="project-num">01</span>
                  </div>
                  <div className="project-meta">
                    <h3>Baremetal OS</h3>
                    <p>A lightweight operating system built from scratch in Rust. Implements core kernel functionality, memory management, and process scheduling with zero dependencies.</p>
                    <div className="tags">
                      <span>Rust</span>
                      <span>Systems Programming</span>
                      <span>Kernel</span>
                    </div>
                  </div>
                </article>
                <article className="project glass hoverable" data-hue="265">
                  <div className="project-visual visual-b">
                    <span className="project-num">02</span>
                  </div>
                  <div className="project-meta">
                    <h3>PodStitch</h3>
                    <p>AI-powered podcast tool using local recording for crystal-clear audio capture. Built with Next.js for seamless editing, stitching, and multi-track management.</p>
                    <div className="tags">
                      <span>Next.js</span>
                      <span>Web Audio API</span>
                      <span>AI Processing</span>
                    </div>
                  </div>
                </article>
                <article className="project glass hoverable" data-hue="20">
                  <div className="project-visual visual-c">
                    <span className="project-num">03</span>
                  </div>
                  <div className="project-meta">
                    <h3>Contract Analytics</h3>
                    <p>Real-time contract analysis platform with AI-powered insights. Tracks obligations, deadlines, and compliance metrics across enterprise agreements.</p>
                    <div className="tags">
                      <span>React</span>
                      <span>LLM Integration</span>
                      <span>Data Visualization</span>
                    </div>
                  </div>
                </article>
                <article className="project glass hoverable" data-hue="140">
                  <div className="project-visual visual-d">
                    <span className="project-num">04</span>
                  </div>
                  <div className="project-meta">
                    <h3>Bravio FSM</h3>
                    <p>Field service management software optimizing technician dispatch and job scheduling. Real-time tracking, customer communication, and revenue analytics.</p>
                    <div className="tags">
                      <span>Full Stack</span>
                      <span>Maps & Geolocation</span>
                      <span>Real-time Sync</span>
                    </div>
                  </div>
                </article>
                <div className="work-endcap">
                  <p>
                    that&apos;s it
                    <br />
                    (for now)
                  </p>
                </div>
              </div>
            </section>

            {/* EXPERIENCE */}
            <section className="process" id="experience">
              <p className="section-tag centered">03 / Experience</p>
              <h2 className="process-heading">Work & Impact</h2>

              <div className="process-body">
                <div className="step glass reveal" style={{ '--step-y': '12%', '--step-side': 'flex-end' } as CSSProperties}>
                  <span className="step-no">2025 - Now</span>
                  <h3>Product Engineer @ nuvae</h3>
                  <p>Building intelligent healthcare agent systems and LLM-powered applications. Specializing in RAG pipelines, multi-agent orchestration, and production AI infrastructure.</p>
                </div>
                <div className="step glass reveal" style={{ '--step-y': '31%', '--step-side': 'flex-start' } as CSSProperties}>
                  <span className="step-no">2024 - 2025</span>
                  <h3>Developer - I @ UST </h3>
                  <p>Developed Gen AI powered POC for multiple use cases.Leveraged large language models to enhance user experience and streamline workflows.</p>
                </div>
                <div className="step glass reveal" style={{ '--step-y': '50%', '--step-side': 'flex-end' } as CSSProperties}>
                  <span className="step-no">2024 - 2024</span>
                  <h3>Software Engineer Trainee @ UST </h3>
                  <p>Trained in software development principles and practices. Gained hands-on experience with various programming languages and frameworks.</p>
                </div>
                <div className="step glass reveal" style={{ '--step-y': '69%', '--step-side': 'flex-start' } as CSSProperties}>
                  <span className="step-no">2023 - 2024</span>
                  <h3>Frontend Developer Intern @ IHRD</h3>
                  <p>Started journey with JavaScript and web fundamentals. Contributed to IHRD-KP joint projects.</p>
                </div>
              </div>
            </section>

            {/* CONTACT */}
            <section className="contact" id="contact">
              <div className="contact-floaters" aria-hidden="true"></div>
              <p className="section-tag centered">04 / Contact</p>
              <h2 className="contact-heading">
                <span className="line">Got something</span>
                <span className="line">worth bending</span>
                <span className="line">light for?</span>
              </h2>
              <a className="btn-glass btn-big glass hoverable magnetic" href="mailto:abhijith@nuvae.ai">
                <span>hello@abhijithh.dev</span>
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <footer className="footer">
                <div className="footer-content">
                  <p>Abhijith H</p>
                  <div className="social-links">
                    <a href="https://linkedin.com/in/13x02" target="_blank" rel="noopener noreferrer" className="social-link hoverable">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                      </svg>
                      LinkedIn
                    </a>
                    <a href="https://github.com/13x02" target="_blank" rel="noopener noreferrer" className="social-link hoverable">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                  </div>
                </div>
                <p className="footer-hint">photosensitivity note: this site bends light, gently</p>
              </footer>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
