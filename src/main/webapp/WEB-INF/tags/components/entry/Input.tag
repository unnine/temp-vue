<%@ include file="../tag-imports.tag"%>
<%@ attribute name="_dataName" fragment="false" required="false" type="java.lang.String" %>
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
        mounted() {
            // console.log('mounted:', this);
        },
        bindParentData: {
            name: `${_dataName}`,
            props: {
                name: {
                    type: 'String',
                    required: true,
                    init(value) {
                        // console.log(value);
                    },
                    watch(newValue, oldValue) {
                        // console.log(newValue, oldValue);
                    },
                },
                readOnly: {
                    type: 'Boolean',
                    init() {

                    },
                    watch(newValue, oldValue) {

                    },
                },
                click: {
                    type: 'Function',
                }
            },
        },
    });

    const okButton = component.find('ok').on('click', e => {
        component.$props.click(e);
    });

</script>