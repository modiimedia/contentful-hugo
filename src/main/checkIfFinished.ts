const checkIfFinished = (num: number, totalContentTypes: number): boolean => {
    if (num === totalContentTypes) {
        return true;
    }
    return false;
};

export default checkIfFinished;
