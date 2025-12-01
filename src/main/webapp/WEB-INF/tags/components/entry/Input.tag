<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag"%>
<%@ attribute name="_data" fragment="false" required="false" type="java.lang.String" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}" />


<div component-id="${cid}">
    Input:
    <label>
        <input type="text" />
        <button e-id="ok">Input</button>
    </label>
</div>

<script type="module">
    import { newComponent } from 'dom';

    const component = newComponent({
        id: `${cid}`,
        bindData: {
            target: `${_data}`,
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
        mounted() {
            // console.log('mounted:', this);
        },
    });

    const okButton = component.find('ok').on('click', e => {
        component.$props.click(e);
    });

</script>