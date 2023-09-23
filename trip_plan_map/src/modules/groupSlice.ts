import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface groupData {
  name: string;
  userList: string[];
  placeList: placeInfo[];
  id: string;
}

export type placeInfo = {
  location: {
    latitude: 0;
    longitude: 0;
  };
  memo: [];
  name: "";
  address: "";
  phone: "";
};

interface GroupState {
  allGroupsData: groupData[];
  targetGroup: groupData;
}

const initialState: GroupState = {
  allGroupsData: [],
  targetGroup: {
    id: "",
    name: "",
    userList: [],
    placeList: [
      {
        address: "",
        phone: "",
        name: "",
        memo: [],
        location: {
          latitude: 0,
          longitude: 0,
        },
      },
    ],
  },
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setAllGroups: (state, action: PayloadAction<groupData[]>) => {
      state.allGroupsData = [...action.payload];
    },
    setTargetGroup: (state, action: PayloadAction<groupData>) => {
      state.targetGroup = { ...action.payload };
    },
  },
});

export const { setAllGroups, setTargetGroup } = groupSlice.actions;
export default groupSlice.reducer;
