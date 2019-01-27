const request = require('node-fetch');

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