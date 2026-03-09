# Netlify CMS Setup Guide

This guide will help you set up Netlify CMS to easily add and edit liturgical commentary entries through a web interface.

## What You Get

- 🎨 Beautiful admin interface at `yoursite.com/admin`
- ✏️ Easy form-based editing (no JSON editing needed)
- 🔐 Secure authentication via Netlify Identity
- 📝 All changes saved to GitHub automatically
- 🚀 Free hosting on Netlify

## Setup Steps

### 1. Deploy to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Sign up or log in
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **GitHub** and select your repository: `enzopizzoferrato24/liturgyrepo`
5. Configure build settings:
   - **Build command**: `node build-data.js`
   - **Publish directory**: `.` (root)
6. Click **"Deploy site"**

### 2. Enable Netlify Identity

1. In your Netlify site dashboard, go to **"Site settings"** → **"Identity"**
2. Click **"Enable Identity"**
3. Under **"Registration preferences"**, select **"Invite only"** (recommended)
4. Under **"Services"** → **"Git Gateway"**, click **"Enable Git Gateway"**

### 3. Invite Yourself as Admin

1. Go to **"Identity"** tab in your Netlify dashboard
2. Click **"Invite users"**
3. Enter your email address
4. Check your email and click the invitation link
5. Set your password

### 4. Access the Admin Interface

1. Go to `https://your-site-name.netlify.app/admin`
2. Log in with your email and password
3. Start adding/editing entries! 🎉

## How It Works

### Adding a New Entry

1. Go to `/admin`
2. Click **"Liturgical Entries"** → **"New Entry"**
3. Fill in the form (all fields from your current data structure)
4. Click **"Publish"**
5. Netlify CMS will:
   - Create a new JSON file in `data/entries/`
   - Commit it to GitHub
   - Trigger a rebuild (runs `build-data.js`)
   - Rebuild `data.json` from all individual files
   - Deploy the updated site

### Editing an Existing Entry

1. Go to `/admin`
2. Click **"Liturgical Entries"**
3. Search or browse for the entry
4. Click to edit
5. Make changes and click **"Publish"**

### Managing Eras

1. Go to `/admin`
2. Click **"Historical Eras"**
3. Add or edit eras as needed

## File Structure

```
liturgyrepo/
├── admin/
│   ├── index.html          # Admin interface
│   └── config.yml          # Netlify CMS configuration
├── data/
│   ├── data.json           # Main data file (auto-generated)
│   ├── entries/            # Individual entry files (managed by CMS)
│   │   ├── 381-egeria-1.json
│   │   ├── 430-augustine-of-hippo-2.json
│   │   └── ...
│   └── eras/               # Individual era files (managed by CMS)
│       ├── i-the-early-christian-era.json
│       └── ...
├── build-data.js           # Compiles individual files → data.json
└── split-data.js           # One-time: splits data.json → individual files
```

## Build Process

When you edit via Netlify CMS:

1. **Edit in admin** → CMS saves to `data/entries/xxx.json`
2. **Git commit** → CMS commits to GitHub
3. **Netlify build** → Runs `node build-data.js`
4. **Rebuild data.json** → Compiles all individual files
5. **Deploy** → Site updates with new data

## Local Development

### Option 1: Edit via Netlify CMS (Recommended)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Run local proxy:
   ```bash
   npx netlify-cms-proxy-server
   ```

3. In another terminal, serve the site:
   ```bash
   npm run serve
   ```

4. Uncomment `local_backend: true` in `admin/config.yml`

5. Go to `http://localhost:8000/admin`

### Option 2: Edit JSON Directly (Still Works!)

1. Edit files in `data/entries/` or `data/eras/`
2. Run build script:
   ```bash
   node build-data.js
   ```
3. Test locally:
   ```bash
   npm run serve
   ```

## Troubleshooting

### Can't log in to /admin
- Make sure Netlify Identity is enabled
- Check that Git Gateway is enabled
- Verify you've been invited as a user

### Changes not showing up
- Check Netlify deploy logs
- Make sure `build-data.js` ran successfully
- Verify `data.json` was updated

### Want to add more fields?
- Edit `admin/config.yml`
- Add new fields to the `fields` array
- Redeploy

## Alternative: Keep It Simple

If Netlify CMS feels too complex, you can:

1. **Edit JSON files directly** in `data/entries/`
2. **Run `node build-data.js`** to rebuild
3. **Commit and push** to GitHub
4. **Use GitHub Pages** for free hosting

This gives you version control without the CMS overhead.

## Need Help?

- [Netlify CMS Docs](https://www.netlifycms.org/docs/)
- [Netlify Identity Docs](https://docs.netlify.com/visitor-access/identity/)
- [Git Gateway Docs](https://docs.netlify.com/visitor-access/git-gateway/)
