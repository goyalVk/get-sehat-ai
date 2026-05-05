import { getAllPosts } from '@/lib/blog'

export default async function sitemap() {
  const baseUrl = 'https://www.sehat24.com'
  const now     = new Date()

  const blogPosts = getAllPosts().map(post => ({
    url:             `${baseUrl}/blog/${post.slug}`,
    lastModified:    post.date ? new Date(post.date) : now,
    changeFrequency: 'monthly',
    priority:        0.7,
  }))

  const staticPages = [
    {
      url:             `${baseUrl}/blog`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.8,
    },
    {
      url:             baseUrl,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        1.0,
    },
    {
      url:             `${baseUrl}/upload`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.9,
    },
    {
      url:             `${baseUrl}/chat`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.8,
    },
    {
      url:             `${baseUrl}/auth/login`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.5,
    },
    {
      url:             `${baseUrl}/privacy`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.3,
    },
    {
      url:             `${baseUrl}/terms`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.3,
    },
  ]

  return [...staticPages, ...blogPosts]
}