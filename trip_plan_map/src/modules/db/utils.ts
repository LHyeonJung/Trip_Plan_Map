import { firestore } from "../../firebaseConfig";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export const getDocList = async (collectionName: string) => {
  try {
    // 컬렉션의 모든 문서 가져오기
    const querySnapshot = await getDocs(collection(firestore, collectionName));

    // 문서 ID들 추출
    const documentIds = querySnapshot.docs.map((doc) => doc.id);
    // console.log("문서 ID들:", documentIds);
  } catch (error) {
    console.error("문서 검색 오류:", error);
  }
};

export const findDocumentsWithField = async (collectionName: string, fieldName: string) => {
  try {
    // 해당 필드를 포함한 쿼리 생성
    const q = query(collection(firestore, collectionName), where(fieldName, "!=", null));

    // 쿼리 실행
    const querySnapshot = await getDocs(q);

    // 검색 결과 출력
    querySnapshot.forEach((doc) => {
      //   console.log("문서 ID:", doc.id);
      //   console.log("문서 데이터:", doc.data());
    });
  } catch (error) {
    console.error("문서 검색 오류:", error);
  }
};

export const findFieldsByDataValue = async (collectionName: string, fieldName: string, searchValue: any) => {
  try {
    // 해당 데이터 값을 가진 문서 검색
    const q = query(collection(firestore, collectionName), where(fieldName, "==", searchValue));
    const querySnapshot = await getDocs(q);

    // 검색 결과 출력
    querySnapshot.forEach((doc) => {
      //   console.log("문서 ID:", doc.id);
      //   console.log("문서 데이터:", doc.data());

      //   // 데이터 값에 해당하는 필드명 찾기
      //   const data = doc.data();
      //   const fields = Object.keys(data).filter((key) => data[key] === searchValue);
      //   console.log("해당 데이터 값을 가지고 있는 필드명:", fields);

      console.log("삭제 대상: ", doc.id, "\n", doc.data());
      return { docId: doc.id, data: doc.data() };
    });
  } catch (error) {
    console.error("문서 검색 오류:", error);
  }
};

// 특정 필드 값을 가진 Document ID 검색
export const getDocumentIdsByFieldValue = async (collectionName: string, fieldName: string, searchValue: any) => {
  try {
    const q = query(collection(firestore, collectionName), where(fieldName, "==", searchValue));
    const querySnapshot = await getDocs(q);

    // 검색 결과에서 문서 ID들 추출
    const documentIds = querySnapshot.docs.map((doc) => doc.id);
    // console.log("문서 ID들:", documentIds);

    const docId = querySnapshot.docs.map((doc) => doc.id);
    return docId[0];
  } catch (error) {
    console.error("문서 검색 오류:", error);
  }
};
