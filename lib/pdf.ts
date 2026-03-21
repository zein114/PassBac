import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
    try {
        console.log('[DEBUG-PDF] Starting extraction with basic pdf-parse...');

        // Use a standard require to avoid Next.js ESM dynamic import bugs
        const pdfParse = require('pdf-parse');

        // pdf-parse sometimes exports differently depending on the bundler
        // It might be the function itself, or it might have a .default property
        let extractedText = '';

        if (pdfParse.PDFParse) {
            console.log('[DEBUG-PDF] Detected PDFParse class structure, instantiating...');
            const parser = new pdfParse.PDFParse({ data: buffer });
            const result = await parser.getText();
            extractedText = result.text || '';
        } else {
            console.log('[DEBUG-PDF] Detected standard pdf-parse function...');
            const parseFunc = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;

            if (!parseFunc || typeof parseFunc !== 'function') {
                throw new Error("Could not resolve a valid parsing function/class from pdf-parse");
            }

            const data = await parseFunc(buffer);
            extractedText = data?.text || '';
        }

        console.log(`[DEBUG-PDF] SUCCESS: Extracted ${extractedText.length} characters.`);

        if (extractedText.trim().length === 0) {
            console.warn('[DEBUG-PDF] WARNING: Extracted text is empty. PDF might be scanned or empty.');
        }

        return extractedText;

    } catch (error: any) {
        console.error('[DEBUG-PDF] ERROR during extraction:', error.message);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}

export function chunkText(text: string, chunkSize: number = 800, overlap: number = 100): string[] {
    if (!text || text.trim().length === 0) return [];

    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let start = 0;

    while (start < words.length) {
        const chunk = words.slice(start, start + chunkSize).join(' ');
        const trimmedChunk = chunk.trim();

        // Only add if chunk has meaningful content
        if (trimmedChunk.length > 10) {
            chunks.push(trimmedChunk);
        }

        start += chunkSize - overlap;
    }

    console.log(`[DEBUG-CHUNK] Created ${chunks.length} chunks from ${words.length} words.`);
    return chunks;
}
