# HMS Feature Gap Analysis (vs. market-leading HMS)

This document maps standard Hospital Management Software modules to the current system, and outlines what remains to reach parity.

Legend: ✅ present | 🟡 partial | ❌ missing

## Core Operational Modules
- OPD Appointments & Scheduling: ✅ (appointments, calendar view)
- Patient Registration & Profile: ✅ (patients, auto-creation, unique IDs)
- EMR/EHR (Diagnoses, Treatments, Prescriptions): 🟡 (Medical Dashboard ✅, Prescriptions ✅; templates, vitals, allergies ❌)
- IPD / Bed & Ward Management: 🟡 (wards module ✅; admission/discharge workflows, bed transfer, nursing notes ❌)
- Discharge Summary & Approvals: 🟡 (new discharge module ✅; approvals + auto-billing ✅; richer templates ❌)
- Nursing Station / Duty Roster: ❌ (rosters, shift assignment, handover notes)
- Queue Management / Token System: ❌ (per-department tokens & display)
	- Update: Queue scaffold ✅ (tokens per department, call/serve/skip); Duty Roster scaffold ✅ (create/list). Handover notes/TV display ❌
- Telemedicine & Video Consults: ❌ (meeting scheduler, video room, consent & recording policy)
- Referrals (Internal/External): ❌

## Diagnostics
- Laboratory (LIS): 🟡 (lab orders & reports ✅; result validation, panels, ranges, attachments 🟡)
- Radiology (RIS/PACS): ❌ (orders, report templates, DICOM/PACS integration)

## Financials
- Billing & Payments: 🟡 (invoices, payments ✅; doctor visibility ✅; summary endpoint ✅; multi-tariff, package pricing, credit notes ❌)
- Insurance/TPA Claims: ❌ (policy capture, pre-auth, claim, E-claim export)
- Pharmacy (POS + Inventory): 🟡 (pharmacy pages ✅; drug master, expiry batches, stock audit ❌)
- Inventory & Procurement: 🟡 (inventory ✅; GRN/PO, vendor mgmt ❌)
- Price Lists & Contracts: ❌

## Administrative & Compliance
- Discharge Summary & Approvals: ❌ (discharge workflow, physician approval, summary PDF)
- Clinical Coding (ICD-10/11, CPT): 🟡 (diagnosis code text only; full controlled coding ❌)
- Audit Logs & RBAC: 🟡 (audit middleware ✅; module-wide coverage ❌)
- Notifications & Alerts: ✅ (notifications route & UI)
- Analytics & Dashboards: ✅ (analytics module; add KPIs ❌)
- Multilingual UI: ❌ (i18next integration)
- Data Export & Reports: ✅ (export route; expand reports ❌)
- Compliance: ❌ (NABH/NABL templates, HIPAA/GDPR policies)

## Patient Engagement
- Patient Portal / Mobile UX: 🟡 (web portal ✅; mobile/PWA enhancements ❌)
- Health Card / Membership: ❌
- Feedback/CRM & Campaigns: ❌
- Reminders (SMS/Email/WhatsApp): 🟡 (sms/email utils ✅; comprehensive templates ❌)

---

## Proposed Implementation Plan

### Phase 1 – Patient Care & Billing Completeness (2–3 weeks)
1) Prescriptions v2: multi-medicines, templates, vitals capture, allergies.
2) Discharge Summary workflow: admission→discharge, summary PDF, approvals; auto-discharge bill. (partially done)
3) Insurance/TPA basics: policy on patient, pre-auth ref, claim export; billing link.
4) Billing: price lists, GST, packages, credit/void; doctor/patient summaries in UI.

### Phase 2 – Diagnostics Expansion (2 weeks)
5) Radiology (RIS): orders, report templates; attach files; basic PACS link field.
6) Laboratory v2: panels, normal ranges, multi-approver validation, share link.

### Phase 3 – Operations (2 weeks)
7) Queue/Token System per department; TV view endpoint. (scaffold done)
8) Duty Roster for nursing/doctor; shift & handover notes. (scaffold done)
9) Bed mgmt enhancements: transfers, bed-type pricing, occupancy dashboard.

### Phase 4 – Engagement & Compliance (2 weeks)
10) Telemedicine (3rd-party SDK placeholder); appointment type=teleconsult.
11) Multilingual (i18next) with EN/HI; core pages.
12) Analytics KPIs (revenue by dept, ALOS, occupancy, conversion).
13) ICD-10/11 coding assistance; mapping table; simple picker.

---

## Quick Wins Already in Progress
- Prescriptions module with auto-billing ✅
- Medical Dashboard separated from Lab ✅
- Doctor-visible billing & summaries ✅

Request which phases to prioritize; I can start delivering PRs module-by-module.
