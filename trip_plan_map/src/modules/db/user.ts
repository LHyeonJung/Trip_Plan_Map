import { firestore } from "../../firebaseConfig";
import { addDoc, collection, getDocs, doc, query, where, updateDoc, deleteDoc } from "firebase/firestore";

// 데이터 추가
export const addUser = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(firestore, collectionName), data);
    console.log("User written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding User ", error);
  }
};

// 모든 데이터 조회
export const getAllUser = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(firestore, collectionName));
    const data = querySnapshot.docs.map((doc) => doc.data());
    // console.log("All User: ", data);
    return data;
  } catch (error) {
    console.log("Error getting all User data: ", error);
  }
};

// 특정 데이터 조회
export const getUserById = async (collectionName: string, field: string, value: string) => {
  try {
    const collectionRef = collection(firestore, collectionName);
    const queryRef = query(collectionRef, where(field, "==", value));
    const querySnapshot = await getDocs(queryRef);
    if (querySnapshot.empty) {
      console.log("Not found user!");
    } else {
      const data = querySnapshot.docs.map((doc) => doc.data());
      console.log("User Info: ", data);
      return data;
    }
  } catch (error) {
    console.log("Error getting User data: ", error);
  }
};

// 수정
export const updateUser = async (collectionName: string, documentId: string, newData: any) => {
  try {
    const docRef = doc(firestore, collectionName, documentId);
    await updateDoc(docRef, newData);
    console.log("User document successfully updated!");
  } catch (error) {
    console.error("Error updating user document: ", error);
  }
};

// 삭제
const deleteUser = async (collectionName: string, documentId: string) => {
  try {
    const docRef = doc(firestore, collectionName, documentId);
    await deleteDoc(docRef);
    console.log("User document successfully deleted!");
  } catch (error) {
    console.error("Error deleting user document: ", error);
  }
};
