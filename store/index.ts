import { configureStore, createSlice } from "@reduxjs/toolkit";
import { imageScrapings } from "./imageScrapings";

export const store = configureStore({
  reducer: {
    imageScrapings,
  },
});

export type  RooteState = ReturnType<typeof store.getState>;