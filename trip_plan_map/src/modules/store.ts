import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./index";

const store = configureStore({
  reducer: rootReducer,
  // 미들웨어 등 다른 설정들
});

export default store;
