// import app from "./app.js";
// import { PORT } from "./config/env.js";

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { PORT } from "./config/env.js";

app.listen(PORT, "0.0.0.0", () => {
  console.log(` Server running on port ${PORT}`);
});
