<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_data" fragment="false" required="false" type="java.lang.String" %>

<div component-id="${cid}" class="base-layout-component">
    <div class="base-layout-component__header-wrap">
        <_:Header />
    </div>

    <div class="base-layout-component__content">

        <div class="base-layout-component__side-bar">
            <_:Sidebar />
        </div>

        <div class="base-layout-component__body-wrap">
            <jsp:doBody />
        </div>
    </div>
</div>

<script type="module">
    import { newComponent } from 'dom';

    const component = newComponent({
        id: '${cid}',
    });

</script>

<style>
.base-layout-component {
    position: relative;
    width: 100%;
    height: 100%;
    background: var(---color-bg--light);
    overflow: hidden;
}

.base-layout-component__header-wrap {
    position: relative;
    box-shadow: var(---box-shadow-base);
    z-index: 3;
}

.base-layout-component__side-bar {
    position: relative;
    width: var(---side-bar-width);
    height: 100%;
    overflow: scroll;
    z-index: 2;
}

.base-layout-component__content {
    position: relative;
    display: flex;
    height: 100%;
    z-index: 1;
}

.base-layout-component__body-wrap {
    position: relative;
    width: calc(100vw - var(---side-bar-width));
    overflow: scroll;
}
</style>