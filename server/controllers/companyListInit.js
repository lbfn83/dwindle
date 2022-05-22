const fs = require("fs");
const {company} = require('../models')


async function setupCompanyListFromTxt() 
{
    try{
        const data = []
        const fileContent = fs.readFileSync('./data/company_list.txt', 'utf-8');
        fileContent.split(/\r?\n/).forEach(line =>  {
            if(line != "")
            {
                const trimedWord  = line.trim();
                data.push(trimedWord)
                // console.log(`[testRouter] Line from file: ${trimedWord}`);
            }
          });

        const dbEntries = data.map( elem => {
            return {"companyname": elem};
        })

        // console.log(dbEntries)
        // What is bulkCreate's return? some sequelize auto created field with dbEntries
        await company.bulkCreate(dbEntries, {
            updateOnDuplicate: ['companyname']
          });
        // console.log(`[testRouter] bulkInsert result : `, result);
        return dbEntries;
    }catch(error)
    {
        // console.log(`[testRouter] Err : `, error);
        // 500 Internal Server Error
        // 400 Bad Request
        return {message : error}
    }
}

module.exports = {setupCompanyListFromTxt}