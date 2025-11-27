<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<%@ attribute name="_dataName" fragment="false" required="false" type="java.lang.String" %>
<c:set var="componentId" value="${UUID.randomUUID().toString()}"/>

<div component-id="${componentId}" class="base-layout-component">

    <div class="side-bar">
    </div>

    <div class="content">
        <div class="header-wrap">
            <_:Header />
        </div>

        <div class="body-wrap">
            <jsp:doBody />
        </div>

<%--        <div class="footer-wrap">--%>
<%--            <_:Footer />--%>
<%--        </div>--%>
    </div>
</div>

<script type="module">
    import { newComponent } from 'dom';

    const component = newComponent({
        id: '${componentId}',
    });

</script>

<style>
.base-layout-component {
    position: relative;
    display: flex;
    flex: 1 auto;
    width: 100%;
    height: 100%;
    background: var(---color-bg--light);
}

.base-layout-component > .side-bar {
    position: relative;
    min-width: var(---side-bar-width);
    height: 100%;
    background: linear-gradient(135deg, var(---color--primary-light), var(---color--primary));
    border-radius: 0 24px 24px 0;
}

.base-layout-component .header-wrap {
    position: relative;
    width: 100%;
}

.base-layout-component > .content {
    position: relative;
    width: 100%;
    height: 100%;
}

.base-layout-component > .content > .body-wrap {
    position: relative;
    width: 100%;
}

/*.base-layout-component > .content > .footer-wrap {*/
/*    position: relative;*/
/*}*/
</style>