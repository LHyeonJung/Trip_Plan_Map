import React, { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineMenu, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { BiMap } from "react-icons/bi";
import { CiMemoPad } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import * as HeaderStyles from "../css/HeaderStyles";
import { setKeyword } from "../modules/searchSlice";
import { RootState } from "../modules";
import * as firebaseAuth from "firebase/auth";
import * as firebaseUser from "../modules/db/user";
import * as firebaseGroup from "../modules/db/group";
import * as firebaseUtils from "../modules/db/utils";
import { MaterialReactTable, type MRT_ColumnDef, type MRT_RowSelectionState } from "material-react-table";
import { Button } from "react-bootstrap";
import { createGuid, isNullOrEmpty } from "../utils/Common";

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

  interface RowData {
    name: "";
    placeList: placeInfo[];
    id: "";
    userList: [];
    // ... 다른 데이터 속성들 ...
  }

  const menuTabTypes = {
    individual: "individual",
    group: "group",
  };

  const columns = useMemo<MRT_ColumnDef<RowData>[]>(
    () => [
      {
        accessorKey: "name",
        header: "그룹명",
        size: 100,
        // 현재 아래 스타일이 적용되지 않는 상태라 확인 필요함 **
        headerStyle: {
          textAlign: "center", // 헤더 텍스트 중앙 정렬
          fontWeight: "bold", // 헤더 텍스트 굵게 설정
          fontSize: "16px", // 헤더 텍스트 폰트 크기 설정
          color: "#007bff", // 헤더 텍스트 색상 설정
          backgroundColor: "#f2f2f2", // 헤더 배경색 설정
          // ... 다른 스타일 속성들 ...
        },
      },
    ],
    []
  );

  const dispatch = useDispatch();
  const searchReducer = useSelector((state: RootState) => state.search);
  const profilePopupRef = useRef<HTMLDivElement>(null);
  const menuPopupRef = useRef<HTMLDivElement>(null);
  const subPopupRef = useRef<HTMLDivElement>(null);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isMenuPopupOpen, setIsMenuPopupOpen] = useState(false);
  const [isMemoPopupOpen, setIsMemoPopupOpen] = useState(false);
  const [memoPopupData, setMemoPopupData] = useState<placeInfo | undefined>();
  const [selectedTab, setSelectedTab] = useState(menuTabTypes.individual);
  const [user, setUser] = useState<userInfo>(); // 현재 로그인된 사용자 정보
  const [dbUser, setDbUser] = useState<dbUserInfo | undefined>(); // 현재 계정에 저장된 장소 관련 데이터
  const [dbGroups, setDbGroups] = useState<dbGroupInfo[] | undefined>([]); // 현재 계정이 속한 그룹 데이터
  const [isGroupDetailMode, setIsGroupDetailMode] = useState(false); // 메뉴> 그룹 탭> 상세보기 클릭 여부
  const [selectedGroup, setSelectedGroup] = useState<dbGroupInfo | undefined>(); // 메뉴> 그룹 탭> 상세보기 클릭 대상 그룹
  const [selectedGroups, setSelectedGroups] = useState<MRT_RowSelectionState>({}); // 메뉴> 그룹 탭> 테이블에서 체크 박스를 통해 선택된 그룹 목록
  const [isCreateGroupMode, setIsGroupCreateMode] = useState(false);
  const [inputCreateGroup, setInputCreateGroup] = useState({ name: "", userList: "" }); //<createGroup>();

  useEffect(() => {
    console.info("selected rows", selectedGroups);
  }, [selectedGroups]);

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
      const allGroups = await firebaseGroup.getAllGroup("Group");
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
        setIsGroupDetailMode(false);
        setSelectedTab(menuTabTypes.individual);
      }

      // 프로필 팝업
      if (profilePopupRef.current && !profilePopupRef.current.contains(event.target)) {
        setIsProfilePopupOpen(false);
      }

      // 메모 또는 그룹 생성 팝업
      if (subPopupRef.current && !subPopupRef.current.contains(event.target)) {
        setIsMemoPopupOpen(false);
        setIsGroupCreateMode(false);
        setInputCreateGroup({ name: "", userList: "" });
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

  const onClickCreateGroup = useCallback(async () => {
    try {
      // 필수 입력 항목 체크
      if (isNullOrEmpty(inputCreateGroup.name)) {
        alert("그룹명은 필수 입력 항목 입니다.");
      } else {
        // 추가할 사용자 입력 상태라면 배열로 치환 (공백 제거 후 배열로 치환)
        const userArr = !isNullOrEmpty(inputCreateGroup.userList) ? inputCreateGroup.userList.replace(/\s+/g, "").split(",") : [];

        const body = {
          id: createGuid(),
          name: inputCreateGroup.name,
          userList: [...userArr],
          placeList: [
            {
              location: {
                latitude: 0,
                longitude: 0,
              },
              memo: [],
              name: "",
              address: "",
              phone: "",
            },
          ],
        };

        // DB에 추가
        await firebaseGroup.addGroup("Group", body);

        // 입력 값 초기화 및 그룹 데이터 재조회
        getAllGroup(user);
        setInputCreateGroup({ name: "", userList: "" });
        setIsGroupCreateMode(false);
      }
    } catch (e) {
      console.error("그룹 생성 실패");
      console.error(e);
    }
  }, [inputCreateGroup, user]);

  // 선택한 여러개 그룹을 한번에 삭제하도록 추가해야 함 **
  // (체크된 그룹은 변수에 담아두었는데, 체크박스에 표시가 안되는 버그가 있어서 테스트를 제대로 못한 상태)
  // 선택한 특정 그룹 삭제 테스트는 완료!
  const onClickDeleteGroup = useCallback(async () => {
    try {
      // 선택한 필드가 속한 Document ID 조회
      const targetDocId = await firebaseUtils.getDocumentIdsByFieldValue("Group", "id", selectedGroup?.id);

      if (!isNullOrEmpty(targetDocId)) {
        // DB에서 삭제
        await firebaseGroup.deleteGroupDocument("Group", targetDocId as string);

        // 입력 값 초기화 및 그룹 데이터 재조회
        getAllGroup(user);
      } else {
        alert("해당 데이터의 Document ID를 찾을 수 없습니다.\nDB 서버 확인 후 재시도 하세요.");
      }
    } catch (e) {
      console.error("그룹 삭제 실패");
      console.error(e);
    }
  }, [selectedGroup]);

  return (
    <div style={HeaderStyles.headerContainer}>
      {/* 메뉴 */}
      <AiOutlineMenu style={HeaderStyles.menuButton} size="2rem" onClick={() => setIsMenuPopupOpen(!isMenuPopupOpen)} />
      {isMenuPopupOpen ? (
        <div style={HeaderStyles.menuPopup} ref={menuPopupRef}>
          <h5 className="mt20">장소 저장 목록 </h5>

          {/* <!-- 탭 메뉴 영역   --> */}
          <div className="tab_upbar mt20">
            <input
              className="radio one"
              id="one"
              name="group"
              type="radio"
              checked={selectedTab === menuTabTypes.individual ? true : false}
              onChange={(e) => {
                setSelectedTab(menuTabTypes.individual);
                setIsGroupDetailMode(false);
              }}
            />
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
              {/* 개인 탭 */}
              <div className="panel one-panel">
                <section style={HeaderStyles.tabContents}>
                  {dbUser?.placeList &&
                    dbUser.placeList.map((place) => (
                      <li style={HeaderStyles.placeItemBox}>
                        <BiMap size="35px" />
                        <div>
                          <div>
                            <div style={HeaderStyles.placeInfo_main}>
                              {place.name} <CiMemoPad style={HeaderStyles.memoListButton} size="20px" onClick={() => onClickMemoList(place)} />
                              <AiOutlineClose
                                className="cursor_pointer ml5"
                                size="17px"
                                onClick={() => {
                                  alert("개인 저장 장소 삭제");
                                }}
                              />
                            </div>
                            <div style={HeaderStyles.placeInfo_sub}>{place.address}</div>
                            <div style={HeaderStyles.placeInfo_sub}>{place.phone}</div>
                          </div>

                          {isMemoPopupOpen && memoPopupData ? (
                            <div style={HeaderStyles.memoPopup} ref={subPopupRef}>
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
                {/* <button className="mt10" onClick={() => setIsMenuPopupOpen(false)}>
                  닫기
                </button> */}
                {/* <button style={HeaderStyles.toMapButton}>지도로 보기</button> */}
              </div>

              {/* 그룹 탭 */}
              <div className="panel two-panel">
                <section style={HeaderStyles.tabContents}>
                  {dbGroups &&
                    // dbGroups.map(function (item: any) {
                    //   return <div>{item?.id}</div>;
                    // })
                    (!isGroupDetailMode ? (
                      <div>
                        <Button className="w100 h30" style={HeaderStyles.basicBtn} onClick={onClickDeleteGroup}>
                          그룹 삭제
                        </Button>
                        <Button className="w100 h30" style={HeaderStyles.basicBtn} onClick={(e) => setIsGroupCreateMode(true)}>
                          그룹 생성
                        </Button>
                        {isCreateGroupMode ? (
                          <div style={HeaderStyles.createGroupPopup} ref={subPopupRef}>
                            <div>
                              <div>
                                그룹명 * <input type="text" value={inputCreateGroup?.name} onChange={(e) => setInputCreateGroup({ ...inputCreateGroup, name: e?.target?.value })} />
                              </div>
                              <div className="mt10">
                                그룹에 추가할 친구 목록
                                <input type="text" placeholder="쉼표(,)로 구분하여 입력" value={inputCreateGroup?.userList} onChange={(e) => setInputCreateGroup({ ...inputCreateGroup, userList: e?.target?.value })} />
                              </div>
                            </div>
                            <button className="mt10" style={HeaderStyles.basicBtn} onClick={onClickCreateGroup}>
                              생성
                            </button>
                          </div>
                        ) : null}
                        <MaterialReactTable
                          columns={columns}
                          data={dbGroups}
                          enableMultiRowSelection={true}
                          getRowId={(row: any) => row.id}
                          onRowSelectionChange={setSelectedGroups}
                          muiSelectCheckboxProps={{
                            color: "secondary",
                            // disabled: row.original.isAccountLocked,
                          }}
                          state={selectedGroups}
                          displayColumnDefOptions={{
                            "mrt-row-actions": {
                              header: "상세보기", //change header text
                              size: 100, //make actions column wider
                            },
                          }}
                          enableRowSelection
                          enableRowActions
                          positionActionsColumn="last"
                          renderRowActions={({ row }) => (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "nowrap",
                                justifyItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <AiOutlineSearch
                                size="23px"
                                onClick={() => {
                                  console.info("View Profile", row);
                                  setIsGroupDetailMode(true);
                                  setSelectedGroup({ ...selectedGroup, placeList: [...row?.original?.placeList], id: row?.original?.id, name: row?.original?.name, userList: [...row?.original?.userList] });
                                }}
                              />
                            </div>
                          )}
                        />
                      </div>
                    ) : (
                      <div style={HeaderStyles.groupDetail}>
                        <div> {selectedGroup?.name}</div>

                        <section>
                          <div className="form-item col-1">
                            <label className="w150" style={HeaderStyles.groupDetailLabel}>
                              친구 목록
                              <Button className="w50 h30" style={HeaderStyles.basicBtn}>
                                추가
                              </Button>
                            </label>

                            <div style={HeaderStyles.groupDetailItemBox}>
                              {" "}
                              {selectedGroup?.userList.map((user: string) => {
                                return (
                                  <div>
                                    {!isNullOrEmpty(user) ? (
                                      <div style={HeaderStyles.groupDetailItem}>
                                        {user}

                                        <AiOutlineClose
                                          className="cursor_pointer ml5"
                                          size="17px"
                                          onClick={() => {
                                            alert("사용자 삭제");
                                          }}
                                        />
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </section>

                        <section className="form-info">
                          <div className="form-item col-1">
                            <label className="w150" style={HeaderStyles.groupDetailLabel}>
                              장소 목록
                              <Button className="w50 h50" style={HeaderStyles.basicBtn}>
                                지도 표시
                              </Button>
                            </label>

                            <div style={HeaderStyles.groupDetailItemBox}>
                              {" "}
                              {selectedGroup?.placeList.map((place: placeInfo) => {
                                return (
                                  <div>
                                    {!isNullOrEmpty(place?.name) ? (
                                      <div style={HeaderStyles.groupDetailItem}>
                                        {place?.name}

                                        <AiOutlineClose
                                          className="cursor_pointer ml5"
                                          size="17px"
                                          onClick={() => {
                                            alert("저장된 장소 삭제");
                                          }}
                                        />
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </section>
                      </div>
                    ))}
                </section>
                {isGroupDetailMode && (
                  <button
                    className="mr20"
                    onClick={() => {
                      setIsGroupDetailMode(false);
                    }}
                  >
                    이전
                  </button>
                )}
                {/* <button className="mt10" onClick={() => setIsMenuPopupOpen(false)}>
                  닫기
                </button> */}
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
