import React, { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { BiMap } from "react-icons/bi";
import { CiMemoPad } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import * as HeaderStyles from "../css/HeaderStyles";
import { setKeyword } from "../modules/searchSlice";
import { RootState } from "../modules";
import * as firebaseAuth from "firebase/auth";
import * as firebaseUser from "../modules/db/user";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

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

  type placeInfo = {
    location: {
      latitude: 0;
      longitude: 0;
    };
    memo: [];
    name: "";
    address: "";
    phone: "";
  };

  type dbUserInfo = {
    placeList: placeInfo[];
    id: "";
    groupList: [];
  };

  type dbGroupInfo = {
    placeList: placeInfo[];
    id: "";
    name: "";
    userList: [];
  };

  const menuTabTypes = {
    individual: "individual",
    group: "group",
  };

  const dispatch = useDispatch();
  const searchReducer = useSelector((state: RootState) => state.search);
  const profilePopupRef = useRef<HTMLDivElement>(null);
  const menuPopupRef = useRef<HTMLDivElement>(null);
  const memoPopupRef = useRef<HTMLDivElement>(null);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isMenuPopupOpen, setIsMenuPopupOpen] = useState(false);
  const [isMemoPopupOpen, setIsMemoPopupOpen] = useState(false);
  const [memoPopupData, setMemoPopupData] = useState<placeInfo | undefined>();
  const [selectedTab, setSelectedTab] = useState(menuTabTypes.individual);
  const [user, setUser] = useState<userInfo>();
  const [dbUser, setDbUser] = useState<dbUserInfo | undefined>(); // 현재 계정에 저장된 장소 관련 데이터
  const [dbGroups, setDbGroups] = useState<dbGroupInfo[] | undefined>([]); // 현재 계정이 속한 그룹 데이터

  //사용자 정보 확인
  useEffect(() => {
    // 1. 로컬 스토리지 (로그인 계정)
    const storedUser = localStorage.getItem("user");
    let userInfo: any;
    if (storedUser) {
      userInfo = JSON.parse(storedUser);
      setUser(userInfo);
    }

    // 2. firebase
    getAllUser(userInfo);
    getAllGroup(userInfo);
  }, []);

  const getAllUser = async (userInfo: any) => {
    try {
      const allUsers = await firebaseUser.getAllUser("User");
      const targetUser = allUsers?.filter((x) => x.id == userInfo?.email) != null ? allUsers?.filter((x) => x.id == userInfo?.email)[0] : {};
      setDbUser(targetUser as dbUserInfo);
    } catch (error) {
      console.error("유저 정보 조회 실패");
    }
  };

  const getAllGroup = async (userInfo: any) => {
    try {
      const allGroups = await firebaseUser.getAllUser("Group");
      const targetGroups = allGroups?.filter((x) => x.userList.includes(userInfo?.email)) != null ? allGroups?.filter((x) => x.userList.includes(userInfo?.email)) : [];
      setDbGroups(targetGroups as dbGroupInfo[]);
    } catch (error) {
      console.error("그룹 정보 조회 실패");
    }
  };

  // 팝업 외 영역 클릭 시, 팝업 닫히도록 리스너 로직 구현
  useEffect(() => {
    function handleClickOutside(event: any) {
      // 메뉴 팝업
      if (menuPopupRef.current && !menuPopupRef.current.contains(event.target)) {
        setIsMenuPopupOpen(false);
        setIsMemoPopupOpen(false);
      }

      // 프로필 팝업
      if (profilePopupRef.current && !profilePopupRef.current.contains(event.target)) {
        setIsProfilePopupOpen(false);
      }

      if (memoPopupRef.current && !memoPopupRef.current.contains(event.target)) {
        setIsMemoPopupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onClickMemoList = useCallback((item: any) => {
    setIsMemoPopupOpen(true);
    setMemoPopupData(item);
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

  const columns = useMemo<MRT_ColumnDef<dbGroupInfo>[]>(
    () => [
      {
        accessorKey: "name", //access nested data with dot notation
        header: "그룹명",
        size: 100,
      },
    ],
    []
  );

  return (
    <div style={HeaderStyles.headerContainer}>
      {/* 메뉴 */}
      <AiOutlineMenu style={HeaderStyles.menuButton} size="2rem" onClick={() => setIsMenuPopupOpen(!isMenuPopupOpen)} />
      {isMenuPopupOpen ? (
        <div style={HeaderStyles.menuPopup} ref={menuPopupRef}>
          <h5 className="mt20">장소 저장 목록 </h5>

          {/* <!-- 탭 메뉴 영역   --> */}
          <div className="tab_upbar mt20">
            <input className="radio one" id="one" name="group" type="radio" checked={selectedTab === menuTabTypes.individual ? true : false} onChange={(e) => setSelectedTab(menuTabTypes.individual)} />
            <input className="radio two" id="two" name="group" type="radio" checked={selectedTab === menuTabTypes.group ? true : false} onChange={(e) => setSelectedTab(menuTabTypes.group)} />
            <div className="tabs">
              <label className="tab one-tab" htmlFor="one">
                개인
              </label>
              <label className="tab two-tab" htmlFor="two">
                그룹
              </label>
            </div>
            <div className="panels">
              {/* <!-- 일괄 설정 템플릿 조회 탭  --> */}
              <div className="panel one-panel">
                <section style={HeaderStyles.placeList}>
                  {dbUser?.placeList &&
                    dbUser.placeList.map((place) => (
                      <li style={HeaderStyles.placeItemBox}>
                        <BiMap size="35px" />
                        <div>
                          <div>
                            <div style={HeaderStyles.placeInfo_main}>
                              {place.name} <CiMemoPad style={HeaderStyles.memoListButton} size="20px" onClick={() => onClickMemoList(place)} />
                            </div>
                            <div style={HeaderStyles.placeInfo_sub}>{place.address}</div>
                            <div style={HeaderStyles.placeInfo_sub}>{place.phone}</div>
                          </div>

                          {isMemoPopupOpen && memoPopupData ? (
                            <div style={HeaderStyles.memoPopup} ref={memoPopupRef}>
                              [{memoPopupData.name}]
                              <div style={HeaderStyles.memoList}>
                                {memoPopupData.memo.map((item) => (
                                  <li style={HeaderStyles.memoItemBox}>{item}</li>
                                ))}
                              </div>
                              <button style={HeaderStyles.memoPopupCloseButton} onClick={() => setIsMemoPopupOpen(false)}>
                                닫기
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </li>
                    ))}
                </section>
                <button className="mt10" onClick={() => setIsMenuPopupOpen(false)}>
                  닫기
                </button>
                {/* <button style={HeaderStyles.toMapButton}>지도로 보기</button> */}
              </div>
              {/* <!-- 파일 경로 템플릿 조회 탭  --> */}
              <div className="panel two-panel">
                <section style={HeaderStyles.placeList}>
                  {dbGroups && (
                    <MaterialReactTable
                      columns={columns}
                      data={dbGroups}
                      enableRowSelection
                      enableRowActions
                      positionActionsColumn="last"
                      renderRowActions={({ row }) => (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "nowrap",
                            gap: "0.5rem",
                          }}
                        >
                          <button
                            color="primary"
                            onClick={() => {
                              console.info("View Profile", row);
                            }}
                          >
                            상세보기 (팝업 출력하기)
                          </button>
                        </div>
                      )}
                    />
                  )}
                </section>
                <button className="mt10" onClick={() => setIsMenuPopupOpen(false)}>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 검색 창 */}
      <label style={HeaderStyles.label}>
        <input defaultValue={searchReducer.keyword} value={searchReducer.keyword} style={HeaderStyles.inputKeyword} placeholder="검색" onChange={(e) => dispatch(setKeyword(e.target.value))} />
      </label>

      {/* 프로필 버튼*/}
      <CgProfile style={HeaderStyles.profileButton} size="2rem" onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)} />
      {/* 프로필 팝업*/}
      {isProfilePopupOpen ? (
        <div style={HeaderStyles.profilePopup} ref={profilePopupRef}>
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
