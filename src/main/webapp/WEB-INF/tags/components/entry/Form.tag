<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<%@ attribute name="_dataName" fragment="false" required="false" type="java.lang.String" %>
<c:set var="componentId" value="${pageContext.request.requestedSessionId}-${UUID.randomUUID().toString()}"/>

<div component-id="${componentId}">
<%--    <h3 e-id="title" class="form-title"></h3>--%>
    <form e-id="form" class="form-base"></form>
</div>

<script type="module">
    import { dom } from 'dom';

    const component = dom.newComponent({
        id: '${componentId}',
        bindData: {
            name: `${_dataName}`,
            props: {
                countPerRow: {
                    type: 'Number',
                    defaultValue: 2,
                    init(value) {
                        this.$find('form').addStyle('grid-template-columns', 'repeat(' + value + ', 1fr)');
                    },
                },
                // title: {
                //     type: 'String',
                //     init(value) {
                //         this.find('title').append(value);
                //     },
                // },
                content: {
                    type: 'Array',
                    required: true,
                    defaultValue: [],
                    init(value) {
                        this.$find('form').render({
                            forms: value,
                            event: {
                                onInput: e => this.$props.onInput(e),
                            },
                        });
                    },
                    watch(newValue, oldValue) {
                        console.log(newValue, oldValue);
                    },
                },
                onInput: {
                    type: 'Function',
                },
            },
        },
    });

</script>