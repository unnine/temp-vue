export const objectUtil = {
    find(o, targetKey) {
        const results = [];

        const travers = (current, key, path = []) => {
            if (current == null || typeof current !== 'object') {
                return;
            }

            if (Array.isArray(current)) {
                current.forEach((el, i) => travers(el, key, [...path, i]));
                return;
            }

            Object.entries(current).forEach(([propKey, propValue]) => {
                if (targetKey === propKey) {
                    results.push({
                        data: propValue,
                        path: [...path, propKey],
                        parent: current,
                    });
                }
                travers(propValue, key, [...path, propKey]);
            });
        }

        travers(o, targetKey);
        return results;
    },

    findFirst(o, targetKey) {
      const results = this.find(o, targetKey);
      if (!results || results.length === 0) {
          return {
              data: null,
              path: [],
              parent: null,
          };
      }
      return results[0];
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
        return this.copyObject(obj, isDeep);
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

    isObject(value) {
        return value != null && !Array.isArray(value) && typeof value === 'object';
    },

    isFunction(value) {
        return value === 'function';
    },
}