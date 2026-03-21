import pdfParse from 'pdf-parse';

export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

export function chunkText(text: string, maxTokens: number = 800): string[] {
    // Simple chunking by paragraphs or length
    const chunks: string[] = [];
    let currentChunk = '';
    const sentences = text.match(/[^.!?]+[.!?]+/g) || text.split('\n');

    for (const sentence of sentences) {
        // Basic approximation: 1 token ~ 4 characters
        if ((currentChunk.length + sentence.length) / 4 > maxTokens) {
            if (currentChunk.trim().length > 0) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = sentence;
        } else {
            currentChunk += ' ' + sentence;
        }
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}
