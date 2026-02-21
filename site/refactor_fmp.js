const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/actions/fmp.ts');
let content = fs.readFileSync(filePath, 'utf8');

// We want to replace:
// if (!res.ok) throw new Error("Failed to fetch X");
// with:
// if (!res.ok) {
//   if (res.status === 401 || res.status === 403) {
//     console.warn("FMP API key invalid/unauthorized for X. Using mock data.");
//     return mockData; // or getMockX()
//   }
//   throw new Error("Failed to fetch X");
// }

// We can find the return value from the catch block.
// The structure is:
// if (!res.ok) throw new Error("Failed to fetch X");
// ... some code ...
// } catch (error) {
//   console.error("Error fetching X:", error);
//   return Y;
// }

const regex = /if \(!res\.ok\) throw new Error\(([`"'])(Failed to fetch.*?)\1\);([\s\S]*?)catch \((.*?)\) \{\s*console\.error\(([`"']).*?\5,\s*.*?\);\s*return (.*?);\s*\}/g;

content = content.replace(regex, (match, q1, errorMsg, middleCode, errVar, q2, returnExpr) => {
  const replacement = `if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        console.warn(\`FMP API key invalid/unauthorized. Using mock data for: ${errorMsg}\`);
        return ${returnExpr};
      }
      throw new Error(${q1}${errorMsg}${q1});
    }${middleCode}catch (${errVar}) {
    console.error(${q2}Error fetching ${errorMsg.replace('Failed to fetch ', '')}:${q2}, ${errVar});
    return ${returnExpr};
  }`;
  return replacement;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log("Refactored fmp.ts successfully.");
