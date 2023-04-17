import React, { useEffect, useState, useMemo } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}
function MapComponent() {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | string>(""); // 현재 위치 저장 (차후 선택/검색된 장소로 표시하도록 redux로 뺄 예정)

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
      let container = document.getElementById("map");
      let options = {
        center: new window.kakao.maps.LatLng(currentLocation.latitude, currentLocation.longitude), // 지도의 중심 좌표 (현재 위치 기반)
        level: 3, // 지도의 확대 레벨 (임의 설정)
      };

      let map = new window.kakao.maps.Map(container, options);

      // 현재 위치 핀 표시
      const currentMarker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(currentLocation.latitude, currentLocation.longitude),
        map,
        // 원하는 이미지로 마커 커스텀
        // icon: {
        //     url: pinImage,
        //     size: new naver.maps.Size(50, 52),
        //     origin: new naver.maps.Point(0, 0),
        //     anchor: new naver.maps.Point(25, 26),
        //   },
      });
    }
  }, [currentLocation]);

  return (
    <div>
      <div id="map" style={{ width: "100vw", height: "100vh" }} />
    </div>
  );
}

export default MapComponent;
