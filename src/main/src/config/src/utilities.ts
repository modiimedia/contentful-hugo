import { ContentfulConfig } from './types';

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

const isContentfulConfig = (input: unknown): input is ContentfulConfig => {
    return (input as ContentfulConfig) !== undefined;
};

export { determineFileType, isContentfulConfig };
