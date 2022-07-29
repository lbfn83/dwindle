const {logger} = require('../config/logger')
const {sequelize} = require('../models')

const MAX_JOBPOSTING_PER_COMPANY = 10;
/**
 * Pick top three companies that have most jobpostings this week
 * and calculate their respective counts of jobpostings in each location
 */
const fetchCompanyInformation = async() => {
    try{
        // Pick top three companies that have most jobposting this week
        // result columns ( refre to first element of the result ) : mode, count, company_summary
        const threeCompanies = await sequelize.query(`SELECT stat.*, company.company_summary from 
            (
                SELECT mode() WITHIN GROUP (ORDER BY jobposting.company_name), count(*)
                from jobposting group by jobposting.company_name order by count desc limit 3
            ) 
        as stat INNER JOIN company on company.company_name = stat.mode`);
        
        logger.info(`[weeklyEmailDynamicContent] fetchCompanyInformation : three companies picked : ${JSON.stringify(await threeCompanies[0])}`)

        // console.log(await threeCompanies[0])
        // console.log(`${JSON.stringify(await threeCompanies[0])}`);

        // https://stackoverflow.com/questions/33438158/best-way-to-call-an-asynchronous-function-within-map
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
        // The Promise.all() method takes an iterable of promises as an input, and returns a single Promise that resolves to an array of the results of the input promises.
        //  This returned promise will fulfill when all of the input's promises have fulfilled, or if the input iterable contains no promises.
        
        const countingPerLoc = await Promise.all(threeCompanies[0].map(async(company, index)=> {
                const eachJobcounting = await sequelize.query(`SELECT mode() WITHIN GROUP(ORDER BY jobposting.normalized_job_location), COUNT(*) from jobposting 
                    WHERE jobposting.company_name = '${company.mode}' group by jobposting.normalized_job_location`);
                    // each elem of eachJobcounting : [ { mode: 'USA', count: '470' }, { mode: 'CANADA', count: '372' } ]
                    // console.log(eachJobcounting[0]);
                // reduce
                // https://betterprogramming.pub/6-use-cases-for-reduce-in-javascript-49683842ebed
                return eachJobcounting[0].reduce((prev, elem) => {
                    prev['company_name'] = company.mode;
                    prev['company_summary'] = company.company_summary;
                    prev['total_count'] = company.count;
                    if( prev['count_per_loc'] === undefined )
                    {
                        prev['count_per_loc'] = {};
                    }

                    prev['count_per_loc'][`${elem.mode}`] = elem.count;
                    
                    // Version 1.0
                    // https://code-boxx.com/convert-string-object-javascript/
                    // prev['count_per_loc'].push(JSON.parse(
                    //     `{"${elem.mode}" : "${elem['count']}"}`));
                
                    // prev[elem.mode] = elem.count;

                    return prev;
                }, {});
                
            })   
        );
     
        logger.info(`[weeklyEmailDynamicContent] fetchCompanyInformation :jobposting counts per location : ${JSON.stringify(await countingPerLoc)} `)
        
        return countingPerLoc;
        
    }catch(error)
    {
        return Promise.reject(`[weeklyEmailDynamicContent] fetchCompanyInformation : Error "${error}"`); 
    }
}

// input param : the array of objects with the below structure
// {
//     company_name: 'Deloitte',
//     company_summary: 'Deloitte drives progress. Our firms around the world help clients become leaders wherever they choose to compete.',
//     total_count: '806',
//     count_per_loc: { USA: '450', CANADA: '356' }
//        
//   }
// jobpostins key will be added... 

function getRandomInt(min = 0, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const fetchJobPostingInformation = async(companyInfo) => {
    try{
        logger.info(`[weeklyEmailDynamicContent] fetchJobPostingInformation :jobposting counts per location :  `);
        
        // Version 1.0
        // let a = companyInfo[0].count_per_loc.reduce((prev, elem) => {
        //     prev[Object.keys(elem)] = Math.round(MAX_JOBPOSTING_PER_COMPANY * (elem[Object.keys(elem)] /  companyInfo[0].total_count));
        //     return prev;
        // }, {})

        return Promise.all(companyInfo.map(async (singleCompanyInfo)=>{
            let actualNumOfJPfromEachLoc = {}; // for debugging purpose
            let randNumSets = []; // this is for debugging purpose
            
            // create New key to store jobposting strings
            singleCompanyInfo.jobpostings =[];
            // Go through each location [USA, CANADA]
            for( singleLoc of Object.keys(singleCompanyInfo.count_per_loc))
            {
                // console.log(singleLoc);
                // for example 5.5 and 4.5 then it will have one more job posting. However, putting out one more job posting won't do any harm I think
                actualNumOfJPfromEachLoc[`${singleLoc}_NumOfJP`] = Math.round(parseFloat(MAX_JOBPOSTING_PER_COMPANY) * (singleCompanyInfo.count_per_loc[singleLoc] /  singleCompanyInfo.total_count));   
                
                logger.info(`[weeklyEmailDynamicContent] fetchJobPostingInformation : ${singleLoc} should pull ${actualNumOfJPfromEachLoc[`${singleLoc}_NumOfJP`]} jobs out of total ${MAX_JOBPOSTING_PER_COMPANY}`);
                
                let randNumSet = new Set();
                let loopCond = parseInt(actualNumOfJPfromEachLoc[`${singleLoc}_NumOfJP`]);
                while(randNumSet.size < loopCond)
                {   
                    let temp =  getRandomInt(0, singleCompanyInfo.count_per_loc[singleLoc] -1);
                    randNumSet.add(temp);
                }

                randNumSets.push(randNumSet);
                const result = await sequelize.query(`select * from jobposting where jobposting.company_name='${singleCompanyInfo.company_name}' 
                and jobposting.normalized_job_location= '${singleLoc}'`);
                
                // Insert jobpostings' info fetched from the generated index into return value
                for(index of randNumSet)
                {
                    singleCompanyInfo.jobpostings.push(result[0][index])
                }
            }
            logger.info(`[weeklyEmailDynamicContent] fetchJobPostingInformation actual job posting count by loc : ${singleCompanyInfo.company_name} =>  ${JSON.stringify(actualNumOfJPfromEachLoc)}`);
            logger.info(`[weeklyEmailDynamicContent] fetchJobPostingInformation :  ${singleCompanyInfo.company_name} => ${Array.from(randNumSets[0])} // ${Array.from(randNumSets[1])}`);
            return singleCompanyInfo; 

        })); 

    }catch(error)
    {
        return Promise.reject(`[weeklyEmailDynamicContent] fetchJobPostingInformation : Error "${error}"`); 
    }
}




const dyanmicConentBuilder = async() => {
    try{
        
        let companyInfo = await fetchCompanyInformation();
        // console.log(await companyInfo);
        
        const comInfoWithJPs =await fetchJobPostingInformation(companyInfo);
        console.log(JSON.stringify(comInfoWithJPs))
        // console.log(JSON.stringify(comInfoWithJPs[0].jobpostings))
        // comInfoWithJPs.map((elem) => {
        //     console.log(elem.jobpostings);
        //     console.log("--------------------");
        // });
    
        return charEncodingInHTML(comInfoWithJPs);


    }
    catch(err){

    }
}
const charEncodingInHTML = (comInfoWithJPs) => {
    try{
        let body = `<style>
        table, th, td {
          border:1px solid black;
        }
        </style>
        <table style="width:100%">
        `

        comInfoWithJPs.map((eachCompanyInfoWithJP) => {
            body += `<tr>
                        <th> ${eachCompanyInfoWithJP.company_name} </th> 
                    </tr>
                    <tr>
                     <th> ${eachCompanyInfoWithJP.company_summary} </th>
                    </tr>`
            for( eachJP of eachCompanyInfoWithJP.jobpostings)
            {
                body += `<tr> <td> ${eachJP.company_name}  ${eachJP.job_title}   ::   ${eachJP.job_location} </td> </tr>`
            }   

        })

        body += `</table>`
        return body;
    }catch(error)
    {
        // TODO  바꿔주고 나중에
        return Promise.reject(`[weeklyEmailDynamicContent] charEncodingInHTML : Error "${error}"`); 
    }
}


module.exports = {
    dyanmicConentBuilder
};

/*
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
    */
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

