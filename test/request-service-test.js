const expect = require('chai').expect;
const requestService = require('../services/requestService');
const request = require('node-fetch');
const sinon = require('sinon');

describe('Unit Testing the request service module', () => {

    it('testing url creation for provide query params', (done) => {
        const queryParams = {
            q: 'stopcharla+language:nodejs',
            per_page: 20,
            page: 1
        };
        const fullUrl = 'http://github.com?q=stopcharla+language:nodejs&per_page=20&page=1';
        const url = requestService.appendQueryParamsToUrl('http://github.com', queryParams);
        expect(url).to.be.equal(fullUrl);
        done();
    });

    it('testing url creation for not providing query params', (done) => {
        const queryParams = {};
        const fullUrl = 'http://github.com';
        const url = requestService.appendQueryParamsToUrl('http://github.com', queryParams);
        expect(url).to.be.equal(fullUrl);
        done();
    });


    it('Checking if the get call is successfull and returns 200', async () => {
        const responseObject = {
            status: 200,
            json: () => {
                return { name: 'tom', username: 'tomgithub', url: 'http://api.github.com/tomgithub' };
            }
        };
        const expectedResponse = {
            status: responseObject.status,
            response: responseObject.json(),
            isError: false
        };
        sinon.stub(request, 'Promise').returns(Promise.resolve(responseObject));
        const response = await requestService.get('http:github.com');
        expect(response).to.be.deep.equals(expectedResponse);
        sinon.assert.calledOnce(request.Promise);
        request.Promise.restore();
    });


    it('Checking if the get call is failure and returns error code other than 200', async () => {
        const responseObject = {
            status: 400,
            json: () => {
                return { name: 'tom', username: 'tomgithub', url: 'http://api.github.com/tomgithub' };
            }
        };
        const expectedResponse = {
            status: responseObject.status,
            isError: false,
            response: responseObject.json()
        };
        sinon.stub(request, 'Promise').returns(Promise.resolve(responseObject));
        const response = await requestService.get('http:github.com');
        expect(response).to.be.deep.equals(expectedResponse);
        sinon.assert.calledOnce(request.Promise);
        request.Promise.restore();
    });


    it('checking if error occured in the request', async () => {
        const responseObject = {
            error: 'test case for error check passed'
        };
        const expectedResponse = {
            response: responseObject,
            isError: true
        };
        sinon.stub(request, 'Promise').returns(Promise.reject(responseObject));
        const response = await requestService.get('http:github.com');
        expect(response).to.be.deep.equals(expectedResponse);
        sinon.assert.calledOnce(request.Promise);
        request.Promise.restore();
    });

});