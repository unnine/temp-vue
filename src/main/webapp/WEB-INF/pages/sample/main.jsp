<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>


<body>
    <_:Layout>
        Main
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