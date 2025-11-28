<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_data" fragment="false" required="false" type="java.lang.String" %>

<div component-id="${cid}" class="base-footer-component">
    Footer
</div>

<script type="module">
    import { newComponent } from 'dom';

    const component = newComponent({
        id: '${cid}',
    });

</script>

<style>
.base-footer-component {
    height: 40px;
}
</style>