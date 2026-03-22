import fs from 'fs';
import path from 'path';
import { getAllBlogs } from '../src/lib/blog-data';

const blogs = getAllBlogs();
const outDir = path.join(process.cwd(), 'src/content/blog');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

console.log(`Exporting ${blogs.length} articles to JSON...`);

blogs.forEach(blog => {
    const filePath = path.join(outDir, `${blog.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(blog, null, 2));
    console.log(`Created: ${filePath}`);
});

console.log('Migration complete!');
