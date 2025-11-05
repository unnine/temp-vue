<%@ include file="../tag-imports.tag"%>

<%@ attribute name="name" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="onClick" fragment="false" required="false" type="java.lang.String" %>

<c:set var="componentId" value="${pageContext.request.requestedSessionId}-${UUID.randomUUID().toString()}" />

<div component-id="${componentId}">
    Input:
    <label>
        <input type="text" />
        <button e-id="ok">Input</button>
    </label>
</div>

<script type="module">
    import {dom} from 'dom';

    const component = dom.newComponent({
        id: `${componentId}`,
    });

    const okButton = component.find('ok').on('click', e => {
        component.invokeParent('${onClick}', e);
    });

</script>