import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({
  path: "C:/Users/gapaw/Desktop/BookMates/bookmates_backend/.env",
});
connectDB().then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is listening on port ${process.env.PORT || 800}`);
  });
});

// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGOOSE_URI}${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("error", error);
//       throw error;
//     });
//     app.listen(process.env.PORT || 2000, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("Error: ", error);
//   }
// })();
