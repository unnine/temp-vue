<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_data" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="actions" fragment="true" required="false" %>


<div component-id="${cid}" class="card-component">
    <div e-id="header" class="card-component__header hide">
        <h3 e-id="title"></h3>
    </div>

    <div class="card-component__body">
        <jsp:doBody />
    </div>

    <div e-id="footer" class="card-component__footer hide">
        <div e-id="actions" class="card-component__actions">
            <jsp:invoke fragment="actions" />
        </div>
    </div>
</div>

<script type="module">
    import {newComponent} from 'dom';

    const component = newComponent({
        id: '${cid}',
        bindData: {
            target: `${_data}`,
            props: {
                title: {
                    type: 'String',
                    showIf: ['header'],
                    init(value) {
                        this.$find('title').append(value);
                    },
                },
            },
        },
        mounted() {
            this.initializeFooter();
        },
        methods: {
            initializeFooter() {
                this.$find('footer').showIf(() => this.$find('actions').isNotEmpty());
            },
        },
    });

</script>

<style>
.card-component {
    --padding: 8px 12px;

    position: relative;
    background: #fff;
    box-shadow: var(---box-shadow-base);
    border-radius: 2px;
    margin: 12px;
}

.card-component__header {
    border-bottom: 1px solid var(---color-border--light);
    padding: var(--padding);
}

.card-component__body {
    padding: var(--padding);
}

.card-component__footer {
    border-top: 1px solid var(---color-border--light);
    padding: var(--padding);
}

.card-component__actions {
    display: flex;
    justify-content: flex-end;
}
</style>