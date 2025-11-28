<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_data" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="button-component">
    <button e-id="self">
        <jsp:doBody />
    </button>
</div>

<script type="module">
    import {newComponent} from 'dom';

    const component = newComponent({
        id: '${cid}',
        bindData: {
            target: `${_data}`,
            props: {
                onClick: {
                    type: 'Function',
                },
            },
        },
        mounted() {
            this.$find('self').on('click', e => {
                this.$props.onClick(e);
            });
        },
    });

</script>

<style>
    .button-component {
        position: relative;
    }

    .button-component > button {
        outline: none;
    }
</style>