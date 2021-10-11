module.exports = async function (req, res, next) {
    logger.info('Method getBalance invoked!');
    logger.debug(`getBalance request body`, req.body);
    try {
      const response = await (req.body);
      const successResponse = new SuccessResponse(HTTP_STATUS_CODE.ACCEPTED, response);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };