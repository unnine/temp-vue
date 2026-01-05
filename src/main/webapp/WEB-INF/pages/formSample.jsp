<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<html>
<body component-id="${cid}">
    <_:Layout>
        <_:Form _bind="${cid}.form" />
    </_:Layout>
</body>

<script type="module">
    import { newComponent } from 'component';
    import { FormBuilder } from 'form';

    const component = newComponent({
        id: '${cid}',
        data({ state }) {

            return {

                ...state('form', {
                    countPerRow: 3,
                    forms: createForms(),
                    event: {

                    },
                }),
            };
        },
    });


    function createForms() {
        return FormBuilder.builder()
            .Input('title', '제목')
            .InputNumber('age', '나이')
            .InputPassword('password', '비밀번호')
            .InputFile('file', '파일')
            .Textarea('etc', '비고', { rows: 3 })
            .Select('type', '분류', {
                value: 2,
                options: [
                    { value: 1, label: '텍스트' },
                    { value: 2, label: '이미지' },
                    { value: 3, label: '동영상' },
                ]
            })
            .Select('sports', '스포츠', {
                value: 3,
                options: async () => [
                    { value: 1, label: '당구' },
                    { value: 2, label: '테니스' },
                    { value: 3, label: '골프' },
                ],
            })
            .Button('view', '이력', { label: '보기' })
            .Blank()
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
            .Label('a', '단순 제목')
            .TextView('text', '단순 텍스트', { value: 'readonly text' })
            .Datepicker('apprDate', '결재일')
            .DatepickerRange('testPeriod', '시험 기간')
            .DatepickerToggle('reqDate', '의뢰일자', {
                value: '2024-02-02',
                checked: true,
            })
            .DatepickerRangeToggle('searchPeriod', '검색 기간')
            .build();
    }


</script>
</html>

<style>
</style>