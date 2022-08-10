
// https://github.com/vic3king/bulljs-email-setup/blob/master/server/helpers/template.js

/**
 * 
 * @param {String} jobpostingsContent HTML code containing randomly picked jobpostings' info
 * @returns {String} fully aggregated Email HTML code
 */
const eamilTemplate = (jobpostingsContent) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
<head>

<style type="text/css">
		body{
			display:flex;
			flex-direction:column;
			align-items:center;
			font-family:Helvetica;
			font-style:normal;
			font-weight:500;
		}
		img{
			width:100%;
			height:auto;
			cursor:pointer;
		}
		a{
			width:300px;
			height:100px;
		}
		.button{
			text-decoration:none;
			background:#0E71EB;
			border-radius:10px;
			font-style:normal;
			font-weight:500;
			font-size:16px;
			line-height:normal;
			text-align:center;
			color:#FFFFFF !important;
			padding:10px 20px;
		}
		h3{
			font-weight:bold;
		}
		.container{
			max-width:520px;
			margin:auto;
			padding:20px;
		}
		.header{
			width:100%;
			text-align:center;
		}
		.bar{
			height:35px;
			background-color:#96dfe3;
		}
		.companies-container{
			margin-top:50px;
		}
		.company-header{
			display:flex;
			justify-content:left;
			margin-bottom:20px;
		}
		.company-image-container{
			width:100px;
		}
		.companies-container{
			margin-top:50px;
		}
		.companies-container div p{
			font-weight:bold;
		}
		.company-title{
			margin-top:15px;
			margin-left:10px;
		}
		.jobposting-container{
			text-align:left;
			height:30px;
		}
		.jobposting-container-left{
			padding-bottom:0px;
			padding:5px;
			font-size:16px;
			line-height:normal;
			border-bottom:solid 1px #cfd2e9;
		}
		.jobposting-container-right{
			width:90px;
			font-size:16px;
			line-height:normal;
			text-align:right;
			border-bottom:solid 1px #cfd2e9;
		}
		.jobposting-link-left{
			font-weight:400;
			text-decoration:none;
			color:#111111;
			width:100%;
			height:70px;
		}
		.jobposting-link-right{
			font-weight:400;
			text-decoration:none;
			color:#777777;
			width:100%;
			height:70px;
			text-align:right;
		}
		.jobposting-span-text{
			font-size:13px;
			font-weight:400;
			color:#777770;
		}
</style></head>
<body>
	
    <div class="container">
        <div class="header">
            <div class="bar">

            </div>
            <a href="#">
                <img src="https://ucarecdn.com/615667af-0e02-4cc1-91df-180628c83dc5/" alt="random">
            </a>
            <div class="bar">

            </div>
        </div>
        <div class="text-container">
            <h3>3 more companies that help you pay off your student loan debt</h3>
            <p>Hi everyone,</p>
            
            <p>Thank you for using Dwindle Student Debt as your resource to find jobs that help you pay down student debt, or lower the cost of your education.</p>
            
            <p>Below you will find more job openings at companies that want to help you with becoming student debt free.</p>
            
            <p>Good luck with your search! Jesse</p>
        </div>
        

        
        ${jobpostingsContent}
        </div>
        </body>
        </html>`;
        
module.exports = {eamilTemplate};
        // <div mc:edit="mytext">
        //     Mytext should come here from the API 
        // </div>