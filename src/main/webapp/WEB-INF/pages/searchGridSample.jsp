<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<html>
<body component-id="${cid}">
    <_:Layout>
        <_:SearchGrid _bind="${cid}.grid" />
    </_:Layout>
</body>

<script type="module">
    import {newComponent} from 'component';
    import { ColumnBuilder } from 'grid';
    import { FormBuilder } from 'form';

    const component = newComponent({
        id: '${cid}',
        data({ state }) {
            return {

                ...state('grid', {
                    countPerRow: 3,
                    forms: createForms(),
                    formEvent: {
                        onInput(e) {
                            console.log(e);
                        }
                    },

                    $grid: null,
                    onCreated(proxy) {
                        this.$grid = proxy;
                    },
                    width: '100%',
                    height: '240px',
                    columns: createColumns(),
                    props: {
                        editable: true,
                    },
                    gridEvent: {
                        onClickButton: e => {
                            alert('그리드 버튼 클릭: \n' + JSON.stringify(e, null, 2));
                        },
                    },
                    defaultData: createDefaultData(),
                }),
            };
        },
    });

    function createForms() {
        return FormBuilder.builder()
            .Input('title', '제목')
            .Select('sports', '스포츠', {
                value: 3,
                options: async () => [
                    { value: 1, label: '당구' },
                    { value: 2, label: '테니스' },
                    { value: 3, label: '골프' },
                ],
            })
            .RadioGroup('radioGroup', '음악 장르', {
                countPerRow: 3,
                groups: [
                    { checkedValue: 1, label: '팝' },
                    { checkedValue: 2, label: '재즈' },
                    { checkedValue: 3, label: '힙합' },
                ],
            })
            .CheckboxGroup('favorite', '취미', {
                value: ['music', 'song'],
                countPerRow: 4,
                groups: [
                    { checkedValue: 'music', label: '음악' },
                    { checkedValue: 'health', label: '헬스' },
                    { checkedValue: 'song', label: '노래' },
                    { checkedValue: 'drink', label: '음주' },
                ],
            })
            .Datepicker('apprDate', '결재일', {
                value: '2023-01-01',
            })
            .DatepickerRange('testPeriod', '시험 기간')
            .build();
    }

    function createColumns() {
        return ColumnBuilder.builder()
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
    }

    function createDefaultData() {
        return [{
            id: '1',
            name: '테스터',
            date: '2026-01-01',
            isReview: true,
            useYn: 'Y',
            delYn: 'Y',
            category1: 'animal',
        }];
    }

</script>
</html>

<style>
</style>