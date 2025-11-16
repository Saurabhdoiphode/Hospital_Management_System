# Push project to GitHub

These are the steps to push the existing Hospital Management System to GitHub. You provided the repo: https://github.com/Saurabhdoiphode/Hospital_Management_System.git

Open PowerShell in project root and run the commands below. Replace placeholders if needed.

1. Configure git (only if not set):

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

2. Initialize a git repo (if not already in the folder):

```powershell
cd "C:\Users\saura\OneDrive\Desktop\Hospital Management System"
# Initialize
git init
# Check status
git status
```

3. Create .gitignore (we added one already):

```powershell
# Make sure .gitignore is correct
code .gitignore
```

4. Add and commit everything:

```powershell
# Stage
git add .
# Commit
git commit -m "Initial commit: Hospital Management System"
```

5. Add remote and push (set `main` or `master` as appropriate):

```powershell
# Add remote
git remote add origin https://github.com/Saurabhdoiphode/Hospital_Management_System.git
# Rename default branch to main (optional) and push
git branch -M main
# Push to remote
git push -u origin main
```

6. If the repository already contains commits (you get errors), you can force push (be careful):

```powershell
# Force push (overwrites remote)
# git push -f origin main
```

7. Verify on GitHub: go to https://github.com/Saurabhdoiphode/Hospital_Management_System.git and refresh.

Troubleshooting:
- If authentication fails, make sure you are signed in to GitHub. On Windows, recommended is Git Credential Manager or using SSH.
- If remote is already set and pointing to different URL: `git remote -v`, then `git remote set-url origin <URL>` to change it.
- If you're using 2FA with GitHub, either use a PAT (personal access token) in place of your password or set up SSH.

Optional: Set the repository field in package.json (already added).

If you prefer, I can also add a tiny script `PUSH_TO_GITHUB.bat` that runs these commands interactively via PowerShell. Let me know if you want that.
