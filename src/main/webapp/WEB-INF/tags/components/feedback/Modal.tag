<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="header" fragment="true" required="false" %>


<div component-id="${cid}" class="modal-component hide">
    <div class="modal-container">
        <div e-id="close-button" class="modal-container--close"></div>

        <_:Card _bind="${cid}.card">
            <jsp:attribute name="header">
                <jsp:invoke fragment="header" />
            </jsp:attribute>

            <jsp:attribute name="footer">
                <_:Button _bind="${cid}.okButton">확인</_:Button>
                <_:Button _bind="${cid}.cancelButton">취소</_:Button>
            </jsp:attribute>

            <jsp:body>
                <jsp:doBody />
            </jsp:body>
        </_:Card>
    </div>
</div>

<script type="module">
    import { newComponent } from 'component';
    import { resizeAllGrids } from 'grid';

    const component = newComponent({
        id: '${cid}',
        propsTarget: `${_bind}`,
        props() {
            return {
                show: {
                    type: Boolean,
                    default: false,
                    onInit(value) {
                        if (value) {
                            this.show();
                            return;
                        }
                        this.close();
                    },
                    onUpdate(value) {
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
                    type: String,
                },
                onOk: {
                    type: Function,
                    default: () => {},
                },
                onClose: {
                    type: Function,
                    default: () => {},
                },
            };
        },
        mounted() {
            this.refreshTitle();
            this.onClickCloseButton();
        },
        data({ state }) {
            return {

                ...state('card', {
                    title: null,
                }),

                ...state('okButton', {
                    onClick: (e) => this.ok(),
                }),

                ...state('cancelButton', {
                    type: 'normal',
                    onClick: (e) => this.close(),
                }),
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
            ok() {
                this.$props.onOk();
                this.close();
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