import { resolve as pathResolve } from 'path';
import fs from 'fs-extra';
import { log } from '@/helpers/logger';

const deleteFile = async (
    filePath: string,
    quietMode = false
): Promise<null> => {
    if (!filePath) {
        return null;
    }
    const path = pathResolve(filePath);
    if (await fs.pathExists(path)) {
        await fs.unlink(path);
        if (!quietMode) {
            log(`[contentful hugo] deleted ${path}`);
        }
    }
    return null;
};

export default deleteFile;
