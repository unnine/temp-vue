<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="menu-component">
    <div class="menu-component__item">
        <div class="menu-component__label">
            시험
        </div>
    </div>
<%--    <c:forEach var="item" items="${items}">--%>
<%--        <div component-id="${cid}" class="menu-component level-${currentLevel}">--%>
<%--            <div class="menu-item">${item.label}</div>--%>

<%--            <c:if test="${not empty item.children}">--%>
<%--                <div class="submenu">--%>
<%--                    <_:Menu--%>
<%--                        items="${item.children}"--%>
<%--                        level="${currentLevel + 1}"--%>
<%--                    ></_:Menu>--%>
<%--                </div>--%>
<%--            </c:if>--%>
<%--        </div>--%>
<%--    </c:forEach>--%>
</div>

<script type="module">
    import { newComponent } from 'component';

    const component = newComponent({
        id: '${cid}',
        propsState: `${_bind}`,
        props() {
            return {
                items: {
                    type: Array,
                    desc: `
                        MenuItem {
                            name: 'test-request',
                            label: '시험 의뢰',
                            href: 'menu url',
                            children: Array<<MenuItem>>,
                        }
                    `,
                    default: () => [],
                    watch(v) {
                        this.refresh(v);
                    },
                },
            };
        },
        mounted() {
            this.refresh(this.$props.items);
        },
        data({ state }) {
            return {};
        },
        methods: {
            refresh(menus) {
                console.log(menus);
            },
        },
    });

</script>

<style>
.menu-component {
    position: relative;
}

.menu-component__item {
    --menu-item-height: 42px;

    position: relative;
    width: 100%;
    height: var(--menu-item-height);
    background-color: rgb(220, 232, 253);
    /*border: 1px solid var(---color-border--base);*/
}

.menu-component__label {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0 20px;
    font-weight: 500;
    font-size: 16px;
    color: rgb(130, 130, 130);
    text-align: center;
    line-height: var(--menu-item-height);
}
</style>