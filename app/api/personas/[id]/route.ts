import { NextRequest, NextResponse } from 'next/server'
import { PersonaManager } from '@/lib/persona-manager'

// GET a specific persona
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const persona = PersonaManager.getPersona(params.id)

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ persona })
  } catch (error) {
    console.error('Error fetching persona:', error)
    return NextResponse.json(
      { error: 'Failed to fetch persona' },
      { status: 500 }
    )
  }
}

