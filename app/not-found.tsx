
import Link from 'next/link'
import Button from '@/components/ui/Button'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Not Found</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Could not find requested resource</p>
      <Link href="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  )
}
