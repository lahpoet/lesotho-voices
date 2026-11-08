# Lesotho Voices - Content Creator Management Web Application

A blogger platform about Lesotho culture, travel and current affairs.
Stack: React (Create React App) + Node/Express + MongoDB Atlas. Hosting: Vercel (frontend), Render (backend).

```
lesotho-blog/
  server/   Express API, Mongoose models, JWT auth, seed script
  client/   React app (Viewer Portal + Creator Dashboard)
```

## Part 1 - Run it on your computer

Install Node.js (v18+) and Git first.

### Step 1: Create the database on MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas and create a free account.
2. Create a free **M0** cluster (pick any region).
3. **Database Access** -> Add New Database User -> username + password (save them; avoid special characters like `@` or `#` in the password).
4. **Network Access** -> Add IP Address -> **Allow access from anywhere (0.0.0.0/0)**. Render needs this because its IP changes.
5. **Database** -> your cluster -> **Connect** -> **Drivers** -> copy the connection string. It looks like:
   `mongodb+srv://myuser:mypass@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
6. Add the database name `lesotho_blog` before the `?`:
   `mongodb+srv://myuser:mypass@cluster0.abcde.mongodb.net/lesotho_blog?retryWrites=true&w=majority`

### Step 2: Connect the backend to the database
```
cd server
npm install
cp .env.example .env        # on Windows: copy .env.example .env
```
Open `server/.env` and fill in:
- `MONGO_URI` = your connection string from Step 1
- `JWT_SECRET` = any long random text
- `CREATOR_EMAIL` / `CREATOR_PASSWORD` / `CREATOR_NAME` = your dashboard login

How the connection works: `server/config/db.js` calls `mongoose.connect(process.env.MONGO_URI)`. `server.js` only starts listening after the connection succeeds. You should see `MongoDB connected: lesotho_blog`.

Then create the creator account and sample Lesotho content:
```
npm run seed
npm run dev
```
Open http://localhost:5000 - you should see `{"message":"Lesotho Blog API is running"}`.
In Atlas -> Browse Collections you will now see `users`, `contents` (and later `comments`, `likes`).

### Step 3: Run the frontend
```
cd ../client
npm install
cp .env.example .env        # REACT_APP_API_URL=http://localhost:5000
npm start
```
Open http://localhost:5173.
- Viewer Portal: `/`
- Creator login: `/login` (use the email and password from `server/.env`)

## Part 2 - Put it on GitHub
```
cd lesotho-blog
git init
git add .
git commit -m "Lesotho Voices content app"
```
Create an empty repository on github.com, then:
```
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```
`.gitignore` already keeps `.env` and `node_modules` out of GitHub. Never upload your passwords.

## Part 3 - Deploy

### Backend on Render
1. render.com -> New -> **Web Service** -> connect your GitHub repo.
2. Root Directory: `server`. Build Command: `npm install`. Start Command: `npm start`.
3. Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (set after the frontend is live), `CREATOR_*` are only needed locally for seeding.
4. Deploy. Copy the URL, e.g. `https://lesotho-blog-api.onrender.com`. Open it to confirm the API message.
5. The free plan sleeps after inactivity, so the first request can take about 50 seconds. Open the URL before your demo.

If you did not seed from your own computer against the same Atlas database, run `npm run seed` locally once with the Atlas `MONGO_URI` (the data lives in Atlas, so Render sees it).

### Frontend on Vercel
1. vercel.com -> Add New Project -> import the same repo.
2. Root Directory: `client`. Framework: Create React App (build command `npm run build`, output `build`).
3. Environment variable: `REACT_APP_API_URL` = your Render URL (no trailing slash).
4. Deploy and copy the public URL, e.g. `https://lesotho-voices.vercel.app`.
(For Netlify: base `client`, build `npm run build`, publish `build`; `public/_redirects` is already included.)

### Connect them (CORS)
Go back to Render -> Environment -> set `CLIENT_URL` to your Vercel URL (no trailing slash) -> save (it redeploys).
Several URLs can be separated by commas.

## Part 4 - Test the public URL
- [ ] Home page shows creator name, introduction and featured content
- [ ] Search and category filter work; try phone width
- [ ] Open a content item, like it, copy the link, post a comment
- [ ] Log in at `/login`, check the overview numbers
- [ ] Add, edit, delete content; try Draft, Published and Scheduled
- [ ] Approve, hide and delete a comment; approved ones appear on the viewer page
- [ ] Close and reopen the browser: data is still there (stored in Atlas)
- [ ] Visit `/dashboard` while logged out: you are sent to login

## API endpoints
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/login | Public |
| GET | /api/auth/creator | Public (profile for home page) |
| GET | /api/contents?search=&category= | Public (published and due scheduled items) |
| GET | /api/contents/:id | Public (adds one view) |
| GET | /api/contents/admin/all | Creator |
| POST | /api/contents | Creator |
| PUT | /api/contents/:id | Creator |
| DELETE | /api/contents/:id | Creator |
| POST | /api/comments | Public (saved as pending) |
| GET | /api/comments/:contentId | Public (approved only) |
| GET | /api/comments/admin/all | Creator |
| PUT | /api/comments/:id/status | Creator (approve or hide) |
| DELETE | /api/comments/:id | Creator |
| POST | /api/likes | Public (like or unlike) |
| GET | /api/dashboard/stats | Creator |

Test login with curl:
```
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"creator@example.com","password":"ChangeMe123"}'
```
Test that security works (should return 401):
```
curl -X POST http://localhost:5000/api/contents -H "Content-Type: application/json" -d '{"title":"x"}'
```

## Database collections
| Collection | Main fields |
|---|---|
| users | name, email (unique), password (bcrypt hash), bio, avatarUrl |
| contents | title, description, category, contentType, thumbnailUrl, mediaUrl, articleBody, status, publishDate, isFeatured, views, likesCount, createdAt |
| comments | contentId, displayName, text, status (pending/approved/hidden), createdAt |
| likes | contentId, viewerId (unique pair) |
| viewers | optional, included in the model for future registration |

## Marking guide checklist
| Component | Where in the code |
|---|---|
| Viewer Portal (20) | `client/src/pages/Home.jsx`, `ContentDetails.jsx`, `styles.css` |
| Creator Dashboard (20) | `client/src/pages/Dashboard.jsx` |
| Database (15) | `server/models/*`, `server/config/db.js`, `server/seed.js` |
| Backend and API (15) | `server/routes/*`, `server/server.js` |
| Engagement (10) | likes, comments, view count, share, moderation |
| Security (10) | `server/middleware/auth.js`, bcrypt in `seed.js`, `.env` |
| Hosting (10) | Part 3 above |

## Before you submit
- Replace the sample posts with your own writing and **real, current Lesotho news** (with sources). The seed articles are placeholders.
- Optionally add thumbnail image URLs and a profile picture URL (set `avatarUrl` on the user in Atlas).
- Submit: source code, GitHub link, and the public Vercel URL.

## Common problems
- **MongoDB connection failed**: wrong password, `<password>` brackets left in, or IP not allowed in Network Access.
- **CORS error in the browser**: `CLIENT_URL` on Render does not exactly match your Vercel URL.
- **Frontend still calls localhost**: set `REACT_APP_API_URL` in Vercel and redeploy (React reads it at build time).
- **404 when refreshing a page on Vercel**: make sure `client/vercel.json` was committed.
