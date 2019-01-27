module.exports = {
    githubConfig: {
        githubUsersUrl: 'https://api.github.com/search/users',
        maxUsersPerPage: 59,
        minUsersPerPage: 20,
        defaultPage: 1
    },
    cacheConfig: {
        maxEntries: 10000,
        TTL: 1000*60*60
    }
};