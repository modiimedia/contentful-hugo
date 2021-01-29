import fs from 'fs';
import { resolve as pathResolve } from 'path';

const deleteFile = (filePath: string, quietMode = false): Promise<null> => {
    return new Promise((resolve) => {
        if (!filePath) {
            return resolve(null);
        }
        const path = pathResolve(filePath);
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
            if (!quietMode) {
                console.log(`deleted ${path}`);
            }
        }
        return resolve(null);
    });
};

export default deleteFile;
