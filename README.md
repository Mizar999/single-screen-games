# Single Screen Games

A collection of browser games built with **Phaser 3**, **TypeScript**, and **Vite**.

**Playable Demo:** [https://mizar999.github.io/single-screen-games/](https://mizar999.github.io/single-screen-games/)

---

## Development

To clone and develop this project locally:

```powershell
git clone https://github.com/Mizar999/single-screen-games.git
cd single-screen-games
npm install
npm run dev
```

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite dev server with instant Hot Module Replacement (HMR). |
| `npm run build` | Runs TypeScript type-checking and builds the production bundle into `dist/`. |
| `npm run preview` | Previews the production build locally. |

---

## Tileset Extrusion (Avoid Bleeding)

To prevent tile bleeding issues in tilemaps, use `tile-extruder` to add margin/spacing:

```powershell
npx tile-extruder --tileWidth 64 --tileHeight 64 --input ./public/assets/hack_square_64x64.png --output ./public/assets/hack_square_64x64_extruded.png
```

---

## New Project Setup from Scratch

If you want to set up a multi-page single screen game project with TypeScript and Vite from scratch:

1. **Initialize NPM project & install dependencies:**

   ```powershell
   npm init -y
   npm install --save-dev typescript vite phaser
   ```

2. **Create Vite configuration (`vite.config.ts`):**

   ```typescript
   import { defineConfig } from 'vite';
   import { resolve } from 'path';

   export default defineConfig({
     base: './',
     build: {
       outDir: 'dist',
       rollupOptions: {
         input: {
           main: resolve(__dirname, 'index.html'),
           connectFour: resolve(__dirname, 'connect-four/index.html'),
         },
       },
     },
   });
   ```

3. **Create TypeScript configuration (`tsconfig.json`):**

   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "useDefineForClassFields": true,
       "module": "ESNext",
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "skipLibCheck": true,
       "moduleResolution": "node",
       "allowSyntheticDefaultImports": true,
       "strict": false,
       "noEmit": true
     },
     "include": ["connect-four/src"]
   }
   ```

4. **Create HTML Entry Points:**

   * `index.html`:
     ```html
     <!DOCTYPE html>
     <html lang="en">
       <head>
         <meta charset="UTF-8" />
         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
         <title>Single Screen Games</title>
       </head>
       <body>
         <a href="connect-four/index.html">Connect Four</a>
       </body>
     </html>
     ```

   * `connect-four/index.html`:
     ```html
     <!DOCTYPE html>
     <html lang="en">
       <head>
         <meta charset="UTF-8" />
         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
         <title>Connect Four</title>
       </head>
       <body>
         <div id="game"></div>
         <script type="module" src="/connect-four/src/app.ts"></script>
       </body>
     </html>
     ```

5. **Configure `package.json` scripts:**

   ```json
   "scripts": {
     "dev": "vite",
     "build": "tsc --noEmit && vite build",
     "preview": "vite preview"
   }
   ```

---

## Useful Links

- [Tile Extruder](https://github.com/sporadic-labs/tile-extruder)
- [Create a dialog modal plugin in Phaser 3](https://gamedevacademy.org/create-a-dialog-modal-plugin-in-phaser-3-part-1/)
- [A procedurally generated roguelike using Phaser](https://www.bytesizeadventures.com/procjam-2014-a-procedurally-generated-roguelike-using-phaser/)
- [JavaScript ECS](https://www.npmjs.com/package/js-ecs)

---

## Automatic Deployment (GitHub Pages)

This repository uses an automated GitHub Actions workflow defined in `.github/workflows/deploy.yml`.

Every push to the `main` or `master` branch automatically triggers a build and deploys the generated site directly to GitHub Pages.
