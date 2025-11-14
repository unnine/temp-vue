export default {
    traverse(o, handler, path = []) {
        Object.entries(o).forEach(([key, value]) => {
           if (typeof value !== 'object') {
               handler(key, value, path);
               return;
           }
           if (Array.isArray(value)) {
               value.forEach((el, i) => this.traverse(el, handler, [...path, key, i]));
               return;
           }
           this.traverse(value, handler, [...path, key]);
        });
    },
    find(o, target) {
        const results = [];

        if (o === target) {
            results.push({
                data: o,
                path: [],
                parent: null,
            });
            return results;
        }

        const _find = (current, _target, path = []) => {
            if (current == null || typeof current !== 'object') {
                return;
            }
            if (Array.isArray(current)) {
                current.forEach((el, i) => {
                    if (target === el) {
                        results.push({
                            data: el,
                            path: [...path, i],
                            parent: current,
                        });
                    }
                    _find(el, _target, [...path, i])
                });
                return;
            }

            Object.entries(current).forEach(([propKey, propValue]) => {
                if (target === propValue) {
                    results.push({
                        data: propValue,
                        path: [...path, propKey],
                        parent: current,
                    });
                }
                _find(propValue, _target, [...path, propKey]);
            });
        }

        _find(o, target);
        return results;
    },
    findFirst(o, target) {
        const results = this.find(o, target);
        if (!results || results.length === 0) {
            return {
                data: null,
                path: [],
                parent: null,
            };
        }
        return results[0];
    },
    findByKey(o, targetKey) {
        const results = [];

        const _find = (current, key, path = []) => {
            if (current == null || typeof current !== 'object') {
                return;
            }
            if (Array.isArray(current)) {
                current.forEach((el, i) => _find(el, key, [...path, i]));
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
                _find(propValue, key, [...path, propKey]);
            });
        }

        _find(o, targetKey);
        return results;
    },

    findFirstByKey(o, targetKey) {
      const results = this.findByKey(o, targetKey);
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

    isObject(value) {
        return value != null && !Array.isArray(value) && typeof value === 'object';
    },

    isFunction(value) {
        return value === 'function';
    },
}