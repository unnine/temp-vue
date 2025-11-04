<%@ include file="../tag-imports.tag"%>

<%@ attribute name="name" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="onClick" fragment="false" required="false" type="java.lang.String" %>

<c:set var="componentId" value="${pageContext.request.requestedSessionId}-${UUID.randomUUID().toString()}" />

<div c-id="${componentId}">
    Input:
    <label>
        ${componentId}
        ${name}
        ${onClick}
        <input type="text" />
        <button c-id="ok"></button>
    </label>
</div>

<script type="module">
    import {dom} from 'dom';
    import {eventBus} from 'event';

    const component = dom.newComponent({
        id: `${componentId}`,
    });

    const okButton = component
        .button('ok')
        .on('click', e => eventBus.emit('${onClick}', e));

    okButton.click();
</script>