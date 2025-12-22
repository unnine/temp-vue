<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>


<body component-id="${cid}">
    <_:Layout>
        <_:SearchGridCard _bind="${cid}.listGrid" />

        <_:Tabs _bind="${cid}.tabs">
            <_:Tab name="tab1">
                Tab1
            </_:Tab>
            <_:Tab name="tab2">
                Tab2
            </_:Tab>
            <_:Tab name="tab3">
                Tab3
            </_:Tab>
        </_:Tabs>
<%--        <_:Modal _bind="${cid}.modal">--%>
<%--            <jsp:attribute name="header">--%>
<%--                header--%>
<%--            </jsp:attribute>--%>

<%--            <jsp:body>--%>
<%--                <_:Card _bind="${cid}.card1">--%>
<%--                    <jsp:attribute name="header">--%>
<%--                        <_:Button _bind="${cid}.card1OkButton">확인</_:Button>--%>
<%--                        <_:Button _bind="${cid}.card1CancelButton">취소</_:Button>--%>
<%--                        <_:Button _bind="${cid}.card1ErrorButton">에러</_:Button>--%>
<%--                        <_:Button _bind="${cid}.card1DisabledButton">사용불가</_:Button>--%>
<%--                    </jsp:attribute>--%>
<%--                </_:Card>--%>
<%--            </jsp:body>--%>
<%--        </_:Modal>--%>
    </_:Layout>
</body>

<script type="module">
    import { newComponent } from 'component';
    import { searchForm, columns } from '/values/main.js';

    const component = newComponent({
        id: '${cid}',
        mounted() {
            this.$request()
                .get('https://jsonplaceholder.typicode.com/albums')
                .then(({data}) => this.listGrid.$grid.setGridData(data));

            setTimeout(() => {
                this.listGrid.gridEvent.onClickButton = e => console.log('re: ' + e);
                this.listGrid.gridEvent.cellClick = e => console.log('re: ' + e);
            }, 1000);
        },
        data({ state }) {
            return {

                ...state('tabs', {
                    closeable: true,
                    tabs: [
                        { name: 'tab1', label: '시험 접수' },
                        { name: 'tab2', label: '결과 입력' },
                        { name: 'tab3', label: '일정 별 시헝 진행도 현황 파악 통계' },
                    ],
                    onChange: (value) => {
                        console.log(value);
                        console.log(this.tabs.tabs);
                    },
                }),

                ...state('listGrid', {
                    title: 'Test Grid',

                    countPerRow: 3,
                    forms: searchForm,
                    onInputForm(e) {
                        console.log(e);
                    },

                    $grid: null,
                    columns,
                    gridEvent: {
                        onCreated: (proxy) => {
                            this.listGrid.$grid = proxy;
                        },
                        onClickButton: (e) => {
                            this.listGrid.forms.validate().then(data => {
                                console.log(data);
                            });
                        },
                        cellClick: e => console.log(e),
                    },
                }),

                ...state('modal', {
                    show: false,
                    title: '123',
                    useFooter: true,
                    onClose() {
                        console.log(this);
                    },
                }),
            };
        },
        methods: {
        },
    });

</script>