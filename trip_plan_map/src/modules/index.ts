import { combineReducers } from "redux";
import searchReducer from "./searchSlice";
import groupReducer from "./groupSlice";

const rootReducer = combineReducers({
  search: searchReducer,
  group: groupReducer,
  // 다른 리듀서들을 여기에 등록
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
