import { firestore } from "../../firebaseConfig";
import { addDoc, collection, getDocs, doc, query, where, updateDoc, deleteDoc } from "firebase/firestore";

// 데이터 추가
export const addGroup = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(firestore, collectionName), data);
    console.log("Group written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding Group ", error);
  }
};

// 모든 데이터 조회
export const getAllGroup = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(firestore, collectionName));
    const data = querySnapshot.docs.map((doc) => doc.data());
    console.log("all group data: ", data);
    return data;
  } catch (error) {
    console.log("Error getting all Group data: ", error);
  }
};

// 특정 데이터 조회
export const getGroupById = async (collectionName: string, field: string, value: string) => {
  try {
    const collectionRef = collection(firestore, collectionName);
    const queryRef = query(collectionRef, where(field, "==", value));
    const querySnapshot = await getDocs(queryRef);
    if (querySnapshot.empty) {
      console.log("Not found group!");
    } else {
      const data = querySnapshot.docs.map((doc) => doc.data());
      console.log("Group Info: ", data);
      return data;
    }
  } catch (error) {
    console.log("Error getting Group data: ", error);
  }
};

// 수정
export const updateGroup = async (collectionName: string, documentId: string, newData: any) => {
  try {
    const docRef = doc(firestore, collectionName, documentId);
    await updateDoc(docRef, newData);
    console.log("Group document successfully updated!");
  } catch (error) {
    console.error("Error updating group document: ", error);
  }
};

// 그룹의 특정 Document 삭제
export const deleteGroupDocument = async (collectionName: string, documentId: string) => {
  try {
    const docRef = doc(firestore, collectionName, documentId);
    await deleteDoc(docRef);
    console.log("Group document successfully deleted!");
  } catch (error) {
    console.error("Error deleting group document: ", error);
  }
};
