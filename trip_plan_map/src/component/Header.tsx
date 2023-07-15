import React, { useCallback, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import * as HeaderStyles from "../css/HeaderStyles";
import { setKeyword } from "../modules/searchSlice";
import { RootState } from "../modules";
import * as firebaseAuth from "firebase/auth";

const Header = () => {
  type userInfo = {
    uid: "";
    email: "";
    emailVerified: false;
    isAnonymous: false;
    providerData: [];
    stsTokenManager: {
      refreshToken: "";
      accessToken: "";
      expirationTime: 0;
    };
    createdAt: "";
    lastLoginAt: "";
    apiKey: "";
    appName: "[DEFAULT]";
  };
  const dispatch = useDispatch();
  const searchReducer = useSelector((state: RootState) => state.search);
  const profilePopupRef = useRef<HTMLDivElement>(null);
  const [isProfilePopupOpen, setProfilePopupOpen] = useState(false);
  const [user, setUser] = useState<userInfo>();

  //로컬 스토리지에서 사용자 정보 확인
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userInfo = JSON.parse(storedUser);
      setUser(userInfo);
    }
  }, []);

  // 팝업 외 영역 클릭 시, 팝업 닫히도록 리스너 로직 구현
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (profilePopupRef.current && !profilePopupRef.current.contains(event.target)) {
        setProfilePopupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onClickLogout = useCallback(async () => {
    try {
      await firebaseAuth.getAuth().signOut();
      localStorage.removeItem("user");
      // 로그아웃 성공 시 추가적인 로직을 수행하거나 리디렉션할 수 있습니다.
    } catch (error) {
      // 로그아웃 실패 시 에러 처리 로직을 수행할 수 있습니다.
      alert("로그아웃 실패:" + error);
    }
  }, []);

  return (
    <div style={HeaderStyles.headerContainer}>
      <AiOutlineMenu style={HeaderStyles.menuButton} size="2rem" />
      <label style={HeaderStyles.label}>
        <input defaultValue={searchReducer.keyword} value={searchReducer.keyword} style={HeaderStyles.inputKeyword} placeholder="검색" onChange={(e) => dispatch(setKeyword(e.target.value))} />
      </label>
      <CgProfile style={HeaderStyles.profileButton} size="2rem" onClick={() => setProfilePopupOpen(!isProfilePopupOpen)} />
      {/* 프로필 */}
      {isProfilePopupOpen ? (
        <div style={HeaderStyles.profilePopup} ref={profilePopupRef}>
          {/* <AiOutlineClose style={HeaderStyles.profilePopupCloseButton} size="1rem" onClick={() => setProfilePopupOpen(!isProfilePopupOpen)} /> */}
          <div style={HeaderStyles.userInfo}>{user?.email}</div>
          <button style={HeaderStyles.logoutButton} onClick={onClickLogout}>
            로그아웃
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Header;
