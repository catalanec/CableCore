const fs = require('fs');

const tsContent = fs.readFileSync('src/lib/blog-data.ts', 'utf8');

const startStr = 'const MULTILANG_ARTICLES: MultiLangArticle[] = [';
const startIndex = tsContent.indexOf(startStr);

let brackets = 0;
let endIndex = startIndex + startStr.length - 1;
for (let i = endIndex; i < tsContent.length; i++) {
    if (tsContent[i] === '[') brackets++;
    if (tsContent[i] === ']') brackets--;
    if (brackets === 0) {
        endIndex = i;
        break;
    }
}

const replacement = `import blogData from './blog-data.json';

const MULTILANG_ARTICLES: MultiLangArticle[] = blogData as MultiLangArticle[];`;

const newTsContent = tsContent.substring(0, startIndex) + replacement + tsContent.substring(endIndex + 1);

fs.writeFileSync('src/lib/blog-data.ts', newTsContent);
console.log('Successfully updated src/lib/blog-data.ts');
