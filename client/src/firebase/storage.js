import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

// Upload file to Firebase Storage
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
      success: true,
      url: downloadURL,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Upload medical document
export const uploadMedicalDocument = async (file, patientId, documentType) => {
  const path = `medical-documents/${patientId}/${documentType}/${Date.now()}_${file.name}`;
  return await uploadFile(file, path);
};

// Upload profile picture
export const uploadProfilePicture = async (file, userId) => {
  const path = `profile-pictures/${userId}/${Date.now()}_${file.name}`;
  return await uploadFile(file, path);
};

// Delete file from Firebase Storage
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

