const fs = require('fs');

let content = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

const regex = /\{activeTab === 'extrusion' \? \([\s\S]*?\) : \([\s\S]*?\)\}/m;
const replacement = `{activeTab === 'extrusion' ? (
                    <>
                      <option value="101">Line 101</option>
                      <option value="102">Line 102</option>
                      <option value="103">Line 103</option>
                      <option value="301">Line 301</option>
                      <option value="302">Line 302</option>
                      <option value="303">Line 303</option>
                      <option value="SOCKET">Socket Machine</option>
                    </>
                  ) : (
                    <>
                      {[201, 202, 203, 204, 205, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 501].map(num => (
                        <option key={num} value={num.toString()}>Injection {num}</option>
                      ))}
                    </>
                  )}`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/pages/ModuleIPQC.tsx', content);
