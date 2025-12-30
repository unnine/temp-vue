<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="exchange-panel-component">
    <div e-id="panel" class="exchange-panel-component__wrapper">
        <div class="exchange-panel-component__item">
            <div class="exchange-panel-component__button-wrap">
                <div e-id="firstButton" class="exchange-panel-component__button down"></div>
            </div>
        </div>

        <div class="exchange-panel-component__item">
            <div class="exchange-panel-component__button-wrap">
                <div e-id="secondButton" class="exchange-panel-component__button up"></div>
            </div>
        </div>
    </div>
</div>

<script type="module">
    import { newComponent } from 'component';

    const component = newComponent({
        id: '${cid}',
        propsState: `${_bind}`,
        props() {
            return {
                vertical: {
                    type: Boolean,
                    default: false,
                    onInit(v) {
                        if (v) {
                            this.initVertical();
                        }
                    },
                },
                onClickDownRight: {
                    type: Function,
                    default: () => {},
                },
                onClickUpLeft: {
                    type: Function,
                    default: () => {},
                },
            };
        },
        mounted() {
            this.$find('firstButton').on('click', this.$props.onClickDownRight);
            this.$find('secondButton').on('click', this.$props.onClickUpLeft);
        },
        destroy() {
            this.$find('firstButton').clear();
            this.$find('secondButton').clear();
        },
        methods: {
            initVertical() {
                this.$find('panel')
                    .addClass('vertical');

                this.$find('firstButton')
                    .removeClass('down')
                    .addClass('right');

                this.$find('secondButton')
                    .removeClass('up')
                    .addClass('left');
            },
        },
    });

</script>

<style>
.exchange-panel-component {
    display: contents;
}

.exchange-panel-component__wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6%;
    width: 100%;
    height: 80px;
}

.exchange-panel-component__wrapper.vertical {
    flex-direction: column;
    width: 80px;
    height: auto;
    min-height: 180px;
}

.exchange-panel-component__item {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 15px;
    margin-bottom: 15px;
}

.exchange-panel-component__button-wrap {
    cursor: pointer;
    position: relative;
    box-sizing: border-box;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0 1px 2px 0 rgb(160, 160, 160);
    transition: 0.3s;
}

.exchange-panel-component__button-wrap:hover {
    background-color: rgb(39, 110, 241);
}

.exchange-panel-component__button-wrap:hover .exchange-panel-component__button {
    border-color: rgb(255, 255, 255);
}

.exchange-panel-component__button-wrap:hover .exchange-panel-component__button::after {
    background-color: #fff;
}

.exchange-panel-component__button {
    position: relative;
    box-sizing: border-box;
    width: 16px;
    height: 16px;
    border-top: 2px solid var(---color-button-primary);
    border-right: 2px solid var(---color-button-primary);
}

.exchange-panel-component__button::after {
    content: '';
    position: absolute;
    width: 23px;
    height: 2px;
    background-color: var(---color-button-primary);
    transform: rotate(-45deg);
    top: 7px;
    left: -5px;
}

.exchange-panel-component__button.up {
    transform: rotate(-45deg);
    top: 14px;
    left: 15px;
}

.exchange-panel-component__button.left {
    transform: rotate(225deg);
    top: 15px;
    left: 14px;
}

.exchange-panel-component__button.down {
    transform: rotate(135deg);
    top: 16px;
    left: 15px;
}

.exchange-panel-component__button.right {
    transform: rotate(45deg);
    top: 15px;
    left: 16px;
}
</style>