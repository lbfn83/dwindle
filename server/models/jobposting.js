'use strict';

const {
  Model
} = require('sequelize');
const {jobpostingTable_RestoreFromCSV} = require('../util/DBRecordsRestoreFromCSV/jobpostingTable_RestoreFromCSV');
const pgPool = require('../config/pgLibDBconfig')
// const company = require('./company');
module.exports = (sequelize, DataTypes) => {
  // console.log("sequelize" ,sequelize)
  // console.log("company", company)
  class jobposting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({company}) {
      // define association here
      this.belongsTo(company, {

         targetKey : "company_name",
         foreignKey : "company_name",
        //  as : 'Asjobposting'
      })
    }
    
    /**
     * jobposting model classmethod : Seed the jobposting table
     * 
     *  Warning: Accessing non-existent property 'splice' of module exports inside circular dependency
     *  To prevent cir. dependency, pass itself as a second argument to jobpostingTable_RestoreFromCSV()
     *  
     */
     static async seed(logger)
     {
       try{
         await jobpostingTable_RestoreFromCSV('jobposting table_20220728.csv', jobposting, logger);
       }catch(e)
       {
         logger.error(`[jobposting classmethod]seed database error : ${e}`);
       }
     }
 


    // https://sebhastian.com/sequelize-class-methods/
    static getSearchVector() {
      return 'jobpostingToken';  
    }
    // Old comment : I would prefer run this function in my local computer, since it is only required to run only once
    // but of course it can be automated by gettintg the full list of columns and check it is crated or not
    // New comment : As 'IF NOT EXISTS' is stated, it would be okay to run this every time server is restarted.
    // Due to the circular dependency issue, logger should be passed over as an argument
    static async addFullTextIndex(logger){
      try{

        if(sequelize.options.dialect !== 'postgres') {
          logger.error('[jobposting classmethods] addFullTextIndex : Not creating search index, must be using POSTGRES to do this');
          return;
        }
        var jobposting = this;
        var vectorName = jobposting.getSearchVector();


        /********************************** */
        /* Nullify things done in the table */
        // Drop column
        // const dropColumnReuslt = await sequelize.query(`ALTER TABLE  "${jobposting.tableName}" DROP COLUMN IF EXISTS "${vectorName}" ;`);
        // logger.info(`[jobposting classmethods] addFullTextIndex : drop column "${JSON.stringify(await dropColumnReuslt)}"`);
        
        // const dropIndexResult = await sequelize.query(`DROP INDEX IF EXISTS jobposting_search_idx;`)
        // logger.info(`[jobposting classmethods] addFullTextIndex : drop index "${JSON.stringify(await dropIndexResult)}"`);


        // const dropTrigResult= await sequelize.query(`DROP TRIGGER IF EXISTS "jobposting_vector_update" ON "${jobposting.tableName}" CASCADE;`)
        // logger.info(`[jobposting classmethods] addFullTextIndex : drop trigger "${JSON.stringify(await dropTrigResult)}"`);

        /*********************************** */
        
        /* Creating TSVector column, obsolete version*/        
        // var searchFields = ['company_name', 'normalized_company_name','job_location::text', 'full_text', 'job_title'];// 'coalesce(normalized_job_location::text)' ,
        // // https://kb.objectrocket.com/postgresql/how-to-perform-the-postgres-add-column-if-not-exists-1266
        // const addColumnResult = await sequelize.query(`ALTER TABLE "${jobposting.tableName}" ADD COLUMN IF NOT EXISTS "${vectorName}" TSVECTOR;`);
        // logger.info(`[jobposting classmethods] addFullTextIndex : add column "${JSON.stringify(await addColumnResult)}"`);

        // // coalesce is required to handle null as '' in case of unexpected NULL passed over as an input
        // // to_tsvector : when joining multiple columns make sure put ' ' in the middle, or otherwise each string from different columns will be chained and as a result, tokenized in an unexpected way
        // const coalesceFields = searchFields.map((elem) => {
        //   return `COALESCE( ${elem},'')`;
        // });
        // const updateColumnResult = await sequelize.query(`UPDATE "${jobposting.tableName}" SET "${vectorName}" = to_tsvector('english', ${coalesceFields.join(' || \' \' || ')})`)
        // logger.info(`[jobposting classmethods] addFullTextIndex : update tsvector with lexemes "${JSON.stringify(await updateColumnResult)}"`);


        // const indexResult = await sequelize.query(`CREATE INDEX IF NOT EXISTS jobposting_search_idx ON "${jobposting.tableName}" USING gin("${vectorName}");`);
        // logger.info(`[jobposting classmethods] addFullTextIndex : add index "${JSON.stringify(await indexResult)}"`);
        

        // // tsvector_update_trigger can't take ::text
        // const triggerFields = searchFields.map((element, index) => {
        //   return element.split('::')[0];
        // })  ; 
        // const triggerResult = await sequelize.query('CREATE OR REPLACE TRIGGER jobposting_vector_update BEFORE INSERT OR UPDATE ON "' + jobposting.tableName + '" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger("' + vectorName + '", \'pg_catalog.english\', ' + triggerFields.join(', ') + ')')
        // logger.info(`[jobposting classmethods] addFullTextIndex : add trigger "${JSON.stringify(await triggerResult)}"`);
        /*************************** */
        /* Creating TSVector column, nerwer version*/ 
        var searchFields = ['company_name', 'normalized_company_name','job_location::text', 'full_text', 'job_title'];// 'coalesce(normalized_job_location::text)' ,
        
        // coalesce is required to handle null as '' in case of unexpected NULL passed over as an input
        // to_tsvector : when joining multiple columns make sure put ' ' in the middle, or otherwise each string from different columns will be chained and as a result, tokenized in an unexpected way
        const coalesceFields = searchFields.map((elem) => {
          return `COALESCE( ${elem},'')`;
        });

        const genColumnResult = await sequelize.query(`ALTER TABLE "${jobposting.tableName}" ADD COLUMN IF NOT EXISTS "${vectorName}" TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', ${coalesceFields.join(' || \' \' || ')})) STORED;`);
        logger.info(`[jobposting classmethods] addFullTextIndex : add column "${JSON.stringify(await genColumnResult)}"`);

        const indexResult = await sequelize.query(`CREATE INDEX IF NOT EXISTS jobposting_search_idx ON "${jobposting.tableName}" USING gin("${vectorName}");`);
        logger.info(`[jobposting classmethods] addFullTextIndex : add index "${JSON.stringify(await indexResult)}"`);
        
      }catch(e)
      {
        logger.error(`[jobposting classmethods] addFullTextIndex : Error  "${JSON.stringify(e)}"`);
      }
    }

    // Due to the circular dependency issue, logger should be passed over as an argument
    // Also don't try to log everything cause it will be too many. only thing you need is error logs
    static async searchJobPosting(query, logger) {
      try{
          if(sequelize.options.dialect !== 'postgres') {
              logger.error('[jobposting classmethods] searchJobPosting : Search is only implemented on POSTGRES database');
              return;
          }
      
          var jobposting = this;
          
          // Escape string for SQL, 
          // query = sequelize.getQueryInterface().escape(query);
          // console.log(query);

          // Old version : return sequelize.query(`SELECT * FROM "${jobposting.tableName}" WHERE "${jobposting.getSearchVector()}" @@ plainto_tsquery('english', '${query}');`);
          // https://www.ibm.com/docs/en/i/7.4?topic=join-inner-using-where-clause
          // Should exculde soft-deleted entries
          
          // return sequelize.query(`SELECT jobposting.*, benefit_agg.benefit_type_array, (benefit_agg.benefit_type_array @> '{student_loan_repayment}') as student_loan_repayment, 
          // (benefit_agg.benefit_type_array @> '{tuition_reimbursement}') as tuition_reimbursement,  (benefit_agg.benefit_type_array @> '{tuition_assistance}') as tuition_assistance,
          // (benefit_agg.benefit_type_array @> '{full_tuition_coverage}') as full_tuition_coverage
          //  FROM "${jobposting.tableName}" LEFT JOIN (SELECT benefit.company_name as company_name , array_agg(benefit.benefit_type) as benefit_type_array
          //  FROM benefit where "deletedAt" is null group by benefit.company_name) as benefit_agg on benefit_agg.company_name = jobposting.company_name
          //   WHERE "${jobposting.getSearchVector()}" @@ plainto_tsquery('english', '${query}') and "deletedAt" is null
          //   order by posted_date DESC, jobposting.company_name ASC, jobposting.uuid ASC;`);
          
          // Sequelize ORM output DATEONLY type as a string. 
            // Very unreliable. should get codes migrated into pg lib. 
          
          return pgPool.query(`SELECT jobposting.*, benefit_agg.company_website, benefit_agg.imagelink, benefit_agg.benefit_type_array, (benefit_agg.benefit_type_array @> '{student_loan_repayment}') as student_loan_repayment, 
          (benefit_agg.benefit_type_array @> '{tuition_reimbursement}') as tuition_reimbursement,  (benefit_agg.benefit_type_array @> '{tuition_assistance}') as tuition_assistance,
          (benefit_agg.benefit_type_array @> '{full_tuition_coverage}') as full_tuition_coverage FROM "${jobposting.tableName}" LEFT JOIN 
		  ( SELECT benefit.company_name , array_agg(benefit.benefit_type) as benefit_type_array, (array_agg(company.company_website))[1] as company_website, (array_agg(company.imagelink))[1] as imagelink
				   FROM benefit LEFT JOIN 
		   		   (  SELECT company_name, company_website, imagelink FROM company )
		   		   as company on company.company_name = benefit.company_name where "deletedAt" is null group by benefit.company_name
		  ) as benefit_agg on benefit_agg.company_name = jobposting.company_name 
		  WHERE "${jobposting.getSearchVector()}" @@ plainto_tsquery('english', '${query}') and "deletedAt" is null
		  ORDER BY posted_date DESC, jobposting.company_name ASC, jobposting.uuid ASC;`);
        
          // return pgPool.query(`SELECT jobposting.*, benefit_agg.benefit_type_array, (benefit_agg.benefit_type_array @> '{student_loan_repayment}') as student_loan_repayment, 
          // (benefit_agg.benefit_type_array @> '{tuition_reimbursement}') as tuition_reimbursement,  (benefit_agg.benefit_type_array @> '{tuition_assistance}') as tuition_assistance,
          // (benefit_agg.benefit_type_array @> '{full_tuition_coverage}') as full_tuition_coverage
          //  FROM "${jobposting.tableName}" LEFT JOIN (SELECT benefit.company_name as company_name , array_agg(benefit.benefit_type) as benefit_type_array
          //  FROM benefit where "deletedAt" is null group by benefit.company_name) as benefit_agg on benefit_agg.company_name = jobposting.company_name
          //   WHERE "${jobposting.getSearchVector()}" @@ plainto_tsquery('english', '${query}') and "deletedAt" is null
          //   order by posted_date DESC, jobposting.company_name ASC, jobposting.uuid ASC;`);
            
      }
      catch(e)
      {
          logger.error(`[jobposting classmethods] searchJobPosting : Error  "${JSON.stringify(e)}" /  search keyword : ${query}`);
      }
    }
  }
  
  jobposting.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    linkedin_job_url_cleaned: {
      type : DataTypes.TEXT,
      primaryKey: true
    },
    company_name: {
      type: DataTypes.STRING
    },
    normalized_company_name: DataTypes.STRING,
    job_title: DataTypes.TEXT,
    job_location: DataTypes.STRING,
// Should make this column to only accept either of USA or CANADA
    normalized_job_location : {
      type: DataTypes.ENUM,
      values : ['USA', 'CANADA'],
      allowNull : false
    },
    posted_date: DataTypes.DATEONLY,
    full_text: DataTypes.TEXT,
    // "jobpostingToken" is not really required to be specified
    // ,as it would be only handled with raw query and classmethod
    // Also for the reason that server instance will always create this column at the very start
    // and the column should be configured with "GENERATED ALWAYS AS ... "
    
    // jobpostingToken:{
    //   type : DataTypes.TSVECTOR,
    // },

    std_loc_str :{
      type : DataTypes.TEXT,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'jobposting',
    paranoid: true
  });
  return jobposting;
};