import { Flats } from "../models/flat.model.js";
import { Users } from "../models/user.model.js";
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

  const user = await Users.findById(ownerId);

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

  const newFlat = await Flats.create(req.body);
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

  const updatedFlat = await Flats.findByIdAndUpdate(
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

  const deletedFlat = await Flats.findByIdAndDelete({
    _id: flatId,
    ownerId: ownerId,
  });

  if (!deletedFlat) {
    throw new ApiError(404, "Flat Not Found");
  }

  await Users.findByIdAndUpdate(ownerId, {
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

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  if (user.favouriteFlats.includes(flatId)) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Flat is already in the favorite list"));
  }
  user.favouriteFlats.push(flatId);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Flat Successfully added to favorite"));
});

const removeFlatFromFavourite = asyncHandler(async (req, res) => {
  const { userId, flatId } = req.body;

  if (!userId || !flatId) {
    throw new ApiError(400, "userId and flatId is required");
  }

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  if (!user.favouriteFlats.includes(flatId)) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Flat is not in the favorite list"));
  }
  user.favouriteFlats.push(flatId);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Flat Successfully removed to favorite"));
});

const fetchFlat = asyncHandler(async (req, res) => {
  const userId = req.header("userId");
  console.log(userId);
  const user = await Users.findById(userId);

  const flats = await Flats.find();
  if (!user) {
    throw new ApiError(404, "User Not Found");
  }
  flats.forEach((element) => {
    if (user.favouriteFlats.includes(element._id)) {
      element.favourite = true;
    } else {
      element.favourite = false;
    }
  });

  return res.status(200).json(new ApiResponse(200, flats, "Success"));
});
export {
  uploadFlat,
  updateFlat,
  deleteFlat,
  addFlatToFavourite,
  removeFlatFromFavourite,
  fetchFlat,
};
