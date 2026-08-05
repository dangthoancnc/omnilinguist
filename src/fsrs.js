// v9.1.49-1 — FSRS 4.5 Engine (simplified, no external deps)
// Dựa trên thuật toán FSRS-4.5 của Jarrett Ye (open-spaced-repetition/fsrs4anki)
// https://github.com/open-spaced-repetition/fsrs4anki

// ── Hằng số FSRS 4.5 mặc định ──
const DEFAULT_PARAMS = {
  w: [0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0589,
      1.4755, 0.1544, 1.0070, 1.9395, 0.1100, 0.2900, 2.2700, 0.1500, 2.9898],
  DECAY: -0.5,
  FACTOR: 19/81,
  REQUEST_RETENTION: 0.9,
};

// ── Rating enum ──
export const Rating = { Again: 1, Hard: 2, Good: 3, Easy: 4 };

// ── Card State ──
export const State = { New: 0, Learning: 1, Review: 2, Relearning: 3 };

// ── Hàm tính forgetting curve ──
function forgettingCurve(t, s, params = DEFAULT_PARAMS) {
  return Math.pow(1 + params.FACTOR * t / s, params.DECAY);
}

// ── Khởi tạo card mới ──
export function initCard(cardId) {
  return {
    id: cardId,
    state: State.New,
    due: new Date().toISOString(),
    stability: 0,
    difficulty: 0,
    lapses: 0,
    reps: 0,
    lastReview: null,
  };
}

// ── Hàm tính initial stability theo rating ──
function initStability(rating, w = DEFAULT_PARAMS.w) {
  return Math.max(w[rating - 1], 0.1);
}

// ── Hàm tính initial difficulty ──
function initDifficulty(rating, w = DEFAULT_PARAMS.w) {
  return Math.min(Math.max(w[4] - Math.exp(w[5] * (rating - 1)) + 1, 1), 10);
}

// ── Hàm cập nhật difficulty sau review ──
function nextDifficulty(d, rating, w = DEFAULT_PARAMS.w) {
  const delta = -w[6] * (rating - 3);
  return Math.min(Math.max(d + delta * (10 - d) / 9, 1), 10);
}

// ── Hàm tính next stability (recall) ──
function nextRecallStability(d, s, r, rating, w = DEFAULT_PARAMS.w) {
  const hardPenalty = rating === Rating.Hard ? w[15] : 1;
  const easyBonus = rating === Rating.Easy ? w[16] : 1;
  return s * (
    Math.exp(w[8]) *
    (11 - d) *
    Math.pow(s, -w[9]) *
    (Math.exp((1 - r) * w[10]) - 1) *
    hardPenalty * easyBonus
  );
}

// ── Hàm tính next stability (forget/lapse) ──
function nextForgetStability(d, s, r, w = DEFAULT_PARAMS.w) {
  return Math.max(
    w[11] * Math.pow(d, -w[12]) * (Math.pow(s + 1, w[13]) - 1) * Math.exp((1 - r) * w[14]),
    0.1
  );
}

// ── Hàm tính interval từ stability ──
function nextInterval(stability, params = DEFAULT_PARAMS) {
  const interval = stability / params.FACTOR *
    (Math.pow(params.REQUEST_RETENTION, 1 / params.DECAY) - 1);
  return Math.max(Math.round(interval), 1);
}

// ── HÀM CHÍNH: Xử lý review và tính card tiếp theo ──
export function scheduleCard(card, rating, now = new Date()) {
  const w = DEFAULT_PARAMS.w;
  const updated = { ...card, lastReview: now.toISOString(), reps: card.reps + 1 };

  if (card.state === State.New) {
    // Lần đầu học
    updated.stability = initStability(rating, w);
    updated.difficulty = initDifficulty(rating, w);
    updated.state = rating === Rating.Again ? State.Learning : State.Review;

    const daysAdd = rating === Rating.Again ? 0 :
                    rating === Rating.Hard ? 1 :
                    rating === Rating.Good ? nextInterval(updated.stability) :
                    nextInterval(updated.stability * w[16]);
    const due = new Date(now);
    due.setDate(due.getDate() + daysAdd);
    updated.due = due.toISOString();

  } else if (card.state === State.Review || card.state === State.Learning) {
    const elapsed = card.lastReview
      ? Math.max((now - new Date(card.lastReview)) / 86400000, 0)
      : 0;
    const r = forgettingCurve(elapsed, card.stability);

    updated.difficulty = nextDifficulty(card.difficulty, rating, w);

    if (rating === Rating.Again) {
      // Lapse
      updated.lapses += 1;
      updated.stability = nextForgetStability(updated.difficulty, card.stability, r, w);
      updated.state = State.Relearning;
      const due = new Date(now);
      due.setDate(due.getDate() + 1);
      updated.due = due.toISOString();
    } else {
      updated.stability = nextRecallStability(updated.difficulty, card.stability, r, rating, w);
      updated.state = State.Review;
      const interval = nextInterval(updated.stability);
      const due = new Date(now);
      due.setDate(due.getDate() + interval);
      updated.due = due.toISOString();
    }
  }

  return updated;
}

// ── Kiểm tra card có đến hạn hôm nay không ──
export function isDue(card, now = new Date()) {
  return new Date(card.due) <= now;
}

// ── Tính ngày còn lại ──
export function daysUntilDue(card, now = new Date()) {
  const diff = (new Date(card.due) - now) / 86400000;
  return Math.ceil(diff);
}
