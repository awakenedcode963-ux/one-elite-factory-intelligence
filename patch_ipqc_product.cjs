const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

if (!code.includes('ProductQuickSelect')) {
  code = code.replace(/import \{ format \} from 'date-fns';/, "import { format } from 'date-fns';\nimport { ProductQuickSelect } from '../components/ProductQuickSelect';");

  const oldInput = `              <div className="sm:col-span-2">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.productCode')}</label>
                <input
                  list="products-list"
                  required
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder={t('shared.approved') === 'معتمد' ? 'ابحث بكود أو اسم الصنف...' : 'Search by code or name...'}
                  className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                />
                <datalist id="products-list">
                  {masterData.products
                    .filter(p => p.Process_Type === (activeTab === 'extrusion' ? 'Extrusion' : 'Injection'))
                    .map((p) => (
                      <option key={p.Product_Code} value={p.Product_Code}>{p.Product_Code} - {t('shared.approved') === 'معتمد' ? p.Product_Name_AR : p.Product_Name_EN}</option>
                  ))}
                </datalist>
              </div>`;

  const newSelect = `              <div className="sm:col-span-4">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t('ipqc.productCode')}</label>
                <ProductQuickSelect 
                  products={masterData.products} 
                  activeProcess={activeTab} 
                  selectedMachine={machine} 
                  value={productCode} 
                  onChange={setProductCode} 
                />
              </div>`;

  code = code.replace(oldInput, newSelect);
  fs.writeFileSync('src/pages/ModuleIPQC.tsx', code);
}
