<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_data" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="actions" fragment="true" %>


<div component-id="${cid}" class="card-component">
    <div class="card-component__header">
        <h3 e-id="title"></h3>
    </div>

    <div class="card-component__body">
        <jsp:doBody />
    </div>

    <div class="card-component__footer">
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
                    init(value) {
                        this.$find('title').append(value);
                    },
                },
            },
        },
    });

</script>

<style>
.card-component {
    --padding: 8px 12px;

    position: relative;
    min-width: 80px;
    min-height: 80px;
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