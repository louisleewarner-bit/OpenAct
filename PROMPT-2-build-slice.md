Read CLAUDE.md, docs/plan.md and docs/decisions.md, then build the next unticked slice in plan.md.

1. Plan it with anthropic-skills:cunning-plan: files to touch, tests to write, and how you'll show it working. Wait for my OK.
2. Write tests first for format logic (parser, layout engine, import and export), using the script-formats skill for the rules.
3. Implement until the tests pass. Then use the run skill to check it in the browser; for layout changes, show me a screenshot of the page view.
4. Run /code-review and /simplify, and fix what they find.
5. Tick the slice in plan.md, log new decisions in decisions.md, and commit.

Done when: the slice's done-when line holds, the tests pass, and I've approved the screenshot or demo.

Before the first public release: run /security-review (treat shared script files as untrusted input: FDX is XML, DOCX is a zip, pasted text can carry HTML), then engineering:deploy-checklist, then engineering:documentation for the README and a user guide.
