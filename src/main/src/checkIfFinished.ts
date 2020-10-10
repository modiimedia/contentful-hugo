const checkIfFinished = (num: number, totalContentTypes: number): boolean => {
    if (num === totalContentTypes) {
        return true;
    } else {
        return false;
    }
};

export default checkIfFinished;
