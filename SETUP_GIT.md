# Git Setup Instructions

## Configure Git (Required for First Commit)

Before making your first commit, you need to tell Git who you are. Run these commands:

**For this repository only (recommended):**
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

**Or globally (for all repositories):**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Make Your First Commit

After configuring Git, run:

```bash
# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: Phase 1 complete - CFMS project setup"
```

## Connect to Remote Repository (Optional)

If you want to push to GitHub/GitLab/Bitbucket:

1. Create a repository on your Git hosting service
2. Add the remote:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo.git
   ```
3. Push your code:
   ```bash
   git push -u origin master
   ```

## Common Git Commands

```bash
# Check status of files
git status

# Stage specific file
git add filename.ts

# Stage all files
git add .

# Commit changes
git commit -m "Description of changes"

# View commit history
git log

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout branch-name

# View branches
git branch
```

