<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="name" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" data-name="${name}" class="tab-component">
    <jsp:doBody />
</div>

<script type="module">
    import { newComponent } from 'component';

    const component = newComponent({
        id: '${cid}',
        propsState: `${_bind}`,
    });

</script>

<style>

.tab-component__close {
    position: absolute;
}

.tab-component__close:before {
    position: absolute;
    content: '';
    width: 10px;
    height: 9px;
    top: 7px;
    right: 7px;
    border-right: 1px solid rgb(180, 180, 180);
    transform: rotate(45deg);
    cursor: pointer;
}

.tab-component__close:after {
    position: absolute;
    content: '';
    width: 9px;
    height: 9px;
    top: 7px;
    right: 1px;
    border-bottom: 1px solid rgb(180, 180, 180);
    transform: rotate(45deg);
    cursor: pointer;
}

</style>