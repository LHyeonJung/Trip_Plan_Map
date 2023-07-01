import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface placeData {
  address_name: string;
  category_group_code: string;
  category_group_name: string;
  category_name: string;
  distance: string;
  id: string;
  phone: string;
  place_name: string;
  place_url: string;
  road_address_name: string;
  x: string;
  y: string;
}

interface SearchState {
  keyword: string;
  results: placeData[];
}

const initialState: SearchState = {
  keyword: "",
  results: [],
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setKeyword: (state, action: PayloadAction<string>) => {
      state.keyword = action.payload;
    },
    setResults: (state, action: PayloadAction<placeData[]>) => {
      state.results = action.payload;
    },
  },
});

export const { setKeyword, setResults } = searchSlice.actions;
export default searchSlice.reducer;
