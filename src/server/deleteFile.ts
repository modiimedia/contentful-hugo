import { pathExists, unlink } from 'fs-extra';
import { resolve as pathResolve } from 'path';
import { log } from '@/helpers/logger';

const deleteFile = async (
    filePath: string,
    quietMode = false
): Promise<null> => {
    if (!filePath) {
        return null;
    }
    const path = pathResolve(filePath);
    if (await pathExists(path)) {
        await unlink(path);
        if (!quietMode) {
            log(`[contentful hugo] deleted ${path}`);
        }
    }
    return null;
};

export default deleteFile;
