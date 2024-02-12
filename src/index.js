import { server } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({
  path: "C:/Users/gapaw/Desktop/BookMates/bookmates_backend/.env",
});




connectDB().then(() => {
  server.listen(process.env.PORT || 8000, () => {
    console.log(`Server is listening on port ${process.env.PORT || 8000}`);
  });
});
