'use strict';

const {
  Model
} = require('sequelize');
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
    
    // https://sebhastian.com/sequelize-class-methods/
    static getSearchVector() {
      return 'jobpostingToken';  
    }
    // I would prefer run this function in my local computer, since it is only required to run only once
    // but of course it can be automated by gettintg the full list of columns and check it is crated or not

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
        var searchFields = ['company_name', 'normalized_company_name','job_location::text', 'full_text', 'job_title'];// 'coalesce(normalized_job_location::text)' ,
        // https://kb.objectrocket.com/postgresql/how-to-perform-the-postgres-add-column-if-not-exists-1266
        const addColumnResult = await sequelize.query(`ALTER TABLE "${jobposting.tableName}" ADD COLUMN IF NOT EXISTS "${vectorName}" TSVECTOR;`);
        logger.info(`[jobposting classmethods] addFullTextIndex : add column "${JSON.stringify(await addColumnResult)}"`);

        // coalesce is required to handle null as '' in case of unexpected NULL passed over as an input
        // to_tsvector : when joining multiple columns make sure put ' ' in the middle, or otherwise each string from different columns will be chained and as a result, tokenized in an unexpected way
        const coalesceFields = searchFields.map((elem) => {
          return `COALESCE( ${elem},'')`;
        });
        const updateColumnResult = await sequelize.query(`UPDATE "${jobposting.tableName}" SET "${vectorName}" = to_tsvector('english', ${coalesceFields.join(' || \' \' || ')})`)
        logger.info(`[jobposting classmethods] addFullTextIndex : update tsvector with lexemes "${JSON.stringify(await updateColumnResult)}"`);


        const indexResult = await sequelize.query(`CREATE INDEX IF NOT EXISTS jobposting_search_idx ON "${jobposting.tableName}" USING gin("${vectorName}");`);
        logger.info(`[jobposting classmethods] addFullTextIndex : add index "${JSON.stringify(await indexResult)}"`);
        

        // tsvector_update_trigger can't take ::text
        const triggerFields = searchFields.map((element, index) => {
          return element.split('::')[0];
        })  ; 
        const triggerResult = await sequelize.query('CREATE OR REPLACE TRIGGER jobposting_vector_update BEFORE INSERT OR UPDATE ON "' + jobposting.tableName + '" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger("' + vectorName + '", \'pg_catalog.english\', ' + triggerFields.join(', ') + ')')
        logger.info(`[jobposting classmethods] addFullTextIndex : add trigger "${JSON.stringify(await triggerResult)}"`);
        /*************************** */


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
          
          return sequelize.query(`SELECT * FROM "${jobposting.tableName}" WHERE "${jobposting.getSearchVector()}" @@ plainto_tsquery('english', '${query}');`);
          // return sequelize
          //         .query('SELECT * FROM "' + jobposting.tableName + '" WHERE "' + jobposting.getSearchVector() + '" @@ plainto_tsquery(\'english\', \'' + query + '\');');
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
    posted_date: DataTypes.STRING,
    full_text: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'jobposting',
    paranoid: true
  });
  return jobposting;
};