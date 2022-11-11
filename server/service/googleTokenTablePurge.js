
const {sequelize} = require('../models')
const {logger} = require('../config/logger')


async function googleTokenTablePurge()
{
    // Other than the latest 10 records, delete all the records in google_token table
    const queryResult = await sequelize.query(`DELETE FROM google_token
    WHERE token_chunk Not IN (SELECT token_chunk FROM google_token ORDER BY "updatedAt" DESC limit 10 )`);

    logger.info(`[googleTokenTablePurge] queryResult : ${JSON.stringify(queryResult)}`);
}

module.exports = {googleTokenTablePurge}