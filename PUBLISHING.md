# Publishing Guide

This guide walks you through publishing the VSCode MIDI Editor extension.

## Prerequisites

### 1. Create a Visual Studio Marketplace Publisher

1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with your Microsoft account
3. Click "Create publisher"
4. Fill in the details:
   - **ID**: A unique identifier (e.g., `your-name-midi`)
   - **Display Name**: Your name or organization
   - **Email**: Contact email (publicly visible)

### 2. Generate a Personal Access Token (PAT)

1. Go to https://dev.azure.com
2. Click on your profile (top right) → Security → Personal Access Tokens
3. Click "+ New Token"
4. Configure:
   - **Name**: "VSCode Extension Publishing"
   - **Organization**: All accessible organizations
   - **Expiration**: Custom (1 year recommended)
   - **Scopes**: Click "Show all scopes" → Check **Marketplace → Manage**
5. Click "Create" and **SAVE THE TOKEN** (you won't see it again)

### 3. Update package.json

Replace `"publisher": "vscode-midi-editor"` with your publisher ID:
```json
{
  "publisher": "your-publisher-id"
}
```

Also update the repository URLs with your GitHub username:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/VSCode-MIDI-Editor.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/VSCode-MIDI-Editor/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/VSCode-MIDI-Editor#readme"
}
```

## Manual Publishing

### First-time Setup

```bash
# Login with your PAT (one-time)
npx vsce login <publisher-id>
# When prompted, paste your PAT
```

### Publish Steps

```bash
# 1. Update version in package.json
# Increment version following semver (e.g., 0.1.0 -> 0.2.0)

# 2. Update CHANGELOG.md
# Document changes in the new version

# 3. Install dependencies
npm ci

# 4. Run tests
npm test

# 5. Build the extension
npm run build

# 6. Package the extension (creates .vsix file)
npm run package

# 7. Test the .vsix locally
# Install in VSCode: Extensions → ... → Install from VSIX

# 8. Publish to marketplace
npx vsce publish

# Or publish specific version
npx vsce publish minor  # 0.1.0 -> 0.2.0
npx vsce publish patch  # 0.1.0 -> 0.1.1
npx vsce publish major  # 0.1.0 -> 1.0.0
```

## Automated Publishing (Recommended)

### Setup GitHub Actions

1. **Add PAT to GitHub Secrets**:
   - Go to your repository on GitHub
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `VSCE_PAT`
   - Value: Your Personal Access Token
   - Click "Add secret"

2. **Verify workflows exist**:
   - `.github/workflows/ci.yml` - Runs on every push/PR
   - `.github/workflows/release.yml` - Runs on version tags

### Publishing a New Release

```bash
# 1. Update version in package.json
# Example: "version": "0.2.0"

# 2. Update CHANGELOG.md
# Add new version section with changes

# 3. Commit changes
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 0.2.0"

# 4. Create and push tag
git tag v0.2.0
git push origin main
git push origin v0.2.0

# 5. Watch the GitHub Actions workflow
# Go to: https://github.com/YOUR_USERNAME/VSCode-MIDI-Editor/actions
```

The workflow will automatically:
- ✅ Run tests
- ✅ Build the extension
- ✅ Create a `.vsix` package
- ✅ Create a GitHub Release with the `.vsix` file
- ✅ Publish to VSCode Marketplace (stable releases only)

### Pre-release Versions

For alpha/beta/rc versions:
```bash
git tag v0.2.0-beta.1
git push origin v0.2.0-beta.1
```

This creates a GitHub Release but **does not** publish to the marketplace.

## Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.2.0): New features (backward compatible)
- **PATCH** (0.1.1): Bug fixes

Pre-release identifiers:
- `0.2.0-alpha.1`: Early preview
- `0.2.0-beta.1`: Feature complete, testing
- `0.2.0-rc.1`: Release candidate

## Marketplace Best Practices

### 1. Add Extension Icon

Create a 128x128 PNG icon and add to package.json:
```json
{
  "icon": "media/icon.png"
}
```

### 2. Add Screenshots

- Place in `media/` folder
- Add to README.md
- Show key features (piano roll, playback, etc.)

### 3. Add Badges

Update README.md:
```markdown
[![Version](https://img.shields.io/visual-studio-marketplace/v/YOUR_PUBLISHER.vscode-midi-editor)](https://marketplace.visualstudio.com/items?itemName=YOUR_PUBLISHER.vscode-midi-editor)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/YOUR_PUBLISHER.vscode-midi-editor)](https://marketplace.visualstudio.com/items?itemName=YOUR_PUBLISHER.vscode-midi-editor)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/YOUR_PUBLISHER.vscode-midi-editor)](https://marketplace.visualstudio.com/items?itemName=YOUR_PUBLISHER.vscode-midi-editor)
```

### 4. Use Keywords

Already configured in package.json:
```json
{
  "keywords": ["midi", "music", "audio", "piano roll", "daw", "sequencer"]
}
```

### 5. Update Categories

Consider changing from "Other" to more specific:
```json
{
  "categories": ["Data Science", "Other"]
}
```

## Post-Publishing

### Verify Installation

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "MIDI Editor"
4. Check that it appears with correct icon, description
5. Install and test

### Monitor

- **Downloads**: https://marketplace.visualstudio.com/items?itemName=YOUR_PUBLISHER.vscode-midi-editor
- **Reviews**: Respond to user feedback
- **Issues**: GitHub Issues for bug reports

## Troubleshooting

### "Extension validation failed"

- Run `npx vsce package` locally to see validation errors
- Common issues:
  - Missing `repository` in package.json
  - Missing `LICENSE` file
  - Invalid `engines.vscode` version
  - Large files not in `.vscodeignore`

### "Publisher not found"

- Verify publisher ID matches exactly
- Re-login: `npx vsce login <publisher-id>`

### "PAT expired"

- Generate a new PAT
- Update GitHub secret `VSCE_PAT`
- Re-login locally: `npx vsce login <publisher-id>`

### "Version already exists"

- Cannot republish same version
- Increment version and try again
- Use `vsce unpublish` to remove (not recommended for stable releases)

## Unpublishing

⚠️ **Warning**: Only unpublish if absolutely necessary (security issue, broken extension)

```bash
# Unpublish specific version
npx vsce unpublish <publisher>.<extension>@<version>

# Unpublish entire extension
npx vsce unpublish <publisher>.<extension>
```

## Resources

- [VSCode Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce CLI Reference](https://github.com/microsoft/vscode-vsce)
- [Marketplace Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)

## Checklist

Before publishing, verify:

- [ ] Tests pass (`npm test`)
- [ ] Version bumped in `package.json`
- [ ] `CHANGELOG.md` updated
- [ ] README.md reflects current features
- [ ] Publisher ID updated in `package.json`
- [ ] Repository URLs updated in `package.json`
- [ ] LICENSE file exists
- [ ] `.vscodeignore` excludes dev files
- [ ] Extension icon added (optional)
- [ ] Screenshots added (optional)
- [ ] Tested locally with packaged `.vsix`
- [ ] GitHub PAT added to repository secrets (for automation)

---

**Ready to publish? 🚀**

```bash
npm test && npm run build && npm run package && npx vsce publish
```
