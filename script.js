// Real playback via YouTube IFrame Player API.
// Track titles/artists/thumbnails come from YouTube's public oEmbed endpoint
// (no API key needed) once the playlist's video IDs are known.

const PLAYLIST_ID = "PLdEN-_9tuaOM";
const FALLBACK_COLORS = ["#b985ff,#241238", "#ff5ec4,#3a0f3a", "#5c7bff,#1a1a4a", "#4cc9ff,#0f2a3a"];

const state = {
  player: null,
  tracks: [],          // [{ videoId, title, artist, thumbnail }]
  currentIndex: 0,
  queue: [],            // array of videoIds
  tickHandle: null,
};

const els = {
  playlist: document.getElementById("playlist-list"),
  trackCount: document.getElementById("track-count"),
  queueBody: document.getElementById("queue-body"),
  queueCount: document.getElementById("queue-count"),
  playerTitle: document.getElementById("player-title"),
  playerArtist: document.getElementById("player-artist"),
  barFill: document.getElementById("player-bar-fill"),
  elapsed: document.getElementById("player-elapsed"),
  total: document.getElementById("player-total"),
  btnPlay: document.getElementById("btn-play"),
  btnPrev: document.getElementById("btn-prev"),
  btnNext: document.getElementById("btn-next"),
};

function formatSeconds(total) {
  if (!isFinite(total) || total < 0) return "0:00";
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ---------- metadata (oEmbed, no API key) ----------

async function fetchMeta(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!res.ok) throw new Error("oEmbed failed");
    const data = await res.json();
    return { videoId, title: data.title, artist: data.author_name, thumbnail: data.thumbnail_url };
  } catch {
    return { videoId, title: "Unknown track", artist: "Unknown artist", thumbnail: null };
  }
}

async function loadPlaylistMeta(videoIds) {
  state.tracks = await Promise.all(videoIds.map(fetchMeta));
  renderPlaylist();
  updateNowPlayingCard();
}

function coverStyle(track, fallbackIndex) {
  if (track.thumbnail) return `background-image:url('${track.thumbnail}')`;
  const color = FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
  return `background: linear-gradient(135deg, ${color.split(",")[0]}, ${color.split(",")[1]})`;
}

// ---------- YouTube IFrame API ----------

function onYouTubeIframeAPIReady() {
  state.player = new YT.Player("yt-player", {
    height: "200",
    width: "200",
    playerVars: { listType: "playlist", list: PLAYLIST_ID, playsinline: 1 },
    events: { onReady, onStateChange },
  });
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function onReady() {
  const videoIds = state.player.getPlaylist() || [];
  state.currentIndex = state.player.getPlaylistIndex() || 0;
  loadPlaylistMeta(videoIds);
}

function onStateChange(e) {
  state.currentIndex = state.player.getPlaylistIndex();
  updateNowPlayingCard();

  if (e.data === YT.PlayerState.PLAYING) {
    els.btnPlay.textContent = "⏸";
    state.tickHandle = setInterval(tick, 500);
  } else {
    els.btnPlay.textContent = "▶";
    clearInterval(state.tickHandle);
  }
}

function tick() {
  const current = state.player.getCurrentTime();
  const total = state.player.getDuration();
  els.barFill.style.width = total ? `${(current / total) * 100}%` : "0%";
  els.elapsed.textContent = formatSeconds(current);
  els.total.textContent = formatSeconds(total);
}

function updateNowPlayingCard() {
  const track = state.tracks[state.currentIndex];
  if (!track) return;
  els.playerTitle.textContent = track.title;
  els.playerArtist.textContent = track.artist;
  renderPlaylist();
}

function togglePlay() {
  if (!state.player) return;
  const playerState = state.player.getPlayerState();
  playerState === YT.PlayerState.PLAYING ? state.player.pauseVideo() : state.player.playVideo();
}

// ---------- playlist ----------

function renderPlaylist() {
  els.trackCount.textContent = `${state.tracks.length} tracks`;

  els.playlist.innerHTML = state.tracks.map((track, i) => `
    <div class="track-item ${i === state.currentIndex ? "is-active" : ""}" data-index="${i}">
      <span class="track-number">${String(i + 1).padStart(2, "0")}</span>
      <div class="track-cover" style="${coverStyle(track, i)}"></div>
      <div>
        <p class="track-title">${track.title}</p>
        <p class="track-artist">${track.artist}</p>
      </div>
      <span class="track-duration"></span>
      <button class="track-add" data-add="${track.videoId}" aria-label="Add to queue">+</button>
    </div>
  `).join("");
}

// ---------- queue ----------

function renderQueue() {
  els.queueCount.textContent = state.queue.length;

  if (state.queue.length === 0) {
    els.queueBody.innerHTML = `
      <div class="queue-empty">
        <p>Queue's empty. Add a track.</p>
        <span>LATE NIGHTS · LOUD MUSIC · EMPTY HEARTS</span>
      </div>
    `;
    return;
  }

  const rows = state.queue.map((videoId, i) => {
    const track = state.tracks.find(t => t.videoId === videoId) || { title: "Unknown", artist: "", thumbnail: null };
    return `
      <div class="track-item" data-queue-index="${i}">
        <span class="track-number">${String(i + 1).padStart(2, "0")}</span>
        <div class="track-cover" style="${coverStyle(track, i)}"></div>
        <div>
          <p class="track-title">${track.title}</p>
          <p class="track-artist">${track.artist}</p>
        </div>
        <span class="track-duration"></span>
        <button class="track-add" data-remove="${i}" aria-label="Remove from queue">×</button>
      </div>
    `;
  }).join("");

  els.queueBody.innerHTML = `
    <div class="queue-list">${rows}</div>
    <div class="queue-actions">
      <button class="queue-play" id="btn-play-queue">▶ PLAY QUEUE</button>
      <button class="queue-clear" id="btn-clear-queue">🗑 CLEAR</button>
    </div>
  `;
}

function addToQueue(videoId) {
  state.queue.push(videoId);
  renderQueue();
}

function removeFromQueue(index) {
  state.queue.splice(index, 1);
  renderQueue();
}

function clearQueue() {
  state.queue = [];
  renderQueue();
}

function playQueue() {
  if (state.queue.length === 0 || !state.player) return;
  state.player.loadPlaylist({ playlist: state.queue });
  state.queue = [];
  renderQueue();
}

// ---------- events ----------

els.btnPlay.addEventListener("click", togglePlay);
els.btnNext.addEventListener("click", () => state.player && state.player.nextVideo());
els.btnPrev.addEventListener("click", () => state.player && state.player.previousVideo());

els.playlist.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  if (addBtn) {
    addToQueue(addBtn.dataset.add);
    return;
  }
  const row = e.target.closest(".track-item");
  if (row && state.player) state.player.playVideoAt(Number(row.dataset.index));
});

els.queueBody.addEventListener("click", (e) => {
  if (e.target.id === "btn-play-queue") return playQueue();
  if (e.target.id === "btn-clear-queue") return clearQueue();
  const removeBtn = e.target.closest("[data-remove]");
  if (removeBtn) removeFromQueue(Number(removeBtn.dataset.remove));
});

renderQueue();
