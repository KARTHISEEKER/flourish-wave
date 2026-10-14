export type Topic = 'javascript' | 'python' | 'web' | 'computer';
export type TechCard = { id: string; topic: Topic; term: string; definition: string; example: string };
export const topics: { id: Topic; name: string; label: string; symbol: string; description: string }[] = [
  { id: 'javascript', name: 'JavaScript', label: 'JS', symbol: '{ }', description: 'The language of the web' },
  { id: 'python', name: 'Python', label: 'PY', symbol: '>_', description: 'Think it. Code it.' },
  { id: 'web', name: 'Web development', label: 'WEB', symbol: '</>', description: 'Build for the browser' },
  { id: 'computer', name: 'Computer science', label: 'CS', symbol: '01', description: 'Understand what’s underneath' },
];
const content: Record<Topic, [string, string, string][]> = {
  javascript: [
    ['Closure', 'A function that retains access to variables from its outer scope, even after the outer function has finished executing.', 'function counter() { let n = 0; return () => ++n; }'],
    ['Promise', 'An object representing the eventual completion or failure of an asynchronous operation.', 'fetch("/data").then(response => response.json())'],
    ['Hoisting', 'The behavior in which declarations are processed before code executes. Variables declared with let and const cannot be accessed before initialization.', 'sayHi(); function sayHi() { return "Hello"; }'],
    ['Event loop', 'The mechanism that coordinates synchronous code, queued tasks, and microtasks in the JavaScript runtime.', 'setTimeout(() => console.log("Later"), 0)'],
    ['Arrow function', 'A compact function expression that inherits this from the surrounding scope.', 'const double = n => n * 2;'],
    ['Destructuring', 'A syntax for unpacking values from arrays or properties from objects into separate variables.', 'const { name, age } = user;'],
    ['Strict equality', 'A comparison that checks equality without converting the types of the operands.', '5 === "5" // false'],
    ['Spread syntax', 'Syntax that expands an iterable into individual elements or copies enumerable object properties.', 'const copy = [...items];'],
  ],
  python: [
    ['List comprehension', 'A concise expression that creates a list by evaluating an expression for each item in an iterable.', 'squares = [x * x for x in range(5)]'],
    ['Dictionary', 'A mutable collection that maps unique, hashable keys to values.', 'user = {"name": "Ada", "level": 1}'],
    ['Tuple', 'An ordered, immutable sequence of values.', 'point = (10, 20)'],
    ['Decorator', 'A callable that wraps or transforms a function or class, commonly applied with the @ syntax.', '@staticmethod\ndef greet(): return "Hello"'],
    ['Generator', 'An iterator-producing function that yields values lazily instead of building an entire collection at once.', 'def count():\n    yield 1\n    yield 2'],
    ['Exception', 'An object representing an error or exceptional condition that can be raised and handled.', 'try: n = int("x")\nexcept ValueError: n = 0'],
    ['Lambda', 'An anonymous function defined as a single expression.', 'double = lambda x: x * 2'],
    ['Set', 'An unordered collection of distinct, hashable elements.', 'unique = set([1, 1, 2]) // {1, 2}'],
  ],
  web: [
    ['Semantic HTML', 'HTML elements that communicate the meaning and structure of their content.', '<article><h1>A story</h1></article>'],
    ['CSS Flexbox', 'A one-dimensional layout system for arranging elements along a row or column.', '.row { display: flex; gap: 1rem; }'],
    ['CSS Grid', 'A two-dimensional layout system that places elements into rows and columns.', '.grid { display: grid; grid-template-columns: 1fr 1fr; }'],
    ['DOM', 'A tree-like representation of an HTML document that scripts can read and modify.', 'document.querySelector("h1").textContent = "Hello";'],
    ['HTTP', 'An application-layer protocol used to exchange requests and responses between clients and servers.', 'GET /articles HTTP/1.1'],
    ['Responsive design', 'An approach that adapts a layout to different screen sizes and device capabilities.', '@media (max-width: 600px) { .grid { display: block; } }'],
    ['Accessibility', 'The practice of making digital experiences usable by people with a wide range of abilities.', '<button aria-label="Close dialog">×</button>'],
    ['REST', 'An architectural style for networked systems, based on stateless requests and a uniform interface to resources.', 'GET /users/42'],
  ],
  computer: [
    ['Algorithm', 'A finite sequence of well-defined steps used to solve a problem or perform a computation.', 'Binary search repeatedly halves a sorted search space.'],
    ['Time complexity', 'A measure of how an algorithm’s running time grows with the size of its input.', 'A linear search has O(n) time complexity.'],
    ['Stack', 'A last-in, first-out data structure in which items are added and removed at one end.', 'push(A), push(B), pop() → B'],
    ['Queue', 'A first-in, first-out data structure in which the earliest added item is removed first.', 'enqueue(A), enqueue(B), dequeue() → A'],
    ['Recursion', 'A technique in which a function calls itself to solve smaller instances of a problem, stopping at a base case.', 'factorial(n) = n × factorial(n − 1); factorial(0) = 1'],
    ['Hash table', 'A data structure that uses a hash function to map keys to locations for efficient lookup.', 'A map can retrieve a value by its key in average O(1) time.'],
    ['Binary search', 'A search algorithm that repeatedly halves a sorted collection to locate a target.', 'Compare with the middle element, then search one half.'],
    ['Encapsulation', 'The bundling of data and the operations on that data while controlling access to internal state.', 'A class exposes methods while keeping implementation details private.'],
  ],
};
export const cards: TechCard[] = topics.flatMap(topic => content[topic.id].map(([term, definition, example], i) => ({ id: `${topic.id}-${i}`, topic: topic.id, term, definition, example })));
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export type Question = { card: TechCard; options: string[] };
export type Answer = { question: Question; selected: string };
export function makeQuiz(pool: TechCard[]): Question[] {
  return shuffle(pool).slice(0, 10).map(card => ({ card, options: shuffle([card.definition, ...shuffle(cards.filter(other => other.id !== card.id)).slice(0, 3).map(other => other.definition)]) }));
}
export function scoreAnswers(answers: Answer[]) {
  return answers.filter(answer => answer.selected === answer.question.card.definition).length * 100;
}