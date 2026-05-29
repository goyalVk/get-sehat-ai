import DiabetesBlog from './DiabetesBlog'

export const metadata = {
  title: 'Diabetes Kya Hoti Hai — Sugar Ki Bimari Ko Samjho | Sehat24',
  description: 'Diabetes kya hoti hai, symptoms, ghar ke nuskhe aur kya khayein — poori jankari simple Hinglish mein. Type 1, Type 2 aur sugar control ke tarike.',
  keywords: ['diabetes kya hoti hai', 'sugar ki bimari hindi', 'diabetes symptoms hindi', 'sugar control kaise kare', 'diabetes home remedies hindi'],
  openGraph: {
    title: 'Diabetes Kya Hoti Hai — Sugar Ki Bimari Ko Samjho',
    description: 'Diabetes kya hoti hai, symptoms, ghar ke nuskhe aur kya khayein — poori jankari simple Hinglish mein.',
    type: 'article',
    publishedTime: '2026-05-28',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diabetes Kya Hoti Hai — Sugar Ki Bimari Ko Samjho',
    description: 'Diabetes symptoms, ghar ke nuskhe, kya khayein — simple Hinglish mein.',
  },
}

export default function DiabetesPage() {
  return <DiabetesBlog />
}
