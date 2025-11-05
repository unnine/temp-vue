<c:set var="componentId" value="${pageContext.request.requestedSessionId}-${UUID.randomUUID().toString()}"/>

<html>

<head>
    <title>Title</title>
</head>

<body>
    <div component-id="${componentId}">
        <_:Input name="name1" onClick="onClickHandler1"/>
        <_:Input name="name2" onClick="onClickHandler2"/>

        <button c-id="ok">Main</button>

        <form e-id="form">
            <input type="text" name="a" value="1" />
            <input type="password" name="b" value="2" />
            <input type="hidden" name="c" value="3" />
            <input type="checkbox" name="d" value="apple" checked />
            <input type="checkbox" name="d" value="watermelon" checked />
            <textarea name="e" >5</textarea>
        </form>
    </div>
</body>

<script type="module">
    import {dom} from 'dom';

    const component = dom.newComponent({
        id: '${componentId}',
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

    console.log(component);

    const form = component.form('form');
    console.log(form.toJson());

    form.setValue('c', 111);
    form.setValue('e', 555);
    console.log(form.toJson());

    form.clear();
    console.log(form.toJson());

</script>
</html>