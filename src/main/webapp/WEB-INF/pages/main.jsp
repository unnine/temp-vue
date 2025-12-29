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
    </_:Layout>
</body>

<script type="module">
    import { newComponent } from 'component';
    import { searchForm, columns } from '/values/main.js';
    import { FormUtil } from 'form';

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
                }),

                ...state('listGrid', {
                    title: 'Test Grid',

                    countPerRow: 3,
                    forms: searchForm,
                    formEvent: {
                        onInput: (e) => {
                            console.log(e);
                        },
                        onClickButton: (e) => {
                            // this.$danger('qwd');
                            this.$confirm('qwd');
                        },
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
            };
        },
        methods: {
        },
    });

</script>