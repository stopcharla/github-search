const cache = require('lru-cache-node');
const config = require('../config');

class Cache {
    /**
     * retuns a singleton object. As the instance once sreated is stored in static variable
     * This is used as many times a new object is created method retuns a single instance of the class
     */
    constructor() {
        if (typeof Cache.instance === 'object') {
            return Cache.instance;
        }
        this.cache = new cache(config.cacheConfig.maxEntries, config.cacheConfig.TTL);
        Cache.instance = this;
        return this;
    }

    /**
     * Retuns the cached entry for the key is a entry exists else retuns null
     * @param {string} key 
     */
    get(key) {
        return this.cache.get(key);
    }

    /**
     * Retuns an array of all entries so far in the cache
     */
    getAllEntries() {
        return this.cache.toArray();
    }

    /**
     * Removes all the entries from the cache
     */
    reset() {
        this.cache.reset();
    }

    /**
     * Saves all the users info to the cache whose request are retuned with a 200 response, else all other error responses
     * are captured and retuned back along with successful entries and the failure objects along with their failed messages
     * @param {Array} users 
     */
    saveUsers(users) {
        const successUsersInfo = [];
        const failedInfo = {};
        users.forEach((user) => {
            if (user.status === 200) {
                this.cache.set(user.response.login, user.response);
                successUsersInfo.push(user.response);
            }else{
                if(failedInfo[user.status] === undefined){
                    let responseBody = user.response;
                    responseBody.requestCount = 1;
                    responseBody.status = user.status;
                    failedInfo[user.status] = responseBody;
                }else{
                    failedInfo[user.status].requestCount = failedInfo[user.status].requestCount+1;
                }
            }
        });
        const failedRequests = Object.keys(failedInfo).map((key) =>  failedInfo[key]);
        return {success: successUsersInfo, error: failedRequests};
    }
}

module.exports = Cache;

