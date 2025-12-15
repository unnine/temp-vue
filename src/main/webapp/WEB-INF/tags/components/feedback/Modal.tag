<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_data" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="footer" fragment="true" required="false" %>

<div component-id="${cid}" class="modal-component hide">
    <div class="modal-container">
        <_:Card _data="${cid}.card">
            <jsp:attribute name="footer">
                <jsp:invoke fragment="footer" />
            </jsp:attribute>

            <jsp:body>
                <jsp:doBody />
            </jsp:body>
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
                        value ? this.show() : this.hide();
                    },
                },
                title: {
                    type: 'String',
                }
            },
        },
        mounted() {
            this.card.title = this.$props.title;
        },
        data() {
            return {
                card: {
                    title: null,
                },
            };
        },
        methods: {
            show() {
                const component = this.$find('${cid}');
                component.removeClass('hide');
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