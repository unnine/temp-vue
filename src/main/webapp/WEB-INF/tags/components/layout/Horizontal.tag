<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="spans" fragment="false" required="false" type="java.lang.String" %>
<%@ attribute name="gap" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="horizontal-component">
    <jsp:doBody />
</div>

<script type="module">
    import { newComponent } from 'dom';
    import { StringUtil } from 'util';

    const component = newComponent({
        id: '${cid}',
        mounted() {
            this.getSlotSpans();
            this.applyGap();
        },
        methods: {
            applyGap() {
                const gap = '${gap}';

                if (StringUtil.isNotEmpty(gap)) {
                    const self = this.$find('${cid}');
                    self.setStyle('gap', gap + 'px');
                }
            },
            getChildren() {
                const self = this.$find('${cid}');
                return Array.from(self._$el.children ?? []).filter($child => {
                    const tagName = $child.tagName.toUpperCase();
                    return tagName !== 'SCRIPT' && tagName !== 'STYLE';
                });
            },
            getSpans(defaultLength) {
                const spans = '${spans}';
                if (spans.length === 0) {
                    return new Array(defaultLength);
                }
                return JSON.parse(spans);
            },
            getSlotSpans() {
                const children = this.getChildren();
                const spans = this.getSpans(children.length);
                const sum = spans.reduce((acc, span) => acc += span, 0);
                const avg = sum / spans.length;

                children.forEach(($child, i) => {
                    const span = spans[i] ?? avg;
                    $child.style.width = ((span / sum) * 100) + '%';
                });
            },
        },
    });

</script>

<style>
.horizontal-component {
    position: relative;
    display: flex;
    width: 100%;
}
</style>