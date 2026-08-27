const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf8');
content = content.replace(/export interface ProductMaster \{[\s\S]*?export interface MasterData \{[\s\S]*?\}/, "import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData } from '../types/qms';");
fs.writeFileSync('src/services/api.ts', content);
