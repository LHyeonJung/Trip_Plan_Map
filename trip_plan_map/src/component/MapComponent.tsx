import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux/es/exports";
import { MdOutlineBookmarkAdd } from "react-icons/md";
import { RootState } from "../modules/index";
import * as Common from "../utils/Common";
import { setResults } from "../modules/searchSlice";
import globalStyles from "../css/globalStyles.module.scss";
import * as MapStyles from "../css/MapStyles";
import * as firebaseUtils from "../modules/db/utils";
import * as firebaseGroup from "../modules/db/group";
import * as firebaseUser from "../modules/db/user";
import DataTable from "react-data-table-component";
import "../css/MapStyles.css";
import { groupData, setAllGroups } from "../modules/groupSlice";

declare global {
  interface Window {
    kakao: any;
  }
}

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

type dbGroupInfo = {
  placeList: placeInfo[];
  id: "";
  name: "";
  userList: [];
};

type dbUserInfo = {
  placeList: placeInfo[];
  id: "";
  groupList: [];
};

function MapComponent() {
  const dispatch = useDispatch();
  const searchResultPopupRef = useRef<HTMLDivElement>(null);
  const searchReducer = useSelector((state: RootState) => state.search);

  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | string>(""); // 현재 위치(위도, 경도) 저장 (차후 선택/검색된 장소로 표시하도록 redux로 뺄 예정)
  const [searchLocation, setSearchLocation] = useState<{ latitude: number; longitude: number } | string>("");
  const [isOpenSearchResult, setIsOpenSearchResult] = useState<boolean>(false);
  const [isOpenGroupsModal, setIsOpenGroupsModal] = useState<boolean>(false); // 공유 대상 그룹 선택 팝업 출력 여부
  const [dbGroups, setDbGroups] = useState<dbGroupInfo[] | undefined>([]); // 현재 계정이 속한 그룹 데이터
  const [targetPlace, setTargetPlace] = useState<placeData | undefined>();
  const [user, setUser] = useState<userInfo>(); // 현재 로그인된 사용자 정보
  const [dbUser, setDbUser] = useState<dbUserInfo | undefined>(); // 현재 계정에 저장된 장소 관련 데이터
  const [selectedGroups, setSelectedGroups] = useState<dbGroupInfo[]>([]); // 메뉴> 그룹 탭> 테이블에서 체크 박스를 통해 선택된 그룹 목록
  const toggleRow = (id: string) => {
    let targetGroupFilter = dbGroups?.filter((x) => x.id == id);
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
  useEffect(() => {
    console.log("selectedGroups==", selectedGroups);
  }, [selectedGroups]);

  const columns = [
    {
      name: "Select",
      cell: (row: dbGroupInfo) => <input type="checkbox" style={{ textAlign: "center" }} checked={selectedGroups?.includes(row)} onChange={() => toggleRow(row.id)} />,
    },
    {
      name: "name", //"이름",
      selector: (row: dbGroupInfo) => row.name,
      sortable: true,
      sortField: "name",
      cell: (row: any) => <div style={{ textAlign: "center" }}>{row.name}</div>, // 데이터를 가운데 정렬하여 렌더링
    },
  ];

  useMemo(() => {
    // [현재 위치 정보를 state에 세팅]
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    }

    function success(position: any) {
      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    }

    function error() {
      setCurrentLocation({
        latitude: 37.483034,
        longitude: 126.902435,
      });
      console.log("위치 받기 실패");
    }
  }, [navigator.geolocation.getCurrentPosition]);

  useEffect(() => {
    // [지도 데이터 세팅]
    if (typeof currentLocation != "string") {
      changePinPosition(currentLocation.latitude, currentLocation.longitude); // 지도에 핀 찍기
    }
  }, [currentLocation]);

  // 팝업 외 영역 클릭 시, 팝업 닫히도록 리스너 로직 구현
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (searchResultPopupRef.current && !searchResultPopupRef.current.contains(event.target)) {
        setIsOpenSearchResult(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

    // 공유 대상 그룹 선택 모달 닫기
    setIsOpenGroupsModal(false);

    // 초기화
    setSelectedGroups([]);
  }, []);

  // [헤더> 검색창을 통해 키워드 입력 시, 검색 결과 목록을 화면에 출력해주기 위함]
  useEffect(() => {
    if (!Common.isNullOrEmpty(searchReducer.keyword)) {
      setIsOpenSearchResult(true);

      // 키워드 검색 기능 구현
      let searchList: placeData[] = [];
      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(searchReducer.keyword, (data: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          for (let i = 0; i < data.length; i++) {
            const obj1: placeData = { ...data[i] };
            searchList.push(obj1);
          }

          // 검색 결과 화면에 띄워주기 위해 리듀서 업데이트
          dispatch(setResults(searchList));

          if (searchList.length < 1) {
            setIsOpenSearchResult(false);
          }
        }
      });
    } else {
      dispatch(setResults([]));
      setIsOpenSearchResult(false);
    }
  }, [searchReducer.keyword]);

  // [검색 결과 목록 중, 특정 장소 클릭 시 해당 위치로 핀 이동]
  const onClickPlace = useCallback((item: placeData) => {
    console.log(item);
    console.log(+item.x);
    setSearchLocation({
      latitude: +item.y,
      longitude: +item.x,
    });
  }, []);

  useEffect(() => {
    if (typeof searchLocation != "string") {
      changePinPosition(searchLocation.latitude, searchLocation.longitude); // 지도에 핀 찍기
    }
  }, [searchLocation]);

  const changePinPosition = useCallback((latitude: number, longitude: number) => {
    let container = document.getElementById("map");
    let options = {
      center: new window.kakao.maps.LatLng(latitude, longitude), // 지도의 중심 좌표 (현재 위치 기반)
      level: 3, // 지도의 확대 레벨 (임의 설정)
    };

    let map = new window.kakao.maps.Map(container, options);

    // 현재 위치 핀 표시
    const currentMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(latitude, longitude),
      map,
    });
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
      dispatch(setAllGroups(targetGroups as groupData[]));
    } catch (error) {
      console.error("그룹 정보 조회 실패");
    }
  };

  const onClickAdd = useCallback(async () => {
    if (typeof selectedGroups != "undefined" && selectedGroups.length > 0) {
      selectedGroups.forEach(async (targetGroup: any) => {
        try {
          // 선택한 필드가 속한 Document ID 조회
          const targetDocId = await firebaseUtils.getDocumentIdsByFieldValue("Group", "id", targetGroup?.id);

          if (!Common.isNullOrEmpty(targetDocId)) {
            // 해당 그룹에 추가
            let tempGroup = JSON.parse(JSON.stringify(targetGroup));
            const isOverlap = tempGroup.placeList.some((x: any) => x.name === targetPlace?.place_name && x.location.longitude === targetPlace?.x && x.location.latitude === targetPlace?.y);

            if (!isOverlap) {
              const body = {
                memo: [],
                name: targetPlace?.place_name,
                phone: targetPlace?.phone,
                location: {
                  longitude: targetPlace?.x,
                  latitude: targetPlace?.y,
                },
                address: targetPlace?.address_name,
              };
              tempGroup.placeList.push(body);
              await firebaseGroup.updateGroup("Group", targetDocId as string, tempGroup);
            }

            // // 공유 대상 그룹 선택 모달 닫기
            setIsOpenGroupsModal(false);
            setSelectedGroups([]);
          } else {
            alert("해당 데이터의 Document ID를 찾을 수 없습니다.\nDB 서버 확인 후 재시도 하세요.");
          }
        } catch (e) {
          console.error("그룹에 추가 실패");
          console.error(e);
        }
      });

      // 입력 값 초기화 및 그룹 데이터 재조회
      getAllGroup(user);
    } else {
      alert("선택된 그룹이 없습니다.");
    }
  }, [selectedGroups, targetPlace]);

  const onClickAddPlace = useCallback(async (e: any, result: any) => {
    console.log("====저장 대상 place====", result);
    setTargetPlace(result);
    setIsOpenGroupsModal(true);
  }, []);

  return (
    <div>
      {/* 키워드 검색 결과 */}
      {isOpenSearchResult ? (
        <div style={MapStyles.searchResultPopup} ref={searchResultPopupRef}>
          <div>
            <div className="search-results">
              <ul className="results-list">
                {searchReducer.results.map((result, index) => (
                  <li style={{ marginBottom: "10px" }} className={globalStyles.cursor_pointer} key={index} onClick={() => onClickPlace(result)}>
                    {result.place_name} [{result.address_name}]
                    <MdOutlineBookmarkAdd className="results-item-addGroupBtn" onClick={(e) => onClickAddPlace(e, result)} size="20px" />
                  </li>
                ))}
              </ul>
            </div>

            {/* 추가 대상 그룹 목록 */}
            {isOpenGroupsModal && (
              <div style={{ background: "white" }}>
                <DataTable
                  title="공유 대상 그룹 선택"
                  columns={columns}
                  data={dbGroups || []}
                  pagination
                  paginationPerPage={5}
                  selectableRowSelected={(row: any) => selectedGroups.includes(row)} // 선택된 행 설정
                  paginationRowsPerPageOptions={[5, 10, 20]}
                  fixedHeader={true} // 헤더 고정
                  fixedHeaderScrollHeight="30rem" // 스크롤 높이 설정
                  defaultSortFieldId="name" // 초기 정렬 열을 설정 (defaultSortField 대신 defaultSortFieldId 사용)
                  defaultSortAsc={false} // 내림차순으로 정렬
                />
                <button onClick={onClickAdd}>추가</button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* 지도 */}
      <div id="map" className="map" />
    </div>
  );
}

export default MapComponent;
