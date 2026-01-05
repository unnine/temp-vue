<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<html>
<body component-id="${cid}">
    <_:Layout>
        <_:AUIGrid _bind="${cid}.grid" />
    </_:Layout>
</body>

<script type="module">
    import {newComponent} from 'component';
    import { ColumnBuilder } from 'grid';

    const component = newComponent({
        id: '${cid}',
        data({ state }) {

            const columns = ColumnBuilder.builder()
                .col('id', '사용자 ID', false)
                .col('name', '사용자')
                .calendar('date', '달력')
                .button('button', '이력', { label: '보기' })
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
                // .combo('category1', '대분류', {
                //     descendants: ['category2'],
                //     async: async () => {
                //         return [
                //             { value: 'fruit', label: '과일'},
                //             { value: 'animal', label: '동물'},
                //         ];
                //     },
                // })
                // .combo('category2', '중분류', {
                //     descendants: ['category3'],
                //     listFunction(rowIndex, columnIndex, item, dataField) {
                //
                //     },
                // })
                // .combo('category3', '소분류', {
                //     listFunction(rowIndex, columnIndex, item, dataField) {
                //
                //     },
                // })
                .build();

            return {

                /**
                 * AUIGrid 컴포넌트의 _bind 속성으로 전달한 객체.
                 * @props https://www.auisoft.net/documentation/auigrid/DataGrid/Properties.html
                 *
                 */
                ...state('grid', {
                    onCreated(proxy) {

                    },
                    width: '100%',
                    height: '240px',
                    columns,
                    props: {
                        editable: true,
                    },
                    event: {

                    },
                    defaultData: [{
                        id: '1',
                        name: '테스터',
                        date: '2026-01-01',
                        isReview: true,
                        useYn: 'Y',
                        delYn: 'Y',
                        category1: 'animal',
                    }],
                }),
            };
        },
    });

</script>
</html>

<style>
</style>