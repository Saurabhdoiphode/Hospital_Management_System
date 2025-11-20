# Deploy to Render

This project is split into:
- API: Node/Express at `server/index.js`
- Client: React app in `client/`

We deploy them to Render as two services using a blueprint (`render.yaml`).

## 1) Prerequisites
- MongoDB connection string (Atlas or other) for `MONGODB_URI`.
- GitHub repository connected to Render.

## 2) What the blueprint does
- `hospital-api` (Web Service)
  - Build: `npm ci`
  - Start: `npm start` (runs `node server/index.js`)
  - Env: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`
  - CORS is automatically set to the deployed client URL.
- `hospital-web` (Static Site)
  - Build: `cd client && npm ci && npm run build`
  - Publish: `client/build`
  - Env: `PUBLIC_URL=/`, `REACT_APP_API_URL` auto-wired to API URL

## 3) Deploy steps (Blueprint)
1. Commit `render.yaml` and push to GitHub (already done).
2. In Render:
   - New → Blueprint → Connect this repo
   - Review the two services (`hospital-api`, `hospital-web`)
   - Before creating, edit environment variables:
     - For `hospital-api`:
       - `MONGODB_URI` = your MongoDB connection string
       - Optional: any other secrets (SMTP, Twilio, etc.)
   - Click "Apply" to create both services.
3. Wait for both to build and deploy.

## 4) After deploy
- API URL: shown on the `hospital-api` service page.
- Client URL: shown on the `hospital-web` page.
- CORS: `server/index.js` reads `CORS_ORIGIN` and will allow the client URL.
- Client → API: The React build uses `REACT_APP_API_URL` from the blueprint.

## 5) Troubleshooting
- CORS blocked: Ensure `CORS_ORIGIN` is set (it’s wired by the blueprint) or add additional domains separated by commas.
- 401s on API: Make sure you login to obtain a token; tokens are stored in `localStorage`.
- Mongo connect errors: Add your IP in Atlas network access or use 0.0.0.0/0 for testing.
- Blank client: Rebuild the client (Render → hospital-web → Manual Deploy → Clear cache and deploy).

## 6) Manual (no blueprint)
- Create Web Service from this repo at root:
  - Start command: `node server/index.js`
  - Env: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` (set to client URL after it’s live)
- Create Static Site from this repo but set:
  - Build command: `cd client && npm ci && npm run build`
  - Publish directory: `client/build`
  - Env: `PUBLIC_URL=/`, `REACT_APP_API_URL` = API URL

## 7) Local test
- API: `npm run server`
- Client: `npm run client`
- Build client: `npm run build`

Happy shipping!
