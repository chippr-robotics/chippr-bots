module.exports = (category) => {
    let filePath = `./models/${category}.json`;
    try {
        let rmodel = require(filePath);
        return rmodel;
    } catch (error) {
        let rmodel = defaultModel;
        return rmodel;
    }
};