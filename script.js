// Real playback via YouTube IFrame Player API.
// We take full manual control of "what plays next" instead of relying on
// YouTube's own playlist cursor — that's what let title/audio drift out of
// sync before. Every track change goes through loadVideoById().

const PLAYLIST_ID = "PLdEN-_9tuaOM";
const FALLBACK_COLORS = ["#b985ff,#241238", "#ff5ec4,#3a0f3a", "#5c7bff,#1a1a4a", "#4cc9ff,#0f2a3a"];

const state = {
  player: null,
  playlistIds: [],       // fixed order, from the YouTube playlist
  playlistIndex: 0,       // position in playlistIds when NOT following the queue
  library: {},             // videoId -> { title, artist, thumbnail }
  queue: [],                // persists until user clicks Clear — never auto-clears
  queuePointer: -1,         // index into queue currently playing; -1 = not following queue
  currentVideoId: null,
  shuffle: false,
  repeatMode: "off",        // "off" | "all" | "one"
  tickHandle: null,
  draggedIndex: null,
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
  btnShuffle: document.getElementById("btn-shuffle"),
  btnRepeat: document.getElementById("btn-repeat"),
};

function formatSeconds(total) {
  if (!isFinite(total) || total < 0) return "0:00";
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ---------- metadata (oEmbed, no API key) ----------

async function fetchMeta(videoId) {
  if (state.library[videoId]) return state.library[videoId];
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!res.ok) throw new Error("oEmbed failed");
    const data = await res.json();
    state.library[videoId] = { title: data.title, artist: data.author_name, thumbnail: data.thumbnail_url };
  } catch {
    state.library[videoId] = { title: "Unknown track", artist: "Unknown artist", thumbnail: null };
  }
  return state.library[videoId];
}

function coverStyle(videoId, fallbackIndex) {
  const meta = state.library[videoId];
  if (meta && meta.thumbnail) return `background-image:url('${meta.thumbnail}')`;
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

async function onReady() {
  state.playlistIds = state.player.getPlaylist() || [];
  state.playlistIndex = state.player.getPlaylistIndex() || 0;
  state.currentVideoId = state.playlistIds[state.playlistIndex];

  await Promise.all(state.playlistIds.map(fetchMeta));
  renderPlaylist();
  updateNowPlayingCard();
}

function onStateChange(e) {
  if (e.data === YT.PlayerState.PLAYING) {
    els.btnPlay.textContent = "⏸";
    state.tickHandle = setInterval(tick, 500);
  } else {
    els.btnPlay.textContent = "▶";
    clearInterval(state.tickHandle);
  }

  if (e.data === YT.PlayerState.ENDED) handleTrackEnded();
}

function tick() {
  const current = state.player.getCurrentTime();
  const total = state.player.getDuration();
  els.barFill.style.width = total ? `${(current / total) * 100}%` : "0%";
  els.elapsed.textContent = formatSeconds(current);
  els.total.textContent = formatSeconds(total);
}

// ---------- playback control (manual — never delegate to YT's own cursor) ----------

async function playVideoId(videoId) {
  await fetchMeta(videoId);
  state.currentVideoId = videoId;
  state.player.loadVideoById(videoId);
  state.player.playVideo();
  updateNowPlayingCard();
}

function togglePlay() {
  if (!state.player) return;
  const playerState = state.player.getPlayerState();
  playerState === YT.PlayerState.PLAYING ? state.player.pauseVideo() : state.player.playVideo();
}

function randomIndexExcluding(exclude, length) {
  if (length <= 1) return 0;
  let idx;
  do { idx = Math.floor(Math.random() * length); } while (idx === exclude);
  return idx;
}

// Queue takes priority for both directions. Only when the queue has no
// next/previous slot to offer do we fall back to the main playlist.
function goNext(fromAutoAdvance = false) {
  if (state.repeatMode === "one" && fromAutoAdvance) {
    return playVideoId(state.currentVideoId);
  }

  if (state.queue.length > 0) {
    const nextPointer = state.queuePointer + 1;
    if (nextPointer < state.queue.length) {
      state.queuePointer = nextPointer;
      renderQueue();
      return playVideoId(state.queue[nextPointer]);
    }
  }

  // fall back to the playlist
  const atEnd = state.playlistIndex === state.playlistIds.length - 1;
  if (atEnd && state.repeatMode === "off" && fromAutoAdvance) {
    state.player.pauseVideo();
    return;
  }

  state.queuePointer = -1; // no longer following the queue
  state.playlistIndex = state.shuffle
    ? randomIndexExcluding(state.playlistIndex, state.playlistIds.length)
    : (state.playlistIndex + 1) % state.playlistIds.length;

  renderQueue();
  playVideoId(state.playlistIds[state.playlistIndex]);
}

function goPrev() {
  if (state.queue.length > 0 && state.queuePointer > 0) {
    state.queuePointer -= 1;
    renderQueue();
    return playVideoId(state.queue[state.queuePointer]);
  }

  state.queuePointer = -1;
  state.playlistIndex = state.shuffle
    ? randomIndexExcluding(state.playlistIndex, state.playlistIds.length)
    : (state.playlistIndex - 1 + state.playlistIds.length) % state.playlistIds.length;

  renderQueue();
  playVideoId(state.playlistIds[state.playlistIndex]);
}

function handleTrackEnded() {
  goNext(true);
}

function toggleShuffle() {
  state.shuffle = !state.shuffle;
  els.btnShuffle.classList.toggle("is-active", state.shuffle);
}

function cycleRepeat() {
  const order = ["off", "all", "one"];
  state.repeatMode = order[(order.indexOf(state.repeatMode) + 1) % order.length];
  els.btnRepeat.textContent = state.repeatMode === "one" ? "🔂" : "🔁";
  els.btnRepeat.classList.toggle("is-active", state.repeatMode !== "off");
  els.btnRepeat.title = `Repeat: ${state.repeatMode}`;
}

// ---------- now playing card ----------

function updateNowPlayingCard() {
  const meta = state.library[state.currentVideoId];
  if (!meta) return;
  els.playerTitle.textContent = meta.title;
  els.playerArtist.textContent = meta.artist;
  renderPlaylist();
  renderQueue();
}

// ---------- playlist ----------

function renderPlaylist() {
  els.trackCount.textContent = `${state.playlistIds.length} tracks`;

  els.playlist.innerHTML = state.playlistIds.map((videoId, i) => {
    const meta = state.library[videoId] || {};
    return `
      <div class="track-item ${videoId === state.currentVideoId ? "is-active" : ""}" data-video-id="${videoId}">
        <span class="track-number">${String(i + 1).padStart(2, "0")}</span>
        <div class="track-cover" style="${coverStyle(videoId, i)}"></div>
        <div>
          <p class="track-title">${meta.title || "Loading…"}</p>
          <p class="track-artist">${meta.artist || ""}</p>
        </div>
        <span class="track-duration"></span>
        <button class="track-add" data-add="${videoId}" aria-label="Add to queue">+</button>
      </div>
    `;
  }).join("");
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
    const meta = state.library[videoId] || {};
    const isCurrent = i === state.queuePointer && videoId === state.currentVideoId;
    return `
      <div class="track-item ${isCurrent ? "is-active" : ""}" draggable="true" data-queue-index="${i}">
        <span class="track-number">⠿</span>
        <div class="track-cover" style="${coverStyle(videoId, i)}"></div>
        <div>
          <p class="track-title">${meta.title || "Loading…"}</p>
          <p class="track-artist">${meta.artist || ""}</p>
        </div>
        <span class="track-duration"></span>
        <button class="track-add" data-remove="${i}" aria-label="Remove from queue">×</button>
      </div>
    `;
  }).join("");

  els.queueBody.innerHTML = `
    <div class="queue-list" id="queue-list">${rows}</div>
    <div class="queue-actions">
      <button class="queue-play" id="btn-play-queue">▶ PLAY QUEUE</button>
      <button class="queue-clear" id="btn-clear-queue">🗑 CLEAR</button>
    </div>
  `;
}

async function addToQueue(videoId) {
  await fetchMeta(videoId);
  state.queue.push(videoId);
  renderQueue();
}

function removeFromQueue(index) {
  state.queue.splice(index, 1);
  if (state.queuePointer === index) state.queuePointer = -1;
  else if (state.queuePointer > index) state.queuePointer -= 1;
  renderQueue();
}

function clearQueue() {
  state.queue = [];
  state.queuePointer = -1;
  renderQueue();
}

function playQueue() {
  if (state.queue.length === 0) return;
  state.queuePointer = 0;
  renderQueue();
  playVideoId(state.queue[0]);
}

function reorderQueue(fromIndex, toIndex) {
  const [moved] = state.queue.splice(fromIndex, 1);
  state.queue.splice(toIndex, 0, moved);

  // keep the pointer glued to whichever video was actually playing
  if (state.queuePointer === fromIndex) state.queuePointer = toIndex;
  else if (fromIndex < state.queuePointer && toIndex >= state.queuePointer) state.queuePointer -= 1;
  else if (fromIndex > state.queuePointer && toIndex <= state.queuePointer) state.queuePointer += 1;

  renderQueue();
}

// ---------- events ----------

els.btnPlay.addEventListener("click", togglePlay);
els.btnNext.addEventListener("click", () => goNext(false));
els.btnPrev.addEventListener("click", goPrev);
els.btnShuffle.addEventListener("click", toggleShuffle);
els.btnRepeat.addEventListener("click", cycleRepeat);

els.playlist.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  if (addBtn) return addToQueue(addBtn.dataset.add);

  const row = e.target.closest(".track-item");
  if (row) {
    state.queuePointer = -1;
    state.playlistIndex = state.playlistIds.indexOf(row.dataset.videoId);
    playVideoId(row.dataset.videoId);
  }
});

els.queueBody.addEventListener("click", (e) => {
  if (e.target.id === "btn-play-queue") return playQueue();
  if (e.target.id === "btn-clear-queue") return clearQueue();

  const removeBtn = e.target.closest("[data-remove]");
  if (removeBtn) return removeFromQueue(Number(removeBtn.dataset.remove));

  const row = e.target.closest("[data-queue-index]");
  if (row) {
    const index = Number(row.dataset.queueIndex);
    state.queuePointer = index;
    renderQueue();
    playVideoId(state.queue[index]);
  }
});

// drag-to-reorder within the queue
els.queueBody.addEventListener("dragstart", (e) => {
  const row = e.target.closest("[data-queue-index]");
  if (row) state.draggedIndex = Number(row.dataset.queueIndex);
});

els.queueBody.addEventListener("dragover", (e) => {
  if (e.target.closest("[data-queue-index]")) e.preventDefault();
});

els.queueBody.addEventListener("drop", (e) => {
  const row = e.target.closest("[data-queue-index]");
  if (!row || state.draggedIndex === null) return;
  e.preventDefault();
  const targetIndex = Number(row.dataset.queueIndex);
  if (targetIndex !== state.draggedIndex) reorderQueue(state.draggedIndex, targetIndex);
  state.draggedIndex = null;
});

renderQueue();
