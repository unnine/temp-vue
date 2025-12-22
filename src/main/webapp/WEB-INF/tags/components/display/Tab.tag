<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="name" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" data-name="${name}" class="tab-component">
    <jsp:doBody />
</div>

<script type="module">
    import { newComponent } from 'component';

    const component = newComponent({
        id: '${cid}',
        propsState: `${_bind}`,
    });

</script>

<style>
</style>