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

export const menuPopup: CSSProperties = {
  position: "absolute",
  top: "0",
  left: "5px",
  marginTop: "63px",
  zIndex: "20",
  background: "white",
  border: "1px solid #ccc",
  // padding: "10px",
  boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
  width: "25rem",
  minHeight: "20rem",
  maxHeight: "50rem",
};

export const tabContents: CSSProperties = {
  maxHeight: "20rem",
  overflowY: "auto",
};

export const placeItemBox: CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "95%",
  height: "100px",
  border: "solid black 1px",
  margin: "0 auto",
  justifyContent: "center",
};

export const placeInfo_main: CSSProperties = {
  fontSize: "17px",
};
export const placeInfo_sub: CSSProperties = {
  fontSize: "13px",
};

export const toMapButton: CSSProperties = {
  fontSize: "15px",
  justifyContent: "right",
  marginTop: "10px",
};

export const memoListButton: CSSProperties = {
  cursor: "pointer",
};

export const memoPopup: CSSProperties = {
  position: "absolute",
  top: "10%",
  left: "100%",
  marginTop: "63px",
  zIndex: "20",
  background: "#FAF3F0",
  border: "1px solid #ccc",
  boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
  width: "17rem",
  height: "18rem",
  padding: "10px",
};

export const memoList: CSSProperties = {
  height: "13rem",
  maxHeight: "13rem",
  overflowY: "auto",
};

export const memoItemBox: CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "95%",
  height: "50px",
  border: "solid black 1px",
  margin: "0 auto",
  justifyContent: "center",
  fontSize: "13px",
};

export const memoPopupCloseButton: CSSProperties = {
  marginTop: "8px",
  fontSize: "15px",
};

export const createGroupPopup: CSSProperties = {
  paddingTop: "1rem",
  position: "absolute",
  top: "10%",
  left: "100%",
  marginTop: "63px",
  zIndex: "20",
  background: "#FAF3F0",
  border: "1px solid #ccc",
  boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
  width: "17rem",
  height: "12rem",
  padding: "10px",
};

export const groupDetail: CSSProperties = {
  paddingLeft: "0.5rem",
  paddingRight: "0.5rem",
};

export const groupDetailLabel: CSSProperties = {
  border: "solid black 1px",
};

export const groupDetailItemBox: CSSProperties = {
  width: "100%",
  // height: "100px",
  border: "solid black 1px",
  margin: "0 auto",
  overflowWrap: "normal",
  maxHeight: "10rem",
  overflowY: "auto",
};

export const groupDetailItem: CSSProperties = {
  padding: "0.5rem",
  fontSize: "13px",
  borderBottom: "solid black 1px",
  width: "100%",
  justifyContent: "left",
  display: "flex",
  maxWidth: "100%",
  wordBreak: "break-all",
};

export const basicBtn: CSSProperties = {
  background: "white",
  color: "black",
  border: "1px solid black",
  fontSize: "12px",
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
