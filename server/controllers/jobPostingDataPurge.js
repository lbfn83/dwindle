
const {jobposting} = require('../models')
const { Op } = require("sequelize");
const softDeletePeriod = 1
const hardDeletePeriod = 5

async function jobPostingDataPurge()
{
    // Find most latest record with updatedAt data which is going to be our reference date for purging
    let latestRecord = await jobposting.findOne({
        limit : 1,
        order : [['updatedAt' , 'DESC']]
    })
    // console.log(latestRecord.updatedAt)
    
    // await jobposting.restore()
    if(latestRecord !== null && latestRecord !== undefined)
    {
        // Record is wrapped with "double quote" so remove it
        let strLatestRecord =  JSON.stringify(latestRecord.updatedAt).replace(/["]+/g, '')
        // Soft deletion handling
        let softDelRefDate = convertFromStringToRefDate(strLatestRecord, softDeletePeriod)
    
        // Genrated SQL : UPDATE "jobposting" SET "deletedAt"=$1 WHERE "deletedAt" IS NULL AND "updatedAt" < '2022-05-24 04:00:00.000 +00:00'
        // it considers "deletedAt" IS NULL
        let numOfSDData = await jobposting.destroy({
            where: {
                updatedAt : { [Op.lt] : softDelRefDate}
            },
            // exclude soft deleted records, false is defualt value
            force: false
        })
        console.log("[JobPostingDataPurge] Soft Deleted Data:" + numOfSDData)
        // let SDRecords = await jobposting.findAll({
        //     where: {
        //         updatedAt : { [Op.lt] : refDate}
        //     },
        //     // exclude soft deleted records
        //     paranoid: true
        // })
        
        // hard Deletion handling 
        
        // TODO : jobposing that manually created shouldn't be deleted from here
        // method1 : create different table that only accomodate manually created job postings but needs to invent join query
        // method2 : add another column "manual" if true then don't make it go through purge process defined here

        let hardDelRefDate = convertFromStringToRefDate(strLatestRecord, hardDeletePeriod)
        // Generated SQL : DELETE FROM "jobposting" WHERE "updatedAt" < '2022-05-24 04:00:00.000 +00:00'
        // from here it doens't take account of deletedAt, which means any records fall under this criteria will be hard deleted 
        let numOfHDData = await jobposting.destroy({
            where: {
                updatedAt : { [Op.lt] : hardDelRefDate}
            },
     
            // include soft deleted records
            force: true
        })
        console.log("[JobPostingDataPurge] Hard Deleted Data:" + numOfHDData)
        // let numOfHDData = await jobposting.findAll({
        //     where: {
        //         updatedAt : { [Op.lt] : hardDelRefDate}
        //     },
        //      //include soft deleted records 
        //     paranoid : false
        //   
        //    
        // })
    }

    console.log("[JobPostingDataPurge]finito")
}

function convertFromStringToRefDate(responseDate, dayPassed) {
    let dateComponents = responseDate.split('T');
    let datePieces = dateComponents[0].split("-");
    // Don't need to process time information. 
    // but in the future if it is needed take a note of the below
    // let timePieces = dateComponents[1].split(":");
    // timePieces[2].split(".") and only take the former as milliseconds is unrecognized by this function
    
    // returns today date with 00:00:00
    return(new Date(datePieces[0], datePieces[1]-1, datePieces[2]-dayPassed+1, 0, 0, 0))//+1 should come later
}

module.exports = {jobPostingDataPurge}