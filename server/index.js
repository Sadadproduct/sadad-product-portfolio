import 'dotenv/config';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT || 8787);

const app = await createApp();
app.listen(PORT, () => {
  console.log(`SADAD API listening on http://localhost:${PORT}`);
  console.log(`Admin login: ${process.env.ADMIN_EMAIL || 'admin@sadad.local'} / (see ADMIN_PASSWORD)`);
});
