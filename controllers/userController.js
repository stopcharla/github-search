const userService = require('../services/userService');
const config = require('../config');

/**
 * Method to obtain users for the specified username and language along with per_page and page 
 * number. This function initally fetches the search reults for the specified filter, which contains the 
 * user metadata. Then ton using the meta data it fetches the data for each user. On successful fetch of both 
 * search and users status 200 is returned.
 * 
 * If search results for a psecified language are empty the loop continues and fetches the results for next language
 * On timeout for obtaning search results for specified language, it then tries to fetch for next language
 * 
 * If no users are available for all requested languages then empty is returned with status 200
 * 
 * If the users info fetch partially fails, the method returns with a failure status code as of the user info request
 * along with the number of requests failed with same status code, its an array if a request is failed in multiple ways 
 * then all the erros are returned along with partial success responses. key "incomplete_results": true specifies
 * that the request has entirely or partially failed responses.
 * 
 * status code:504 is for request timeout
 * status code:200 is for success
 * 
 * @param {object} req 
 * @param {object} res 
 */
const getUsers = async (req, res) => {
    if (req.query.username === undefined || req.query.language === undefined) {
        res.status(404).send({ message: "username or language not specified" , status:400});
        return;
    }

    console.log('query parameters:', req.query);

    const username = req.query.username;
    const languages = req.query.language.split(',');
    const per_page = req.query.per_page || config.githubConfig.minUsersPerPage;
    const page = req.query.page || config.githubConfig.defaultPage;

    for (let i = 0; i < languages.length; i++) {
        const validUsers = await userService.getValidUsers(username, languages[i], per_page, page);
        if (validUsers.status === 200) {
            if (validUsers.response.items.length > 0) {
                const usersInfo = await userService.getUsersInfo(validUsers.response.items);
                return res.status(usersInfo.status).send(usersInfo);
            }
        } else if (validUsers.status !== 504 ) {
            console.log("get search results failed with status code:", validUsers.status);
            return res.status(validUsers.status).send(validUsers);
        }else if(validUsers.status === 504 && i === languages.length-1){
            console.log("get search results timed out fro the last langauge:", validUsers.status);
            return res.status(validUsers.status).send(validUsers);
        } if (i === languages.length - 1) {
            console.log("get search results empty for the requested langauge/languages. Sending 200");
            return res.status(200).send({
                status: 200,
                users: [],
                incomplete_results: validUsers.response.incomplete_results,
                error: [],
                total_count: validUsers.response.total_count
            });
        }
    }
}

module.exports = {
    getUsers
}