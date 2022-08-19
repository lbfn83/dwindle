'use strict';
const {
  Model
} = require('sequelize');
const {loc_lookupRecordsRestoreFromCSV} = require('../util/DBRecordsRestoreFromCSV/loc_lookup_RestoreFromCSV');

const pgPool = require('../config/pgLibDBconfig')
require('dotenv').config();
const { GEOCODING_API_KEY } = process.env;

module.exports = (sequelize, DataTypes) => {
  class loc_lookup extends Model {
 
    static associate(models) {
      // define association here
    };


    /**
     * loc_lookup model classmethod : Seed the loc_lookup table
     * 
     *  Warning: Accessing non-existent property 'splice' of module exports inside circular dependency
     *  To prevent cir. dependency, pass itself as a second argument to loc_lookupRecordsRestoreFromCSV()
     *  
     */
    static async seed(logger)
    {
      try{
        await loc_lookupRecordsRestoreFromCSV('loc_lookup_20220816.csv', loc_lookup, logger);
      }catch(e)
      {
        logger.error(`[loc_lookup classmethod]seed database error : ${e}`);
      }
    }

    /**
     * loc_lookup model classmethod
     * 
     * Make queries regarding the geolocation to Google geocoding API
     * However, Google geocoding is not designed for address standardization
     * so the possiblity of API yielding the correct form of the answer is hit or miss
     * 
     * 
     * @param {String} strAddr address to be queried
     * @returns {Promise<String>} standardized address :  The concat of administrative_area_level_1 and country``
     *                                           ex) Maine, United States   
     */
    // TODO : one more argument is requried for Country
    static async geocodingQuery(strAddr, logger)
    {
      try{
        var axios = require('axios');
        require('dotenv').config();
        const queryResult = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
          params : {
            address : strAddr,
            key : process.env.GEOCODING_API_KEY
          }
        });
        logger.info(`[loc_lookup classmethod]geocodingQuery with ${strAddr} raw result: ${JSON.stringify(queryResult.data)}`);
        // queryResult.data.results[0].address_components;
        
        var country = undefined;
        var state = undefined;

        // result.data sturucture : {results: Array(0), status: 'ZERO_RESULTS'}
        if(queryResult.data.status === 'OK')
        {
          queryResult.data.results[0].address_components.map((elem) => {
              if(elem.types.includes('country'))
                country = elem.long_name;
              if(elem.types.includes('administrative_area_level_1'))
                state = elem.long_name;
          });
          logger.info(`[loc_lookup classmethod]geocodingQuery extracted result from '${strAddr}': country => '${country}' / state => '${state}'`);

        }
        // TODO : if country is undefined or not the country asked for, 
        // return 'deletion flag'
        if(country === undefined || state === undefined)
        {
          return Promise.reject(`[loc_lookup classmethod]geocodingQuery error`);
    
        }else{
          return Promise.resolve(`${state}, ${country}`);
        }
      }
      catch(e)
      {
        logger.error(`[loc_lookup classmethod]geocodingQuery error : ( arg, country, state)=> (${strAddr}, ${country}, ${state}) / err : ${e}`);
        return Promise.reject(`[loc_lookup classmethod]geocodingQuery error`);
      }
    }
    /**
     * 
     */
    static async jobpostingSoftDeleteByFlag(logger)
    {
      try{
        // update loc_lookup set std_loc_str = 'deletion flag' where job_location_str similar to '%India' 
        // select * from loc_lookup where need_to_be_reviewed = true order by std_loc_str asc
        let today = new Date();
        
        const softDeletionResult = await pgPool.query(`UPDATE jobposting SET "deletedAt" = '${today.toLocaleString()}' where  std_loc_str = 'deletion flag' and "deletedAt" is null`);
        logger.debug(`[loc_lookup classmethod]jobpostingSoftDeleteByFlag : Update result '${JSON.stringify(softDeletionResult)}' `);
        logger.info(`[loc_lookup classmethod]jobpostingSoftDeleteByFlag  '${softDeletionResult.rowCount}' Rows soft deleted`);
        return Promise.resolve(softDeletionResult.rowCount); 
      }catch(e)
      {
        logger.error(`[loc_lookup classmethod]jobpostingSoftDeleteByFlag error : ${e}`);
        return Promise.reject(`[loc_lookup classmethod]jobpostingSoftDeleteByFlag error : ${e}`);
      }
        
    }

    /**
     * This is preliminary function:
     * flag "job_location_str" record in a table with "deletion flag"
     * which later will soft-delete jobposting records with the exact job_location_str  
     * @param {String} job_location_str  
     * @param {logger} logger 
     */    
    static async examineLookupTable( job_location_str ,logger)
    {
      try{
        /** Part1 : This can be utilized in jobPostingFetcher logic */
        // const lookupResult = await pgPool.query(`SELECT * from loc_lookup where need_to_be_reviewed = $$true$$;`);
        // logger.info(`[loc_lookup classmethod]examineLookupTable rows with 'need_to_be_reviewed' true : ${JSON.stringify(lookupResult.rows)}`)
        // /** covertTOStdAddr를 일부.. 코멘트 처리해놓으면.. 강제로 에러를 발생시킬 수는 있겠지?*/
        // const stdAddrResults = await Promise.all(lookupResult.rows.map(async(element) => {
        //   let stdStr = undefined;
        //   await loc_lookup.convertToStdAddr(element.job_location_str, logger)
        //   .then(result => stdStr = result).catch(err => stdStr = err); 
        //   return stdStr;
        // }));

        // console.log(await stdAddrResults);

        /** Part2 : element.deletedAt = Date.now(); will this work? */
        let today = new Date();
        console.log(today.toLocaleString());
        const lookupResult = await pgPool.query(`select * from jobposting where std_loc_str = 'Ho Chi Minh City, Ho Chi Minh City, Vietnam'`);
        console.log(lookupResult);
        
         
        await pgPool.query(`update jobposting set "deletedAt" = '${today.toLocaleString()}' where  std_loc_str = 'Ho Chi Minh City, Ho Chi Minh City, Vietnam'`);
        // select * from jobposting where std_loc_str = 'Ho Chi Minh City, Ho Chi Minh City, Vietnam'
        // update jobposting set "deletedAt" = null where  std_loc_str = 'Ho Chi Minh City, Ho Chi Minh City, Vietnam'
        // Error msg : column "deletedAt" is of type timestamp with time zone but expression is of type bigint
        // Database purge에서 사용한  technique 이 필요할듯 
      }
      catch(e){
        logger.error(`[loc_lookup classmethod]examineLookupTable error : ${e}`);
        return Promise.reject(`[loc_lookup classmethod]examineLookupTable error`);
      }
    }
    /**
     * loc_lookup model classmethod
     * 
     * Standardize Address string ( especially fetched from Specrom ) 
     * by utilizing the loc_lookup table
     * 
     * @param {String} address single job_location string in jobposting table 
     * @param {logger} logger  winston logger / to prevent the circular dependency
     * @returns {Promise<String>} standardized address string. If failed, return Promise.reject
     */
    static async convertToStdAddr(address, logger)    
    {
      try{


        /**  SQL Commands below doens't work as expected!!
         * 
         * Input address regex filtering : only extract meaningful substring
         * @Column APIQueryRequired : refer to "The rest of strings" section
         * @Column parsed_str : 
         *            reg1 :  extracting substr from strings ending with Two letter state ABBR. ex) Fairfax, VA
         *            reg2 :  extracting full state name from the string ending with 'United States'
         *            The rest of strings : the whole string is passed over  
         * */ /*
        const regexAddr = await sequelize.query(`SELECT COALESCE(regexpResult.reg1, regexpResult.reg2, regexpResult.passAll) as parsed_str from 
            (
              SELECT 
              UNNEST(REGEXP_MATCHES('${address.trim()}', '(?<=(\S|\s)+, )[A-Z]{2}$')) as reg1, 
              UNNEST(REGEXP_MATCHES('${address.trim()}', '[\s|\S]+(?=, United States$)')) as reg2,
              UNNEST(REGEXP_MATCHES('${address.trim()}', '[\s|\S]+')) as passAll
            ) as regexpResult;`
        );*/
            
        var regexAddr = undefined;
        
        var regexPassedId = 0 // Which Regex is it passed?

        // Regex1 : Extracting Two letter state abbreviation ex) Fairfax, VA => VA
        const reg1 = /(?<=(\S|\s)+, )([A-Z]{2})$/;
        const reg1Result = address.match(reg1);
        
        // console.log(reg1Result);
        
        if(reg1Result !== null )
        {
          regexAddr = reg1Result[0];
          regexPassedId = 1;
        
        }else{
          // Regex2 : Extracting the state name from the string ending with 'United States'  ex) Georgia, United States
          const reg2 = /[\s|\S]+(?=, United States$)/;
          const reg2Result = address.match(reg2);
          
          // console.log(reg2Result);
          
          if(reg2Result !== null)
          {
            regexAddr = reg2Result[0];
            regexPassedId = 2;          
         
          }else{
            // Either of Regex cases don't work then just copy it
            // try out : wouldn't it be better to put united states at the end: like querying with 'Greater Jefferson City Area'
            // doesn't make no difference
            regexAddr = address;
          }
        }
   
        logger.info(`[loc_lookup classmethod]convertToStdAddr regex filtering : reg "${regexPassedId}" / ${address} => ${regexAddr}`)
        
        // const lookupResult = await sequelize.query(`SELECT * from loc_lookup where job_location_str = $$${regexAddr}$$;`);
        
        // Look up the table 
        // To prevent randomly occuring "SequelizeConnectionAcquireTimeoutError" pg lib is deployed, 
        // I personally find pg lib is more stable in case of connection pool managemen
        const lookupResult = await pgPool.query(`SELECT * from loc_lookup where job_location_str = $$${regexAddr}$$;`);
        logger.info(`[loc_lookup classmethod]convertToStdAddr Look up result with ${regexAddr} : ${JSON.stringify(lookupResult.rows)}`)

        // No hit in look up, then ask geocoding API and Insert the pair (regexAddr, APIresult)
        // If geocoding doens't give the correct answer, simply Insert (regexAddr, regexAddr) with 
        // "need_to_be_reviewed" column set true ( Should be corrected/updated manually )
       
        let stdAddr = undefined;
        let need_to_be_reviewed = undefined;
        // when there is no hit
        if(lookupResult.rowCount < 1)
        {
            if(GEOCODING_API_KEY !== undefined && GEOCODING_API_KEY !== '')
            {
              await loc_lookup.geocodingQuery(regexAddr, logger)
              .then((addrResult) => {
                stdAddr = addrResult;
                need_to_be_reviewed = false;
              })
              .catch((error) => {
                // In case of GEOCODING unable to provide the answer
                // just copy raw input to the processed output with "need to be reviewed flag on"
                stdAddr = regexAddr;
                need_to_be_reviewed = true;
                logger.error(`[loc_lookup classmethod]geocodingQuery error : ${error}`);
  
              });
            }else{
                // In case of API key not provided
                // just copy raw input to the processed output with "need to be reviewed flag on"
                stdAddr = regexAddr;
                need_to_be_reviewed = true;
            }

            await sequelize.query(`INSERT into loc_lookup(job_location_str, std_loc_str, need_to_be_reviewed, "createdAt", "updatedAt") 
                          VALUES ($$${regexAddr}$$, $$${stdAddr}$$, ${need_to_be_reviewed}, NOW(), NOW()) 
                          ON CONFLICT DO NOTHING;`);
        }
        else if(lookupResult.rowCount  === 1)
        {
          // A hit!
            stdAddr = lookupResult.rows[0].std_loc_str;
        }
        else{
          // TODO : I can prevent this by setting unique constraint in job_location_str column 
          // More than Two rows coming from queries. 
          throw Error("Duplicate rows in a loc_lookup table")
        }
        return Promise.resolve(await stdAddr);
      }
      catch(e){
        logger.error(`[loc_lookup classmethod]convertToStdAddr error : ${e}`);
        return Promise.reject(`deletion flag`);
      }
    }


   /**
    * Bulk update "std_loc_str" column in the jobposting table according to loc_lookup table.
    * @param {logger} logger
    */
    static async buildStdAddrColumn(logger)
    {
      try{

        // As of July 2022, jobpostings in USA are only valid.
        const allRowsfromJobposting = await sequelize.query(`SELECT * FROM jobposting ;`); //where jobposting.normalized_job_location = 'USA' 
        
        /* For Debugging purpose */
        // const allRowsfromJobposting = await sequelize.query(`SELECT * FROM jobposting where jobposting.normalized_job_location = 'USA' and jobposting.job_location similar to '(\\S)+, [A-Z]{2}\\M';`);
        // const allRowsfromJobposting = await sequelize.query(`SELECT * FROM jobposting where jobposting.normalized_job_location = 'USA' and jobposting.job_location similar to '%United States';`);
        // const allRowsfromJobposting = await sequelize.query(`SELECT * FROM jobposting where jobposting.normalized_job_location = 'USA' and jobposting.job_location not similar to '%United States' 
        // and jobposting.job_location not similar to '(\\S|\\s)+, [A-Z]{2}\\M' ;`);
        
        // In postgres, regex op. $ is not working with 'similar to'. 'similar to' only accepts partial regex syntax. should use \M instead

        logger.info(`[loc_lookup classmethod] buildStdAddrColumn : total jobpostings USA : ${allRowsfromJobposting[0].length}`);

        // When there are lots of rows? it doesn't work?
        let jobpostingsArryWithStdAddr = await Promise.all(allRowsfromJobposting[0].map(async(element, index) => {
          const standardizedAddr = await loc_lookup.convertToStdAddr(element.job_location, logger).catch((error)=> {
              logger.error(`[loc_lookup classmethod] : buildStdAddrColumn error during convertToStdAddr() : ${error}`);
          });
          // @Deprecated: This should be changed into Bulk update
          // The below gives out an error "Operation timeout\n    at ConnectionManager.getConnection"
          // when the table is big
          // await sequelize.query(`UPDATE jobposting SET std_loc_str = $$${standardizedAddr}$$ 
          //                       where jobposting.uuid = $$${element.uuid}$$;`);
      
          const result  = await pgPool.query(`UPDATE jobposting SET std_loc_str = $$${standardizedAddr}$$ where jobposting.uuid = $$${element.uuid}$$;`)
          
          logger.info(`[loc_lookup classmethod] buildStdAddrColumn : addr update to std_loc_str col : 
          stdaddr string => '${standardizedAddr}' / original str =>'${element.job_location}'`);
          // logger.info(`[loc_lookup classmethod] jobpostingsArry with std location : ${JSON.stringify(await jobpostingsArryWithStdAddr)}`);
          return standardizedAddr;

          /* cf) sequelize SQL update */  
          // https://sebhastian.com/sequelize-bulk-update/                    
          // await element.update({ std_loc_str : await loc_lookup.convertToStdAddr(element.job_location, logger);})
          // await element.save();
        }));

        logger.debug(`[loc_lookup classmethod] buildStdAddrColumn : jobpostingsArry with std location : ${JSON.stringify(await jobpostingsArryWithStdAddr)}`);

/*
        const jobpostingsArry = [];

        await allRowsfromJobposting[0].map(async(element) => {
            const standardizedAddr = await loc_lookup.convertToStdAddr(element.job_location, logger);
            // @Deprecated: This should be changed into Bulk update
            // The below gives out an error "Operation timeout\n    at ConnectionManager.getConnection"
            // when the table is big
            // await sequelize.query(`UPDATE jobposting SET std_loc_str = $$${standardizedAddr}$$ 
            //                       where jobposting.uuid = $$${element.uuid}$$;`);
            jobpostingsArry.push({
              ...element,
              std_loc_str : standardizedAddr});
            logger.info(`[loc_lookup classmethod] addr update to std_loc_str col : 
            stdaddr string => '${standardizedAddr}' / original str =>'${element.job_location}'`);
            // cf) sequelize SQL update   
            // https://sebhastian.com/sequelize-bulk-update/                    
            // await element.update({ std_loc_str : await loc_lookup.convertToStdAddr(element.job_location, logger);})
            // await element.save();
        });
        */
        //TODO: Implement delete records flagged with deletion flag
        await loc_lookup.jobpostingSoftDeleteByFlag(logger).then(async (rtn) => {
          logger.info(`[loc_lookup classmethod]buildStdAddrColumn jobpostingSoftDeleteByFlag success: ${rtn} Rows processed`);
        }).catch((error) => logger.error(`[loc_lookup classmethod]buildStdAddrColumn error : ${error}`));

      }catch(e)
      {
        logger.error(`[loc_lookup classmethod]buildStdAddrColumn error2 : ${e}`);
      }
            
    }
  }
  loc_lookup.init({
    job_location_str: {
      type: DataTypes.TEXT,
      primaryKey: true, 
      allowNull: false,
    },
    std_loc_str: {
      type: DataTypes.TEXT, 
      allowNull: false
    },
    need_to_be_reviewed : {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'loc_lookup',
  });
  return loc_lookup;
};