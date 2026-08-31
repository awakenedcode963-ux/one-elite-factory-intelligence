#!/bin/bash
# Remove firebase imports
for file in src/pages/*.tsx; do
  sed -i 's/import.*firebase\/firestore.*/ /g' "$file"
  sed -i 's/import { db } from '\''\.\.\/lib\/firebase'\'';/ /g' "$file"
done

# Fix IQC
sed -i "s/await submitInspection('IQC', \[record\]);/await submitInspection('IQC', record);/" src/pages/ModuleIQC.tsx

# Fix IPQC
# IPQC already passes newRecord, which is an object.
# But it has: await addDoc(collection(db, 'ipqc_inspections'), newRecord);
sed -i "/await addDoc(collection(db, 'ipqc_inspections'), newRecord);/d" src/pages/ModuleIPQC.tsx

# Fix FinalQC
sed -i "s/await submitInspection('Lab', \[record\]);/await submitInspection('Lab', record);/" src/pages/ModuleFinalQC.tsx
sed -i "/await addDoc(collection(db, 'lab_tests'), record);/d" src/pages/ModuleFinalQC.tsx

# Fix NCR
sed -i "s/await submitInspection('NCR', \[record\]);/await submitInspection('NCR', record);/" src/pages/ModuleNCR.tsx
sed -i "/await addDoc(collection(db, 'ncr_records'), record);/d" src/pages/ModuleNCR.tsx

# Fix Complaints
sed -i "/const rowDataArray = \[/,/\];/d" src/pages/ModuleComplaints.tsx
sed -i "s/await submitInspection('Complaints', rowDataArray);/await submitInspection('Complaints', newRecord);/" src/pages/ModuleComplaints.tsx
sed -i "/await addDoc(collection(db, 'customer_complaints'), newRecord);/d" src/pages/ModuleComplaints.tsx

# Fix Crusher
sed -i "/const rowDataArray = \[/,/\];/d" src/pages/ModuleCrusher.tsx
sed -i "s/await submitInspection('Crusher', rowDataArray);/await submitInspection('Crusher', newRecord);/" src/pages/ModuleCrusher.tsx
sed -i "/await addDoc(collection(db, 'crusher_logs'), newRecord);/d" src/pages/ModuleCrusher.tsx

# Fix Calibration
sed -i "s/await addDoc(collection(db, 'metrology_instruments'), newRecord);/await submitInspection('Calibration', newRecord);\n      setInstruments(prev => [newRecord, ...prev]);/" src/pages/ModuleCalibration.tsx

