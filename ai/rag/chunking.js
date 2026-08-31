export const chapterMatchers = [
  { chapterNo: 1, title: 'Relations and Functions', patterns: ['relations and functions', 'relation', 'function'] },
  { chapterNo: 2, title: 'Numbers and Sequences', patterns: ['numbers and sequences', 'sequence', 'arithmetic progression'] },
  { chapterNo: 3, title: 'Algebra', patterns: ['algebra', 'quadratic', 'polynomial'] },
  { chapterNo: 4, title: 'Geometry', patterns: ['geometry', 'circle', 'similar triangles'] },
  { chapterNo: 5, title: 'Coordinate Geometry', patterns: ['coordinate geometry', 'distance formula', 'section formula'] },
  { chapterNo: 6, title: 'Trigonometry', patterns: ['trigonometry', 'heights and distances', 'trigonometric'] },
  { chapterNo: 7, title: 'Mensuration', patterns: ['mensuration', 'surface area', 'volume'] },
  { chapterNo: 8, title: 'Statistics and Probability', patterns: ['statistics and probability', 'statistics', 'probability'] },
]

export function normalizeText(text) {
  return text
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function findChapterForText(text, fallback) {
  const lowered = text.toLowerCase()
  return (
    chapterMatchers.find((chapter) => chapter.patterns.some((pattern) => lowered.includes(pattern))) ??
    fallback ??
    chapterMatchers[0]
  )
}

export function chunkTextByChapter(text, chunkSize = 1400, overlap = 180) {
  const firstChapterStart = text.search(/\n\s*1\s+Relations and Functions\s+Learning Outcomes/i)
  const textbookText = firstChapterStart > -1 ? text.slice(firstChapterStart) : text
  const paragraphs = normalizeText(textbookText)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 40)

  const chunks = []
  let currentChapter = chapterMatchers[0]
  let buffer = ''

  function flush() {
    const cleaned = buffer.trim()
    if (!cleaned) return

    let start = 0
    while (start < cleaned.length) {
      const content = cleaned.slice(start, start + chunkSize).trim()
      if (content.length > 80) {
        chunks.push({
          chapterNo: currentChapter.chapterNo,
          chapterTitle: currentChapter.title,
          content,
        })
      }
      start += chunkSize - overlap
    }
    buffer = ''
  }

  for (const paragraph of paragraphs) {
    const detectedChapter = findChapterForText(paragraph, currentChapter)
    if (detectedChapter.chapterNo !== currentChapter.chapterNo && paragraph.length < 600) {
      flush()
      currentChapter = detectedChapter
    }

    buffer = `${buffer}\n\n${paragraph}`.trim()
    if (buffer.length >= chunkSize * 2) flush()
  }

  flush()
  return chunks.map((chunk, index) => ({ ...chunk, chunkIndex: index }))
}
