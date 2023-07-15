import "./App.css";
import React, { useEffect, useState } from "react";
import { Router, Switch, Route, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import "firebase/auth";
import { getAuth, User, onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 1. 현재 로그인 정보 확인
    const auth = getAuth(); // Firebase Auth 인스턴스 가져오기
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 사용자가 로그인한 경우
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        // 사용자가 로그아웃한 경우
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    // 2. 페이지 로드 시, 로컬 스토리지에서 사용자 정보 확인
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userInfo = JSON.parse(storedUser);
      setUser(userInfo);
    }

    // 컴포넌트 언마운트 시에도 구독 해제
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      <switch>
        <Route path="/login" render={(props) => <Login {...props} />} />
        <Route path="/signup" render={(props) => <SignUp {...props} />} />
        <Route path="/home" render={(props) => <Home {...props} />} />
        {user ? <Redirect exact from="/" to="/home" /> : <Redirect exact from="/" to="/login" />}
      </switch>
    </div>
  );
}

export default App;
