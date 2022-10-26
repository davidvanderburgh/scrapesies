import { createSlice } from '@reduxjs/toolkit';
import { ImageScrapingResults } from '@/types';

const imageScrapingsSlice = createSlice({
  name: 'imageScrapings',
  initialState: { value: { images: [], errors: [] } as ImageScrapingResults},
  reducers: {
    setImageScrapings: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setImageScrapings } = imageScrapingsSlice.actions;
export const imageScrapings = imageScrapingsSlice.reducer;