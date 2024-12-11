export const parseField = <T>(field: T | { [x: string]: T }): T => {
    if (
        typeof field === 'object' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((field as any)?.['en-US'] || (field as any)?.['en-us'])
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ((field as any)?.['en-US'] ?? (field as any)?.['en-us']) as T;
    }
    return field as T;
};
