---
model: claude-3-5-sonnet-20241022
---

Create a Merge Request (MR) against this branch: $ARGUMENTS.

Follow these steps:
1. ALWAYS start by running git status to check what branch you're on and what files have changes
2. Stage all changes: `git add -A` or `git add .` to ensure all modified files are included
3. Commit the changes with a descriptive message:
   - Template: `git commit -m "Your MR title here"`
   - For fixes: `git commit -m "FIX: Description of what was fixed"`
   - For risky changes: `git commit -m "RISKY: Description of major changes"`
4. Push the current branch to remote: `git push -u origin HEAD` or `git push origin <branch-name>`
5. Ask for user confirmation before creating the MR
6. Create the MR using GitLab CLI:
   <!-- - Use template: `glab mr create --target-branch dev --title "MR Title" --description "MR Description"` -->
   - create via web: `glab mr create --web` to open browser
7. Show the MR URL to the user
8. Always create Merge Requests against the branch the user specifies (or default to 'dev' branch). NEVER EVER AGAINST 'main'
9. If you run into issues, STOP and explain the error to the user

Alternative GitLab Push & MR Creation (if glab not available):
- After push, GitLab will show a URL in the terminal to create MR
- Or use: `git push -o merge_request.create -o merge_request.target=dev`

Remember:
- Use GitLab CLI (`glab`) for all GitLab-related tasks when available
- Make titles clear & concise, and descriptions detailed yet focused
- DO NOT credit yourself for fixes, prefix the title with "FIX:"
- For large & risky changes, prefix the title with "RISKY:"
- Ensure ALL changes are staged and committed before pushing