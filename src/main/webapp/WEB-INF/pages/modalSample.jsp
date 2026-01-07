<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<html>
<body>
<_:Layout>
    <div component-id="${cid}">
    </div>
</_:Layout>
</body>

<script type="module">
    import {newComponent} from 'component';

    const component = newComponent({
        id: '${cid}',
        data({state}) {
            return {};
        },
    });

</script>
</html>

<style>
</style>