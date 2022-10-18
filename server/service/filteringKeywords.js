
const { logger } = require('../config/logger');
const FILTERING_KEYWORDS = ['intern', 'internship', 'contract'];

/**
 * This function is to inspect each jobposting's full text and job title elements
 * to see if any keyword provided in a 'filteringWords' array
 * is contained in those elements or not
 * 
 * 10/16/2022 FILTERING_KEYWORDS = ['intern', 'internship', 'contract'];
 * 
 * @param {JSON<string>} singleJP  single jobposting data fetched from API
 * @return {Boolean} true : when the jobposting does contain any keyword specified in a "filteringWords" array
 */
function doesFilteringKeywordsExistInJP(singleJP)
{
    if (areWordsInString(singleJP.full_text, FILTERING_KEYWORDS) || areWordsInString(singleJP.job_title, FILTERING_KEYWORDS))
    {
        logger.info(`[doesFilteringKeywordsExist] ${singleJP.job_title} contains ${JSON.stringify(FILTERING_KEYWORDS)}`);
        return true;
    }
    else{
        logger.info(`[doesFilteringKeywordsExist] ${singleJP.job_title} doesn't contain ${JSON.stringify(FILTERING_KEYWORDS)}`);
        return false;
    }
}
/**
 * This function is to inspect the targetText to see if any keyword provided in a 'filteringWords' array
 * is contained in the text or not
 * 
 * @param {String} targetText
 * @param {Array<String>} filteringWords 
 * @return {Boolean} true : when the target text does contain any of filteringWords array
 */
function areWordsInString(targetText, filteringWords)
{   
    
    if(Array.isArray(filteringWords))
    {
        
        const filteringResult = filteringWords.map((eachWord)=> {
            //  reference website : How can I concatenate regex literals in JavaScript?
            // https://stackoverflow.com/questions/185510/how-can-i-concatenate-regex-literals-in-javascript
            // regex literal consist of flags and source. 

            //  the below type of syntax is not working :
            // var re2 = /\b+eachWord+\b/i;
            // global search won't be necessary cause our focus is to find the fact whether there is any single occurrence or not but not the total frequency
            var regex  = new RegExp('\\b' + eachWord + '\\b', 'i');
            // if there is no match, null will be returned
            return targetText.match(regex);
            
        })
        // if an array has at least one element that meets a specified condition. https://www.javascripttutorial.net/javascript-array-some/
        // any of it is jnon null, then it contains filtering words
        // console.(log(filteringResult.some((x) => (x !== null)))
        logger.info(`[areWordsInString] "${targetText}" against the filtering keywords =>  ${JSON.stringify(filteringResult)}`);
        // console.log(JSON.stringify(filteringResult))

        // https://www.javascripttutorial.net/javascript-array-some/
        return filteringResult.some((x) => (x !== null));

    }else{
        return Error('second arg should be an array of filtering words');
    }
}

// case insensitive with regular expression?
// using flag /i 

/*  https://www.programiz.com/javascript/regex#fromHistory
// performing case-insensitive replacement
const result3 = string.replace(/hello/i, 'world');
console.log(result3); // world hello hello
*/
module.exports = {doesFilteringKeywordsExistInJP };


