# ✅ Complete Deployment Checklist

Copy this checklist and tick off each step as you complete it!

---

## 📦 Part 1: Get the Files Ready (5 minutes)

- [ ] Downloaded the `zoho-crm-clone` folder
- [ ] Unzipped it on my computer
- [ ] I can see folders like `src`, `public` and files like `package.json`

---

## 🔥 Part 2: Firebase is Already Set Up (You said it's done! ✅)

Skip this if you already did it. Otherwise:

- [ ] Created Firebase project at https://console.firebase.google.com
- [ ] Enabled Authentication → Google Sign-In
- [ ] Created Firestore Database (test mode)
- [ ] Added Security Rules (from SETUP_GUIDE.md)
- [ ] Copied Firebase config values

---

## 📁 Part 3: Upload to GitHub (10 minutes)

- [ ] Opened my GitHub repository
- [ ] Deleted all old files (if any existed)
- [ ] Uploaded all new files from `zoho-crm-clone` folder
- [ ] Created `.env` file with my Firebase settings
- [ ] All files show up in GitHub (check: can you see `src` folder?)

---

## 🚀 Part 4: Deploy to Vercel (You said this is done! ✅)

Skip if already deployed. Otherwise:

- [ ] Went to vercel.com and logged in
- [ ] Clicked "Import Project"
- [ ] Selected my GitHub repository
- [ ] Added all 6 environment variables:
  - [ ] VITE_FIREBASE_API_KEY
  - [ ] VITE_FIREBASE_AUTH_DOMAIN
  - [ ] VITE_FIREBASE_PROJECT_ID
  - [ ] VITE_FIREBASE_STORAGE_BUCKET
  - [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
  - [ ] VITE_FIREBASE_APP_ID
- [ ] Clicked "Deploy"
- [ ] Waited for deployment (2-3 minutes)

---

## ✨ Part 5: Test Your App (5 minutes)

- [ ] Opened my Vercel URL (looks like: `yourname.vercel.app`)
- [ ] Saw the login page with "Sign in with Google" button
- [ ] Clicked "Sign in with Google"
- [ ] Successfully logged in
- [ ] Can see the Dashboard page
- [ ] Clicked "Leads" in the sidebar
- [ ] Clicked "Add Lead" button
- [ ] Filled out the form and saved a test lead
- [ ] Lead appears in the table ✅

---

## 🎉 Success Criteria

If you can check ALL these boxes, your app is working:

- [ ] I can sign in with Google
- [ ] I can see the Dashboard
- [ ] I can click "Leads" and see the Leads page  
- [ ] I can click "Add Lead" and the form opens
- [ ] I can create a lead and it appears in the table
- [ ] I can edit a lead (pencil icon)
- [ ] I can delete a lead (trash icon)
- [ ] The sidebar navigation works
- [ ] I can sign out (click my photo, then logout icon)

---

## 🐛 If Something Doesn't Work

### Login doesn't work?
1. Go to Firebase Console → Authentication
2. Make sure Google Sign-In is **enabled** (green toggle)
3. Check if your email is in authorized domains

### White screen after login?
1. Press F12 to open browser console
2. Look for red error messages
3. Usually means .env variables are missing in Vercel
4. Go to Vercel → Your Project → Settings → Environment Variables
5. Add all 6 Firebase variables

### Leads won't save?
1. Go to Firebase Console → Firestore Database → Rules
2. Make sure you pasted the security rules from SETUP_GUIDE.md
3. Rules should allow read/write for authenticated users
4. Click "Publish"

### Can't see files in GitHub?
1. Make sure you uploaded the FOLDER contents, not the folder itself
2. You should see `package.json` at the root, not inside another folder

---

## 📸 Screenshots to Take (For Your Portfolio!)

Once everything works, take screenshots of:

1. ✅ Login page
2. ✅ Dashboard with stats
3. ✅ Leads page with data in the table
4. ✅ "Add Lead" modal open
5. ✅ Sidebar navigation

These screenshots will look great in your portfolio!

---

## 🎯 Next Steps

Once everything above is working, you can:

1. **Build Contacts Module** (similar to Leads)
2. **Build Accounts Module** (company management)
3. **Build Deals Pipeline** (drag-and-drop Kanban board)
4. **Build Tasks Module** (to-do list)
5. **Customize the design** (colors, logos, etc.)

Just tell me what you want to build next! 🚀

---

## 📞 Need Help?

If you're stuck, tell me:

1. **Which checkbox above you're stuck on**
2. **What you see on your screen** (describe it or paste error message)
3. **What you expected to happen**

I'll walk you through it step by step!
