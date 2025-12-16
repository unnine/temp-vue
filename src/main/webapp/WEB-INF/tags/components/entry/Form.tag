<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="form-component">
    <div e-id="header" class="form-component__header hide">
        <h3 e-id="title" class="form-title"></h3>
    </div>
    <form e-id="form" class="form-base"></form>
</div>

<script type="module">
    import { newComponent } from 'component';

    const component = newComponent({
        id: '${cid}',
        propsTarget: `${_bind}`,
        props() {
            return {
                list: {
                    type: Array,
                },
                countPerRow: {
                    type: Number,
                    default: 3,
                    onInit(value) {
                        this.$find('form').setStyle('grid-template-columns', 'repeat(' + value + ', 1fr)');
                    },
                },
                title: {
                    type: String,
                    showIf: ['header'],
                    onInit(value) {
                        this.$find('title').append(value);
                    },
                },
                forms: {
                    type: Array,
                    required: true,
                    default: () => [],
                    onInit(value) {
                        this.$find('form').render({
                            forms: value,
                            event: {
                                onInput: e => this.$props.onInput(e),
                            },
                        });
                    },
                },
                onInput: {
                    type: Function,
                },
            };
        },
    });

</script>

<style>
.form-component {
    position: relative;
}

.form-component__header {
    border-bottom: 1px solid var(---color-border--light);
    padding: 10px 6px;
}
</style>