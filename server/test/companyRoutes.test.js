process.env.NODE_ENV = 'development';

const chai = require('chai');
const expect = chai.expect;
const should = chai.should;
const chaiHttp = require('chai-http');
const sinonChai = require('sinon-chai');
const server = require('../server');
const proxyQuire = require('proxyquire');
const sinon = require('sinon');
const companyRoutes = require('../controller/company');
const companyList= require('./comapnyList');

chai.use(should);
chai.use(chaiHttp);
chai.use(sinonChai);
// Error generated from should and chaiHttp is very unhelpful
// like they generated error like have is not recognized if test failed
describe('Company Routes Test Suite with chai HTTP', () => {
    
    // after(() => {
    //     require('../server').stop();
    // });
    // never use end in promise
    it('Get /database/companies with Chai HTTP', (done) => {
        var serverInstance =  chai.request(server)
            .get('/database/companies')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                console.log(res.body)
                res.body.length.should.be.eql(companyList.companyList.length);
                const company = res.body.map((elem) => {
                    return elem.company_name;
                });
                // https://medium.com/building-ibotta/testing-arrays-and-objects-with-chai-js-4b372310fe6d
                company.should.have.members(companyList.companyList);
                // error generated from below
                // res.body.shoud.be.equal(company);
                done();
            });

    })


});
describe('Company Routes Test Suite with Sinon Stub', () => {


    const databaseQuery = sinon.stub();
    const companyRoutes = proxyQuire('../controller/company', {
        '../models': {
            'company' : {
                'findAll' : databaseQuery
            }
        }
    });
    
    const res = {
        json: sinon.stub()
    };
    const next = sinon.spy();

    const result = "success"
    // done is not really required here unless
    // you are calling the function that returns the actual promise    
    context('Get /database/companies with no error', () => {
        before(async() => {
            // Can't use onCall or onFirstCall with resolves
            // only with returns is possible
            databaseQuery.
                resolves(result);
            await companyRoutes.getfullListCompanies('', res, next);
  
        });
        after(() => {
            databaseQuery.resetHistory();
            next.resetHistory();
        });
        it('queried database once? ', () => {
            expect(databaseQuery).to.be.calledOnce;
        });
        it('called database query with the right parameter', ()=>{
            expect(databaseQuery).to.have.been.calledWith(JSON.parse('{ "paranoid" : false }'));
        });
        it('called res.json with the right data?', () => {
            expect(res.json).to.be.calledWith(result);
        });
        it('called res.json once?', ()=> {
            expect(res.json).to.be.calledOnce;
        });

        it(`didn't call next `, () => {
            expect(next).not.to.be.called;
        });
        // done();
    });
});

// 이젠 여기다가 error 관련된 부분을 넣어주고

