<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_data" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="modal-component hide">
    <div class="modal-container">
        <_:Card>
            <jsp:doBody />
        </_:Card>
    </div>
</div>

<script type="module">
    import {newComponent} from 'dom';

    const component = newComponent({
        id: '${cid}',
        bindData: {
            target: `${_data}`,
            props: {
                show: {
                    type: 'Boolean',
                    default: false,
                    init(value) {
                        value ? this.show() : this.hide();
                    },
                    watch(value) {
                        console.log(value);
                        value ? this.show() : this.hide();
                    },
                }
            },
        },
        methods: {
            show() {
                const component = this.$find('${cid}');
                component.removeClass('hide');
                // this.drawBackground();
                // this.drawContent();
            },
            drawBackground() {
                // const modalBg = this.$find('modal-bg');
                // const clone = modalBg._$el.cloneNode(true);
                // document.body.insertAdjacentElement('beforebegin', clone);
            },
            drawContent() {

            },

            hide() {
                const component = this.$find('${cid}');
                component.addClass('hide');
            },
        },
    });

</script>

<style>
.modal-component {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.2);
}

.modal-container {
    position: relative;
    min-width: 120px;
    max-width: 80%;
    min-height: 60px;
    max-height: 80%;
    background-color: transparent;
}
</style>