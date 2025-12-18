<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>


<body component-id="${cid}">
    <_:Layout>
        <_:SearchGridCard _bind="${cid}.listGrid" />

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
        },
        data({ state }) {
            return {

                ...state('listGrid', {
                    title: 'Test Grid',

                    countPerRow: 3,
                    forms: searchForm,

                    $grid: null,
                    columns,
                    defaultData: [],
                    event: {
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