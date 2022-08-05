'use strict';
const {
  Model
} = require('sequelize');
const {loc_lookupRecordsRestoreFromCSV} = require('../util/DBRecordsRestoreFromCSV/loc_lookup_RestoreFromCSV');


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
    static async seed()
    {
      try{
        await loc_lookupRecordsRestoreFromCSV('loc_lookup.csv', loc_lookup);
      }catch(e)
      {
        console.log(`[loc_lookup classmethod]seed database error : ${e}`);
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
        
        // Look up the table 
        const lookupResult = await sequelize.query(`SELECT * from loc_lookup where job_location_str = $$${regexAddr}$$;`);
        logger.info(`[loc_lookup classmethod]convertToStdAddr Look up result with ${regexAddr} : ${JSON.stringify(lookupResult[0][0])}`)

        // No hit in look up, then ask geocoding API and Insert the pair (regexAddr, APIresult)
        // If geocoding doens't give the correct answer, simply Insert (regexAddr, regexAddr) with 
        // "need_to_be_reviewed" column set true ( Should be corrected/updated manually )
       
        let stdAddr = undefined;
        if(lookupResult[0][0] === undefined)
        {
            let need_to_be_reviewed = false;

            await loc_lookup.geocodingQuery(regexAddr, logger)
            .then((addrResult) => {
              stdAddr = addrResult;
            })
            .catch((error) => {
              stdAddr = regexAddr;
              need_to_be_reviewed = true;
            });
            
            await sequelize.query(`INSERT into loc_lookup(job_location_str, std_loc_str, need_to_be_reviewed, "createdAt", "updatedAt") 
                          VALUES ($$${regexAddr}$$, $$${stdAddr}$$, ${need_to_be_reviewed}, NOW(), NOW()) 
                          ON CONFLICT DO NOTHING;`);
        }else{
            // A hit!
            stdAddr = lookupResult[0][0].std_loc_str;
        }
    
        return Promise.resolve(await stdAddr);
      }
      catch(e){
        logger.error(`[loc_lookup classmethod]convertToStdAddr error : ${e}`);
        return Promise.reject(`[loc_lookup classmethod]convertToStdAddr error`);
      }
    }


   /**
    * Initialize "std_loc_str" column in the jobposting table.
    * 
    * This function is for one time use when first set up Address standardization feature
    * or after being done any change in loc_lookup table.
    * 
    */
    static async buildStdAddrColumn(logger)
    {
      try{

        // As of July 2022, jobpostings in USA are only valid.
        const allRowsfromJobposting = await sequelize.query(`SELECT * FROM jobposting where jobposting.normalized_job_location = 'USA' ;`);
        
        /* For Debugging purpose */
        // const allRowsfromJobposting = await sequelize.query(`SELECT * FROM jobposting where jobposting.normalized_job_location = 'USA' and jobposting.job_location similar to '(\\S)+, [A-Z]{2}\\M';`);
        // const allRowsfromJobposting = await sequelize.query(`SELECT * FROM jobposting where jobposting.normalized_job_location = 'USA' and jobposting.job_location similar to '%United States';`);
        // const allRowsfromJobposting = await sequelize.query(`SELECT * FROM jobposting where jobposting.normalized_job_location = 'USA' and jobposting.job_location not similar to '%United States' 
        // and jobposting.job_location not similar to '(\\S|\\s)+, [A-Z]{2}\\M' ;`);
        
        // In postgres, regex op. $ is not working with 'similar to'. 'similar to' only accepts partial regex syntax. should use \M instead

        logger.info(`[loc_lookup classmethod] total jobpostings USA : ${allRowsfromJobposting[0].length}`);

        allRowsfromJobposting[0].forEach(async(element) => {
          const standardizedAddr = await loc_lookup.convertToStdAddr(element.job_location, logger);
          await sequelize.query(`UPDATE jobposting SET std_loc_str = $$${standardizedAddr}$$ 
                                where jobposting.uuid = $$${element.uuid}$$;`);
          
          logger.info(`[loc_lookup classmethod] addr update to std_loc_str col : 
          stdaddr string => '${standardizedAddr}' / original str =>'${element.job_location}'`);

          /* cf) sequelize SQL update */                      
          // await element.update({ std_loc_str : await loc_lookup.convertToStdAddr(element.job_location, logger);})
          // await element.save();
        });

      }catch(e)
      {
        logger.error(`[loc_lookup classmethod]buildStdAddrColumn error : ${e}`);
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