<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<_:Layout>
    <div component-id="${cid}">
    </div>
</_:Layout>

<script type="module">
    import {newComponent} from 'component';

    const component = newComponent({
        id: '${cid}',
        data({state}) {
            return {};
        },
    });

</script>

<style>
</style>