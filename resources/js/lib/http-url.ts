export function httpUrl(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim() !== value) {
        return null;
    }

    try {
        const url = new URL(value);

        return ['http:', 'https:'].includes(url.protocol) && url.hostname
            ? url.href
            : null;
    } catch {
        return null;
    }
}
