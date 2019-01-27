const userService = require('../services/userService');
const config = require('../config');

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