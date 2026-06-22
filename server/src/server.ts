import 'dotenv/config';
import { createApp } from './app';

// DB connection + graceful shutdown are added in Phase 1 (Stage 1.1).
const port = Number(process.env.PORT) || 4000;

const app = createApp();

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
