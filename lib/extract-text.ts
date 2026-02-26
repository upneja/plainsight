export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    const pdf = (await import('pdf-parse')).default
    const data = await pdf(buffer)
    if (!data.text || data.text.trim().length < 100) {
      throw new Error('PDF_UNREADABLE')
    }
    return data.text
  }

  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8')
  }

  throw new Error('UNSUPPORTED_FORMAT')
}
