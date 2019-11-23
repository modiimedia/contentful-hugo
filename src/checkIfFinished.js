const checkIfFinished = (num, totalContentTypes) => {
	if (num === totalContentTypes) {
		return true;
	} else {
		return false;
	}
};

module.exports = checkIfFinished;
