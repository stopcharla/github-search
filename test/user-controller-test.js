const expect = require('chai').expect;
const sinon = require('sinon');
const userController = require('../controllers/userController');
const userService = require('../services/userService');
const testConstants = require('./test-constants');

describe('Testing the get get users function in user controller', () => {
    it('not sending username as a part of query parameters', async () => {
        const req = {
            query: {
                language: 'nodejs'
            }
        }
        const res = {
            status: (status) => {
                return {
                    send: (response) => {
                        console.log('response:', response);
                        expect(response.status).to.be.equals(400);
                    }
                };
            }
        }
        await userController.getUsers(req, res);
    });

    it('not sending language as a part of query parameters', async () => {
        const req = {
            query: {
                username: 'tom'
            }
        }
        const res = {
            status: (status) => {
                return {
                    send: (response) => {
                        console.log('response:', response);
                        expect(response.status).to.be.equals(400);
                    }
                };
            }
        }
        await userController.getUsers(req, res);
    });

    it('sending username, language, per_page as a part of query parameters ', async () => {
        const req = {
            query: {
                language: 'nodejs',
                username: 'topcharla',
                per_page: 2
            }
        }
        const res = {
            status: (status) => {
                return {
                    send: (response) => {
                        console.log('response:', response);
                        expect(response.status).to.be.equals(200);
                        expect(response.users).to.be.an("array").of.length(2);
                        expect(response.incomplete_results).to.be.equal(false),
                            expect(response.total_count).to.be.equals(2)
                    }
                };
            }
        }
        sinon.stub(userService, 'getValidUsers').returns(Promise.resolve(testConstants.getValidUsersSampleResponse));
        sinon.stub(userService, 'getUsersInfo').returns(Promise.resolve({
            status: 200,
            users: [testConstants.sampleMultipleUsers[0].response, testConstants.sampleMultipleUsers[1].response],
            error: [],
            incomplete_results: false,
            total_count: 2
        }));
        await userController.getUsers(req, res);
        userService.getUsersInfo.restore();
        userService.getValidUsers.restore();
    });

    it('sending username,multiple languages, per_page and receiving empty for one language', async () => {
        const req = {
            query: {
                language: 'nodejscpp,nodejs',
                username: 'topcharla',
                per_page: 2
            }
        }
        const res = {
            status: (status) => {
                return {
                    send: (response) => {
                        console.log('response:', response);
                        expect(response.status).to.be.equals(200);
                        expect(response.users).to.be.an("array").of.length(2);
                        expect(response.incomplete_results).to.be.equal(false),
                            expect(response.total_count).to.be.equals(2)
                    }
                };
            }
        }
        sinon.stub(userService, 'getValidUsers').callsFake((username, language, per_page, page) => {
            if (language === 'nodejscpp') {
                return (Promise.resolve({ isError: false, status: 200, response: { items: [] } }));
            } else {
                return (Promise.resolve(testConstants.getValidUsersSampleResponse));
            }
        }
        );
        sinon.stub(userService, 'getUsersInfo').returns(Promise.resolve({
            status: 200,
            users: [testConstants.sampleMultipleUsers[0].response, testConstants.sampleMultipleUsers[1].response],
            error: [],
            incomplete_results: false,
            total_count: 2
        }));
        await userController.getUsers(req, res);
        userService.getUsersInfo.restore();
        userService.getValidUsers.restore();
    });

    it('sending username,multiple languages, per_page and receiving empty for both languages', async () => {
        const req = {
            query: {
                language: 'nodejscpp,nodejs',
                username: 'topcharla',
                per_page: 2
            }
        }
        const res = {
            status: (status) => {
                return {
                    send: (response) => {
                        console.log('response:', response);
                        expect(response.status).to.be.equals(200);
                        expect(response.users).to.be.an("array").of.length(0);
                        expect(response.incomplete_results).to.be.equal(false),
                        expect(response.total_count).to.be.equals(0)
                    }
                };
            }
        }
        sinon.stub(userService, 'getValidUsers').callsFake(() => {
            return (Promise.resolve({
                isError: false,
                status: 200,
                response: {
                    incomplete_results: false,
                    total_count: 0,
                    items: []
                }
            }));
        }
        );
        sinon.stub(userService, 'getUsersInfo').returns(Promise.resolve({
            status: 200,
            users: [],
            error: [],
            incomplete_results: false,
            total_count: 0
        }));
        await userController.getUsers(req, res);
        userService.getUsersInfo.restore();
        userService.getValidUsers.restore();
    })

    it('sending username,multiple languages, per_page and failing with error code s (404, 400) other than 504', async () => {
        const req = {
            query: {
                language: 'nodejscpp,nodejs',
                username: 'topcharla',
                per_page: 2
            }
        }
        const res = {
            status: (status) => {
                return {
                    send: (response) => {
                        console.log('response:', response);
                        expect(response.status).to.be.equals(400);
                    }
                };
            }
        }
        sinon.stub(userService, 'getValidUsers').callsFake(() => {
            return (Promise.resolve({
                isError: false,
                status: 400,
                response: {
                    incomplete_results: false,
                    total_count: 0,
                    items: []
                }
            }));
        }
        );
        await userController.getUsers(req, res);
        userService.getValidUsers.restore();
    });


    it('sending username,multiple languages, per_page and failing with error code is 504 for multiple languages', async () => {
        const req = {
            query: {
                language: 'nodejscpp,nodejs',
                username: 'topcharla',
                per_page: 2
            }
        }
        const res = {
            status: (status) => {
                return {
                    send: (response) => {
                        console.log('response:', response);
                        expect(response.status).to.be.equals(504);
                    }
                };
            }
        }
        sinon.stub(userService, 'getValidUsers').callsFake(() => {
            return (Promise.resolve({
                isError: false,
                status: 504,
                response: {
                    incomplete_results: false,
                    total_count: 0,
                    items: []
                }
            }));
        }
        );
        await userController.getUsers(req, res);
        userService.getValidUsers.restore();
    })
});