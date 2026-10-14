import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, CircleCheck, Code2, Flame, Layers, RotateCcw, Shuffle, Target, Timer, Trophy, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cards, topics, shuffle, makeQuiz, scoreAnswers, type TechCard, type Topic, type Question, type Answer } from '@/lib/game-data';
import boltImage from '@/assets/quiz-bolt.jpg';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'TechQuest — Flashcards & Speed Quiz' },
    { name: 'description', content: 'Level up your programming knowledge with 32 interactive technical flashcards, a 60-second speed quiz, live scoring, and answer review.' },
    { property: 'og:title', content: 'TechQuest — Flashcards & Speed Quiz' },
    { property: 'og:description', content: 'Flip. Learn. Level up. Your next technical breakthrough starts here.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

type Round = { questions: Question[]; answers: Answer[]; deadline: number; remaining: number; selected: string | null; finished: boolean };
function Index() {
  const [topic, setTopic] = useState<Topic>('javascript');
  const [deck, setDeck] = useState<TechCard[]>(cards.filter(c => c.topic === 'javascript'));
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<string[]>([]);
  const [studied, setStudied] = useState<string[]>([]);
  const [bestScore, setBestScore] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [review, setReview] = useState(false);
  const [quizSetup, setQuizSetup] = useState(false);
  const [quizTopic, setQuizTopic] = useState<Topic | 'all'>('all');
  const [activeNav, setActiveNav] = useState('learn');
  const studyRef = useRef<HTMLDivElement>(null);
  const libraryRef = useRef<HTMLElement>(null);
  const current = deck[position];
  const currentTopic = topics.find(t => t.id === topic) ?? topics[0];
  const correct = round ? scoreAnswers(round.answers) / 100 : 0;
  const question = round?.questions[round.answers.length];

  useEffect(() => {
    if (!round || round.finished) return;
    const tick = () => setRound(previous => {
      if (!previous || previous.finished) return previous;
      const remaining = Math.max(0, Math.ceil((previous.deadline - Date.now()) / 1000));
      return { ...previous, remaining, finished: remaining === 0 };
    });
    const interval = window.setInterval(tick, 200);
    tick();
    return () => window.clearInterval(interval);
  }, [round?.deadline, round?.finished]);

  useEffect(() => {
    if (!round?.finished) return;
    setBestScore(previous => Math.max(previous, scoreAnswers(round.answers)));
    setCompletedQuizzes(previous => previous + 1);
  }, [round?.finished]);

  function selectTopic(next: Topic) {
    setTopic(next); setDeck(cards.filter(c => c.topic === next)); setPosition(0); setFlipped(false);
  }
  function flip() {
    if (!current) return;
    setFlipped(!flipped);
    setStudied(previous => previous.includes(current.id) ? previous : [...previous, current.id]);
  }
  function move(delta: number) { setFlipped(false); setPosition(previous => (previous + delta + deck.length) % deck.length); }
  function startQuiz() {
    setRound({ questions: makeQuiz(quizTopic === 'all' ? cards : cards.filter(c => c.topic === quizTopic)), answers: [], deadline: Date.now() + 60000, remaining: 60, selected: null, finished: false });
    setReview(false); setQuizSetup(false);
  }
  function answer(selected: string) {
    setRound(previous => {
      if (!previous || previous.finished || previous.selected || Date.now() >= previous.deadline) return previous;
      const q = previous.questions[previous.answers.length];
      if (!q) return previous;
      return { ...previous, selected, answers: [...previous.answers, { question: q, selected }] };
    });
  }
  function nextQuestion() {
    setRound(previous => previous ? { ...previous, selected: null, finished: previous.answers.length === previous.questions.length || Date.now() >= previous.deadline } : null);
  }
  // While feedback is shown, keep the just-answered question in place.
  const visibleQuestion = round?.selected ? round.answers[round.answers.length - 1]?.question : question;

  return (
    <div>
      <header className="app-header">
        <div className="brand"><span className="brand-mark"><Zap size={22} fill="currentColor" /></span>techquest<span className="text-primary">.</span></div>
        <nav className="header-nav" aria-label="Main navigation">
          <Button variant="ghost" className={`nav-button ${activeNav === 'learn' ? 'active' : ''}`} onClick={() => { setActiveNav('learn'); studyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}><Layers />Learn</Button>
          <Button variant="ghost" className={`nav-button ${activeNav === 'decks' ? 'active' : ''}`} onClick={() => { setActiveNav('decks'); libraryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}><BookOpen />Decks</Button>
          <Button variant="ghost" className="nav-button" onClick={() => setQuizSetup(true)}><Zap />Quiz</Button>
        </nav>
        <div className="header-meta"><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Flame size={15} className="text-coral" />Keep the spark alive</span><div className="avatar" title="Your learning session">YOU</div></div>
      </header>
      <main className="main-shell">
        <section className="intro animate-arrive">
          <div><div className="eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-primary" />A little practice. A big leap.</div><h1>Make knowledge your superpower<span className="text-primary">.</span></h1><p>Flip a card. Spark a connection. Get a little better every day.</p></div>
          <div className="level-box"><span className="level-icon"><Trophy size={23} /></span><div><div className="text-xs font-medium">Level {1 + Math.floor(mastered.length / 8)} · {mastered.length >= 8 ? 'Code explorer' : 'Curious mind'}</div><div className="mt-1 text-[10px] text-muted-foreground">{mastered.length * 25} XP earned this session</div><progress className="mt-2 h-1 w-36 accent-primary" value={mastered.length % 8} max={8} aria-label="Level progress" /></div></div>
        </section>
        <div className="workspace animate-arrive">
          <div ref={studyRef} className="study-panel">
            <div className="panel-heading"><h2 className="section-label"><Layers size={18} className="text-lavender" />Flashcard studio</h2><span className="tiny-tag">LEARN AT YOUR PACE</span></div>
            <div className="topic-tabs" role="tablist" aria-label="Flashcard topic">{topics.map(t => <Button key={t.id} role="tab" aria-selected={topic === t.id} variant="ghost" className={`topic-tab ${topic === t.id ? 'selected' : ''}`} onClick={() => selectTopic(t.id)}>{t.id === 'web' ? 'Web dev' : t.id === 'computer' ? 'Computer science' : t.name}</Button>)}</div>
            <div className="card-stage"><Button variant="ghost" className="flashcard-button" aria-label={flipped ? `Hide definition of ${current?.term}` : `Reveal definition of ${current?.term}`} aria-pressed={flipped} onClick={flip}>
              <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
                <div className="card-face" aria-hidden={flipped}><div className="card-top"><span>{currentTopic.name} · fundamentals</span><Code2 size={17} /></div><span className="card-decoration">{currentTopic.symbol}</span><div className="card-term">{current?.term}</div><div className="card-hint"><RotateCcw size={12} />Reveal the answer</div></div>
                <div className="card-face card-back" aria-hidden={!flipped}><div className="card-top"><span>The connection</span><CircleCheck size={16} /></div><div><h3>{current?.term}</h3><p>{current?.definition}</p><code>{current?.example}</code></div><div className="card-hint"><RotateCcw size={12} />Back to the term</div></div>
              </div>
            </Button></div>
            <div className="study-controls"><div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="icon-control" title="Previous card" aria-label="Previous card" onClick={() => move(-1)}><ChevronLeft /></Button><span className="text-[11px] text-muted-foreground"><span className="text-foreground">{String(position + 1).padStart(2, '0')}</span> / {String(deck.length).padStart(2, '0')}</span><Button variant="ghost" size="icon" className="icon-control" title="Next card" aria-label="Next card" onClick={() => move(1)}><ChevronRight /></Button></div><div className="page-dots" aria-hidden="true">{deck.map((c, i) => <span key={c.id} className={i === position ? 'current' : ''} />)}</div><Button variant="ghost" size="icon" className="icon-control" title="Shuffle deck" aria-label="Shuffle deck" onClick={() => { setDeck(shuffle(deck)); setPosition(0); setFlipped(false); }}><Shuffle /></Button></div>
            <div className="mastery-row"><span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><CircleCheck size={13} className="text-primary" />{mastered.filter(id => id.startsWith(topic)).length} of {deck.length} cards mastered</span><Button variant="ghost" className="learn-button text-primary" disabled={!flipped || Boolean(current && mastered.includes(current.id))} onClick={() => { if (current) setMastered(previous => previous.includes(current.id) ? previous : [...previous, current.id]); move(1); }}><Check size={13} />{current && mastered.includes(current.id) ? 'Mastered' : 'Got it!'}</Button></div>
          </div>
          <div className="side-stack">
            <section className="quiz-tile"><div className="eyebrow"><Zap size={12} />Ready. Set. Recall.</div><img className="quiz-visual" src={boltImage} alt="Electric lime lightning bolt" width={170} height={170} /><h2>60 seconds.<br />Go all in.</h2><p className="quiz-copy">Race the clock. Trust your brain.<br />How much can you recall?</p><div className="quiz-facts"><span><Timer size={13} />60 seconds</span><span><Target size={13} />10 questions</span></div><Button className="start-quiz" onClick={() => setQuizSetup(true)}>Start speed quiz<ArrowRight /></Button></section>
            <section className="progress-tile"><div className="flex items-center justify-between"><h2 className="section-label text-sm"><Target size={16} className="text-sky" />Your momentum</h2><span className="text-[10px] text-muted-foreground">THIS SESSION</span></div><div className="progress-numbers"><div><strong>{String(studied.length).padStart(2, '0')}</strong><p>Cards explored</p></div><div><strong className="text-primary">{String(mastered.length).padStart(2, '0')}</strong><p>Mastered</p></div><div><strong>{bestScore}</strong><p>Best quiz score</p></div></div><div className="mt-4 flex items-center gap-1.5 text-[10px] text-muted-foreground"><Flame size={12} className="text-coral" />{completedQuizzes ? `${completedQuizzes} quiz${completedQuizzes === 1 ? '' : 'zes'} completed. Keep it going!` : 'Small steps. Stronger skills.'}</div></section>
          </div>
        </div>
        <section ref={libraryRef} className="deck-section animate-arrive"><div className="deck-heading"><h2 className="section-label">Pick your next adventure</h2><span className="text-[11px] text-muted-foreground">4 decks · 32 cards</span></div><div className="deck-grid">{topics.map(t => <Button key={t.id} variant="ghost" className={`deck-button ${topic === t.id ? 'active-deck' : ''}`} onClick={() => { selectTopic(t.id); setActiveNav('learn'); studyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}><div className="flex items-center justify-between"><span className={`deck-icon deck-${t.id}`}>{t.symbol}</span><ArrowRight size={15} className="text-muted-foreground" /></div><div><h3>{t.name}</h3><p>{t.description}</p></div><div className="flex justify-between text-[10px] text-muted-foreground"><span>8 flashcards</span><span>{mastered.filter(id => id.startsWith(t.id)).length}/8 <Check size={10} className="inline" /></span></div></Button>)}</div></section>
        <footer className="app-footer"><span className="flex items-center gap-1.5"><Zap size={11} />Built for curious minds.</span><span>Less scrolling. More knowing. <span className="text-primary">That’s the quest.</span></span></footer>
      </main>
      <Dialog open={quizSetup} onOpenChange={setQuizSetup}><DialogContent className="bg-card"><DialogTitle className="font-display text-2xl">Choose your challenge</DialogTitle><DialogDescription>60 seconds. 100 points per correct answer. No penalty for mistakes.</DialogDescription><div className="grid gap-2 py-3"><Button variant={quizTopic === 'all' ? 'default' : 'outline'} onClick={() => setQuizTopic('all')}>All subjects · 10 questions</Button>{topics.map(t => <Button key={t.id} variant={quizTopic === t.id ? 'default' : 'outline'} onClick={() => setQuizTopic(t.id)}>{t.name} · 8 questions</Button>)}</div><Button size="lg" onClick={startQuiz}><Zap />Let’s go</Button></DialogContent></Dialog>
      <Dialog open={Boolean(round)} onOpenChange={open => { if (!open) { if (round && !round.finished) setRound(previous => previous ? { ...previous, finished: true } : null); else setRound(null); } }}>
        <DialogContent className="game-modal" showCloseButton={false}>
          <DialogTitle className="sr-only">{round?.finished ? 'Quiz results' : '60-second speed quiz'}</DialogTitle><DialogDescription className="sr-only">Choose the correct definition for each technical term before the timer expires.</DialogDescription>
          {round && !round.finished && visibleQuestion && <>
            <div className="quiz-topline"><div className="section-label"><Zap size={18} className="text-primary" />Speed quiz</div><div className={`quiz-timer ${round.remaining <= 10 ? 'urgent' : ''}`} role="timer" aria-label={`${round.remaining} seconds remaining`}><Timer size={19} />0:{String(round.remaining).padStart(2, '0')}</div><Button variant="ghost" size="icon" aria-label="Finish quiz early" title="Finish quiz early" onClick={() => setRound(previous => previous ? { ...previous, finished: true } : null)}><X /></Button></div>
            <div className="timer-track"><div className="timer-progress" style={{ width: `${round.remaining / 60 * 100}%` }} /></div>
            <div className="flex justify-between text-xs text-muted-foreground"><span>QUESTION {Math.min(round.answers.length + (round.selected ? 0 : 1), round.questions.length)} / {round.questions.length}</span><span><strong className="text-primary">{correct * 100} PTS</strong> · {correct} correct</span></div>
            <div className="quiz-question" key={visibleQuestion.card.id}><p className="mt-6 text-xs text-muted-foreground">Which definition matches this term?</p><h2>{visibleQuestion.card.term}</h2><div className="quiz-options">{visibleQuestion.options.map((option, i) => <Button key={option} variant="ghost" disabled={Boolean(round.selected)} className={`answer-option ${round.selected && option === visibleQuestion.card.definition ? 'correct-option' : ''} ${round.selected === option && option !== visibleQuestion.card.definition ? 'wrong-option' : ''}`} onClick={() => answer(option)}><span className="answer-letter">{'ABCD'[i]}</span><span>{option}</span></Button>)}</div></div>
            {round.selected && <div className="answer-feedback"><span className={round.selected === visibleQuestion.card.definition ? 'text-primary' : 'text-coral'}>{round.selected === visibleQuestion.card.definition ? '✓ Nailed it! +100 points' : 'Not quite — the correct answer is highlighted.'}</span><Button onClick={nextQuestion}>{round.answers.length === round.questions.length ? 'See results' : 'Next'}<ArrowRight /></Button></div>}
          </>}
          {round?.finished && <>
            <div className="flex items-center justify-between"><span className="eyebrow">Quest complete</span><Button variant="ghost" size="icon" aria-label="Close results" onClick={() => setRound(null)}><X /></Button></div>
            <div className="results-title"><div className="trophy-badge"><Trophy size={33} /></div><h2>{correct >= round.questions.length * .8 ? 'Knowledge looks good on you.' : correct ? 'One step sharper.' : 'Every quest starts somewhere.'}</h2><p className="text-sm text-muted-foreground">{round.remaining === 0 ? 'Time’s up! ' : ''}{correct ? 'Keep that curiosity going.' : 'Explore the flashcards and give it another go.'}</p></div>
            <div className="result-stats"><div><strong>{correct * 100}</strong><p>Final score</p></div><div><strong>{correct}/{round.questions.length}</strong><p>Correct answers</p></div><div><strong>{round.answers.length ? Math.round(correct / round.answers.length * 100) : 0}%</strong><p>Answer accuracy</p></div></div>
            <p className="mt-3 text-center text-xs text-muted-foreground">{round.answers.length} answered · {round.questions.length - round.answers.length} unanswered · {60 - round.remaining}s elapsed</p>
            <div className="mt-6 flex justify-center gap-3"><Button onClick={startQuiz}><RotateCcw />Play again</Button><Button variant="outline" onClick={() => setReview(!review)}><BookOpen />{review ? 'Hide answers' : 'Review answers'}</Button></div>
            {review && <div className="mt-6"><h3 className="font-display text-lg">Your answer review</h3>{round.questions.map(q => { const a = round.answers.find(item => item.question.card.id === q.card.id); return <div key={q.card.id} className="review-item"><div className="flex items-center justify-between text-sm"><strong>{q.card.term}</strong><span className={a?.selected === q.card.definition ? 'text-primary' : 'text-coral'}>{!a ? 'Unanswered' : a.selected === q.card.definition ? 'Correct' : 'Incorrect'}</span></div>{a && a.selected !== q.card.definition && <p>Your answer: {a.selected}</p>}<p><span className="text-primary">Correct answer: </span>{q.card.definition}</p></div>; })}</div>}
          </>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
