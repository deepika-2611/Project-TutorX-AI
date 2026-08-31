export async function getKnowledgeStatus(db) {
  const result = await db.query(
    `select
       count(distinct d.id)::int as documents,
       count(c.id)::int as chunks,
       max(d.created_at) as "lastIngestedAt"
     from book_documents d
     left join book_chunks c on c.document_id = d.id`,
  )
  return result.rows[0]
}

export async function retrieveBookChunks(db, { question = '', topic = {} }) {
  const chapterNo = Number(topic.chapterNo)
  const query = `${question} ${topic.chapter ?? ''} ${topic.name ?? ''} ${topic.formula ?? ''}`
  const result = await db.query(
    `with ranked as (
       select
         id,
         chapter_no as "chapterNo",
         chapter_title as "chapterTitle",
         content,
         ts_rank_cd(search_vector, plainto_tsquery('english', $1)) as rank
       from book_chunks
       where ($2::int is null or chapter_no = $2::int)
     )
     select id, "chapterNo", "chapterTitle", content, rank
     from ranked
     order by rank desc, id asc
     limit 5`,
    [query, Number.isFinite(chapterNo) ? chapterNo : null],
  )

  const rows = result.rows
  if (rows.some((row) => Number(row.rank) > 0)) {
    return rows.filter((row) => Number(row.rank) > 0).slice(0, 4)
  }
  return rows.slice(0, 4)
}

export async function getChapterChunks(db, chapterNo) {
  const result = await db.query(
    `select
       id,
       chapter_no as "chapterNo",
       chapter_title as "chapterTitle",
       chunk_index as "chunkIndex",
       content
     from book_chunks
     where chapter_no = $1
     order by chunk_index asc
     limit 30`,
    [Number(chapterNo)],
  )
  return result.rows
}
