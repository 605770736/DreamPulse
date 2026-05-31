'use client';

import { useEffect, useRef } from 'react';

export function BackgroundEffects() {
  const auroraRef = useRef<HTMLCanvasElement>(null);
  const particleRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId = 0;
    const auroraCanvas = auroraRef.current;
    const particleCanvas = particleRef.current;
    if (!auroraCanvas || !particleCanvas) return;

    const auroraCtx = auroraCanvas.getContext('2d');
    const pCtx = particleCanvas.getContext('2d');
    if (!auroraCtx || !pCtx) return;

    let w = 0, h = 0;
    function resize() {
      w = innerWidth; h = innerHeight;
      auroraCanvas!.width = w; auroraCanvas!.height = h;
      particleCanvas!.width = w; particleCanvas!.height = h;
    }
    resize();
    addEventListener('resize', resize);

    class AuroraWave {
      c1: string; c2: string; yBase: number; amp: number; freq: number; speed: number; opacity: number;
      constructor(c1: string, c2: string, yBase: number, amp: number, freq: number, speed: number, opacity: number) {
        this.c1 = c1; this.c2 = c2; this.yBase = yBase; this.amp = amp; this.freq = freq; this.speed = speed; this.opacity = opacity;
      }
      draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 3) {
          const y = this.yBase
            + Math.sin(x * this.freq + t * this.speed) * this.amp
            + Math.sin(x * this.freq * 0.6 + t * this.speed * 1.5) * this.amp * 0.6;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h); ctx.closePath();
        const grad = ctx.createLinearGradient(0, this.yBase - this.amp, 0, this.yBase + this.amp * 2);
        grad.addColorStop(0, this.c1);
        grad.addColorStop(1, this.c2);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    const waves = [
      new AuroraWave('rgba(129,140,248,0.32)', 'rgba(129,140,248,0)', h * 0.22, 90, 0.0014, 0.0007, 1),
      new AuroraWave('rgba(244,114,182,0.22)', 'rgba(244,114,182,0)', h * 0.32, 70, 0.0017, 0.0009, 1),
      new AuroraWave('rgba(251,146,60,0.16)', 'rgba(251,146,60,0)', h * 0.42, 80, 0.0011, 0.0005, 1),
      new AuroraWave('rgba(167,139,250,0.13)', 'rgba(244,114,182,0)', h * 0.52, 60, 0.002, 0.0008, 1),
    ];

    let t = 0;
    function animateAurora() {
      auroraCtx!.clearRect(0, 0, w, h);
      t += 1;
      waves.forEach((wave) => wave.draw(auroraCtx!, w, h, t));
    }

    const mouse = { x: -1000, y: -1000 };
    addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
    }, { passive: true });

    const COLORS = ['rgba(167,139,250,', 'rgba(244,114,182,', 'rgba(251,146,60,', 'rgba(253,224,71,', 'rgba(129,140,248,'];

    class Particle {
      x = 0; y = 0; size = 0; speedX = 0; speedY = 0; opacity = 0; colorBase = ''; pulse = 0; drift = 0;
      currentOpacity = 0;
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2.5 + 0.6;
        this.speedX = (Math.random() - 0.5) * 1.2;
        this.speedY = (Math.random() - 0.5) * 1.2;
        this.opacity = Math.random() * 0.5 + 0.15;
        this.colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.pulse = Math.random() * Math.PI * 2;
        this.drift = Math.random() * 0.02 - 0.01;
      }
      update() {
        const dx = mouse.x - this.x, dy = mouse.y - this.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          const force = (220 - dist) / 220 * 0.05;
          this.speedX += dx * force * 0.015;
          this.speedY += dy * force * 0.015;
        }
        this.speedX *= 0.985;
        this.speedY *= 0.985;
        this.speedX += this.drift;
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < -20) this.x = w + 20;
        if (this.x > w + 20) this.x = -20;
        if (this.y < -20) this.y = h + 20;
        if (this.y > h + 20) this.y = -20;
        this.pulse += 0.03;
        this.currentOpacity = this.opacity * (0.6 + 0.4 * Math.sin(this.pulse));
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colorBase + this.currentOpacity + ')';
        ctx.fill();
        if (this.currentOpacity > 0.35) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = this.colorBase + (this.currentOpacity * 0.15) + ')';
          ctx.fill();
        }
      }
    }

    const count = Math.min(120, Math.floor(w * h / 12000));
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function drawConnections(ctx: CanvasRenderingContext2D) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = (1 - dist / 140) * 0.22;
            ctx.strokeStyle = `rgba(167,139,250,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      animateAurora();
      pCtx!.clearRect(0, 0, w, h);
      particles.forEach((p) => { p.update(); p.draw(pCtx!); });
      drawConnections(pCtx!);
      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <canvas ref={auroraRef} id="aurora-canvas" className="fixed inset-0 z-0 pointer-events-none" />
      <div className="orb orb--1" />
      <div className="orb orb--2" />
      <div className="orb orb--3" />
      <canvas ref={particleRef} id="particle-canvas" className="fixed inset-0 z-[1] pointer-events-none" />
      <style>{`
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          pointer-events: none;
          animation: orbFloat 12s ease-in-out infinite alternate;
        }
        .orb--1 { width:500px; height:500px; background:rgba(167,139,250,0.12); top:-10%; left:-5%; }
        .orb--2 { width:400px; height:400px; background:rgba(244,114,182,0.10); top:30%; right:-8%; animation-delay:-4s; }
        .orb--3 { width:350px; height:350px; background:rgba(251,146,60,0.08); bottom:-5%; left:20%; animation-delay:-8s; }
      `}</style>
    </>
  );
}
