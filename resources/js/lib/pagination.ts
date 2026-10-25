export function paginationDirection(label: string): 'previous' | 'next' | null {
    if (
        /^(?:pagination\.)?previous$/i.test(label.trim()) ||
        /&laquo;|\u00ab/i.test(label)
    ) {
        return 'previous';
    }

    if (
        /^(?:pagination\.)?next$/i.test(label.trim()) ||
        /&raquo;|\u00bb/i.test(label)
    ) {
        return 'next';
    }

    return null;
}
