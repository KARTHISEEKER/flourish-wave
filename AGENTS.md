<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Keep technical deck content and pure quiz helpers in `src/lib/game-data.ts` so flashcards, quizzes, and tests share a single source of truth.
- Keep learning progress session-only and quiz timing deadline-based; the app requires no account or remote services for its core learning flows.
- Define the visual system in `src/styles.css` and use semantic tokens and existing accessible UI primitives for all interactive surfaces.
