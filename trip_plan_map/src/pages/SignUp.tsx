import React from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import * as SingUpStyles from "../css/SignUpStyles";
import signup_img from "../image/logo/signup.png";

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

  const onClickSubmit = async (inputData: formInputs) => {
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
  };

  return (
    <div style={SingUpStyles.SignUpContainer}>
      <div style={SingUpStyles.SignUpBox}>
        <img style={SingUpStyles.signupImage} src={signup_img} alt="singup_image" />
        <h2>회원 가입</h2>
        <form style={SingUpStyles.SignUpForm}>
          <div>
            <input
              type="email"
              id="email"
              placeholder="이메일"
              style={SingUpStyles.inputField}
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
              style={SingUpStyles.inputField}
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
          <button style={SingUpStyles.submitButton} type="submit" onClick={handleSubmit(onClickSubmit)}>
            등록
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
