import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux/es/exports";
import { RootState } from "../modules/index";
import * as Common from "../utils/Common";
import { setResults } from "../modules/searchSlice";
import globalStyles from "../css/globalStyles.module.scss";
import * as MapStyles from "../css/MapStyles";
import "../css/MapStyles.css";

declare global {
  interface Window {
    kakao: any;
  }
}

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

function MapComponent() {
  const dispatch = useDispatch();
  const searchReducer = useSelector((state: RootState) => state.search);

  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | string>(""); // 현재 위치 저장 (차후 선택/검색된 장소로 표시하도록 redux로 뺄 예정)
  const [searchLocation, setSearchLocation] = useState<{ latitude: number; longitude: number } | string>("");
  const [isOpenSearchResult, setIsopenSearchResult] = useState<boolean>(false);

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

  // [헤더> 검색창을 통해 키워드 입력 시, 검색 결과 목록을 화면에 출력해주기 위함]
  useEffect(() => {
    if (!Common.isNullOrEmpty(searchReducer.keyword)) {
      setIsopenSearchResult(true);

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
            setIsopenSearchResult(false);
          }
        }
      });
    } else {
      dispatch(setResults([]));
      setIsopenSearchResult(false);
    }
  }, [searchReducer.keyword]);

  // [검색 결과 목록 중, 특정 장소 클릭 시 해당 위치로 핀 이동]
  const onClickPlace = useCallback((item: placeData) => {
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

  return (
    <div>
      {/* 키워드 검색 결과 */}
      {isOpenSearchResult ? (
        <div style={MapStyles.searchResultPopup}>
          <div>
            <div className="search-results">
              <ul className="results-list">
                {searchReducer.results.map((result, index) => (
                  <li style={{ marginBottom: "10px" }} className={globalStyles.cursor_pointer} key={index} onClick={() => onClickPlace(result)}>
                    {result.place_name} [{result.address_name}]
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {/* 지도 */}
      <div id="map" className="map" />
    </div>
  );
}

export default MapComponent;
