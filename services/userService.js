const config = require('../config');
const requestService = require('./requestService');
const Cache = require('../cache/cache');

const getValidUsers = async (username, language, count, pageIndex) => {
    const queryParams = {
        q: `${username}+language:${language}`,
        per_page: (count > config.githubConfig.maxUsersPerPage) ? config.githubConfig.maxUsersPerPage : (count < 1) ? config.githubConfig.minUsersPerPage : count,
        page: pageIndex || 1
    }
    const url = requestService.appendQueryParamsToUrl(config.githubConfig.githubUsersUrl, queryParams);
    console.log("url is:", url);
    const response = await requestService.get(url);
    return response;
}

const getUsersInfo = async (users) => {
    const userPromises = [];
    const cachedUsers = [];
    const cache = new Cache();
    users.forEach((user) => {
        const userCachedInfo = cache.get(user.login);
        if (userCachedInfo !== null) {
            cachedUsers.push(userCachedInfo);
            
        } else {
            userPromises.push(requestService.get(user.url));
        }
    });
    if (userPromises.length > 0) {
        const allUsersInfo = await Promise.all(userPromises);
        const usersInfo = cache.saveUsers(allUsersInfo);
        const successfulRequests = usersInfo.success;
        const failureRequests = usersInfo.error;
        let isIncomplete = false;
        let status = 200;
        if (failureRequests.length > 0) {
            isIncomplete = true;
            status = failureRequests[0].status;
        }
        return { status: status, users: cachedUsers.concat(successfulRequests), incomplete_results: isIncomplete, error: failureRequests };
    }
    return { status: 200, users: cachedUsers, incomplete_results: false, error: [] };
}

process.on('SIGINT', function () {
    console.log("signal recived clean up need to be done");
    const cache = new Cache();
    cache.reset();
    console.log("resetting the cache");
    process.exit();
});

process.on('exit', function () {
    console.log('exit message received');
    const cache = new Cache();
    cache.reset();
    console.log("resetting the cache");
    process.exit();
});

module.exports = {
    getUsersInfo,
    getValidUsers
};

