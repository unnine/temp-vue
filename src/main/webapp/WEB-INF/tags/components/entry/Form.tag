<%@ include file="../tag-imports.tag" %>
<%@ attribute name="_dataName" fragment="false" required="false" type="java.lang.String" %>
<c:set var="componentId" value="${pageContext.request.requestedSessionId}-${UUID.randomUUID().toString()}"/>

<form component-id="${componentId}">
    
</form>

<script type="module">
    import {dom} from 'dom';

    const component = dom.newComponent({
        id: '${componentId}',
        bindParentData: {
            name: `${_dataName}`,
            props: {
                values: {
                    type: 'Array',
                    required: true,
                    defaultValue: [],
                    init(value) {
                        console.log(value);
                    },
                    watch(newValue, oldValue) {
                        console.log(newValue, oldValue);
                    }
                }
            },
        },
    });

</script>