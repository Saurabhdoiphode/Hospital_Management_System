# Git Push Instructions

To push this repository to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: Hospital Management System"
git remote add origin https://github.com/Saurabhdoiphode/Hospital_Management_System.git
git branch -M main
git push -u origin main
```

If you already have a remote configured:
```bash
git remote set-url origin https://github.com/Saurabhdoiphode/Hospital_Management_System.git
git push -u origin main
```

### Authentication & Common Push Problems
- **2FA / Personal Access Token (PAT)**: Create a GitHub PAT at [https://github.com/settings/tokens](https://github.com/settings/tokens) and use it as your password.
- **SSH Alternative**:
  ```bash
  ssh-keygen -t ed25519 -C "your_email@example.com"
  cat ~/.ssh/id_ed25519.pub
  ```
  Add key to [https://github.com/settings/ssh/new](https://github.com/settings/ssh/new), then set remote:
  ```bash
  git remote set-url origin git@github.com:Saurabhdoiphode/Hospital_Management_System.git
  ```
- **Unrelated Histories**:
  ```bash
  git pull origin main --allow-unrelated-histories
  ```
