import { CSSProperties } from "react";

export const map: CSSProperties = {
  position: "relative",
  zIndex: "1",
  width: "100vw",
  height: "100vh",
};

export const searchResult: CSSProperties = {
  //테스트용 (차후 다시 시도 예정)
  position: "absolute",
  zIndex: "2",
};

export const closeBtn: CSSProperties = {
  position: "absolute",
  right: "1rem",
  width: "1.6rem",
  marginTop: "10px",
  background: "white",
  border: "0 0 0 1px white",
};

export const popupContainer: React.CSSProperties = {
  display: "none",
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "50%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: 9999,
};

export const popupContent: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 5,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export const closeButton: React.CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "50px",
};
