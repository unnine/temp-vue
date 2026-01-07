<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="gap" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="vertical-component">
    <jsp:doBody />
</div>

<script type="module">
    import { newComponent } from 'component';
    import { StringUtil } from 'util';

    const component = newComponent({
        id: '${cid}',
        mounted() {
            this.applyGap();
        },
        methods: {
            applyGap() {
                const gap = '${gap}';

                if (StringUtil.isNotEmpty(gap)) {
                    this.$find('${cid}').setStyle({
                        gap: gap + 'px',
                    });
                }
            },
        },
    });

</script>

<style>
.vertical-component {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
}
</style>