import { app } from './app.js';
import { config } from './config.js';

app.listen(config.port, () => {
  console.log(`Quiz Builder API is running on http://localhost:${config.port}`);
});
