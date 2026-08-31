import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { chunkTextByChapter } from './chunking.js'

const require = createRequire(import.meta.url)
const { PDFParse } = require('pdf-parse')

export async function ingestPdfKnowledgeBase(db, filePath) {
  const resolvedPath = path.resolve(filePath)
  if (!fs.existsSync(resolvedPath)) {
    const error = new Error(`PDF not found: ${resolvedPath}`)
    error.statusCode = 404
    throw error
  }

  const dataBuffer = fs.readFileSync(resolvedPath)
  const parser = new PDFParse({ data: dataBuffer })
  const parsed = await parser.getText()
  await parser.destroy?.()
  const chunks = chunkTextByChapter(parsed.text)

  if (!chunks.length) {
    const error = new Error('No extractable textbook text found in the PDF')
    error.statusCode = 422
    throw error
  }

  const client = await db.connect()
  try {
    await client.query('begin')
    await client.query('delete from book_documents where source_path = $1', [resolvedPath])
    const documentResult = await client.query(
      `insert into book_documents (title, source_path, total_pages)
       values ($1, $2, $3)
       returning id, title, total_pages as "totalPages"`,
      [path.basename(resolvedPath), resolvedPath, parsed.total ?? parsed.numpages ?? null],
    )
    const document = documentResult.rows[0]

    const batchSize = 80
    for (let start = 0; start < chunks.length; start += batchSize) {
      const batch = chunks.slice(start, start + batchSize)
      const values = []
      const placeholders = batch.map((chunk, index) => {
        const base = index * 5
        values.push(document.id, chunk.chapterNo, chunk.chapterTitle, chunk.chunkIndex, chunk.content)
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`
      })

      await client.query(
        `insert into book_chunks (document_id, chapter_no, chapter_title, chunk_index, content)
         values ${placeholders.join(', ')}`,
        values,
      )
    }

    await client.query('commit')
    return {
      document,
      chunks: chunks.length,
      sourcePath: resolvedPath,
    }
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}
