export type ChunkWithPage = {
  chunk: string;
  pageNumber: number;
};

export type ExtractedPage = {
  text: string;
  pageNumber: number;
};

// export function chunkText(
//   text: string,
//   chunkSize = 800,
//   overlap = 200
// ): string[] {
//   const chunks: string[] = [];
//   let start = 0;

//   while (start < text.length) {
//     const end = Math.min(start + chunkSize, text.length);
//     chunks.push(text.slice(start, end));
//     start += chunkSize - overlap;
//   }

//   return chunks;
// }

export function chunkPages(
  pages: ExtractedPage[],
  chunkSize = 800,
  overlap = 200
): ChunkWithPage[] {

  const chunks: ChunkWithPage[] = [];

  for (const page of pages) {

    let start = 0;

    while (start < page.text.length) {

      const end = Math.min(
        start + chunkSize,
        page.text.length
      );

      chunks.push({
        chunk: page.text.slice(start, end),
        pageNumber: page.pageNumber,
      });

      start += chunkSize - overlap;
    }
  }

  return chunks;
}
