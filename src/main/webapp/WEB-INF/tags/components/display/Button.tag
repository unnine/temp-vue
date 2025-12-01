<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_data" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="button-component">
    <div e-id="button" class="button-component__button">
        <button>
            <jsp:doBody />
        </button>
    </div>
</div>

<script type="module">
    import {newComponent} from 'dom';

    const component = newComponent({
        id: '${cid}',
        mounted() {
            this.$find('button').on('click', e => {
                this.$props.onClick(e);
            });
        },
        bindData: {
            target: `${_data}`,
            props: {
                type: {
                    type: 'String',
                    desc: ['normal', 'warn', 'danger',],
                    defaultValue: () => 'normal',
                    init(value) {
                        this.$find(`button`).addClass(value);
                    },
                },
                disabled: {
                    type: 'Boolean',
                    defaultValue: () => false,
                    init(value) {
                        if (value) {
                            this.$find('button').addClass('disabled');
                        }
                    },
                },
                onClick: {
                    type: 'Function',
                },
            },
        },
    });

</script>

<style>
    .button-component {
        position: relative;
    }

    .button-component__button {
        min-width: 20px;
        margin-left: 6px;
        border: 1px solid var(---color-border--light);
        border-radius: 3px;
        padding: 4px;
        cursor: pointer;
    }

    .button-component__button > button {
        position: relative;
        color: #fff;
    }

    .button-component__button.normal {
        background-color: rgb(50, 120, 210);
    }

    .button-component__button.normal:hover {
        background-color: rgb(40, 110, 200);
    }

    .button-component__button.normal:active {
        background-color: rgb(30, 100, 190);
    }

    .button-component__button.warn {
        background-color: rgb(245, 200, 90);
    }

    .button-component__button.warn:hover {
        background-color: rgb(235, 190, 80);
    }

    .button-component__button.warn:active {
        background-color: rgb(225, 180, 70);
    }

    .button-component__button.danger {
        background-color: rgb(230, 75, 75);
    }

    .button-component__button.danger:hover {
        background-color: rgb(220, 65, 65);
    }

    .button-component__button.danger:active {
        background-color: rgb(210, 55, 55);
    }

    .button-component__button.danger:disabled {
        background-color: rgba(150, 150, 150, 1);
        pointer-events: none;
    }
</style>