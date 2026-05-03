# GitHub Release Checklist

## Before making repository public

- Run `npm run build`
- Run `npm run lint`
- Run `npm audit --omit=dev --audit-level=high`
- Confirm no `.env` file is tracked
- Confirm no Supabase service role key is exposed
- Confirm Supabase RLS is enabled
- Confirm `anon` and `authenticated` role permissions are reviewed
- Confirm README links are correct
- Confirm screenshots do not expose private data

## After making repository public

- Add repository URL to README
- Add repository URL to `/hackathon` page if needed
- Add screenshots
- Add demo video link
- Submit to hackathon platform

## Commands

```bash
git status
git add .
git commit -m "Prepare project for public hackathon submission"
git remote add origin <GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```
