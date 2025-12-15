<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_data" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="header" fragment="true" required="false" %>


<div component-id="${cid}" class="modal-component hide">
    <div class="modal-container">
        <div e-id="close-button" class="modal-container--close"></div>

        <_:Card _data="${cid}.card">
            <jsp:attribute name="header">
                <jsp:invoke fragment="header" />
            </jsp:attribute>

            <jsp:attribute name="footer">
                <_:Button _data="${cid}.okButton">확인</_:Button>
                <_:Button _data="${cid}.cancelButton">취소</_:Button>
            </jsp:attribute>

            <jsp:body>
                <jsp:doBody />
            </jsp:body>
        </_:Card>
    </div>
</div>

<script type="module">
    import { newComponent } from 'dom';
    import { resizeAllGrids } from 'grid';

    const component = newComponent({
        id: '${cid}',
        bindData: {
            target: `${_data}`,
            props: {
                show: {
                    type: 'Boolean',
                    default: false,
                    init(value) {
                        if (value) {
                            this.show();
                            return;
                        }
                        this.close();
                    },
                    watch(value) {
                        if (value) {
                            this.show();
                            this.refreshTitle();
                            resizeAllGrids();
                            return;
                        }
                        this.close();
                    },
                },
                title: {
                    type: 'String',
                },
                onClose: {
                    type: 'Function',
                    default: () => {},
                },
            },
        },
        mounted() {
            this.refreshTitle();
            this.onClickCloseButton();
        },
        data() {
            return {
                card: {
                    title: null,
                },
                okButton: {
                    onClick(e) {
                        console.log(e);
                    },
                },
                cancelButton: {
                    type: 'normal',
                    onClick(e) {
                        console.log(e);
                    },
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
            close() {
                this.hide();
                this.$props.show = false;
                this.$props.onClose();
            },
            onClickCloseButton() {
                this.$find('close-button').on('click', () => this.close());
            },
            refreshTitle() {
                this.card.title = this.$props.title;
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
    z-index: 100000;
}

.modal-container {
    position: relative;
    min-width: 120px;
    max-width: 80%;
    min-height: 60px;
    max-height: 80%;
    background-color: transparent;
}

.modal-container--close {
    position: absolute;
    width: 20px;
    height: 20px;
    top: -8px;
    right: 12px;
}

.modal-container--close:before {
    position: absolute;
    content: '';
    width: 20px;
    height: 20px;
    top: -8px;
    right: 5px;
    border-right: 1px solid #fff;
    transform: rotate(45deg);
    cursor: pointer;
}

.modal-container--close:after {
    position: absolute;
    content: '';
    width: 20px;
    height: 20px;
    top: -8px;
    right: -9px;
    border-bottom: 1px solid #fff;
    transform: rotate(45deg);
    cursor: pointer;
}
</style>