<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<%@ attribute name="_dataName" fragment="false" required="false" type="java.lang.String" %>
<c:set var="componentId" value="${UUID.randomUUID().toString()}"/>

<div component-id="${componentId}" class="base-toolbar-component">
    Toolbar
</div>

<script type="module">
    import {newComponent} from 'dom';

    const component = newComponent({
        id: '${componentId}',
    });

</script>

<style>
.base-toolbar-component {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>