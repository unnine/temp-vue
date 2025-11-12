const _axios = window.axios;
delete window.axios;

const axios = _axios.create({
    baseURL: `${window.location.origin}`,
    timeout: 5000,
    headers: {
        common: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Accept': 'application/json;charset=UTF-8',
        },
    },
    withCredentials: false,
});

export {
    axios
};