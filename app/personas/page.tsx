import PersonaEditor from '@/components/PersonaEditor'
import Navigation from '@/components/Navigation'

export default function PersonasPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-6xl">
        <Navigation />
        <h1 className="text-4xl font-bold text-center mb-8">
          AI Persona Management
        </h1>
        <PersonaEditor />
      </div>
    </main>
  )
}

