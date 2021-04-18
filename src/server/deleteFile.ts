import { pathExists, unlink } from 'fs-extra';
import { resolve as pathResolve } from 'path';

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
            console.log(`[contentful hugo] deleted ${path}`);
        }
    }
    return null;
};

export default deleteFile;
