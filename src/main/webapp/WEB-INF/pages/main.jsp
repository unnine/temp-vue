<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<body component-id="${cid}">
    <_:Layout>
        <_:Card _data="${cid}.card1">
            <jsp:attribute name="actions">
                <_:Button _data="${cid}.card1CancelButton">확인</_:Button>
                <_:Button _data="${cid}.card1OkButton">취소</_:Button>
            </jsp:attribute>

            <jsp:body>
                qwdqd222
            </jsp:body>
        </_:Card>

        <_:Card>
            카드2
        </_:Card>
    </_:Layout>
</body>

<script type="module">
    import { newComponent } from 'dom';
    import { FormBuilder, FormUtil } from 'form';
    import { searchForm } from '/values/main.js';

    const component = newComponent({
        id: '${cid}',
        mounted() {
            setTimeout(() => this.$data.form.title ='테스트 폼', 1000);

            this.$request()
                .get('https://jsonplaceholder.typicode.com/albums')
                .then(({ data }) => {
                    this.$data.form.content[0].label = data[0].title;
                    this.$data.form.list = data;
                });
        },
        data() {
            return {
                card1: {
                    title: 'Card - 1',

                },
                card1OkButton: {
                    onClick(e) {
                        console.log('ok');
                    },
                },
                card1CancelButton: {
                    onClick(e) {
                        console.log('cancel');
                    },
                },
                form: {
                    countPerRow: 4,
                    title: '',
                    onInput: ({ item, originEvent }) => {
                        const { data } = this.$data.form;
                        data[item.name] = originEvent.target.value;

                        const formData = FormUtil.getData(this.$data.form.content);
                        console.log(formData);
                    },
                    list: [],
                    content: searchForm,
                },
            };
        },
        methods: {
            onClickHandler1(e) {
                console.log(`handler1: ${e}`, this);
            },
            onClickHandler2(e) {
                console.log(`handler2: ${e}`, this);
            },
            clicker1(e) {
                console.log(e);
            },
            clicker2(e) {
                console.log(`name2: ${e}`);
            }
        },
    });

</script>