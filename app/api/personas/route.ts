import { NextRequest, NextResponse } from 'next/server'
import { PersonaManager, Persona } from '@/lib/persona-manager'

// GET all personas
export async function GET() {
  try {
    const personas = PersonaManager.getAllPersonas()
    return NextResponse.json({ personas })
  } catch (error) {
    console.error('Error fetching personas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    )
  }
}

// POST create or update a persona
export async function POST(request: NextRequest) {
  try {
    const persona: Persona = await request.json()

    if (!persona.id || !persona.name || !persona.systemPrompt) {
      return NextResponse.json(
        { error: 'Persona must have id, name, and systemPrompt' },
        { status: 400 }
      )
    }

    const success = PersonaManager.savePersona(persona)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save persona' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, persona })
  } catch (error) {
    console.error('Error saving persona:', error)
    return NextResponse.json(
      { error: 'Failed to save persona' },
      { status: 500 }
    )
  }
}

// DELETE a persona
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Persona ID is required' },
        { status: 400 }
      )
    }

    const success = PersonaManager.deletePersona(id)

    if (!success) {
      return NextResponse.json(
        { error: 'Persona not found or failed to delete' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting persona:', error)
    return NextResponse.json(
      { error: 'Failed to delete persona' },
      { status: 500 }
    )
  }
}

