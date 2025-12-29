<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="search-grid-card-component">
    <_:Card _bind="${cid}.card">
        <jsp:attribute name="header">
            <!-- TODO dynamic buttons -->
        </jsp:attribute>

        <jsp:body>
            <_:SearchGrid _bind="${cid}.grid" />
        </jsp:body>
    </_:Card>
</div>

<script type="module">
    import { newComponent } from 'component';

    const component = newComponent({
        id: '${cid}',
        propsState: `${_bind}`,
        props() {
            return {
                // card
                title: {
                    type: String,
                    watch: v => this.card.title = v,
                },

                // search grid
                countPerRow: {
                    type: Number,
                    watch: v => this.grid.countPerRow = v,
                },
                forms: {
                    type: Array,
                    watch: v => this.grid.forms = v,
                },
                formEvent: {
                    type: Object,
                    watch: v => this.grid.formEvent = v,
                },
                columns: {
                    type: Array,
                    watch: v => this.grid.columns = v,
                },
                props: {
                    type: Object,
                    watch: v => this.grid.props = v,
                },
                gridEvent: {
                    type: Object,
                    watch: v => this.grid.gridEvent = v,
                },
                width: {
                    type: String,
                    watch: v => this.grid.width = v,
                },
                height: {
                    type: String,
                    watch: v => this.grid.height = v,
                },
                defaultData: {
                    type: Array,
                    watch: v => this.grid.defaultData = v,
                },
                onCreated: {
                    type: Function,
                    watch: v => this.grid.onCreated = v,
                },
            }
        },
        mounted() {
        },
        data({ state }) {
            return {
                ...state('card', {}),
                ...state('grid', {}),
            };
        },
        methods: {},
    });

</script>

<style>
</style>