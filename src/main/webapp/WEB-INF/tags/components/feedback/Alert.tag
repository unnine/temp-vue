<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="alert-component hide info">
    <div e-id="alert" class="alert-container">
        <div e-id="message" class="alert-container__body"></div>

        <div class="alert-container__footer">
            <_:Button _bind="${cid}.okButton">
                확인
            </_:Button>
            <_:Button _bind="${cid}.cancelButton">
                취소
            </_:Button>
        </div>
    </div>
</div>

<script type="module">
    import { newComponent } from 'component';
    import { store } from 'store';
    import consts from 'consts';

    const { GLOBAL_ALERT } = consts.store;

    const component = newComponent({
        id: '${cid}',
        propsTarget: '${_bind}',
        props() {
            return {
                onOk: {
                    type: Function,
                    default: () => {},
                },
                onCancel: {
                    type: Function,
                    default: () => {},
                },
            };
        },
        bindStore() {
            return {
                state: [GLOBAL_ALERT, ({ show }) => {
                    if (show) {
                        this.open();
                        return;
                    }
                    this.close();
                }],
            };
        },
        data({ state }) {
            return {

                ...state('okButton', {
                    onClick: () => this.ok(),
                }),

                ...state('cancelButton', {
                    show: false,
                    type: 'normal',
                    onClick: () => this.cancel(),
                }),
            };
        },
        methods: {
            open() {
                const { type, message, isConfirm } = this.state;

                if (isConfirm) {
                    this.showCancelButton();
                }

                this.$find('message').innerText(message);

                const $alert = this.$find('alert');
                $alert.removeClass('info', 'warn', 'danger')
                $alert.addClass(type);

                this.$self.show();
            },
            close() {
                this.$find('${cid}').hide();
                this.$find('message').innerText('');
                this.hideCancelButton();
            },
            ok() {
                this.close();
                store.commit(consts.store.HIDE_ALERT);
                this.$props.onOk();
            },
            cancel() {
                this.close();
                store.commit(consts.store.HIDE_ALERT);
                this.$props.onCancel();
            },
            showCancelButton() {
                this.cancelButton.show = true;
            },
            hideCancelButton() {
                this.cancelButton.show = false;
            },
        },
    });

</script>

<style>
.alert-component {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 100000;
}

.alert-container {
    position: relative;
    min-width: 160px;
    min-height: 90px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 0 2px 0 rgba(39, 110, 241, 0.9);
    border: 1px solid rgba(39, 110, 241, 0.5);
    padding: 3px;
}

.alert-container.warn {
    box-shadow: 0 0 2px 0 rgba(250, 110, 50, 1);
    border: 1px solid rgba(250, 110, 50, 0.7);
}

.alert-container.danger {
    box-shadow: 0 0 2px 0 rgba(230, 40, 0, 1);
    border: 1px solid rgba(230, 40, 0, 0.7);
}

.alert-container__body {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 60px;
    padding: 5px 10px;
}

.alert-container__footer {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 30px;
}
</style>