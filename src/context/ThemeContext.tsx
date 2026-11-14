"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { gsap } from "gsap";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "tijori_theme";

/* ─── Organic tendril generation ─── */

interface Tendril {
  points: { x: number; y: number }[];
  thickness: number;
  speed: number;
  progress: number;
  subTendrils: Tendril[];
  branchPoint: number;
}

function generateTendrils(
  originX: number,
  originY: number,
  count: number,
  vw: number,
  vh: number
): Tendril[] {
  const maxDist = Math.sqrt(vw * vw + vh * vh) * 1.3;
  const tendrils: Tendril[] = [];

  for (let i = 0; i < count; i++) {
    // Distribute angles covering all directions from the origin (top-right)
    const baseAngle =
      Math.PI * 0.5 + (Math.PI * 1.2 * i) / count + (Math.random() - 0.5) * 0.35;
    const segCount = 6 + Math.floor(Math.random() * 5);
    const segLen = maxDist / segCount;
    const points: { x: number; y: number }[] = [{ x: originX, y: originY }];

    let cx = originX;
    let cy = originY;
    let angle = baseAngle;

    for (let s = 0; s < segCount; s++) {
      angle += (Math.random() - 0.5) * 0.7;
      cx += Math.cos(angle) * segLen;
      cy += Math.sin(angle) * segLen;
      points.push({ x: cx, y: cy });
    }

    const thickness = 2 + Math.random() * 3;
    const speed = 0.7 + Math.random() * 0.5;

    // Sub-tendrils branch out from random segments
    const subTendrils: Tendril[] = [];
    const subCount = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < subCount; j++) {
      const branchIdx = 2 + Math.floor(Math.random() * (segCount - 3));
      const bp = points[branchIdx];
      const subAngle = angle + (Math.random() - 0.5) * 1.6;
      const subSegCount = 3 + Math.floor(Math.random() * 3);
      const subSegLen = segLen * (0.5 + Math.random() * 0.4);
      const subPoints: { x: number; y: number }[] = [{ x: bp.x, y: bp.y }];

      let sx = bp.x;
      let sy = bp.y;
      let sa = subAngle;
      for (let ss = 0; ss < subSegCount; ss++) {
        sa += (Math.random() - 0.5) * 0.9;
        sx += Math.cos(sa) * subSegLen;
        sy += Math.sin(sa) * subSegLen;
        subPoints.push({ x: sx, y: sy });
      }

      subTendrils.push({
        points: subPoints,
        thickness: thickness * 0.5,
        speed: speed * 0.8,
        progress: 0,
        subTendrils: [],
        branchPoint: branchIdx / segCount,
      });
    }

    tendrils.push({
      points,
      thickness,
      speed,
      progress: 0,
      subTendrils,
      branchPoint: 0,
    });
  }

  return tendrils;
}

/* ─── Draw helpers ─── */

function drawTendrilPath(
  ctx: CanvasRenderingContext2D,
  tendril: Tendril,
  progress: number,
  color: string,
  glowColor: string
) {
  const pts = tendril.points;
  if (pts.length < 2 || progress <= 0) return;

  const totalSegs = pts.length - 1;
  const drawnSegs = Math.min(progress * totalSegs, totalSegs);
  const fullSegs = Math.floor(drawnSegs);
  const partialFrac = drawnSegs - fullSegs;

  // Glow
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = color;
  ctx.lineWidth = tendril.thickness;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 1; i <= fullSegs && i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2 + (Math.random() - 0.5) * 3;
    const cpy = (prev.y + curr.y) / 2 + (Math.random() - 0.5) * 3;
    ctx.quadraticCurveTo(cpx, cpy, curr.x, curr.y);
  }

  if (partialFrac > 0 && fullSegs < totalSegs) {
    const prev = pts[fullSegs];
    const next = pts[fullSegs + 1];
    const x = prev.x + (next.x - prev.x) * partialFrac;
    const y = prev.y + (next.y - prev.y) * partialFrac;
    ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.restore();
}

function drawLiquidFill(
  ctx: CanvasRenderingContext2D,
  tendrils: Tendril[],
  fillProgress: number,
  originX: number,
  originY: number,
  vw: number,
  vh: number,
  color: string,
  accentColor: string
) {
  if (fillProgress <= 0) return;

  const maxR = Math.sqrt(vw * vw + vh * vh) * 1.3;
  const currentR = maxR * fillProgress;

  ctx.save();

  // Create organic clipping path by connecting tendril tips
  ctx.beginPath();

  const tips: { x: number; y: number; angle: number }[] = [];
  tendrils.forEach((t) => {
    const progress = t.progress;
    if (progress <= 0) return;
    const pts = t.points;
    const totalSegs = pts.length - 1;
    const drawnSegs = Math.min(progress * totalSegs, totalSegs);
    const fullSegs = Math.floor(drawnSegs);
    const partialFrac = drawnSegs - fullSegs;

    let tipX: number, tipY: number;
    if (partialFrac > 0 && fullSegs < totalSegs) {
      tipX = pts[fullSegs].x + (pts[fullSegs + 1].x - pts[fullSegs].x) * partialFrac;
      tipY = pts[fullSegs].y + (pts[fullSegs + 1].y - pts[fullSegs].y) * partialFrac;
    } else if (fullSegs > 0) {
      tipX = pts[Math.min(fullSegs, pts.length - 1)].x;
      tipY = pts[Math.min(fullSegs, pts.length - 1)].y;
    } else {
      tipX = pts[0].x;
      tipY = pts[0].y;
    }

    const angle = Math.atan2(tipY - originY, tipX - originX);
    tips.push({ x: tipX, y: tipY, angle });
  });

  tips.sort((a, b) => a.angle - b.angle);

  if (tips.length > 2) {
    // Draw filled organic shape through tendril tips
    ctx.moveTo(originX, originY);
    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      const nextTip = tips[(i + 1) % tips.length];
      const cpx =
        (tip.x + nextTip.x) / 2 +
        (Math.random() - 0.5) * currentR * 0.15;
      const cpy =
        (tip.y + nextTip.y) / 2 +
        (Math.random() - 0.5) * currentR * 0.15;
      ctx.quadraticCurveTo(tip.x, tip.y, cpx, cpy);
    }
    ctx.closePath();

    // Gradient fill
    const grad = ctx.createRadialGradient(
      originX, originY, 0,
      originX, originY, currentR
    );
    grad.addColorStop(0, color);
    grad.addColorStop(0.7, color);
    grad.addColorStop(1, accentColor + "30");
    ctx.fillStyle = grad;
    ctx.fill();
  }

  ctx.restore();
}

/* ─── Full-screen solid coverage with organic edge ─── */
function drawFullCoverage(
  ctx: CanvasRenderingContext2D,
  coverageProgress: number,
  originX: number,
  originY: number,
  vw: number,
  vh: number,
  color: string,
  edgeNoise: number[]
) {
  if (coverageProgress <= 0) return;

  const maxR = Math.sqrt(vw * vw + vh * vh) * 1.5;
  const currentR = maxR * coverageProgress;

  ctx.save();
  ctx.beginPath();

  // Organic circle with noise-based distortion
  const segments = edgeNoise.length;
  for (let i = 0; i <= segments; i++) {
    const angle = (Math.PI * 2 * i) / segments;
    const noiseIdx = i % segments;
    const noiseAmt = edgeNoise[noiseIdx];
    // Organic distortion decreases as coverage approaches 1
    const distortionScale = Math.max(0, 1 - coverageProgress * 1.2) * 0.2;
    const r = currentR * (1 + noiseAmt * distortionScale);
    const x = originX + Math.cos(angle) * r;
    const y = originY + Math.sin(angle) * r;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/* ─── Provider Component ─── */

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Hydration-safe initialization
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = stored || (prefersDark ? "dark" : "light");
    setThemeState(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  const createSymbioteTransition = useCallback(
    (targetTheme: Theme, onComplete: () => void) => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        document.documentElement.classList.toggle(
          "dark",
          targetTheme === "dark"
        );
        onComplete();
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Create or reuse canvas
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 99999;
          pointer-events: none;
        `;
        canvasRef.current = canvas;
      }

      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      document.body.appendChild(canvas);
      canvas.style.pointerEvents = "auto";

      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isDarkToLight = targetTheme === "light";
      const tendrilColor = isDarkToLight ? "#F5F3EF" : "#080808";
      const fillColor = isDarkToLight ? "#F5F3EF" : "#080808";
      const glowColor = isDarkToLight
        ? "rgba(245, 243, 239, 0.6)"
        : "rgba(8, 8, 8, 0.6)";
      const accentColor = "#E32636";

      // Origin: top-right corner
      const originX = vw;
      const originY = 0;

      const tendrilCount = Math.max(14, Math.floor((vw + vh) / 80));
      const tendrils = generateTendrils(originX, originY, tendrilCount, vw, vh);

      // Generate noise values for organic edge
      const noiseSegments = 64;
      const edgeNoise: number[] = [];
      for (let i = 0; i < noiseSegments; i++) {
        edgeNoise.push((Math.random() - 0.5) * 2);
      }

      // Animation state object for GSAP to tween
      const state = {
        tendrilProgress: 0,   // 0 → 1: tendrils grow
        fillProgress: 0,      // 0 → 1: liquid fills between tendrils
        coverageProgress: 0,  // 0 → 1: full viewport coverage
        dissolveProgress: 0,  // 0 → 1: dissolve/retract
      };

      let themeApplied = false;

      // Render loop
      const render = () => {
        ctx.clearRect(0, 0, vw, vh);

        if (state.dissolveProgress > 0) {
          // Dissolving phase
          const revCoverage = 1 - state.dissolveProgress;
          if (revCoverage > 0) {
            drawFullCoverage(
              ctx, revCoverage, originX, originY, vw, vh, fillColor, edgeNoise
            );
          }

          // Draw fading tendrils
          const tendrilOpacity = Math.max(0, 1 - state.dissolveProgress * 1.5);
          if (tendrilOpacity > 0) {
            ctx.globalAlpha = tendrilOpacity;
            tendrils.forEach((t) => {
              drawTendrilPath(ctx, t, t.progress, tendrilColor, glowColor);
              t.subTendrils.forEach((st) => {
                drawTendrilPath(ctx, st, st.progress, tendrilColor, glowColor);
              });
            });
            ctx.globalAlpha = 1;
          }
        } else {
          // Growing phase
          // Update individual tendril progress based on overall progress
          tendrils.forEach((t, i) => {
            const delay = (i / tendrils.length) * 0.3;
            const adjustedProgress = Math.max(
              0,
              (state.tendrilProgress - delay) / (1 - delay)
            );
            t.progress = Math.min(1, adjustedProgress * t.speed * 1.4);

            t.subTendrils.forEach((st) => {
              const subDelay = t.progress * st.branchPoint;
              if (t.progress > st.branchPoint) {
                st.progress = Math.min(
                  1,
                  ((t.progress - st.branchPoint) / (1 - st.branchPoint)) *
                    st.speed *
                    1.3
                );
              }
            });
          });

          // Draw full coverage behind everything
          if (state.coverageProgress > 0) {
            drawFullCoverage(
              ctx, state.coverageProgress, originX, originY, vw, vh,
              fillColor, edgeNoise
            );
          }

          // Draw liquid fill between tendrils
          if (state.fillProgress > 0) {
            ctx.globalAlpha = Math.min(1, state.fillProgress * 1.5);
            drawLiquidFill(
              ctx, tendrils, state.fillProgress, originX, originY,
              vw, vh, fillColor, accentColor
            );
            ctx.globalAlpha = 1;
          }

          // Draw tendrils on top
          tendrils.forEach((t) => {
            drawTendrilPath(ctx, t, t.progress, tendrilColor, glowColor);
            t.subTendrils.forEach((st) => {
              drawTendrilPath(ctx, st, st.progress, tendrilColor, glowColor);
            });
          });
        }

        animationFrameRef.current = requestAnimationFrame(render);
      };

      animationFrameRef.current = requestAnimationFrame(render);

      // GSAP timeline for precise sequencing
      const tl = gsap.timeline({
        onComplete: () => {
          cancelAnimationFrame(animationFrameRef.current);
          if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
          canvas!.style.pointerEvents = "none";
          onComplete();
        },
      });

      timelineRef.current = tl;

      // Phase 1: Tendrils grow outward (0 → 0.6s)
      tl.to(state, {
        tendrilProgress: 1,
        duration: 0.6,
        ease: "power2.out",
      }, 0);

      // Phase 2: Liquid fills between tendrils (0.2 → 0.7s)
      tl.to(state, {
        fillProgress: 1,
        duration: 0.5,
        ease: "power2.inOut",
      }, 0.2);

      // Phase 3: Full coverage expands (0.3 → 1.0s)
      tl.to(state, {
        coverageProgress: 1,
        duration: 0.7,
        ease: "power3.inOut",
      }, 0.3);

      // Phase 4: Apply theme while fully covered (at 1.0s)
      tl.call(() => {
        if (!themeApplied) {
          themeApplied = true;
          document.documentElement.classList.toggle(
            "dark",
            targetTheme === "dark"
          );
        }
      }, [], 1.0);

      // Phase 5: Hold for a beat (1.0 → 1.15s)
      tl.to({}, { duration: 0.15 }, 1.0);

      // Phase 6: Dissolve/retract (1.15 → 1.85s)
      tl.to(state, {
        dissolveProgress: 1,
        duration: 0.7,
        ease: "power2.in",
      }, 1.15);
    },
    []
  );

  const setTheme = useCallback(
    (newTheme: Theme) => {
      if (newTheme === theme || isTransitioning) return;
      setIsTransitioning(true);

      createSymbioteTransition(newTheme, () => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        setIsTransitioning(false);
      });
    },
    [theme, isTransitioning, createSymbioteTransition]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  if (!mounted) {
    return (
      <ThemeContext.Provider
        value={{
          theme: "dark",
          toggleTheme: () => {},
          setTheme: () => {},
          isTransitioning: false,
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
