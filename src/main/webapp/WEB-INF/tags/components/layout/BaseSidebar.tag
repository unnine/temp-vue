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
                            name: '1',
                            label: '시험',
                            children: [
                                {
                                    name: '2',
                                    label: '시험 의뢰',
                                    href: '/test-request',
                                }, {
                                    name: '3',
                                    label: '시험 접수',
                                    href: '/test-receipt',
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