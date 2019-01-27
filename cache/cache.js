const cache = require('lru-cache-node');
const config = require('../config');

class Cache {
    constructor() {
        if (typeof Cache.instance === 'object') {
            return Cache.instance;
        }
        this.cache = new cache(config.cacheConfig.maxEntries, config.cacheConfig.TTL);
        Cache.instance = this;
        return this;
    }

    get(key) {
        return this.cache.get(key);
    }

    getAllEntries() {
        return this.cache.toArray();
    }

    reset() {
        this.cache.reset();
    }

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

