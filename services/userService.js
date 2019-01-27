const config = require('../config');
const requestService = require('./requestService');
const Cache = require('../cache/cache');

/**
 * Fetches all valid users for the specifed filters provided in the arguments
 * Initally the method gets all the filters appended to the baseurl followed by 
 * requesting a http get call to obtain the users meta data for the search query
 * @param {string} username 
 * @param {string} language 
 * @param {number} count 
 * @param {number} pageIndex 
 */
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

/**
 * To fetch the users info provided in the argument, for each user the method cheks if 
 * data is available in the cache if yes then the data is fetched and stored to a partial array 
 * else then the data is fetched from the http api.
 * 
 * All the responses received from http api are then saved to the cache by checking their valid status codes
 * if a error is occured in the responses. Those error objects are als well retuned.
 * @param {Array} users 
 */
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

/**
 * on click of Ctrl+C the event is captured and the cache is cleaned up
 * then the process is exited
 */
process.on('SIGINT', function () {
    console.log("signal recived clean up need to be done");
    const cache = new Cache();
    cache.reset();
    console.log("resetting the cache");
    process.exit();
});

/**
 * On exit as well we try to flush all the cache entries
 */
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

