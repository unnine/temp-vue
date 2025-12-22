<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="button-component hide">
    <div e-id="button" class="button-component__button">
        <button>
            <jsp:doBody />
        </button>
    </div>
</div>

<script type="module">
    import {newComponent} from 'component';

    const component = newComponent({
        id: '${cid}',
        propsState: `${_bind}`,
        props() {
            return {
                type: {
                    type: String,
                    desc: ['primary', 'normal', 'warn', 'danger',],
                    default: 'primary',
                    onInit(value) {
                        this.$find(`button`).addClass(value);
                    },
                },
                show: {
                    type: Boolean,
                    default: true,
                    watch(value) {
                        if (value) {
                            this.$self.show();
                            return;
                        }
                        this.$self.hide();
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
            this.$find('button').on('click', e => {
                this.$props.onClick(e);
            });
        },
    });

</script>

<style>
.button-component {
    position: relative;
}

.button-component__button {
    min-width: 20px;
    min-height: 18px;
    margin-left: 4px;
    border: 1px solid var(---color-border--light);
    border-radius: 3px;
    padding: 4px 5px;
    cursor: pointer;
}

.button-component__button > button {
    font-size: 0.96rem;
}

.button-component__button > button {
    position: relative;
    color: #fff;
}

.button-component__button.primary {
    background-color: var(---color-button-primary);
}

.button-component__button.primary:hover {
    background-color: var(---color-button-primary--hover);
}

.button-component__button.primary:active {
    background-color: var(---color-button-primary--active);
}

.button-component__button.normal {
    background-color: rgb(180, 180, 180);
}

.button-component__button.normal:hover {
    background-color: rgb(174, 174, 174);
}

.button-component__button.normal:active {
    background-color: rgb(168, 168, 168);
}

.button-component__button.warn {
    background-color: rgb(245, 200, 90);
}

.button-component__button.warn:hover {
    background-color: rgb(239, 194, 84);
}

.button-component__button.warn:active {
    background-color: rgb(233, 188, 78);
}

.button-component__button.danger {
    background-color: rgb(230, 75, 75);
}

.button-component__button.danger:hover {
    background-color: rgb(224, 69, 69);
}

.button-component__button.danger:active {
    background-color: rgb(218, 63, 63);
}

.button-component__button.disabled {
    background-color: rgb(150, 150, 150);
    pointer-events: none;
}
</style>