import React, { useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import * as SignUpStyles from "../css/SignUpStyles";
import signup_img from "../image/logo/signup.png";
import globalStyles from "../css/globalStyles.module.scss";

const SignUp = (props: any) => {
  type formInputs = {
    email: string;
    password: string;
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formInputs>();
  const history = useHistory();

  const onClickSubmit = useCallback(async (inputData: formInputs) => {
    try {
      const ret = await createUserWithEmailAndPassword(auth, inputData.email, inputData.password);
      console.log(ret);
      if (ret.operationType == "signIn") {
        history.push("/login");
      }
    } catch (error: any) {
      if (error.code == "auth/email-already-in-use") {
        alert("이미 존재하는 계정입니다.");
      }
    }
  }, []);

  const onClickCancel = useCallback(() => {
    history.push("/login");
  }, []);
  return (
    <div style={SignUpStyles.SignUpContainer}>
      <div style={SignUpStyles.SignUpBox}>
        <img style={SignUpStyles.signupImage} src={signup_img} alt="singup_image" />
        <h2>회원 가입</h2>
        <form style={SignUpStyles.SignUpForm}>
          <div>
            <input
              type="email"
              id="email"
              placeholder="이메일"
              style={SignUpStyles.inputField}
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
            <input
              type="password"
              id="password"
              placeholder="비밀번호"
              style={SignUpStyles.inputField}
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
          <div>
            <input type="button" className={`${globalStyles.btn_basic} w120`} onClick={handleSubmit(onClickSubmit)} value="등록" />
            <input type="button" className={`${globalStyles.cancelBtn_basic} w120`} onClick={onClickCancel} value="취소" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
