import { createApp } from '../server/app.js';

let appPromise;

export default async function handler(req, res) {
  if (!appPromise) {
    appPromise = createApp().catch((err) => {
      // Allow the next request to retry boot after a failed cold start
      appPromise = null;
      throw err;
    });
  }
  const app = await appPromise;
  return app(req, res);
}
