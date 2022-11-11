const {logger} = require('../config/logger');
const { loc_lookup } = require('../models');
const pgPool = require('../config/pgLibDBconfig');

/**
 * This function is a helper function to filter out job location strings that are not supposed to be in a database
 * ex ) Any job locations outside of the United States
 * Records in loc_lookup table that are corresponding to the input will be marked for deletion 
 * and then jobpostings in a jobposting table that hold this string will be removed.  
 * 
 * https://stackoverflow.com/questions/14611995/how-to-specify-an-array-of-objects-as-a-parameter-or-return-value-in-jsdoc
 * @param {Array.<String>} targetAddrArry The array of job location strings that should be marked for deletion
 * @returns 
 */
const applyStdAddressManual = async (targetAddrArry) => {
    try {

        logger.info(`[applyStdAddressManual] started!`);
    
        // How to run Async Await in Parallel 
        // https://programmingwithswift.com/run-async-await-in-parallel-with-javascript/

        let updateCount = 0;
        await Promise.all(targetAddrArry.map(async (address) => {
            await loc_lookup.markDelFlag_LocTb(address,logger)
            .then(async (rtn) => {
                logger.info(`[applyStdAddressManual]markDelFlag_LocTb success: '${address}' record marked for 'deletion flag'`);
                updateCount++;
            }).catch((error) => {}); //logger.error(`[applyStdAddress]markDelFlag_LocTb error : ${error}`)
        }));

        // Only there is any update record in loc_lookup table then update jobposting table accordingly
        if(updateCount > 0)
        {
            await loc_lookup.UpdateStdAddrColumn_JPTb(logger)
            .then(async (rtn) => {
                logger.info(`[applyStdAddressManual]UpdateStdAddrColumn_JPTb success: ${await rtn} Rows updated`);
            }).catch((error) => logger.error(`[applyStdAddressManual]UpdateStdAddrColumn_JPTb error : ${error}`));
    
            let softdeletedCount
            await loc_lookup.softDel_JPTb_ByFlag(logger)
            .then(async (rtn) => {
                logger.info(`[applyStdAddressManual]softDel_JPTb_ByFlag success: ${await rtn} Rows soft deleted`);
            }).catch((error) => logger.error(`[applyStdAddressManual]softDel_JPTb_ByFlag error : ${error}`));
            
            return Promise.resolve(`[applyStdAddressManual] success! loc_lookup table ${updateCount} Rows updated / jobposting table ${softdeletedCount}`);
        }else{
            throw Error(`updateCount is ${updateCount}`);
        }

    }
    catch (err) {
        logger.error(`[applyStdAddressManual] Error : ${err}`);
        return Promise.reject(`[applyStdAddressManual] Error : "${err}"`);
    }
}

/**
 * This function is a helper function to filter out job location strings that are not supposed to be in a database
 * ex ) Any job locations outside of the United States
 * 
 * Each record in loc_lookup table is exmined by Google Geocoding API to execute address verfication by country.
 * If there is any record that isn't specified 
 * it will be marked for deletion 
 * and then jobpostings in a jobposting table that hold this string will be removed. 
 * @param {String} GeoCodingAPI_KEY
 * @returns 
 */
const applyStdAddressAutomatic = async (APIKey) => {
    try{
        
        logger.info(`[applyStdAddressAutomatic] started!`);
        const lookupResult = await pgPool.query(`SELECT * FROM loc_lookup WHERE need_to_be_reviewed = true`);
        let updateCount = 0;
        let unprocessed_entries = [];
        if(lookupResult.rowCount > 0)
        {   
            await Promise.all(lookupResult.rows.map(async (element) => {
                
                let stdAddr = undefined;
                let need_to_be_reviewed = undefined;
                const geoQueryResult = await loc_lookup.geocodingQuery(element.job_location_str, APIKey, 'United States' ,logger)
                .then((rtn) => {
                    // Well processed by geocoding API
                    stdAddr = rtn;
                    need_to_be_reviewed = false;
                    updateCount++;
                })
                .catch((error)=>{
                    
                    if(error ==='deletion flag')
                    {
                        // `deletion flag` is returned as Promise.reject
                        stdAddr = error;
                        need_to_be_reviewed = false;
                        updateCount++;
                    }else{
                        stdAddr = element.job_location_str;
                        need_to_be_reviewed = true;
                        unprocessed_entries.push({ input : element.job_location_str, output : error });
                    }
                });
    
                updateResult = await pgPool.query(`UPDATE loc_lookup SET std_loc_str =  $$${stdAddr}$$, need_to_be_reviewed = ${need_to_be_reviewed}, "updatedAt" = NOW()  WHERE job_location_str = $$${element.job_location_str}$$`);
                // console.log(updateResult);
                logger.info(`[applyStdAddressAutomatic] loc_lookup update entry : stdAddr > ${stdAddr} / need_to_be_reviewed > ${need_to_be_reviewed}`);

            }));
            unprocessed_entries.map((eachEntry) => {

                logger.info(`[applyStdAddressAutomatic] not processed by geocoding : ${JSON.stringify(eachEntry)}`);
            })
         
        }else
        {
          throw Error(`There is no record to be reviewed in loc_lookup table`);
        }

        // Only there is any update record in loc_lookup table then update jobposting table accordingly
        if(updateCount > 0)
        {
            await loc_lookup.UpdateStdAddrColumn_JPTb(logger)
            .then(async (rtn) => {
                logger.info(`[applyStdAddressManual]UpdateStdAddrColumn_JPTb success: ${await rtn} Rows updated`);
            }).catch((error) => logger.error(`[applyStdAddressManual]UpdateStdAddrColumn_JPTb error : ${error}`));
    
            let softdeletedCount
            await loc_lookup.softDel_JPTb_ByFlag(logger)
            .then(async (rtn) => {
                logger.info(`[applyStdAddressManual]softDel_JPTb_ByFlag success: ${await rtn} Rows soft deleted`);
            }).catch((error) => logger.error(`[applyStdAddressManual]softDel_JPTb_ByFlag error : ${error}`));
            
            return Promise.resolve(`[applyStdAddressManual] success! loc_lookup table ${updateCount} Rows updated / jobposting table ${softdeletedCount}`);
        }else{
            return Promise.reject(`[applyStdAddressManual] Nothing done! updateCount is ${updateCount}`);
        }
   
    }catch (err) {
        logger.error(`[applyStdAddressAutomatic] Error : ${err}`);
        return Promise.reject(`[applyStdAddressAutomatic] Error : "${err}"`);
    }


}

module.exports = {
    applyStdAddressManual, applyStdAddressAutomatic
};
