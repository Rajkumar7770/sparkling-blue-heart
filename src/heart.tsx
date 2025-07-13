import React, { useRef, useEffect, useState } from "react";

const SparklingBlueHeart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showText, setShowText] = useState(false);
  const [phase, setPhase] = useState<'build' | 'dissolve'>('build');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = window.innerWidth < 768;

    const glitterParticles: any[] = [];
    const cycloneParticles: any[] = [];
    const textSparkles: any[] = [];

    const totalCycloneParticles = isMobile ? 600 : 1600;
    const heartParticleEmissionRate = isMobile ? 1 : 3;
    const glitterMax = isMobile ? 3000 : 8000;

    const heartPath = (t: number, scale = 14) => {
      const x = scale * 16 * Math.pow(Math.sin(t), 3);
      const y =
        -scale *
        (13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t));
      return { x, y };
    };

    for (let i = 0; i < totalCycloneParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 220 + 60;
      cycloneParticles.push({
        x: 0,
        y: 0,
        angle,
        radius,
        baseRadius: radius,
        speed: 0.02 + Math.random() * 0.03,
        size: 0.6 + Math.random() * 1,
        alpha: Math.random(),
        alphaChange: 0.01 + Math.random() * 0.01,
      });
    }

    const text = "LISA I LOVE YOU";

    const createTextParticles = () => {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return;

      offCtx.clearRect(0, 0, width, height);
      offCtx.font = "bold 100px Arial";
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillStyle = "white";
      offCtx.fillText(text, width / 2, height / 2);

      const imageData = offCtx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          const index = (y * width + x) * 4;
          if (data[index + 3] > 50) {
            textSparkles.push({
              x: width / 2,
              y: height - 50,
              tx: x,
              ty: y,
              speed: 0.01 + Math.random() * 0.008,
              size: 0.8 + Math.random(),
              alpha: 0,
              alphaChange: 0.02 + Math.random() * 0.01,
            });
          }
        }
      }
    };

    const resetScene = (nextPhase: 'build' | 'dissolve') => {
      glitterParticles.length = 0;
      textSparkles.length = 0;
      setShowText(false);
      setPhase(nextPhase);

      if (nextPhase === 'build') {
        setTimeout(() => {
          setShowText(true);
          createTextParticles();
        }, 1000);
      }
    };

    // Initial build phase
    setTimeout(() => {
      setShowText(true);
      createTextParticles();
    }, 1000);

    // Cycle phases every 20s
    setTimeout(() => resetScene('dissolve'), 20000);
    setInterval(() => {
      resetScene(phase === 'build' ? 'dissolve' : 'build');
    }, 40000);

    let frame = 0;
    const animate = () => {
      frame++;
      if (isMobile && frame % 2 === 0) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      cycloneParticles.forEach((p) => {
        p.angle += p.speed;
        p.radius = p.baseRadius + Math.sin(p.angle * 2) * 5;
        p.x = width / 2 + Math.cos(p.angle) * p.radius;
        p.y = height - 80 + Math.sin(p.angle) * p.radius * 0.6;

        p.alpha += p.alphaChange;
        if (p.alpha >= 1 || p.alpha <= 0.2) p.alphaChange *= -1;

        if (!isMobile) {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
          grad.addColorStop(0, `rgba(0,191,255,${p.alpha})`);
          grad.addColorStop(1, `rgba(0,191,255,0)`);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = `rgba(0,191,255,${p.alpha})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = 0; j < heartParticleEmissionRate; j++) {
          const t = Math.random() * 2 * Math.PI;
          const { x, y } = heartPath(t);
          const tx = phase === 'build' ? width / 2 + x : p.x;
          const ty = phase === 'build' ? height / 2 + y : p.y;
          glitterParticles.push({
            x: p.x,
            y: p.y,
            tx,
            ty,
            speed: 0.006 + Math.random() * 0.005,
            size: 0.5 + Math.random() * 1.1,
            alpha: 0,
            alphaChange: 0.015 + Math.random() * 0.01,
          });
        }
      });

      for (let i = glitterParticles.length - 1; i >= 0; i--) {
        const p = glitterParticles[i];
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        p.x += dx * p.speed;
        p.y += dy * p.speed;
        p.alpha += p.alphaChange;
        if (p.alpha > 1) p.alpha = 1;

        if (!isMobile) {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          grad.addColorStop(0, `rgba(0,191,255,${p.alpha})`);
          grad.addColorStop(1, `rgba(0,191,255,0)`);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = `rgba(0,191,255,${p.alpha})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (glitterParticles.length > glitterMax) glitterParticles.splice(i, 1);
      }

      if (showText && phase === 'build') {
        textSparkles.forEach((p) => {
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          p.x += dx * p.speed;
          p.y += dy * p.speed;
          p.alpha += p.alphaChange;
          if (p.alpha >= 1 || p.alpha <= 0.3) p.alphaChange *= -1;

          if (!isMobile) {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
            grad.addColorStop(0, `rgba(0,191,255,${p.alpha})`);
            grad.addColorStop(1, `rgba(0,191,255,0)`);
            ctx.fillStyle = grad;
          } else {
            ctx.fillStyle = `rgba(0,191,255,${p.alpha})`;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      requestAnimationFrame(animate);
    };

    animate();

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100vw",
        height: "100vh",
        display: "block",
        background: "black",
        willChange: "transform, opacity",
      }}
    />
  );
};

export default SparklingBlueHeart;
