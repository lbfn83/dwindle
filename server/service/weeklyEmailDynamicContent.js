const {logger} = require('../config/logger')
const {sequelize} = require('../models')


const dyanmicConentBuilder = async() => {
    try{
        
        const selectedCompanies = await fetchCompanyInformation();
        console.log(await selectedCompanies);
        // This ensures the right proportion of CANADNA and USA job
        // Also gotta generate random numbers as well
       
    
        // charEncodingInHTML


    }
    catch(err){

    }
}

// Pick top three companies that have most jobpostings this week
const fetchCompanyInformation = async() => {
    try{
        // Pick top three companies that have most jobposting this week
        // columns : mode, count, company_summary
        const threeCompanies = await sequelize.query(`SELECT stat.*, company.company_summary from 
            (
                SELECT mode() WITHIN GROUP (ORDER BY jobposting.company_name), count(*)
                from jobposting group by jobposting.company_name order by count desc limit 3
            ) 
        as stat INNER JOIN company on company.company_name = stat.mode`);
        
        logger.info(`[weeklyEmailDynamicContent] fetchCompanyInformation: `)
        threeCompanies.map();
        let aa = {
            ...threeCompanies,
            jobpostings : [],
        }
        console.log(aa)
        // console.log(await threeCompanies[0])
        // console.log(`${JSON.stringify(await threeCompanies[0])}`);

        // TODO : 
        return threeCompanies[0];

    }catch(error)
    {
        return Promise.reject(`[weeklyEmailDynamicContent] fetchCompanyInformation : Error "${error}"`); 
    }
}


const weeklyEmailJobpostingPull = async() => {
    // Pick top three companies that have most jobposting this week
    // columns : mode, count, company_summary
    const threeCompanies = await sequelize.query(`SELECT stat.*, company.company_summary from 
        (
            SELECT mode() WITHIN GROUP (ORDER BY jobposting.company_name), count(*)
            from jobposting group by jobposting.company_name order by count desc limit 3
        ) 
    as stat INNER JOIN company on company.company_name = stat.mode`);

    let finalResult = [];
    console.log(await threeCompanies[0])
    console.log(`${JSON.stringify(await threeCompanies[0])}`);
            

        // Below is for looping through obejct's keys 
        // for( mode in threeCompanies[0])
        // should use 'of'

        // await threeCompanies[0].forEach(async(company) => {
        //     await sequelize.query(`SELECT mode() WITHIN GROUP(ORDER BY jobposting.normalized_job_location), COUNT(*) from jobposting 
        //     WHERE jobposting.company_name = '${company.mode}' group by jobposting.normalized_job_location`)
        //     .then((result)=> {
        //         console.log(result)
        //         finalResult.push(result)
        //     });    
        // })
    await threeCompanies[0].map(async(company)=> {
        await sequelize.query(`SELECT mode() WITHIN GROUP(ORDER BY jobposting.normalized_job_location), COUNT(*) from jobposting 
            WHERE jobposting.company_name = '${company.mode}' group by jobposting.normalized_job_location`)
        .then(async(result)=> {
            // console.log(await result)
            finalResult.push(await result[0])
            if(finalResult.length ===3)
            {
                console.log(finalResult)
                console.log("hahaha")
            }
        });    
    })
    
    /*
    await sequelize.query(`SELECT stat.*, company.company_summary from 
        (
            SELECT mode() WITHIN GROUP (ORDER BY jobposting.company_name), count(*)
            from jobposting group by jobposting.company_name order by count desc limit 3
        ) 
    as stat INNER JOIN company on company.company_name = stat.mode`)
    
    .then(async(threeCompanies) => 
    {
        let finalResult = [];
        console.log(`${JSON.stringify(threeCompanies[0])}`);
        if(threeCompanies[0].length === 3)
        {
            threeCompanies[0].map(async(company)=> {
                await sequelize.query(`SELECT mode() WITHIN GROUP(ORDER BY jobposting.normalized_job_location), COUNT(*) from jobposting 
                    WHERE jobposting.company_name = '${company.mode}' group by jobposting.normalized_job_location`)
                .then((result)=> {
                    // console.log(result)
                    finalResult.push(result)
                });    
            })
            if( finalResult.length ===3 )
            {
                console.log(finalResult)
            }l
           
    
        }
    });
 */
}
dyanmicConentBuilder();
module.exports = {
    weeklyEmailJobpostingPull, dyanmicConentBuilder
};