import { axios } from "./axios.js";

const convertToQueryString = (param) => {
    if (!param) {
        return '';
    }
    return encodeURI(
        `?${Object.entries(param)
            .filter(([key, value]) => value != null)
            .map(([key, value]) => `${key}=${value}`)
            .join('&')}`,
    );
};

class Ajax {
    #config = {};

    constructor(config) {
        if (config && typeof config === "object") {
            this.#config = config;
        }
    }

    get(url, data) {
        return axios.get(`${url}${convertToQueryString(data)}`, this.#config);
    }

    post(url, data) {
        return axios.post(url, data, this.#config);
    }

    put(url, data) {
        return axios.put(url, data, this.#config);
    }

    patch(url, data) {
        return axios.patch(url, data, this.#config);
    }

    delete(url, data) {
        return axios.get(`${url}${convertToQueryString(data)}`, this.#config);
    }
}

const request = (config) => {
    return new Ajax(config);
}

export {
    request
}