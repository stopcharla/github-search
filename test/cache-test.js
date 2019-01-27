const expect = require('chai').expect;
const Cache = require('../cache/cache');
const testConstants = require('./test-constants');

describe('checking the cache functionality', () => {
    it('testing adding of multiple users to cache and testing reset', (done) => {
        const cache = new Cache();
        const savedUsers = cache.saveUsers(testConstants.sampleMultipleUsers);

        expect(savedUsers.success).to.be.an('array');
        expect(savedUsers.success).to.be.deep.equals([testConstants.sampleMultipleUsers[0].response, testConstants.sampleMultipleUsers[1].response]);
        expect(savedUsers.error).to.be.an('array').of.length(0);

        cache.reset();
        const elements = cache.getAllEntries();
        expect(elements).to.be.an('array').of.length(0);
        done();
    });

    it('testing singleton functionality of cache', () => {
        const cache1 = new Cache();
        const savedUsers = cache1.saveUsers(testConstants.sampleMultipleUsers);
        const userFromCache1 = cache1.get(savedUsers.success[0].login);

        const cache2 = new Cache();
        const userFromCache2 = cache2.get(savedUsers.success[0].login);

        expect(userFromCache1).to.be.deep.equals(userFromCache2);
        expect(cache1).to.be.equal(cache2);

        cache1.reset();
    });

    it('testing adding of multiple users with status 200 and 403 to cache and testing reset', (done) => {
        const cache = new Cache();
        const savedUsers = cache.saveUsers([testConstants.sampleMultipleFailedandSuccessUsers[0], testConstants.sampleMultipleFailedandSuccessUsers[1]]);

        expect(savedUsers.success).to.be.an('array');
        expect(savedUsers.success).to.be.deep.equals([testConstants.sampleMultipleUsers[0].response]);
        expect(savedUsers.error).to.be.an('array').of.length(1);

        let expectedErrors = testConstants.sampleMultipleFailedandSuccessUsers[1].response;
        expectedErrors.requestCount = 1;
        expectedErrors.status = testConstants.sampleMultipleFailedandSuccessUsers[1].status;
        expect(savedUsers.error).to.be.deep.equals([expectedErrors]);

        cache.reset();
        done();
    });

    it('testing adding of multiple users to cache with status 200 and multiple with 403', (done) => {
        const cache = new Cache();
        const savedUsers = cache.saveUsers(testConstants.sampleMultipleFailedandSuccessUsers);

        expect(savedUsers.success).to.be.an('array');
        expect(savedUsers.success).to.be.deep.equals([testConstants.sampleMultipleUsers[0].response]);
        expect(savedUsers.error).to.be.an('array').of.length(1);

        let expectedErrors = testConstants.sampleMultipleFailedandSuccessUsers[1].response;
        expectedErrors.requestCount = 2;
        expectedErrors.status = testConstants.sampleMultipleFailedandSuccessUsers[1].status;
        expect(savedUsers.error).to.be.deep.equals([expectedErrors]);

        cache.reset();
        done();
    });

});