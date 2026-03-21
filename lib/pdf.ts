import * as pdfParse from 'pdf-parse';

export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
    try {
        // Use the specialized Node.js entry point to avoid browser/canvas issues
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfModule = require('pdf-parse/node');
        const pdf = pdfModule.default || pdfModule;

        if (typeof pdf !== 'function') {
            console.error('[PDF] Required module is not a function:', typeof pdf);
            throw new Error('PDF parser initialization failed');
        }

        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

export function chunkText(text: string, chunkSize: number = 800, overlap: number = 100): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let start = 0;

    while (start < words.length) {
        const chunk = words.slice(start, start + chunkSize).join(' ');
        if (chunk.trim()) chunks.push(chunk.trim());
        start += chunkSize - overlap;
    }

    return chunks;
}
