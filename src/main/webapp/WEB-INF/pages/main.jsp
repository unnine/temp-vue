<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>


<body component-id="${cid}">
<_:Layout>
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

    <div style="display: flex; justify-content: end; align-items: center; height: 100%;">
        <div id="datepicker1"></div>
        <div id="datepicker2"></div>
        <div id="datepicker3"></div>
        <div id="datepicker4"></div>
        <div id="datepicker5"></div>
    </div>
</_:Layout>
</body>

<script type="module">
    import {newComponent} from 'dom';
    import {FormUtil} from 'form';
    import {searchForm, columns} from '/values/main.js';

    new Datepicker('datepicker1');
    new Datepicker('datepicker2');
    new Datepicker('datepicker3');
    new Datepicker('datepicker4');
    new Datepicker('datepicker5');

    const component = newComponent({
        id: '${cid}',
        mounted() {
            this.$request()
                .get('https://jsonplaceholder.typicode.com/albums')
                .then(({data}) => {
                    this.grid.$grid.setGridData(data);
                });
        },
        data() {
            return {
                grid: {
                    $grid: null,
                    columns,
                    defaultData: [],
                    event: {
                        onCreated: (proxy) => {
                            this.grid.$grid = proxy;
                        },
                        onClickButton: (e) => {
                            const { $grid } = this.grid;
                            const data = $grid.getGridData();
                            console.log(e, data);
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
                    onInput: e => {
                        console.log('main.jsp => ', e);
                        const formData = FormUtil.getData(this.searchForm.content);
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