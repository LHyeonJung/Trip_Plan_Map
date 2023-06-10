import React from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

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
    <div>
      <h2>회원 가입</h2>
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
        <button className="btn btn-primary" type="submit" onClick={handleSubmit(onClickSubmit)}>
          등록
        </button>
      </form>
    </div>
  );
};

export default SignUp;
