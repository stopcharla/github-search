const request = require('node-fetch');

/**
 * Method makes a get request for the provided url, and returns 
 * the json response.
 * @param {*} url 
 */
const get = async (url) => {
    try {
        const response = await request(url);
        const json = await response.json();
        return ({ isError: false, status: response.status, response: json });
    } catch (error) {
        console.error("error occurred:", error);
        return ({ isError: true, response: error });
    }
};

/**
 * Appends the query parameters to the provided baseurl string
 * and retuns the fully appended url.
 * @param {*} baseUrl 
 * @param {*} queryParams 
 */
const appendQueryParamsToUrl = (baseUrl, queryParams) => {
    baseUrl = baseUrl + '?';
    Object.keys(queryParams).forEach((param) => {
        baseUrl = baseUrl + param + '=' + queryParams[param] + "&";
    });
    return baseUrl.slice(0, -1);
}

module.exports = {
    get,
    appendQueryParamsToUrl
}