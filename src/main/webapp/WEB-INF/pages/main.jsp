<c:set var="componentId" value="${pageContext.request.requestedSessionId}-${UUID.randomUUID().toString()}" />

<html>
<head>
    <title>Title</title>
</head>
<body>
    <div c-id="${componentId}">
        <_:Input name="qwdqwd345435" onClick="clicker" />
    </div>
</body>
<script type="module">
    import { dom } from 'dom';
    import { eventBus } from 'event';

    dom.newComponent({
        id: '${componentId}',
        methods: {
          clicker(e) {
              console.log(e);
          }
        },
    });
</script>
</html>
