import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const postsDir = path.join(process.cwd(), 'content/blog')

function parsePost(fileName) {
  const slug = fileName.replace(/\.md$/, '')
  const fullPath = path.join(postsDir, fileName)
  const raw = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(raw)
  const stats = readingTime(content)

  return {
    slug,
    title:       data.title       || '',
    description: data.description || '',
    date:        data.date        || '',
    keywords:    data.keywords    || [],
    readingTime: data.readingTime || stats.text,
    category:    data.category    || 'health',
    content,
  }
}

export function getAllPosts() {
  if (!fs.existsSync(postsDir)) return []
  return fs
    .readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .map(parsePost)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getPostBySlug(slug) {
  return parsePost(`${slug}.md`)
}
