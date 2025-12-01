<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>


<body component-id="${cid}">
    <_:Layout>
        <_:Card _data="${cid}.card1">
            <jsp:attribute name="actions">
                <_:Button _data="${cid}.card1OkButton">확인</_:Button>
                <_:Button _data="${cid}.card1CancelButton">취소</_:Button>
                <_:Button _data="${cid}.card1ErrorButton">에러</_:Button>
                <_:Button _data="${cid}.card1DisabledButton">사용불가</_:Button>
            </jsp:attribute>

            <jsp:body>
                <_:Form _data="${cid}.searchForm" />
                <_:AUIGrid _data="${cid}.grid" />
            </jsp:body>
        </_:Card>

        <_:Card>
            카드2
        </_:Card>
    </_:Layout>
</body>

<script type="module">
    import { newComponent } from 'dom';
    import { FormUtil } from 'form';
    import { searchForm } from '/values/main.js';

    const component = newComponent({
        id: '${cid}',
        mounted() {
            this.$request()
                .get('https://jsonplaceholder.typicode.com/albums')
                .then(({ data }) => {
                    this.$data.searchForm.content[0].label = data[0].title;
                    this.$data.searchForm.list = data;
                });
        },
        data() {
            return {
                grid: {

                },
                card1: {
                    title: 'Card - 1',

                },
                card1OkButton: {
                    onClick(e) {
                        console.log('ok');
                    },
                },
                card1CancelButton: {
                    type: 'warn',
                    onClick(e) {
                        console.log('cancel');
                    },
                },
                card1ErrorButton: {
                    type: 'danger',
                    onClick(e) {
                        console.log('error');
                    },
                },
                card1DisabledButton: {
                    disabled: true,
                    onClick(e) {
                        console.log('never');
                    },
                },
                searchForm: {
                    countPerRow: 4,
                    title: '',
                    onInput: e => {
                        const formData = FormUtil.getData(this.$data.searchForm.content);
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