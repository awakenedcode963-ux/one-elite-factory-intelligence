const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

const productsReplacement = `products: [
    { Product_Code: "1600200", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "HDPE Pipe 200mm", Product_Name_AR: "ماسورة بولي ايثيلين ٢٠٠ مم", Nominal_Dia_mm: 200, Std_Nominal_Weight_kg: 15.5, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1700200", Product_Family: "Fittings", Process_Type: "Injection", Product_Name_EN: "Elbow 90 deg 200mm", Product_Name_AR: "كوع ٩٠ درجة ٢٠٠ مم", Nominal_Dia_mm: 200, Std_Nominal_Weight_kg: 2.1, "Tolerance_Plus_%": 1.5, "Tolerance_Minus_%": 1.5 },
    { Product_Code: "1601020", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "PPR Pipe PN20 20mm", Product_Name_AR: "ماسورة PPR ضغط 20 قطر 20مم", Nominal_Dia_mm: 20, Std_Nominal_Weight_kg: 0.170, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1601025", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "PPR Pipe PN20 25mm", Product_Name_AR: "ماسورة PPR ضغط 20 قطر 25مم", Nominal_Dia_mm: 25, Std_Nominal_Weight_kg: 0.266, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1601032", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "PPR Pipe PN20 32mm", Product_Name_AR: "ماسورة PPR ضغط 20 قطر 32مم", Nominal_Dia_mm: 32, Std_Nominal_Weight_kg: 0.430, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1601040", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "PPR Pipe PN16 40mm", Product_Name_AR: "ماسورة PPR ضغط 16 قطر 40مم", Nominal_Dia_mm: 40, Std_Nominal_Weight_kg: 0.670, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1601050", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "PPR Pipe PN16 50mm", Product_Name_AR: "ماسورة PPR ضغط 16 قطر 50مم", Nominal_Dia_mm: 50, Std_Nominal_Weight_kg: 1.040, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1602110", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "UPVC Pipe Class 4 110mm", Product_Name_AR: "ماسورة UPVC فئة 4 قطر 110مم", Nominal_Dia_mm: 110, Std_Nominal_Weight_kg: 3.5, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1602160", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "UPVC Pipe Class 4 160mm", Product_Name_AR: "ماسورة UPVC فئة 4 قطر 160مم", Nominal_Dia_mm: 160, Std_Nominal_Weight_kg: 7.2, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1701020", Product_Family: "Fittings", Process_Type: "Injection", Product_Name_EN: "PPR Elbow 90 PN20 20mm", Product_Name_AR: "كوع 90 PPR ضغط 20 قطر 20مم", Nominal_Dia_mm: 20, Std_Nominal_Weight_kg: 0.025, "Tolerance_Plus_%": 1.5, "Tolerance_Minus_%": 1.5 },
    { Product_Code: "1701025", Product_Family: "Fittings", Process_Type: "Injection", Product_Name_EN: "PPR Socket PN20 25mm", Product_Name_AR: "جلبة PPR ضغط 20 قطر 25مم", Nominal_Dia_mm: 25, Std_Nominal_Weight_kg: 0.035, "Tolerance_Plus_%": 1.5, "Tolerance_Minus_%": 1.5 },
    { Product_Code: "1702110", Product_Family: "Fittings", Process_Type: "Injection", Product_Name_EN: "UPVC Tee Class 4 110mm", Product_Name_AR: "مشترك UPVC فئة 4 قطر 110مم", Nominal_Dia_mm: 110, Std_Nominal_Weight_kg: 0.8, "Tolerance_Plus_%": 1.5, "Tolerance_Minus_%": 1.5 },
  ],`;

code = code.replace(/products: \[\s*\{[\s\S]*?\},\s*\{\s*Product_Code: "1700200"[\s\S]*?\}\s*\],/, productsReplacement);

fs.writeFileSync('src/services/api.ts', code);
