import React, { createContext, useContext, useMemo, useState } from 'react';

const resources = {
  en: {
    menu: {
      dashboard: 'Dashboard', patients: 'Patients', appointments: 'Appointments', calendar: 'Calendar View',
      medicalRecords: 'Medical Records', medicalDashboard: 'Medical Dashboard', prescriptions: 'Prescriptions',
      billing: 'Billing', pharmacy: 'Pharmacy', laboratory: 'Laboratory', queue: 'Queue', roster: 'Duty Roster',
      discharge: 'Discharge', wards: 'Wards & Beds', staff: 'Staff Management', inventory: 'Inventory',
      analytics: 'Analytics', alerts: 'Send Alerts', bulk: 'Bulk Operations', logs: 'Activity Logs', profile: 'My Profile'
    },
    common: { exportExcel: 'Export Excel', newBill: 'New Bill', myBills: 'My Bills' }
  },
  hi: {
    menu: {
      dashboard: 'डैशबोर्ड', patients: 'रोगी', appointments: 'अपॉइंटमेंट', calendar: 'कैलेंडर',
      medicalRecords: 'मेडिकल रिकॉर्ड', medicalDashboard: 'मेडिकल डैशबोर्ड', prescriptions: 'प्रिस्क्रिप्शन',
      billing: 'बिलिंग', pharmacy: 'फार्मेसी', laboratory: 'प्रयोगशाला', queue: 'क्यू', roster: 'ड्यूटी रोस्टर',
      discharge: 'डिस्चार्ज', wards: 'वार्ड्स व बेड्स', staff: 'स्टाफ प्रबंधन', inventory: 'इन्वेंटरी',
      analytics: 'एनालिटिक्स', alerts: 'अलर्ट भेजें', bulk: 'बल्क ऑपरेशन', logs: 'क्रियाकलाप लॉग', profile: 'मेरा प्रोफ़ाइल'
    },
    common: { exportExcel: 'एक्सेल निर्यात', newBill: 'नया बिल', myBills: 'मेरे बिल' }
  }
};

const I18nContext = createContext();
export const useI18n = () => useContext(I18nContext);

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const t = useMemo(() => {
    const r = resources[lang] || resources.en;
    const translate = (key, fallback) => {
      const parts = key.split('.');
      let obj = r;
      for (const p of parts) obj = obj?.[p];
      return (obj == null ? (fallback ?? key) : obj);
    };
    return translate;
  }, [lang]);

  const value = { lang, setLang, t };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
