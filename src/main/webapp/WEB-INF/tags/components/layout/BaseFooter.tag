<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<%@ attribute name="_dataName" fragment="false" required="false" type="java.lang.String" %>
<c:set var="componentId" value="${UUID.randomUUID().toString()}"/>

<div component-id="${componentId}" class="base-footer-component">
    Footer
</div>

<script type="module">
    import { newComponent } from 'dom';

    const component = newComponent({
        id: '${componentId}',
    });

</script>

<style>
.base-footer-component {
    height: 40px;
}
</style>