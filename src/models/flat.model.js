  import mongoose, { Schema } from "mongoose";

  const flatSchema = new Schema(
    {
      ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      flatPhotos: [
        {
          type: String,
        },
      ],
      buildingName: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pinCode: {
        type: String,
        required: true,
      },
      landmark: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      rent: {
        type: Number,
        required: true,
      },
      apartmentType: {
        type: String,
        required: true,
      },
      furnish: {
        type: String,
        required: true,
      },
      waterSupply: {
        type: String,
        required: true,
      },
      galleryAvailable: {
        type: Boolean,
        required: true,
      },
      parkingAvailable: {
        type: Boolean,
        required: true,
      },
      cctvAvailable: {
        type: Boolean,
        required: true,
      },
      securityAvailable: {
        type: Boolean,
        required: true,
      },
      currentFlatmates: {
        type: Number,
        required: true,
      },
      flatmatesNeeded: {
        type: Number,
        required: true,
      },
      flatmatePreference: {
        type: String,
        required: true,
      },
    },
    { timestamps: true }
  );

  export const Flats = mongoose.model("flat", flatSchema);
