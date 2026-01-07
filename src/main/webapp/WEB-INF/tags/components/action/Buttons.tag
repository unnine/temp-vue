<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="button-group-component">

</div>

<script type="module">
    import { newComponent } from 'component';
    import { ButtonRenderer } from 'form';

    const component = newComponent({
        id: '${cid}',
        propsState: `${_bind}`,
        props() {
            return {
                buttons: {
                    type: Array,
                    desc: `[{
                        name: 'key',
                        label: 'display value',
                        type: 'button type',
                        disabled: 'activation flag',
                        onClick: 'on click event listener',
                    }, ...]`,
                    default: () => [],
                    onUpdate(newButtons) {
                        this.destroy();
                        this.render(newButtons);
                    },
                },
                disabled: {
                    type: Boolean,
                    default: false,
                    onInit(value) {
                        if (value) {
                            this.$find('button').addClass('disabled');
                        }
                    },
                },
                onClick: {
                    type: Function,
                },
            };
        },
        mounted() {
            this.render(this.$props.buttons);
        },
        methods: {
            render(buttons) {
                ButtonRenderer.render(this.$self._$el, buttons);
            },
            destroy() {
                ButtonRenderer.destroy(this.$self._$el);
            },
        },
    });

</script>

<style>
.button-group-component {
    display: contents;
}
</style>