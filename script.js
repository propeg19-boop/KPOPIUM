:root {
  --void: #08050f;
  --panel: #12081f;
  --neon-violet: #b985ff;
  --neon-pink: #ff5ec4;
  --text: #f3ecff;
  --muted: #a99bc4;
  --glow: rgba(185, 133, 255, 0.55);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--void);
  color: var(--text);
  font-family: "Manrope", sans-serif;
  -webkit-font-smoothing: antialiased;
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}

/* ---------- header ---------- */

.site-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 20;

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;

  padding: 22px 34px;

  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
}

.header-tag { color: var(--muted); }

.header-brand {
  justify-self: center;
  font-family: "Bebas Neue", sans-serif;
  font-size: 20px;
  letter-spacing: 0.25em;
  color: var(--text);
}

.header-status {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--muted);
}

.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--neon-pink);
  box-shadow: 0 0 8px var(--neon-pink);
}

/* ---------- hero ---------- */

.hero {
  position: relative;
  min-height: 100svh;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;

  padding: 130px 60px 60px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: saturate(1.1) brightness(0.85);
}

.hero-fade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, var(--void) 2%, rgba(8,5,15,0.35) 40%, rgba(8,5,15,0.55) 100%),
    linear-gradient(to right, rgba(8,5,15,0.6) 0%, transparent 35%);
}

.grain {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  mix-blend-mode: overlay;
  background-image: radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px);
  background-size: 3px 3px;
  pointer-events: none;
}

.hero-sign {
  position: absolute;
  z-index: 2;
  writing-mode: vertical-rl;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--neon-violet);
  text-shadow: 0 0 10px var(--glow);
}

.hero-sign-left {
  left: 28px;
  top: 130px;
}

.hero-copy {
  position: relative;
  z-index: 2;
  margin-bottom: 44px;
}

.hero-eyebrow {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.25em;
  color: var(--muted);
  margin-bottom: 14px;
}

.hero-copy h1 {
  font-family: "Bebas Neue", sans-serif;
  font-size: clamp(70px, 12vw, 160px);
  line-height: 0.9;
  letter-spacing: 0.04em;
  color: var(--text);
  text-shadow:
    0 0 12px var(--glow),
    0 0 40px rgba(255, 94, 196, 0.35);
}

.hero-tagline {
  margin-top: 12px;
  font-size: 15px;
  color: var(--muted);
  letter-spacing: 0.02em;
}

/* ---------- player ---------- */

.player {
  position: relative;
  z-index: 2;

  width: min(560px, 100%);

  display: grid;
  grid-template-columns: 60px 1fr auto;
  align-items: center;
  gap: 16px;

  padding: 14px 18px;

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(10, 6, 20, 0.65);
  backdrop-filter: blur(16px);
}

.player-art {
  width: 60px; height: 60px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, var(--neon-violet), var(--panel));
}

/* The IFrame API requires a real 200x200 player; we render it at that size
   then scale it down to fit the compact art slot. */
#yt-player {
  width: 200px; height: 200px;
  transform: scale(0.3);
  transform-origin: top left;
  pointer-events: none;
}

.player-info { min-width: 0; }

.player-title {
  font-weight: 700;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-artist {
  margin-top: 2px;
  font-size: 11px;
  color: var(--muted);
}

.player-bar {
  margin-top: 9px;
  height: 3px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  overflow: hidden;
}

.player-bar-fill {
  height: 100%;
  width: 0%;
  background: var(--neon-pink);
  box-shadow: 0 0 8px var(--neon-pink);
  transition: width 200ms linear;
}

.player-time {
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  color: var(--muted);
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.player-controls button {
  width: 30px; height: 30px;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--neon-violet);
  cursor: pointer;
  font-size: 13px;
  transition: color 150ms ease, text-shadow 150ms ease, opacity 150ms ease;
}

.player-controls button:hover { color: var(--text); }

.play-button {
  width: 36px !important; height: 36px !important;
  border-radius: 50%;
  background: var(--neon-violet) !important;
  color: #0a0613 !important;
  box-shadow: 0 0 16px var(--glow);
}

.ctrl-secondary {
  font-size: 12px !important;
  color: rgba(185, 133, 255, 0.45) !important;
}

.ctrl-secondary.is-active {
  color: var(--neon-pink) !important;
  text-shadow: 0 0 10px var(--neon-pink);
}

.scroll-indicator {
  position: relative;
  z-index: 2;
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.2em;
  color: var(--muted);
  animation: bob 2.2s ease-in-out infinite;
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

/* ---------- shared section layout ---------- */

.playlist-section, .queue-section {
  width: min(880px, calc(100% - 48px));
  margin: 0 auto;
}

.playlist-section { padding: 110px 0 100px; }
.queue-section { padding-bottom: 140px; }

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-eyebrow {
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--neon-violet);
  margin-bottom: 8px;
}

.section-heading h2 {
  font-family: "Bebas Neue", sans-serif;
  font-size: clamp(32px, 5vw, 52px);
  letter-spacing: 0.03em;
}

.track-count, .queue-count {
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  color: var(--muted);
}

.queue-count {
  min-width: 26px; height: 26px;
  padding: 0 8px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--neon-pink);
  color: #0a0613;
  font-weight: 700;
}

/* ---------- track rows ---------- */

.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.track-item {
  display: grid;
  grid-template-columns: 28px 48px 1fr auto 36px;
  align-items: center;
  gap: 14px;

  padding: 10px 14px;

  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  background: rgba(18, 8, 31, 0.6);

  transition: border-color 160ms ease, background 160ms ease;
}

.track-item:hover {
  border-color: rgba(185, 133, 255, 0.4);
  background: rgba(18, 8, 31, 0.85);
}

.track-item.is-active {
  border-color: var(--neon-pink);
}

.track-number {
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  color: var(--muted);
  text-align: center;
}

.track-cover {
  width: 48px; height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--panel);
}

.track-title { font-weight: 700; font-size: 13px; }
.track-artist { margin-top: 2px; font-size: 11px; color: var(--muted); }

.track-duration {
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  color: var(--muted);
}

.track-add {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.14);
  background: transparent;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  font-size: 15px;
}

.track-add:hover {
  border-color: var(--neon-violet);
  color: var(--neon-violet);
}

/* ---------- queue ---------- */

.queue-empty {
  padding: 38px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  background: rgba(18, 8, 31, 0.5);
  text-align: center;
}

.queue-empty p { font-weight: 700; font-size: 14px; }
.queue-empty span {
  display: block;
  margin-top: 8px;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  color: var(--muted);
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.queue-list .track-item {
  cursor: grab;
}

.queue-list .track-item:active {
  cursor: grabbing;
}

.queue-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.queue-actions button {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  cursor: pointer;
}

.queue-play {
  border: 1px solid var(--neon-violet);
  background: rgba(185, 133, 255, 0.1);
  color: var(--neon-violet);
}

.queue-clear {
  border: 1px solid rgba(255,255,255,0.14);
  background: transparent;
  color: rgba(255,255,255,0.7);
}

/* ---------- footer ---------- */

.site-footer {
  width: min(880px, calc(100% - 48px));
  margin: 0 auto;
  padding-bottom: 40px;
  display: flex;
  justify-content: space-between;
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.15em;
  color: rgba(255,255,255,0.4);
}

/* ---------- responsive ---------- */

@media (max-width: 700px) {
  .site-header { padding: 18px 20px; }
  .hero { padding: 100px 22px 40px; }
  .hero-sign-left { display: none; }
  .player { grid-template-columns: 50px 1fr; }
  .player-controls { grid-column: 1 / -1; justify-content: center; }
  .track-item { grid-template-columns: 22px 40px 1fr 30px; }
  .track-duration { display: none; }
  .queue-actions { flex-direction: column; }
  .site-footer { flex-direction: column; gap: 10px; }
}
