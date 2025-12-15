<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_data" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="header" fragment="true" required="false" %>
<%@ attribute name="footer" fragment="true" required="false" %>


<div component-id="${cid}" class="card-component">
    <div e-id="header" class="card-component__header hide">
        <div>
            <h3 e-id="title"></h3>
        </div>

        <div e-id="headerActions" class="card-component__header-actions">
            <jsp:invoke fragment="header" />
        </div>
    </div>

    <div class="card-component__body">
        <jsp:doBody />
    </div>

    <div e-id="footer" class="card-component__footer hide">
        <div e-id="footerActions" class="card-component__footer-actions">
            <jsp:invoke fragment="footer" />
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
                        this.$find('title').innerText(value);
                        this.toggleHeader();
                    },
                    watch(value) {
                        this.$find('title').innerText(value);
                        this.toggleHeader();
                    },
                },
            },
        },
        mounted() {
            this.toggleFooter();
        },
        methods: {
            toggleHeader() {
                this.$find('header').showIf(() => {
                   if (this.$find('title').isNotEmpty()) {
                       return true;
                   }
                   if (this.$find('headerActions').isNotEmpty()) {
                       return true;
                   }
                   return false;
                });
            },
            toggleFooter() {
                this.$find('footer').showIf(() => {
                    return this.$find('footerActions').isNotEmpty();
                });
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
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(---color-border--light);
    padding: var(--padding);
}

.card-component__header-actions {
    position: relative;
    display: flex;
}

.card-component__body {
    padding: var(--padding);
}

.card-component__footer {
    position: relative;
    border-top: 1px solid var(---color-border--light);
    padding: var(--padding);
}

.card-component__footer-actions {
    position: relative;
    display: flex;
    justify-content: flex-end;
}
</style>