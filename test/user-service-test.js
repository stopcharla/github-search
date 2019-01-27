const expect = require('chai').expect;
const sinon = require('sinon');
const requestService = require('../services/requestService');
const userService = require('../services/userService');
const config = require('../config');
const Cache = require('../cache/cache');
const testConstants = require('./test-constants');

describe('Testing the user service methods', () => {

    afterEach(function () {
        // completely restore all fakes created through the sandbox
        requestService.get.restore();
    });

    it('Checking getValidUsers method with correct parameters', async () => {
        const arguments = {
            username: 'topcharla',
            language: 'nodejs',
            per_page: 50,
            page: 1
        }
        const expectedUrl = `${config.githubConfig.githubUsersUrl}?q=${arguments.username}+language:${arguments.language}&per_page=${arguments.per_page}&page=${arguments.page}`;
        const myStub = sinon.stub(requestService, "get").returns(Promise.resolve(testConstants.getUsersSampleResponse));
        const response = await userService.getValidUsers(arguments.username, arguments.language, arguments.per_page, arguments.page);
        expect(response).to.be.deep.equals(testConstants.getUsersSampleResponse);
        
        sinon.assert.calledOnce(requestService.get);
        const firstArgument = myStub.getCall(0).args[0];
        expect(firstArgument).to.be.equals(expectedUrl);
    });

    it('Checking getValidUsers method by providing per_page more than max', async () => {
        const arguments = {
            username: 'topcharla',
            language: 'nodejs',
            per_page: 300,
            page: 1
        }
        const expectedUrl = `${config.githubConfig.githubUsersUrl}?q=${arguments.username}+language:${arguments.language}&per_page=${config.githubConfig.maxUsersPerPage}&page=${arguments.page}`;
        const myStub = sinon.stub(requestService, "get").returns(Promise.resolve(testConstants.getUsersSampleResponse));
        
        const response = await userService.getValidUsers(arguments.username, arguments.language, arguments.per_page, arguments.page);
        expect(response).to.be.deep.equals(testConstants.getUsersSampleResponse);
        
        sinon.assert.calledOnce(requestService.get);
        const firstArgument = myStub.getCall(0).args[0];
        expect(firstArgument).to.be.equals(expectedUrl);
    });

    it('Checking getValidUsers method invalid per page and page number', async () => {
        const arguments = {
            username: 'topcharla',
            language: 'nodejs',
            per_page: 0,
            page: 0
        }
        
        const expectedUrl = `${config.githubConfig.githubUsersUrl}?q=${arguments.username}+language:${arguments.language}&per_page=${config.githubConfig.minUsersPerPage}&page=${config.githubConfig.defaultPage}`;
        const myStub = sinon.stub(requestService, "get").returns(Promise.resolve(testConstants.getUsersSampleResponse));
        
        const response = await userService.getValidUsers(arguments.username, arguments.language, arguments.per_page, arguments.page);
        expect(response).to.be.deep.equals(testConstants.getUsersSampleResponse);

        sinon.assert.calledOnce(requestService.get);
        const firstArgument = myStub.getCall(0).args[0];
        expect(firstArgument).to.be.equals(expectedUrl);
    });

    it('checking the get user info api without any entries in cache with users obtained as success', async () => {
        const myStub = sinon.stub(requestService, "get").returns(Promise.resolve(testConstants.getUserInfoSampleResponse));
        sinon.stub(Cache.prototype, 'get').callsFake(() => null);
        sinon.stub(Cache.prototype, 'saveUsers').returns({success:[testConstants.getUserInfoSampleResponse.response], error:[]});
        const response = await userService.getUsersInfo(testConstants.getUsersSampleResponse.items);

        const expectedUrl = testConstants.getUsersSampleResponse.items[0].url;
        expect(response.users[0]).to.be.deep.equals(testConstants.getUserInfoSampleResponse.response);

        sinon.assert.calledTwice(requestService.get);
        const firstArgument = myStub.getCall(0).args[0];
        expect(firstArgument).to.be.equals(expectedUrl);

        Cache.prototype.get.restore();
        Cache.prototype.saveUsers.restore();
    });

    it('checking the get user info api by adding entries to cache', async () => {
        sinon.stub(requestService, "get").returns(Promise.resolve(testConstants.getUserInfoSampleResponse));
        sinon.stub(Cache.prototype, 'get').callsFake(() => testConstants.getUserInfoSampleResponse.response);
        const response = await userService.getUsersInfo(testConstants.getUsersSampleResponse.items);

        expect(response.users[0]).to.be.equals(testConstants.getUserInfoSampleResponse.response);
        expect(response.users[1]).to.be.equals(testConstants.getUserInfoSampleResponse.response);
        expect(response.status).to.be.equals(200);

        sinon.assert.notCalled(requestService.get);
        sinon.assert.calledTwice(Cache.prototype.get);
        Cache.prototype.get.restore();
    });

    it('checking the get user info api by adding one entry to cache and other by fetching from api', async () => {
        sinon.stub(requestService, "get").returns(Promise.resolve(testConstants.getUserInfoSampleResponse));
        sinon.stub(Cache.prototype, 'get').callsFake((key) => {
            if (key === 'stopcharla') {
                return testConstants.getUserInfoSampleResponse.response;
            } else {
                return null;
            }
        });
        sinon.stub(Cache.prototype, 'saveUsers').callsFake((res) => {
            return {success:[res[0].response],error:[]};
        });
        
        const response = await userService.getUsersInfo(testConstants.getUsersSampleResponse.items);
        expect(response.users).to.be.deep.equals([testConstants.getUserInfoSampleResponse.response, testConstants.getUserInfoSampleResponse.response]);
        
        sinon.assert.calledOnce(requestService.get);
        sinon.assert.calledTwice(Cache.prototype.get);
        sinon.assert.calledOnce(Cache.prototype.saveUsers);
        
        Cache.prototype.get.restore();
        Cache.prototype.saveUsers.restore();
    });


    it('checking the get user info api by adding one entry is success and other by is failed with 403', async () => {
        sinon.stub(requestService, "get").returns(Promise.resolve(testConstants.getUserInfoSampleResponse));
        sinon.stub(Cache.prototype, 'get').callsFake((key) => {
            if (key === 'stopcharla') {
                return testConstants.getUserInfoSampleResponse.response;
            } else {
                return null;
            }
        });

        let expectedErrorObject = testConstants.sampleMultipleFailedandSuccessUsers[1].response;
        expectedErrorObject.status = testConstants.sampleMultipleFailedandSuccessUsers[1].status;
        expectedErrorObject.requestCount = 1;

        let expectedResponse = {
            status:expectedErrorObject.status,
            users: [testConstants.getUserInfoSampleResponse.response, testConstants.getUserInfoSampleResponse.response],
            incomplete_results: true,
            error: [expectedErrorObject]
        }

        sinon.stub(Cache.prototype, 'saveUsers').callsFake((res) => {
            return {success:[res[0].response],error:[expectedErrorObject]};
        });
        const response = await userService.getUsersInfo(testConstants.getUsersSampleResponse.items);
        expect(response).to.be.deep.equals(expectedResponse);

        Cache.prototype.get.restore();
        Cache.prototype.saveUsers.restore();
    });

});