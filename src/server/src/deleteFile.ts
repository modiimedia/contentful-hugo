import fs from 'fs';
import { resolve } from 'path';

const deleteFile = (filePath: string): null => {
    if (!filePath) {
        return null;
    }
    const path = resolve(filePath);
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
        console.log(`deleted ${path}`);
    }
    return null;
};

export default deleteFile;
