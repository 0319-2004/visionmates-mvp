import './globals.css'
import AuthButton from '@/components/AuthButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VisionMates',
  description: 'ビジョンでつながる仲間募集プラットフォーム',
  metadataBase: new URL('https://visionmates-mvp.vercel.app'),
  openGraph: {
    title: 'VisionMates',
    description: 'ビジョンでつながる仲間募集プラットフォーム',
    url: 'https://visionmates-mvp.vercel.app',
    siteName: 'VisionMates',
  },
  verification: { google: 'mpFMiAiYax2z3yTDLYysHAgq-Z6aPhQCNeDxQ-83JZs' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="max-w-4xl mx-auto p-6">
          <header className="flex items-center justify-between mb-6">
            <a href="/" className="text-2xl font-bold">VisionMates</a>
            <AuthButton />
          </header>
          {children}
          <footer className="mt-16 text-xs text-white/50">
            <div>© {new Date().getFullYear()} VisionMates MVP</div>
          </footer>
        </div>
      </body>
    </html>
  )
}

