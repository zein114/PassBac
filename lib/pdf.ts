export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
    try {
        console.log('[PDF] Extracting text using pdfjs-dist (dynamic legacy import)...');

        // Polyfill browser globals for pdfjs-dist in Node environment BEFORE importing
        if (typeof (global as any).DOMMatrix === 'undefined') (global as any).DOMMatrix = class { };
        if (typeof (global as any).ImageData === 'undefined') (global as any).ImageData = class { };
        if (typeof (global as any).Path2D === 'undefined') (global as any).Path2D = class { };

        // Dynamic import the legacy build to ensure polyfills are in place first
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

        const data = new Uint8Array(buffer);
        const loadingTask = pdfjs.getDocument({
            data,
            disableWorker: true, // Force main-thread parsing in Node environment
            useWorkerFetch: false,
            isEvalSupported: false,
            disableRange: true,
            disableStream: true
        });

        const pdf = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .map((item: any) => item.str)
                .join(" ");
            fullText += pageText + "\n";
        }

        console.log(`[PDF] Extracted ${fullText.length} characters from ${pdf.numPages} pages.`);
        return fullText;
    } catch (error) {
        console.error('Error parsing PDF with pdfjs-dist:', error);
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
