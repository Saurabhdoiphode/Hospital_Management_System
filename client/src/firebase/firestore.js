import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";

// Patients Collection
export const patientsCollection = collection(db, "patients");

export const createPatient = async (patientData) => {
  try {
    const docRef = await addDoc(patientsCollection, {
      ...patientData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getPatient = async (patientId) => {
  try {
    const docRef = doc(db, "patients", patientId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, message: "Patient not found" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getPatients = async () => {
  try {
    const q = query(patientsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const patients = [];
    querySnapshot.forEach((doc) => {
      patients.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: patients };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updatePatient = async (patientId, patientData) => {
  try {
    const docRef = doc(db, "patients", patientId);
    await updateDoc(docRef, {
      ...patientData,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const deletePatient = async (patientId) => {
  try {
    await deleteDoc(doc(db, "patients", patientId));
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Appointments Collection
export const appointmentsCollection = collection(db, "appointments");

export const createAppointment = async (appointmentData) => {
  try {
    const docRef = await addDoc(appointmentsCollection, {
      ...appointmentData,
      appointmentDate: Timestamp.fromDate(new Date(appointmentData.appointmentDate)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getAppointments = async (filters = {}) => {
  try {
    let q = query(appointmentsCollection);
    
    if (filters.doctor) {
      q = query(q, where("doctor", "==", filters.doctor));
    }
    if (filters.patient) {
      q = query(q, where("patient", "==", filters.patient));
    }
    if (filters.status) {
      q = query(q, where("status", "==", filters.status));
    }
    
    q = query(q, orderBy("appointmentDate", "asc"));
    
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: appointments };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const docRef = doc(db, "appointments", appointmentId);
    await updateDoc(docRef, {
      ...appointmentData,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Medical Records Collection
export const medicalRecordsCollection = collection(db, "medicalRecords");

export const createMedicalRecord = async (recordData) => {
  try {
    const docRef = await addDoc(medicalRecordsCollection, {
      ...recordData,
      visitDate: Timestamp.fromDate(new Date(recordData.visitDate || new Date())),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getMedicalRecords = async (filters = {}) => {
  try {
    let q = query(medicalRecordsCollection);
    
    if (filters.patient) {
      q = query(q, where("patient", "==", filters.patient));
    }
    if (filters.doctor) {
      q = query(q, where("doctor", "==", filters.doctor));
    }
    
    q = query(q, orderBy("visitDate", "desc"));
    
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: records };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Billing Collection
export const billingCollection = collection(db, "billing");

export const createBill = async (billData) => {
  try {
    const docRef = await addDoc(billingCollection, {
      ...billData,
      invoiceDate: Timestamp.fromDate(new Date(billData.invoiceDate || new Date())),
      dueDate: Timestamp.fromDate(new Date(billData.dueDate)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getBills = async (filters = {}) => {
  try {
    let q = query(billingCollection);
    
    if (filters.patient) {
      q = query(q, where("patient", "==", filters.patient));
    }
    if (filters.status) {
      q = query(q, where("status", "==", filters.status));
    }
    
    q = query(q, orderBy("invoiceDate", "desc"));
    
    const querySnapshot = await getDocs(q);
    const bills = [];
    querySnapshot.forEach((doc) => {
      bills.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: bills };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Inventory Collection
export const inventoryCollection = collection(db, "inventory");

export const createInventoryItem = async (itemData) => {
  try {
    const docRef = await addDoc(inventoryCollection, {
      ...itemData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getInventoryItems = async (filters = {}) => {
  try {
    let q = query(inventoryCollection);
    
    if (filters.category) {
      q = query(q, where("category", "==", filters.category));
    }
    if (filters.status) {
      q = query(q, where("status", "==", filters.status));
    }
    
    q = query(q, orderBy("itemName", "asc"));
    
    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateInventoryItem = async (itemId, itemData) => {
  try {
    const docRef = doc(db, "inventory", itemId);
    await updateDoc(docRef, {
      ...itemData,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

