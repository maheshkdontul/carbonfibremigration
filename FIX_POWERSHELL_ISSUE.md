# Fix PowerShell Execution Policy Issue

## Problem
PowerShell is blocking npm commands due to execution policy restrictions.

## Solution Options

### Option 1: Fix Execution Policy (Recommended)

**Run this command in PowerShell (as Administrator):**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Or use the provided script:**
1. Right-click on `fix-powershell.ps1`
2. Select "Run with PowerShell"
3. If prompted, allow it to run

**Or run manually in PowerShell:**

```powershell
# Open PowerShell and run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Type `Y` when prompted, then try `npm run dev` again.

### Option 2: Use Command Prompt Instead

Instead of PowerShell, use **Command Prompt (cmd)**:

1. Open Command Prompt (cmd.exe)
2. Navigate to your project:
   ```
   cd "C:\Users\mahes\OneDrive\Documents\Cursor\2. Copper-Fiber migration -Cursor"
   ```
3. Run:
   ```
   npm run dev
   ```

### Option 3: Bypass for Single Command

You can bypass the policy for a single command:

```powershell
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```

## Explanation

**What is ExecutionPolicy?**
- Windows security feature that controls what scripts can run
- By default, it's often set to "Restricted" which blocks everything

**RemoteSigned:**
- Allows local scripts to run
- Requires scripts from the internet to be signed
- Safe for development use

**CurrentUser scope:**
- Only affects your user account (doesn't require admin)
- Safe and reversible

## Verify Fix

After fixing, verify with:
```powershell
Get-ExecutionPolicy
```

Should return: `RemoteSigned`

Then try:
```powershell
npm run dev
```

