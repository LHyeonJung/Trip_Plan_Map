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
import DataTable from "react-data-table-component";
import { Button } from "react-bootstrap";
import { createGuid, isNullOrEmpty } from "../utils/Common";
import { groupData, placeInfo, setAllGroups } from "../modules/groupSlice";
import { async } from "@firebase/util";

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

  const columns = [
    {
      name: "Select",
      cell: (row: groupData) => <input type="checkbox" style={{ textAlign: "center" }} checked={selectedGroups?.includes(row)} onChange={() => toggleRow(row.id)} />,
    },
    {
      name: "name", //"이름",
      selector: (row: groupData) => row.name,
      sortable: true,
      sortField: "name",
      cell: (row: any) => <div style={{ textAlign: "center" }}>{row.name}</div>, // 데이터를 가운데 정렬하여 렌더링
    },
    {
      name: "detail",
      cell: (row: groupData) => (
        <AiOutlineSearch
          className="text-center"
          size="23px"
          onClick={() => {
            console.info("View Profile", row);
            setIsGroupDetailMode(true);
            setSelectedGroup({ ...selectedGroup, placeList: [...row?.placeList], id: row?.id, name: row?.name, userList: [...row?.userList] });
          }}
        />
      ),
    },
  ];

  const dispatch = useDispatch();
  const searchReducer = useSelector((state: RootState) => state.search);
  const reducerAllGroupData = useSelector((state: RootState) => state.group.allGroupsData);
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
  const [dbGroups, setDbGroups] = useState<groupData[] | undefined>([]); // 현재 계정이 속한 그룹 데이터
  const [isGroupDetailMode, setIsGroupDetailMode] = useState(false); // 메뉴> 그룹 탭> 상세보기 클릭 여부
  const [selectedGroup, setSelectedGroup] = useState<groupData | undefined>(); // 메뉴> 그룹 탭> 상세보기 클릭 대상 그룹
  const [selectedGroups, setSelectedGroups] = useState<groupData[]>([]); // 메뉴> 그룹 탭> 테이블에서 체크 박스를 통해 선택된 그룹 목록
  const [isCreateGroupMode, setIsGroupCreateMode] = useState(false);
  const [inputCreateGroup, setInputCreateGroup] = useState({ name: "", userList: "" }); //<createGroup>();

  const toggleRow = (id: string) => {
    let targetGroupFilter = reducerAllGroupData?.filter((x: any) => x.id == id);
    if (typeof targetGroupFilter != "undefined" && targetGroupFilter?.length > 0) {
      let targetGroup = targetGroupFilter[0];
      const isSelected = selectedGroups.includes(targetGroup);
      if (isSelected) {
        setSelectedGroups(selectedGroups.filter((row: any) => row.id !== id));
      } else {
        let temp = [...selectedGroups];
        temp.push(targetGroup);
        setSelectedGroups([...temp]);
      }
    }
  };

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
      setDbGroups(targetGroups as groupData[]);
      dispatch(setAllGroups(targetGroups as groupData[]));
    } catch (error) {
      console.error("그룹 정보 조회 실패");
    }
  };

  // 리듀서의 전체 그룹 정보 변경됐을 시, 바인딩 데이터 갱신
  useEffect(() => {}, [reducerAllGroupData]);

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

  const onClickDeleteGroup = useCallback(async () => {
    if (typeof selectedGroups != "undefined" && selectedGroups.length > 0) {
      selectedGroups.forEach(async (targetGroup: any) => {
        try {
          // 선택한 필드가 속한 Document ID 조회
          const targetDocId = await firebaseUtils.getDocumentIdsByFieldValue("Group", "id", targetGroup?.id);

          if (!isNullOrEmpty(targetDocId)) {
            // DB에서 삭제
            await firebaseGroup.deleteGroupDocument("Group", targetDocId as string);
          } else {
            alert("해당 데이터의 Document ID를 찾을 수 없습니다.\nDB 서버 확인 후 재시도 하세요.");
          }
        } catch (e) {
          console.error("그룹 삭제 실패");
          console.error(e);
        }
      });

      // 입력 값 초기화 및 그룹 데이터 재조회
      getAllGroup(user);
    } else {
      alert("선택된 그룹이 없습니다.");
    }
  }, [selectedGroups]);

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
                  {reducerAllGroupData &&
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

                        <DataTable
                          columns={columns}
                          data={reducerAllGroupData}
                          pagination
                          paginationPerPage={5}
                          selectableRowSelected={(row: any) => selectedGroups.includes(row)} // 선택된 행 설정
                          paginationRowsPerPageOptions={[5, 10, 20]}
                          fixedHeader={true} // 헤더 고정
                          fixedHeaderScrollHeight="30rem" // 스크롤 높이 설정
                          defaultSortFieldId="name" // 초기 정렬 열을 설정 (defaultSortField 대신 defaultSortFieldId 사용)
                          defaultSortAsc={false} // 내림차순으로 정렬
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
