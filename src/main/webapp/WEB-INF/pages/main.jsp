<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>


<body component-id="${cid}">
    <_:Layout>
        <_:Vertical>
            <_:Card _data="${cid}.card1">
                <jsp:attribute name="header">
                    <_:Button _data="${cid}.card1OkButton">확인</_:Button>
                    <_:Button _data="${cid}.card1CancelButton">취소</_:Button>
                    <_:Button _data="${cid}.card1ErrorButton">에러</_:Button>
                    <_:Button _data="${cid}.card1DisabledButton">사용불가</_:Button>
                </jsp:attribute>

                <jsp:body>
                    <_:Form _data="${cid}.searchForm"/>
                    <_:AUIGrid _data="${cid}.grid"/>
                </jsp:body>
            </_:Card>

            <_:Card>
                카드2
            </_:Card>

            <_:Modal _data="${cid}.modal">
                <jsp:attribute name="footer">
                    <_:Button _data="${cid}.card1OkButton">확인</_:Button>
                    <_:Button _data="${cid}.card1CancelButton">취소</_:Button>
                </jsp:attribute>

                <jsp:body>
                    <_:Card _data="${cid}.card1">
                        <jsp:attribute name="header">
                            <_:Button _data="${cid}.card1OkButton">확인</_:Button>
                            <_:Button _data="${cid}.card1CancelButton">취소</_:Button>
                            <_:Button _data="${cid}.card1ErrorButton">에러</_:Button>
                            <_:Button _data="${cid}.card1DisabledButton">사용불가</_:Button>
                        </jsp:attribute>

                        <jsp:body>
                            <_:Form _data="${cid}.searchForm"/>
                            <_:AUIGrid _data="${cid}.grid2"/>
                        </jsp:body>
                    </_:Card>
                </jsp:body>
            </_:Modal>
        </_:Vertical>
    </_:Layout>
</body>

<script type="module">
    import {newComponent} from 'dom';
    import {FormUtil} from 'form';
    import {searchForm, columns} from '/values/main.js';

    const component = newComponent({
        id: '${cid}',
        mounted() {
            this.$request()
                .get('https://jsonplaceholder.typicode.com/albums')
                .then(({data}) => this.grid.$grid.setGridData(data));
        },
        data() {
            return {
                modal: {
                    show: false,
                    title: '123',
                },
                grid: {
                    $grid: null,
                    columns,
                    defaultData: [],
                    event: {
                        onCreated: (proxy) => {
                            this.grid.$grid = proxy;
                        },
                        onClickButton: (e) => {
                            this.searchForm.content.validate().then(e => console.log('then', e))
                                .catch(e => console.log('catch', e));
                            const { $grid } = this.grid;
                            const data = $grid.getGridData();
                            // console.log(e, data);
                        },
                        cellClick: e => console.log(e),
                    },
                },
                grid2: {
                    $grid: null,
                    columns,
                    defaultData: [],
                    event: {
                        onCreated: (proxy) => {
                            this.grid.$grid = proxy;
                        },
                        onClickButton: (e) => {
                            this.searchForm.content.validate().then(e => console.log('then', e))
                                .catch(e => console.log('catch', e));
                            const { $grid } = this.grid;
                            const data = $grid.getGridData();
                            // console.log(e, data);
                        },
                        cellClick: e => console.log(e),
                    },
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
                    countPerRow: 3,
                    title: '',
                    onInput: () => {
                        const formData = FormUtil.getData(this.searchForm.content);
                        console.log(formData);
                        console.log(this.modal);
                        this.modal.show = true;
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