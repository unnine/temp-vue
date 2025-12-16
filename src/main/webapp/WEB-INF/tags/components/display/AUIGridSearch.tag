<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="aui-grid-search-component">
    <_:Form _bind="${cid}.form" />
    <_:AUIGrid _bind="${cid}.grid" />
</div>

<script type="module">
    import {newComponent} from 'component';

    const component = newComponent({
        id: '${cid}',
        propsTarget: '${_bind}',
        props() {
            return {
                //  form
                countPerRow: {
                    type: Number,
                    watch: (v) => this.form.countPerRow = v,
                },
                forms: {
                    type: Array,
                    watch: v => this.form.form = v,
                },

                // grid
                columns: {
                    type: Array,
                    watch: v => this.grid.columns = v,
                },
                props: {
                    type: Object,
                    watch: v => this.grid.props = v,
                },
                event: {
                    type: Object,
                    watch: v => this.grid.event = v,
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
            }
        },
        data({state}) {
            return {

                ...state('form', {}),

                ...state('grid', {}),
            };
        },
        methods: {},
    });

</script>

<style>
</style>