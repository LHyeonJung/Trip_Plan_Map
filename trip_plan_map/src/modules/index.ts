import { combineReducers } from "redux";
import searchReducer from "./searchSlice";

const rootReducer = combineReducers({
  search: searchReducer,
  // 다른 리듀서들을 여기에 등록
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
