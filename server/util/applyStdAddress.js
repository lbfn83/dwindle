const {logger} = require('../config/logger');
const { loc_lookup } = require('../models');

/**
 * This function is a helper function to filter out job location strings that are not supposed to be in a database
 * ex ) Any job locations outside of the United States
 * Records in loc_lookup table that fall under this criteria will be marked for deletion 
 * and then jobpostings in a jobposting table that hold this string will be removed.  
 * 
 * https://stackoverflow.com/questions/14611995/how-to-specify-an-array-of-objects-as-a-parameter-or-return-value-in-jsdoc
 * @param {Array.<String>} targetAddrArry The array of job location strings that should be marked for deletion
 * @returns 
 */
const applyStdAddress = async (targetAddrArry) => {
    try {

        logger.info(`[applyStdAddress] started!`);
    
        // How to run Async Await in Parallel 
        // https://programmingwithswift.com/run-async-await-in-parallel-with-javascript/

        let updateCount = 0;
        await Promise.all(targetAddrArry.map(async (address) => {
            await loc_lookup.markDelFlag_LocTb(address,logger)
            .then(async (rtn) => {
                logger.info(`[applyStdAddress]markDelFlag_LocTb success: '${address}' record marked for 'deletion flag'`);
                updateCount++;
            }).catch((error) => {}); //logger.error(`[applyStdAddress]markDelFlag_LocTb error : ${error}`)
        }));

        // Only there is any update record in loc_lookup table then update jobposting table accordingly
        if(updateCount > 0)
        {
            await loc_lookup.UpdateStdAddrColumn_JPTb(logger)
            .then(async (rtn) => {
                logger.info(`[applyStdAddress]UpdateStdAddrColumn_JPTb success: ${rtn} Rows marked for deletion`);
            }).catch((error) => logger.error(`[applyStdAddress]UpdateStdAddrColumn_JPTb error : ${error}`));
    
            let softdeletedCount
            await loc_lookup.softDel_JPTb_ByFlag(logger)
            .then(async (rtn) => {
                logger.info(`[applyStdAddress]softDel_JPTb_ByFlag success: ${rtn} Rows soft deleted`);
            }).catch((error) => logger.error(`[applyStdAddress]softDel_JPTb_ByFlag error : ${error}`));
            
            return Promise.resolve(`[applyStdAddress] success! loc_lookup table ${updateCount} Rows updated / jobposting table ${softdeletedCount}`);
        }else{
            throw Error(`updateCount is ${updateCount}`);
        }

    }
    catch (err) {
        logger.error(`[applyStdAddress] Error : ${err}`);
        return Promise.reject(`[applyStdAddress] Error : "${err}"`);
    }
}

module.exports = {
    applyStdAddress
};
