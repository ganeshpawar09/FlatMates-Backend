import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
  addFlatToFavourite,
  deleteFlat,
  fetchFavouriteFlat,
  fetchFlat,
  removeFlatFromFavourite,
  updateFlat,
  uploadFlat,
} from "../controllers/flat.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const flatRouter = Router();

flatRouter
  .route("/upload-flat")
  .post(verifyAccessToken, upload.array("photos", 5), uploadFlat);
flatRouter.route("/update-flat").post(verifyAccessToken, updateFlat);
flatRouter.route("/delete-flat").post(verifyAccessToken, deleteFlat);
flatRouter
  .route("/add-flat-to-favourite")
  .post(verifyAccessToken, addFlatToFavourite);
flatRouter
  .route("/remove-flat-from-favourite")
  .post(verifyAccessToken, removeFlatFromFavourite);
flatRouter.route("/fetch-flat").get(verifyAccessToken, fetchFlat);
flatRouter
  .route("/fetch-favourite-flat")
  .get(verifyAccessToken, fetchFavouriteFlat);

export default flatRouter;
