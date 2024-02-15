import { Flat } from "../models/flat.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadFlat = asyncHandler(async (req, res) => {
  const {
    ownerId,
    buildingName,
    address,
    city,
    state,
    pinCode,
    landmark,
    description,
    rent,
    apartmentType,
    furnish,
    waterSupply,
    galleryAvailable,
    parkingAvailable,
    cctvAvailable,
    securityAvailable,
    currentFlatmates,
    flatmatesNeeded,
    flatmatePreference,
  } = req.body;

  if (
    !ownerId ||
    !buildingName ||
    !address ||
    !city ||
    !state ||
    !pinCode ||
    !landmark ||
    !description ||
    !rent ||
    !apartmentType ||
    !furnish ||
    !waterSupply ||
    !galleryAvailable ||
    !parkingAvailable ||
    !cctvAvailable ||
    !securityAvailable ||
    !currentFlatmates ||
    !flatmatesNeeded ||
    !flatmatePreference
  ) {
    throw new ApiError(400, "Every field are required");
  }

  const user = await User.findById(ownerId);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  // reterive local file path give by multer
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Photos are required");
  }
  // store them into localFilePaths
  const localFilePaths = req.files.map((file) => file.path);
  // upload them to cloudinary
  const uploadedFiles = await uploadOnCloudinary(localFilePaths);
  const photos = uploadedFiles.map((file) => file.url);

  const newFlat = await Flat.create(req.body);
  newFlat.flatPhotos.push(...photos);
  await newFlat.save();

  if (!newFlat) {
    throw new ApiError(501, "Something went wrong while creating new flat");
  }

  user.ownflats.push(newFlat._id);

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, newFlat, "Flat Successfully Added"));
});

const updateFlat = asyncHandler(async (req, res) => {
  const { flatId, ownerId } = req.body;
  const updateData = req.body;

  if (!flatId || !ownerId) {
    throw new ApiError(400, "flatId and ownerId is required to update flat");
  }

  const updatedFlat = await Flat.findByIdAndUpdate(
    { _id: flatId, ownerId: ownerId },
    updateData,
    {
      new: true,
    }
  );

  if (!updatedFlat) {
    throw new ApiError(501, "Failed to update flat");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedFlat, "Flat Successfully Added"));
});

const deleteFlat = asyncHandler(async (req, res) => {
  const { ownerId, flatId } = req.body;

  if (!ownerId || !flatId) {
    throw new ApiError(400, "ownerId and flatId is required");
  }

  const deletedFlat = await Flat.findByIdAndDelete({
    _id: flatId,
    ownerId: ownerId,
  });

  if (!deletedFlat) {
    throw new ApiError(404, "Flat Not Found");
  }

  await User.findByIdAndUpdate(ownerId, {
    $pull: { ownflats: deletedFlat._id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, deletedFlat, "Flat Successfully deleted"));
});

const addFlatToFavourite = asyncHandler(async (req, res) => {
  const { userId, flatId } = req.body;

  if (!userId || !flatId) {
    throw new ApiError(400, "userId and flatId is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  if (user.favouriteFlats.includes(flatId)) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Flat is already in the favorite list"));
  }
  const flat = await Flat.findById(flatId);
  if (!flat) {
    throw new ApiError(404, "Flat Not Found");
  }
  user.favouriteFlats.push(flatId);
  await user.save();
  flat.favourite = true;

  return res
    .status(200)
    .json(new ApiResponse(200, flat, "Flat Successfully added to favorite"));
});

const removeFlatFromFavourite = asyncHandler(async (req, res) => {
  const { userId, flatId } = req.body;

  console.log(flatId);

  if (!userId || !flatId) {
    throw new ApiError(400, "userId and flatId is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const indexOfFlat = user.favouriteFlats.indexOf(flatId);

  if (indexOfFlat === -1) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Flat is not in the favorite list"));
  }

  user.favouriteFlats.splice(indexOfFlat, 1);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Flat Successfully removed to favorite"));
});

const fetchFlat = asyncHandler(async (req, res) => {
  const min = parseInt(req.query.min) || 0;
  const max = parseInt(req.query.max) || 100000;
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 3;
  const search = req.query.search || "";
  const sortby = req.query.sortby || "lowtohigh";
  const preference = req.query.preference || "any";

  const userId = req.header("userId");

  const user = await User.findById(userId);
  let sort = 1;
  if (sortby == "hightolow") {
    sort = -1;
  }
  const pipeline = [];

  if (preference === "male" || preference === "female") {
    pipeline.push({
      $match: {
        flatmatePreference: preference.toLowerCase(),
      },
    });
  }

  pipeline.push({
    $match: {
      rent: { $gte: min, $lte: max },
      $or: [
        { address: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
      ],
    },
  });
  pipeline.push({
    $sort: {
      rent: sort,
    },
  });
  pipeline.push({
    $skip: page * limit,
  });
  pipeline.push({
    $limit: limit,
  });

  const result = await Flat.aggregate(pipeline);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }
  result.forEach((element) => {
    if (user.favouriteFlats.includes(element._id)) {
      element.favourite = true;
    } else {
      element.favourite = false;
    }
  });

  return res.status(200).json(new ApiResponse(200, result, "Success"));
});

const fetchFavouriteFlat = asyncHandler(async (req, res) => {
  const userId = req.header("userId");
  const user = await User.findById(userId);

  const flats = await Flat.find();
  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const favFlats = [];
  flats.forEach((element) => {
    if (user.favouriteFlats.includes(element._id)) {
      element.favourite = true;
      favFlats.push(element);
    } else {
      element.favourite = false;
    }
  });

  return res.status(200).json(new ApiResponse(200, favFlats, "Success"));
});
const fetchOwnFlat = asyncHandler(async (req, res) => {
  const userId = req.header("userId");
  const user = await User.findById(userId);

  const flats = await Flat.find();
  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const own = [];
  flats.forEach((element) => {
    if (user.ownflats.includes(element._id)) {
      own.push(element);
    }
  });

  return res.status(200).json(new ApiResponse(200, own, "Success"));
});

export {
  uploadFlat,
  updateFlat,
  deleteFlat,
  addFlatToFavourite,
  removeFlatFromFavourite,
  fetchFlat,
  fetchFavouriteFlat,
  fetchOwnFlat
};
