<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="componentId" value="${pageContext.request.requestedSessionId}-${UUID.randomUUID().toString()}"/>

<html>
<body>
    <div component-id="${componentId}">
        <_:Form _dataName="form"/>
    </div>
</body>

<script type="module">
    import { dom, FormBuilder } from 'dom';

    const component = dom.newComponent({
        id: '${componentId}',
        mounted() {
            this.$request()
                .get('https://api.restful-api.dev/objects', { a: 1 })
                .then(({ data }) => {
                    console.log(this.$data.forms[0].label);
                    this.$data.forms[0].label = data[0].name;
                    console.log(this.$data.forms[0].label);
                });
        },
        data() {
            const forms = FormBuilder.builder('form')
                .Input('sample1', '아이디1')
                .InputPassword('sample2', '비밀번호1')
                .InputNumber('sample3', '나이1')
                .Textarea('sample4', '비고1')
                .Input('sample5', '아이디2')
                .InputPassword('sample6', '비밀번호2')
                .InputNumber('sample7', '나이2')
                .Textarea('sample8', '비고2')
                .Input('sample9', '아이디3')
                .InputPassword('sample10', '비밀번호3')
                .InputNumber('sample11', '나이3')
                .Textarea('sample12', '비고3')
                .Input('sample13', '아이디4')
                .InputPassword('sample14', '비밀번호4')
                .InputNumber('sample15', '나이4')
                .Textarea('sample16', '비고4')
                .Input('sample17', '아이디5')
                .InputPassword('sample18', '비밀번호5')
                .InputNumber('sample19', '나이5')
                .Textarea('sample20', '비고5')
                .build();

            return {
                forms,
                form: {
                    countPerRow: 4,
                    // title: '테스트 폼',
                    onInput: ({ item, originEvent }) => {
                        const { data } = this.$data.form;
                        data[item.name] = originEvent.target.value;
                    },
                    data: {},
                    content: forms
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
</html>