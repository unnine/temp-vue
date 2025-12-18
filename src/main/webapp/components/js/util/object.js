export default {
    findFirstByKey(o, targetKey) {
        const _find = (current, path = []) => {
            if (current == null || typeof current !== 'object') {
                return;
            }

            if (Array.isArray(current)) {
                for (let i = 0; i < current.length; i++) {
                    const result = _find(current[i], [...path, i]);

                    if (result) {
                        return result;
                    }
                }
                return null;
            }

            for (const [propKey, propValue] of Object.entries(current)) {
                if (targetKey === propKey) {
                    return {
                        value: propValue,
                        path: [...path, propKey],
                        parent: current,
                    };
                }

                const result = _find(propValue, [...path, propKey]);

                if (result) {
                    return result;
                }
            }

            return null;
        };

        return _find(o) ?? { value: null, path: [], parent: null };
    },

    getValue(obj, path) {
        const keys = Array.isArray(path) ? path : path.split('.');
        return keys.reduce((acc, key) => {
            return acc?.[key];
        }, obj);
    },

    setValue(obj, path, value) {
        const keys = Array.isArray(path) ? path : path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current)) {
                current[key] = {};
            }
            return current[key];
        }, obj);

        target[lastKey] = value;
    },

    copy(obj, isDeep = true) {
        if (obj == null) {
            return null;
        }
        if (this.isFunction(obj)) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return this.copyArray(obj, isDeep);
        }
        if (typeof obj === 'object') {
            return this.copyObject(obj, isDeep);
        }
        return obj;
    },

    copyArray(arr, isDeep = true) {
        return arr.map((value) => {
            if (isDeep) {
                if (this.isFunction(value)) {
                    return value;

                } else if (Array.isArray(value)) {
                    return this.copyArray(value);

                } else if (this.isObject(value)) {
                    return this.copyObject(value);

                } else {
                    return value;
                }
            } else {
                return value;
            }
        });
    },

    copyObject(obj, isDeep = true) {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            if (isDeep) {
                if (Array.isArray(value)) {
                    acc[key] = this.copyArray(value);

                } else if (this.isObject(value)) {
                    acc[key] = this.copyObject(value);

                } else {
                    acc[key] = value;
                }
            } else {
                acc[key] = value;
            }
            return acc;
        }, {});
    },

    isFunction(value) {
        return typeof value === 'function';
    },

    isObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    },
}