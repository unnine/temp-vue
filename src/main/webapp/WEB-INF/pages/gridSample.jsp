<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<_:Layout>
    <div component-id="${cid}">
        <_:AUIGrid _bind="${cid}.listGrid" />
    </div>
</_:Layout>

<script type="module">
    import {newComponent} from 'component';
    import { ColumnBuilder } from 'grid';

    const component = newComponent({
        id: '${cid}',
        mounted() {
            this.fetchList();
        },
        data({ state }) {
            return {

                /**
                 * AUIGrid 컴포넌트의 _bind 속성으로 전달한 객체.
                 */
                ...state('listGrid', {
                    $grid: null,
                    width: '100%',
                    height: '240px',
                    columns: createColumns(),
                    props: {
                        editable: true,
                    },
                    event: {
                        onCreated: (proxy) => this.listGrid.$grid = proxy,
                        cellEditEnd: (e) => {
                            console.log(e);
                        }
                    },
                    defaultData: createDefaultData(),
                }),
            };
        },
        methods: {
            fetchList() {
                this.$request()
                    .get('https://jsonplaceholder.typicode.com/albums')
                    .then(({data}) => this.listGrid.$grid.setGridData(
                        data.map(row => ({
                            ...row,
                            date: '2026-01-01',
                            isReview: true,
                            useYn: 'Y',
                            delYn: 'Y',
                            category1: 'fruit',
                        }))
                    ));
            },
        },
    });


    function createColumns() {
        return ColumnBuilder.builder()
            .col('userId', '사용자 ID', false)
            .col('title', '제목')
            .calendar('date', '달력')
            .button('button', '이력', { label: '보기', editable: false, })
            .checkbox('isReview', '검토 여부')
            .combo('useYn', '사용 여부', {
                list: [
                    { value: 'Y', label: '사용'},
                    { value: 'N', label: '미사용'},
                ],
            })
            .combo('delYn', '삭제 여부', {
                // such as ajax
                async: async () => [
                    { value: 'Y', label: '사용'},
                    { value: 'N', label: '미사용'},
                ],
            })
            .combo('category1', '대분류', {
                async: async () => {
                    return [
                        {
                            value: 'fruit',
                            label: '과일',
                            children: [
                                {
                                    value: 't1',
                                    label: '사과',
                                    children: [
                                        { value: 'a1', label: '사과 - 상' },
                                        { value: 'a2', label: '사과 - 중' },
                                        { value: 'a3', label: '사과 - 하' },
                                    ],
                                },
                                {
                                    value: 't2',
                                    label: '배',
                                    children: [
                                        { value: 'b1', label: '배 - 상' },
                                        { value: 'b2', label: '배 - 중' },
                                        { value: 'b3', label: '배 - 하' },
                                    ],
                                },
                            ],
                        },
                        {
                            value: 'animal',
                            label: '동물',
                            children: [
                                { value: '1', label: '강아지' },
                                { value: '2', label: '고양이' },
                            ],
                        },
                    ];
                },
            })
            .combo('category2', '중분류', {
                ancestor: 'category1',
            })
            .combo('category3', '소분류', {
                ancestor: 'category2',
            })
            .build();
    }

    function createDefaultData() {
        return [{
            userId: '1',
            title: '기본 데이터',
            date: '2025-12-31',
            isReview: false,
            useYn: 'N',
            delYn: 'N',
            category1: 'animal',
        }];
    }

</script>

<style>
</style>