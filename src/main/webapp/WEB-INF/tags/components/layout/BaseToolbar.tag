<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>

<div component-id="${cid}" class="base-toolbar-component">

</div>

<script type="module">
    import {newComponent} from 'component';

    const component = newComponent({
        id: '${cid}',
    });

</script>

<style>
.base-toolbar-component {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>