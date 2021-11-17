let isQuietMode = false;
let isVerboseMode = false;

export enum LogCategories {
    default,
    verbose,
}

export enum LogTypes {
    log,
    info,
    warn,
}

export const log = (
    message: unknown,
    type: LogTypes = LogTypes.log,
    category: LogCategories = LogCategories.default
): void => {
    const emitLog = () => {
        switch (type) {
            case LogTypes.info:
                console.info(message);
                break;
            case LogTypes.warn:
                console.warn(message);
                break;
            default:
                console.log(message);
                break;
        }
    };

    if (isQuietMode) {
        return;
    }
    // this isn't being used right now. But it's here in case I want to add a --verbose flag for the logs
    if (category === LogCategories.verbose && !isVerboseMode) {
        return;
    }
    emitLog();
};

/**
 * Initialize the logger state. Should run at the beginning of the app.
 */
export const initLogger = (
    quietMode = false,
    verboseMode = false
): typeof log => {
    isQuietMode = quietMode;
    isVerboseMode = verboseMode;
    return log;
};
