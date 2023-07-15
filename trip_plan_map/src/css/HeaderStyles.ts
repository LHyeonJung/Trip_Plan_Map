import { CSSProperties } from "react";

export const headerContainer: CSSProperties = {
  background: "#9DB2BF",
  height: "4rem",
  justifyContent: "left",
  display: "flex",
  alignItems: "center",
};

export const menuButton: CSSProperties = {
  display: "inline-block",
  cursor: "pointer",
  verticalAlign: "middle",
  marginLeft: "1rem",
};

export const label: CSSProperties = {
  position: "relative",
  width: "100%",
};

export const inputKeyword: CSSProperties = {
  display: "inline-block",
  width: "96%",
  height: "2.5rem",
};

export const searchButton: CSSProperties = {
  position: "absolute",
  color: "#27374D",
  cursor: "pointer",
  top: "0.2rem",
  right: "2.5%",
};

export const profileButton: CSSProperties = {
  marginRight: "1rem",
  cursor: "pointer",
};

export const profilePopup: CSSProperties = {
  position: "absolute",
  top: "0",
  right: "5px",
  marginTop: "63px",
  zIndex: "20",
  background: "white",
  border: "1px solid #ccc",
  // padding: "10px",
  boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
};

export const profilePopupCloseButton: CSSProperties = {
  position: "absolute",
  top: "10px",
  left: "340px",
  cursor: "pointer",
};

export const userInfo: CSSProperties = {
  margin: "35px",
  width: "300px",
};

export const logoutButton: CSSProperties = {
  width: "100%",
  border: "1px solid #ccc",
};
