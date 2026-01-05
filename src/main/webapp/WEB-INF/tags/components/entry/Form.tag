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
        propsState: `${_bind}`,
        props() {
            return {
                list: {
                    type: Array,
                },
                countPerRow: {
                    type: Number,
                    default: 3,
                    watch(value) {
                        this.$find('form').setStyle({
                            gridTemplateColumns: 'repeat(' + value + ', 1fr)',
                        });
                    },
                },
                title: {
                    type: String,
                    showIf: ['header'],
                    watch(value) {
                        this.$find('title').append(value);
                    },
                },
                forms: {
                    type: Array,
                    required: true,
                    default: () => [],
                    watch(value) {
                        this.$find('form').render({
                            forms: value,
                            event: {
                                onInput: e => {
                                    this.onInput(e);
                                },
                                onClickButton: e => {
                                    this.onClickButton(e);
                                },
                            },
                        });
                    },
                },
                event: {
                    type: Object,
                    default: () => ({}),
                },
            };
        },
        methods: {
            onInput(e) {
                const { onInput } = this.$props.event;

                if (onInput) {
                    onInput(e);
                }
            },
            onClickButton(e) {
                const { onClickButton } = this.$props.event;

                if (onClickButton) {
                    onClickButton(e);
                }
            }
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