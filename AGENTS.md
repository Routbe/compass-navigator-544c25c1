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

## Repository import boundaries
- Preserve imported ROUT routes, design system, MDX catalog and cookie-based account adapters because this is a source import, not a recreation of GitHub.
- Never copy source environment files, repository metadata or generated route trees because connections and generated output belong to this project.
- Keep database scripts and the standalone media worker as source only until separately reviewed and configured because copying code does not authorize live-data changes or service deployment.
