<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<div component-id="${cid}" class="vertical-component">
    <jsp:doBody />
</div>

<script type="module">
    import { newComponent } from 'dom';

    const component = newComponent({
        id: '${cid}',
    });

</script>

<style>
.vertical-component {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: start;
    align-items: stretch;
}
</style>