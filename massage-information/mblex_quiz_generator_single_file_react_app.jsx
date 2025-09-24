import React, { useMemo, useState, useEffect } from "react";

// --- Minimal, single-file React quiz generator ---
// Styling uses Tailwind (no import needed in ChatGPT canvas). UI is clean and modern.
// How to use:
// 1) Pick one or more Topics ("sections").
// 2) Choose the number of questions (max 30).
// 3) Click Generate Quiz. Take the quiz, then Submit to see score + rationales.
// 4) To extend, add more questions to QUESTION_BANK or plug a CSV/JSON (see TODO at bottom).

// Data model
// id: string
// topic: string (section name)
// stem: string (question text)
// choices: string[] (a, b, c, d)
// answer: number (0..3 index)
// rationale: string (brief explanation)

const QUESTION_BANK = [
  // ——— Professionalism / Ethics / Business / Legal (Spanish) ———
  {
    id: "prof-eth-1",
    topic: "Professionalism & Ethics",
    stem:
      "La manera correcta y profesional de programar la próxima cita del cliente Alejandro es:",
    choices: [
      "Mostrarle la agenda con nombres de los clientes para que elija.",
      "Preguntarle día y hora de preferencia sin mostrar agendas de otros clientes.",
      "Enviar por email la agenda completa con todos los nombres de clientes.",
      "Preguntarle si desea ver la agenda con nombres y horarios ya apartados."
    ],
    answer: 1,
    rationale:
      "La confidencialidad exige no exponer datos de otros clientes; pedir una preferencia de día y hora es lo profesional."
  },
  {
    id: "prof-eth-2",
    topic: "Professionalism & Ethics",
    stem:
      "El reglamento para la prevención de mala conducta sexual establece que los terapeutas:",
    choices: [
      "Reconocen límites pero pueden hacer excepciones si el cliente es atractivo.",
      "Deben abstenerse de cualquier conducta que sexualice la relación terapeuta–cliente.",
      "Respetan si el cliente llega algo ebrio.",
      "Proveen terapias extras si se paga por adelantado."
    ],
    answer: 1,
    rationale:
      "Código ético: mantener límites claros y evitar conductas que sexualicen la relación profesional."
  },

  // ——— Application of Massage (Spanish) ———
  {
    id: "app-1",
    topic: "Application of Massage",
    stem:
      "¿Cuál es un efecto reflejo del effleurage profundo?",
    choices: [
      "Liberación de endorfinas.",
      "Aumenta la eliminación de residuos.",
      "Aumenta el flujo venoso y linfático.",
      "Mueve nutrientes a través de los vasos."
    ],
    answer: 2,
    rationale:
      "El effleurage profundo favorece el retorno venoso y linfático por efecto mecánico y reflejo."
  },
  {
    id: "app-2",
    topic: "Application of Massage",
    stem:
      "Tras compresiones isquémicas lentas para cefalea tensional, ¿qué potencia el efecto?",
    choices: [
      "Calentar la zona tratada.",
      "Aplicar estiramiento pasivo lento.",
      "Rango de movimiento activo libre.",
      "Todas las respuestas son correctas."
    ],
    answer: 3,
    rationale:
      "Termo + estiramiento + ROM activo completan el abordaje para dolor tensional."
  },

  // ——— Anatomy, Physiology & Kinesiology (Spanish) ———
  {
    id: "apk-1",
    topic: "Anatomy, Physiology & Kinesiology",
    stem: "¿Qué músculos hacen giro medial de la articulación coxal?",
    choices: [
      "Bíceps femoris y sartorio.",
      "Semitendinosus y semimembranosus.",
      "Rectus femoris y piriforme.",
      "Psoas major e iliacus."
    ],
    answer: 1,
    rationale:
      "Semitendinoso y semimembranoso (isquiotibiales mediales) contribuyen a la rotación medial de la cadera."
  },
  {
    id: "apk-2",
    topic: "Anatomy, Physiology & Kinesiology",
    stem:
      "Los tendones son tejido fibroso que conecta…",
    choices: [
      "Músculo con hueso.",
      "Hueso con hueso.",
      "Músculo con músculo.",
      "Tendón con fibras."
    ],
    answer: 0,
    rationale:
      "Definición fundamental: el tendón une músculo con hueso."
  },

  // ——— Pathology (Spanish) ———
  {
    id: "path-1",
    topic: "Pathology",
    stem:
      "La fascitis plantar es inflamación de la aponeurosis plantar y se causa típicamente por…",
    choices: [
      "Lesión por sobrecarga.",
      "Padecimiento sistémico.",
      "Disfunción articular.",
      "Lesión neurológica."
    ],
    answer: 0,
    rationale:
      "La etiología más común es el sobreuso mecánico de la fascia plantar."
  },
  {
    id: "path-2",
    topic: "Pathology",
    stem:
      "¿En cuál condición está totalmente contraindicado el masaje?",
    choices: [
      "Tristeza/estrés.",
      "Coma diabético o descargas repentinas de insulina.",
      "Embarazo ectópico.",
      "Todas las respuestas son correctas."
    ],
    answer: 3,
    rationale:
      "Cada caso listado constituye contraindicación absoluta por riesgo sistémico/agudo."
  },

  // ——— Assessment / Diagnosis (Spanish) ———
  {
    id: "assess-1",
    topic: "Assessment & Diagnosis",
    stem:
      "En el protocolo de entrevista, ¿cuál es una pregunta específica?",
    choices: [
      "¿Cómo considera su estado de salud habitual?",
      "¿Puede describirme la lesión? ¿Fue por golpe o comenzó gradualmente?",
      "¿Qué tan doloroso es: leve, moderado o severo?",
      "¿Tiene familiares con este mismo trastorno?"
    ],
    answer: 1,
    rationale:
      "Las preguntas específicas buscan detalles concretos de la lesión (mecanismo de inicio)."
  },
  {
    id: "assess-2",
    topic: "Assessment & Diagnosis",
    stem:
      "Pie cavo (pes cavus) se refiere a…",
    choices: [
      "Arco aplanado.",
      "Arco acortado.",
      "Arco muy elevado.",
      "Arco superficial."
    ],
    answer: 2,
    rationale:
      "Pes cavus = arco plantar elevado que cambia las cargas y la biomecánica."
  }
];

const ALL_TOPICS = Array.from(new Set(QUESTION_BANK.map(q => q.topic))).sort();

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function QuizGenerator() {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [count, setCount] = useState(10);
  const [quiz, setQuiz] = useState(null); // { items: [...], startedAt, answers: number[]|null }
  const [page, setPage] = useState(0);

  // persist last selections
  useEffect(() => {
    const saved = localStorage.getItem("mblexQuizState");
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.selectedTopics) setSelectedTopics(s.selectedTopics);
        if (s.count) setCount(s.count);
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(
      "mblexQuizState",
      JSON.stringify({ selectedTopics, count })
    );
  }, [selectedTopics, count]);

  const pool = useMemo(() => {
    if (!selectedTopics.length) return [];
    return QUESTION_BANK.filter(q => selectedTopics.includes(q.topic));
  }, [selectedTopics]);

  function handleGenerate() {
    const n = clamp(Number(count) || 0, 1, 30);
    const chosen = shuffle(pool).slice(0, n).map(q => ({
      ...q,
      // randomize choice order per question to avoid patterns
      _choices: shuffle(q.choices.map((c, idx) => ({ label: c, idx }))),
    }));
    setQuiz({ items: chosen, startedAt: Date.now(), answers: Array(n).fill(null), submittedAt: null });
    setPage(0);
  }

  function selectAnswer(qIdx, choiceIdxOriginal) {
    if (!quiz || quiz.submittedAt) return;
    const next = [...quiz.answers];
    next[qIdx] = choiceIdxOriginal;
    setQuiz({ ...quiz, answers: next });
  }

  function submitQuiz() {
    if (!quiz) return;
    setQuiz({ ...quiz, submittedAt: Date.now() });
  }

  function resetQuiz() {
    setQuiz(null);
    setPage(0);
  }

  const score = useMemo(() => {
    if (!quiz || !quiz.submittedAt) return null;
    let correct = 0;
    quiz.items.forEach((q, i) => {
      if (quiz.answers[i] === q.answer) correct += 1;
    });
    return { correct, total: quiz.items.length, pct: Math.round((correct / quiz.items.length) * 100) };
  }, [quiz]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">MBLEx Quiz Generator</h1>
          <p className="text-sm text-slate-600 mt-1">Select topics, pick up to 30 questions, generate a quiz, and review rationales on submit.</p>
        </header>

        {/* Controls */}
        {!quiz && (
          <section className="bg-white rounded-2xl shadow p-5 mb-6">
            <h2 className="text-xl font-semibold mb-4">Setup</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Topics / Sections</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TOPICS.map(t => {
                    const active = selectedTopics.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() =>
                          setSelectedTopics(active ? selectedTopics.filter(x => x !== t) : [...selectedTopics, t])
                        }
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                          active ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-300 hover:border-slate-500"
                        }`}
                        aria-pressed={active}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                {!selectedTopics.length && (
                  <p className="text-xs text-amber-700 mt-2">Select at least one topic.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Questions (1–30)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={count}
                  onChange={e => setCount(e.target.value)}
                  className="w-32 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <p className="text-xs text-slate-500 mt-2">Pool size for current selection: {pool.length}</p>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={!selectedTopics.length || pool.length === 0}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white shadow disabled:opacity-40"
              >
                Generate Quiz
              </button>
              <button
                onClick={() => { setSelectedTopics([]); setCount(10); }}
                className="px-4 py-2 rounded-xl border border-slate-300"
              >
                Reset
              </button>
            </div>
          </section>
        )}

        {/* Quiz */}
        {quiz && (
          <section className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Quiz</h2>
              <div className="text-sm text-slate-600">Question {page + 1} / {quiz.items.length}</div>
            </div>

            {score ? (
              <Results quiz={quiz} score={score} onRestart={resetQuiz} />
            ) : (
              <QuestionCard
                q={quiz.items[page]}
                qIndex={page}
                selected={quiz.answers[page]}
                onSelect={selectAnswer}
              />
            )}

            {!score && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 rounded-xl border border-slate-300 disabled:opacity-40"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >Prev</button>
                  <button
                    className="px-3 py-2 rounded-xl border border-slate-300 disabled:opacity-40"
                    onClick={() => setPage(p => Math.min(quiz.items.length - 1, p + 1))}
                    disabled={page === quiz.items.length - 1}
                  >Next</button>
                </div>

                <button
                  onClick={submitQuiz}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white shadow"
                >Submit</button>
              </div>
            )}
          </section>
        )}

        {/* Footer / Notes */}
        <div className="text-xs text-slate-500 mt-6">
          <p>
            TODOs: CSV/JSON import, per-topic weight balancing, admin mode, question tagging, timer, and exportable results.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ q, qIndex, selected, onSelect }) {
  return (
    <div>
      <div className="text-sm mb-1 text-slate-500">Topic: {q.topic}</div>
      <div className="text-lg font-medium mb-4">{q.stem}</div>
      <div className="space-y-2">
        {q._choices.map((c, i) => {
          const isChosen = selected === c.idx;
          return (
            <button
              key={i}
              onClick={() => onSelect(qIndex, c.idx)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                isChosen
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 hover:border-slate-500 bg-white"
              }`}
            >
              <span className="mr-2 font-semibold">{String.fromCharCode(97 + i)})</span> {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Results({ quiz, score, onRestart }) {
  return (
    <div>
      <div className="mb-4">
        <div className="text-2xl font-bold">Score: {score.correct}/{score.total} ({score.pct}%)</div>
        <div className="text-sm text-slate-600 mt-1">Review your answers and rationales below.</div>
      </div>

      <ol className="space-y-4">
        {quiz.items.map((q, i) => {
          const chosen = quiz.answers[i];
          const correct = q.answer;
          const isCorrect = chosen === correct;

          // Map back to displayed order for labeling
          const displayedChoices = q._choices;
          const correctDisplayIndex = displayedChoices.findIndex(c => c.idx === correct);
          const chosenDisplayIndex = chosen != null ? displayedChoices.findIndex(c => c.idx === chosen) : -1;

          return (
            <li key={q.id} className="border border-slate-200 rounded-xl p-4">
              <div className="text-sm text-slate-500 mb-1">Topic: {q.topic}</div>
              <div className="font-medium mb-2">{i + 1}. {q.stem}</div>
              <ul className="space-y-1 mb-2">
                {displayedChoices.map((c, j) => (
                  <li
                    key={j}
                    className={`px-3 py-2 rounded-lg ${
                      j === correctDisplayIndex
                        ? "bg-emerald-50 border border-emerald-300"
                        : j === chosenDisplayIndex
                        ? "bg-rose-50 border border-rose-300"
                        : ""
                    }`}
                  >
                    <span className="mr-2 font-semibold">{String.fromCharCode(97 + j)})</span> {c.label}
                  </li>
                ))}
              </ul>
              <div className={`text-sm ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                {isCorrect ? "Correct." : "Incorrect."} <span className="text-slate-700">Rationale:</span> {q.rationale}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex gap-3">
        <button onClick={onRestart} className="px-4 py-2 rounded-xl border border-slate-300">Start New Quiz</button>
      </div>
    </div>
  );
}

// --- Extensibility notes ---
// 1) Add more topics: just add new strings in QUESTION_BANK.topic.
// 2) Enforce Carlos's exam formatting (a,b,c,d) + correct randomization: already implemented.
// 3) Importing questions:
//    - Quick path: paste more objects into QUESTION_BANK.
//    - Better: build a small CSV parser (headers: topic, stem, a, b, c, d, answer, rationale) and transform to this shape.
//    - Add upload UI and persist to localStorage or server DB (e.g., Supabase / Firebase) as a next step.
// 4) Limit to 30: enforced by clamp() and input max.
// 5) Avoid answer patterns: choices are shuffled per question before display.
// 6) Accessibility: buttons are focusable, labels clear; additional ARIA can be added if needed.
