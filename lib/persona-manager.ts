import fs from 'fs'
import path from 'path'

export interface Persona {
  id: string
  name: string
  description: string
  systemPrompt: string
  temperature?: number
  maxTokens?: number
  model?: string
  personality?: {
    tone?: string
    style?: string
    formality?: string
  }
}

const PERSONAS_DIR = path.join(process.cwd(), 'personas')

export class PersonaManager {
  /**
   * Get all available personas
   */
  static getAllPersonas(): Persona[] {
    try {
      if (!fs.existsSync(PERSONAS_DIR)) {
        return []
      }

      const files = fs.readdirSync(PERSONAS_DIR)
      const personas: Persona[] = []

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(PERSONAS_DIR, file)
            const content = fs.readFileSync(filePath, 'utf-8')
            const persona = JSON.parse(content) as Persona
            personas.push(persona)
          } catch (error) {
            console.error(`Error reading persona file ${file}:`, error)
          }
        }
      }

      return personas
    } catch (error) {
      console.error('Error reading personas directory:', error)
      return []
    }
  }

  /**
   * Get a specific persona by ID
   */
  static getPersona(id: string): Persona | null {
    try {
      const filePath = path.join(PERSONAS_DIR, `${id}.json`)
      
      if (!fs.existsSync(filePath)) {
        return null
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content) as Persona
    } catch (error) {
      console.error(`Error reading persona ${id}:`, error)
      return null
    }
  }

  /**
   * Save or update a persona
   */
  static savePersona(persona: Persona): boolean {
    try {
      if (!fs.existsSync(PERSONAS_DIR)) {
        fs.mkdirSync(PERSONAS_DIR, { recursive: true })
      }

      const filePath = path.join(PERSONAS_DIR, `${persona.id}.json`)
      fs.writeFileSync(filePath, JSON.stringify(persona, null, 2), 'utf-8')
      return true
    } catch (error) {
      console.error(`Error saving persona ${persona.id}:`, error)
      return false
    }
  }

  /**
   * Delete a persona
   */
  static deletePersona(id: string): boolean {
    try {
      const filePath = path.join(PERSONAS_DIR, `${id}.json`)
      
      if (!fs.existsSync(filePath)) {
        return false
      }

      fs.unlinkSync(filePath)
      return true
    } catch (error) {
      console.error(`Error deleting persona ${id}:`, error)
      return false
    }
  }
}

