import { describe, it, expect } from 'vitest';
import { cards, topics, shuffle, makeQuiz, scoreAnswers } from '../lib/game-data';

describe('TechQuest learning rules', () => {
  it('has complete, unique cards in every topic', () => {
    expect(cards).toHaveLength(32);
    expect(new Set(cards.map(c => c.id)).size).toBe(32);
    for (const t of topics) expect(cards.filter(c => c.topic === t.id)).toHaveLength(8);
    for (const c of cards) { expect(c.term).toBeTruthy(); expect(c.definition).toBeTruthy(); expect(c.example).toBeTruthy(); }
  });
  it('makes ten distinct multiple-choice questions with one correct choice', () => {
    const quiz = makeQuiz(cards);
    expect(quiz).toHaveLength(10);
    expect(new Set(quiz.map(q => q.card.id)).size).toBe(10);
    for (const q of quiz) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options.filter(option => option === q.card.definition)).toHaveLength(1);
    }
  });
  it('restricts a subject quiz to its eight cards', () => {
    expect(makeQuiz(cards.filter(c => c.topic === 'python')).every(q => q.card.topic === 'python')).toBe(true);
    expect(makeQuiz(cards.filter(c => c.topic === 'python'))).toHaveLength(8);
  });
  it('scores correct answers only, with no penalty for mistakes', () => {
    const questions = makeQuiz(cards);
    const q = questions[0];
    if (!q) throw new Error('Missing question');
    expect(scoreAnswers([])).toBe(0);
    expect(scoreAnswers([{ question: q, selected: q.card.definition }])).toBe(100);
    expect(scoreAnswers([{ question: q, selected: 'wrong' }])).toBe(0);
    expect(scoreAnswers(questions.map(question => ({ question, selected: question.card.definition })))).toBe(1000);
  });
  it('shuffles without changing the original deck', () => {
    const original = [...cards];
    const mixed = shuffle(cards);
    expect(cards).toEqual(original);
    expect(mixed).toHaveLength(cards.length);
    expect(new Set(mixed.map(c => c.id))).toEqual(new Set(cards.map(c => c.id)));
  });
});