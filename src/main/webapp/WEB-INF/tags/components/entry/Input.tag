<%@ include file="../tag-imports.tag"%>

<%@ attribute name="name" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="_props" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="onClick" fragment="false" required="false" type="java.lang.String" %>

<c:set var="componentId" value="${pageContext.request.requestedSessionId}-${UUID.randomUUID().toString()}" />

<div component-id="${componentId}">
    Input:
    <label>
        ${_bind}
        <input type="text" />
        <button e-id="ok">Input</button>
    </label>
</div>

<script type="module">
    import {dom} from 'dom';

    const component = dom.newComponent({
        id: `${componentId}`,
        mounted() {
            // console.log('mounted:', this);
        },
        bindParentData: {
            name: `${_props}`,
            props: {
                name: {
                    type: 'String',
                    required: true,
                    watch(newValue, oldValue) {
                        console.log(newValue, oldValue);
                    },
                },
            },
        },
    });

    // console.log('input', component);

    <%--const okButton = component.find('ok').on('click', e => {--%>
    <%--    component.invokeParent('${onClick}', e);--%>
    <%--});--%>

    const okButton = component.find('ok').on('click', e => {
        // component.props.onClick(e);
        // component.invokeParent(component.props.onClick, e);
    });

</script>