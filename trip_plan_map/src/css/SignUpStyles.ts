import { CSSProperties } from "react";

export const SignUpContainer: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
};

export const SignUpBox: CSSProperties = {
  background: "#A0BFE0",
  position: "relative",
  borderRadius: "0.5rem",
  padding: "8rem",
  width: "40rem",
  boxShadow: "0 0 1rem rgba(0, 0, 0, 0.15) ",
};

export const SignUpForm: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "10px",
  marginBottom: "10px",
};

export const inputField: CSSProperties = {
  margin: "10px",
  padding: "7px",
  width: "300px",
};

export const submitButton: CSSProperties = {
  padding: "10px 20px",
  backgroundColor: "#435B66",
  color: "white",
  borderRadius: "5px",
  cursor: "pointer",
  width: "300px",
};

export const signupImage: CSSProperties = {
  width: "7rem",
  height: "7rem",
  marginBottom: "15px",
};
