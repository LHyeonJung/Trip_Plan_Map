import React, { useState } from "react";
import { useHistory, NavLink } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebaseConfig";
import { useForm } from "react-hook-form";
import "../css/LoginStyle.css";

const Login = (props: any) => {
  const history = useHistory();
  type LoginFormInputs = {
    email: string;
    password: string;
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onClickLogin = async (inputData: LoginFormInputs) => {
    try {
      const authInstance = getAuth(app);
      const ret = await signInWithEmailAndPassword(authInstance, inputData.email, inputData.password);

      if (ret?.user?.email == inputData.email) {
        props.history.push("/home");
      }
    } catch (error: any) {
      console.log(error);
      if (error.code == "auth/wrong-password") {
        alert("로그인에 실패했습니다.\n입력 정보 확인 후 다시 시도하세요.");
      }
      if (error.code == "auth/user-not-found") {
        alert("등록되지 않은 계정입니다.");
      }
    }
  };

  return (
    <div className="box">
      <h2>로그인</h2>
      <NavLink to="/signup">회원가입</NavLink>
      <form>
        <div>
          <label htmlFor="email">이메일:</label>
          <input
            type="email"
            id="email"
            {...register("email", {
              required: "이메일을 입력해주세요.",
              pattern: {
                value: /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
                message: "이메일 형식에 맞지 않습니다.",
              },
            })}
          />
          {errors.email && <p>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password">비밀번호:</label>
          <input
            type="password"
            id="password"
            {...register("password", {
              required: "비밀번호를 입력해주세요.",
              minLength: {
                value: 7,
                message: "7자리 이상 비밀번호를 입력하세요.",
              },
            })}
          />
          {errors.password && <p>{errors.password.message}</p>}
        </div>
        <button className="btn btn-primary" type="submit" onClick={handleSubmit(onClickLogin)}>
          로그인
        </button>
      </form>
    </div>
  );
};

export default Login;
