import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAllBlogs } from '@/lib/blog-data';

export async function GET() {
    try {
        const blogs = getAllBlogs();
        const outDir = path.join(process.cwd(), 'src/content/blog');

        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        const results = [];
        for (const blog of blogs) {
            const filePath = path.join(outDir, `${blog.slug}.json`);
            fs.writeFileSync(filePath, JSON.stringify(blog, null, 2));
            results.push(filePath);
        }

        return NextResponse.json({ success: true, count: blogs.length, results });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
