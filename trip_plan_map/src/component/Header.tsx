import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineMenu, AiOutlineSearch } from "react-icons/ai";
import * as HeaderStyles from "../css/HeaderStyles";
import { setKeyword } from "../modules/searchSlice";
import { RootState } from "../modules";
import { isNullOrEmpty } from "../utils/Common";

const Header = () => {
  const dispatch = useDispatch();
  const searchReducer = useSelector((state: RootState) => state.search);
  const [inputKeyword, setInputKeyword] = useState("");

  const onClickSearch = useCallback(() => {
    dispatch(setKeyword(inputKeyword));
  }, [inputKeyword]);
  return (
    <div style={HeaderStyles.headerContainer}>
      <AiOutlineMenu style={HeaderStyles.menuButton} size="2rem"></AiOutlineMenu>
      <label style={HeaderStyles.label}>
        <input defaultValue={searchReducer.keyword} style={HeaderStyles.inputKeyword} placeholder="키워드 입력" onChange={(e) => setInputKeyword(e.target.value)} />
        <AiOutlineSearch onClick={onClickSearch} style={HeaderStyles.searchButton} size="2rem" />
      </label>
    </div>
  );
};

export default Header;
