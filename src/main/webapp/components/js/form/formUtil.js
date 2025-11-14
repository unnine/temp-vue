export default {
    getData(forms) {
        return forms.reduce((acc, item) => {
            const { name, _$value } = item ?? {};
            if (!name) {
                return acc;
            }
            acc[name] = _$value ?? '';
            return acc;
        }, {});
    },
}