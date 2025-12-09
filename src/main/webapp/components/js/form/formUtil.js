export default {
    getData(forms) {
        return forms.reduce((acc, item) => {
            const { name, props, _$value } = item ?? {};
            const { children } = props;

            if (item.type === 'multiple' && children) {
                const childrenData = this.getData(children);
                Object.assign(acc, childrenData);
                return acc;
            }

            if (!name) {
                return acc;
            }
            if (props?.disabled) {
                return acc;
            }
            acc[name] = _$value ?? '';
            return acc;
        }, {});
    },
}