"use client";

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import './Plasma.css';

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
uniform float uIterations;
uniform float uBrightness;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;

  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);

  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < uIterations; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y));
    p.z -= 4.;
    S = p;
    d = p.y-T;

    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05);
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T));
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4;
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }

  o.xyz = tanh(O/uBrightness);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);

  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));

  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

type PlasmaProps = {
  color?: string;
  speed?: number;
  direction?: 'forward' | 'reverse' | 'pingpong';
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
};

export function Plasma({
  color = '#ffffff',
  speed = 1,
  direction = 'forward',
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
}: PlasmaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const containerEl = containerRef.current;

    const prefersReducedMotion = window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    /* Hardware capability sniff. Only skip WebGL on GENUINELY low-end
       hardware — Safari/Firefox don't expose `deviceMemory` at all,
       and `hardwareConcurrency` is commonly 4 on perfectly capable
       mid-tier laptops. Previously we defaulted memory to 4 and
       tripped the fallback for every browser that doesn't report it,
       which is why the plasma looked dead (= static CSS gradient) on
       most desktops. Now: default unknown memory to 8 (trust the
       browser if it doesn't say otherwise) and only fall back on ≤2
       cores or ≤2 GB, which is actual low-end territory. */
    const cores = navigator.hardwareConcurrency || 8;
    const memory =
      ((navigator as unknown) as { deviceMemory?: number }).deviceMemory ?? 8;
    const isLowEnd = cores <= 2 || memory <= 2;

    if (prefersReducedMotion || isLowEnd) {
      /* Render a lightweight static gradient instead of running the
         shader. Matches the overall colour mood of the plasma so the
         page still feels cohesive without the GPU cost. */
      if (fallbackRef.current) fallbackRef.current.style.display = "block";
      return;
    }

    const useCustomColor = color ? 1.0 : 0.0;
    const customColorRgb = color ? hexToRgb(color) : [1, 1, 1] as [number, number, number];

    const directionMultiplier = direction === 'reverse' ? -1.0 : 1.0;

    /* Capable-device tuning. Mobile still gets lower dpr + iterations
       + fps cap to keep the GPU cool; desktop runs near-full detail.
       All expensive work pauses when scrolled past the visible
       region or when the tab is hidden (see the RAF loop below). */
    const isMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.innerWidth < 768;
    const iterations = isMobile ? 32.0 : 55.0;
    /* Lower uBrightness = LESS tanh attenuation = brighter + higher
       contrast output, which is how the fine ray-march detail
       actually shows up on screen. The old 5e3 combined with the
       0.55 wrapper opacity made the plasma read as a flat glow with
       no structure. 3e3 restores the swirl detail without changing
       iterations on mobile (kept for perf). */
    const brightness = isMobile ? 5e3 : 3e3;
    const dpr = isMobile ? 0.6 : 1;
    const targetFps = isMobile ? 24 : 30;
    const effectiveScale = isMobile ? scale * 0.5 : scale;

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr, // Lower on mobile for performance
    });
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    containerEl.appendChild(canvas);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: useCustomColor },
        uSpeed: { value: speed * 0.4 },
        uDirection: { value: directionMultiplier },
        uScale: { value: effectiveScale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 },
        uIterations: { value: iterations },
        uBrightness: { value: brightness },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteractive || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePos.current.x = e.clientX - rect.left;
      mousePos.current.y = e.clientY - rect.top;
      const mouseUniform = program.uniforms.uMouse.value as Float32Array;
      mouseUniform[0] = mousePos.current.x;
      mouseUniform[1] = mousePos.current.y;
    };

    if (mouseInteractive) {
      containerEl.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    const setSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height);
      const res = program.uniforms.iResolution.value as Float32Array;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(containerEl);
    setSize();

    let raf = 0;
    const t0 = performance.now();
    const FRAME_INTERVAL = 1000 / targetFps;
    let lastFrameTime = 0;

    /* Pause-when-invisible: the Plasma container is `fixed top-0
       h-screen` and masked to roughly the top third, so once the
       user scrolls past the first viewport the plasma is no longer
       visible. Pausing the shader then saves the whole per-frame
       GPU cost for 90% of the user's time on the page.
       Pause-when-hidden: likewise when the tab is backgrounded —
       the browser already throttles RAF, but cancelling outright
       drops us to 0 work instead of 1 fps. */
    let scrollPaused = false;
    let visibilityPaused = document.hidden;

    const updateScrollPaused = () => {
      /* Slight buffer past the viewport height so the plasma keeps
         running through the brief "about to come back into view"
         zone if the user scrolls back up. */
      scrollPaused = window.scrollY > window.innerHeight * 1.25;
    };
    updateScrollPaused();
    window.addEventListener("scroll", updateScrollPaused, { passive: true });

    const onVisibilityChange = () => {
      visibilityPaused = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (scrollPaused || visibilityPaused) return;
      if (t - lastFrameTime < FRAME_INTERVAL) return;
      lastFrameTime = t;

      const timeValue = (t - t0) * 0.001;
      if (direction === 'pingpong') {
        const pingpongDuration = 10;
        const segmentTime = timeValue % pingpongDuration;
        const isForward = Math.floor(timeValue / pingpongDuration) % 2 === 0;
        const u = segmentTime / pingpongDuration;
        const smooth = u * u * (3 - 2 * u);
        const pingpongTime = isForward ? smooth * pingpongDuration : (1 - smooth) * pingpongDuration;
        (program.uniforms.uDirection as { value: number }).value = 1.0;
        (program.uniforms.iTime as { value: number }).value = pingpongTime;
      } else {
        (program.uniforms.iTime as { value: number }).value = timeValue;
      }
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", updateScrollPaused);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (mouseInteractive && containerEl) {
        containerEl.removeEventListener('mousemove', handleMouseMove);
      }
      try {
        containerEl?.removeChild(canvas);
      } catch {
        console.warn('Canvas already removed from container');
      }
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive]);

  /* Fallback gradient is hidden by default and only shown by the
     effect above when we decide not to run WebGL (low-end device or
     prefers-reduced-motion). Visuals-only div, no rAF, no shaders. */
  const fallbackColor = color ?? "#ffffff";
  return (
    <div ref={containerRef} className="plasma-container">
      <div
        ref={fallbackRef}
        aria-hidden="true"
        style={{
          display: "none",
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 55% at 50% 42%, ${fallbackColor}33 0%, ${fallbackColor}11 35%, transparent 75%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default Plasma;
