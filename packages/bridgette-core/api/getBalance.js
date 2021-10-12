const { log } = require('@chippr-bots/common');

const getBalance = require('../controllers/getBalance');

module.exports = async function (req, res, next) {
    log.info('Method getBalance invoked!');
    log.debug(`getBalance request body`, req.body);
    try {
      const response = await getBalance(req.body);
      res.json(response.message);
    } catch (error) {
      next(error);
    }
  };