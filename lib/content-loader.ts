import fs from "fs/promises"
import path from "path"

export async function loadJsonContent<T>(fileName: string): Promise<T> {
  const filePath = path.join(process.cwd(), "content", fileName)
  try {
    const fileContent = await fs.readFile(filePath, "utf-8")
    return JSON.parse(fileContent) as T
  } catch (error) {
    console.error(`Error loading content from ${fileName}:`, error)
    // Fallback or rethrow, depending on how critical the content is
    // For now, let's rethrow to make errors visible during development
    throw new Error(`Failed to load content from ${fileName}`)
  }
}
