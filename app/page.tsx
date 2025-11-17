import Chatbox from '@/components/Chatbox'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">
          ExplorAI - AI Clone
        </h1>
        <Chatbox />
      </div>
    </main>
  )
}

