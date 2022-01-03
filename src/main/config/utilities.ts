import { endsWith } from '@/helpers/strings';
import { ContentfulHugoConfig, TypeConfig } from './types';

/**
 * Determine if a file is yaml or js depending on the file extension
 */
const determineFileType = (fileName: string): string | null => {
    const splitStr = fileName.split('.');
    const fileExtension = splitStr[splitStr.length - 1];
    switch (fileExtension) {
        case 'js':
            return 'javascript';
        case 'yaml':
        case 'yml':
            return 'yaml';
        default:
            return null;
    }
};

const isValidFileExtension = (extension: string | undefined): boolean => ['md', 'yaml', 'yml', 'json'].some((ext: string) =>
        endsWith(extension || 'md', ext)
    );

const isTypeConfig = (input: unknown): input is TypeConfig[] => {
    const mappedInput = input as TypeConfig[];
    if (!Array.isArray(mappedInput)) {
        return false;
    }
    for (const item of mappedInput) {
        if (typeof item.id !== 'string') {
            return false;
        }
        if (typeof item.directory !== 'string') {
            return false;
        }
    }
    return true;
};

const isContentfulHugoConfig = (
    input: unknown
): input is ContentfulHugoConfig => {
    const mappedInput = input as ContentfulHugoConfig;
    const { contentful, singleTypes, repeatableTypes } = mappedInput;
    if (!contentful) {
        return false;
    }
    if (
        typeof contentful.space !== 'string' ||
        typeof contentful.environment !== 'string' ||
        typeof contentful.token !== 'string'
    ) {
        return false;
    }
    if (!isTypeConfig(singleTypes)) {
        return false;
    }
    if (!isTypeConfig(repeatableTypes)) {
        return false;
    }
    return true;
};

export { determineFileType, isContentfulHugoConfig, isValidFileExtension };
