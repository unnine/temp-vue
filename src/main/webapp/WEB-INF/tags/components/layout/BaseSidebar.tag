<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>

<div component-id="${cid}" class="base-sidebar-component">
    <div class="base-sidebar-component__content">
        <_:Menu _bind="${cid}.menu" />
    </div>
</div>

<script type="module">
    import { newComponent } from 'component';

    const component = newComponent({
        id: '${cid}',
        data({ state }) {
            return {

                ...state('menu', {
                    items: [
                        {
                            name: 'samplePage',
                            label: '샘플 페이지',
                            children: [
                                {
                                    name: 'gridSample',
                                    label: '그리드',
                                    href: '/grid-sample',
                                },
                                {
                                    name: 'formSample',
                                    label: '폼',
                                    href: '/form-sample',
                                },
                            ],
                        },
                    ],
                }),
            };
        },
    });

</script>

<style>
.base-sidebar-component {
    position: relative;
    width: var(---side-bar-width);
    height: 100%;
    background: #fff;
}

.base-sidebar-component__content {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>