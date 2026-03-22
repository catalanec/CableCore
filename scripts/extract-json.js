const fs = require('fs');

const tsContent = fs.readFileSync('src/lib/blog-data.ts', 'utf8');

// Find the start of the MULTILANG_ARTICLES array
const startStr = 'const MULTILANG_ARTICLES: MultiLangArticle[] = [';
const startIndex = tsContent.indexOf(startStr) + startStr.length - 1;

// Find the end by balancing brackets
let brackets = 0;
let endIndex = startIndex;
for (let i = startIndex; i < tsContent.length; i++) {
    if (tsContent[i] === '[') brackets++;
    if (tsContent[i] === ']') brackets--;
    if (brackets === 0) {
        endIndex = i;
        break;
    }
}

const arrayStr = tsContent.substring(startIndex, endIndex + 1);

// We need to valid eval this to get the object, so we wrap it
// The array might have unquoted keys, single quotes, etc., which JSON doesn't support.
// Eval will parse it into a real JS object!
const data = eval('(' + arrayStr + ')');

fs.writeFileSync('src/lib/blog-data.json', JSON.stringify(data, null, 2));
console.log('Successfully wrote ' + data.length + ' articles to src/lib/blog-data.json');
