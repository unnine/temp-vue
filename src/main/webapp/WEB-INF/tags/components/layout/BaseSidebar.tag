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
                            label: 'Sample Page',
                            children: [
                                {
                                    name: 'displayComponent',
                                    label: 'Display',
                                    children: [
                                        {
                                            name: 'cardSample',
                                            label: '카드',
                                            href: '/card-sample',
                                        },
                                        {
                                            name: 'gridSample',
                                            label: '그리드',
                                            href: '/grid-sample',
                                        },
                                        {
                                            name: 'searchGridSample',
                                            label: '검색 그리드',
                                            href: '/search-grid-sample',
                                        },
                                        {
                                            name: 'searchGridCardSample',
                                            label: '검색 그리드 카드',
                                            href: '/search-grid-card-sample',
                                        },
                                        {
                                            name: 'tabSample',
                                            label: '탭',
                                            href: '/tab-sample',
                                        },
                                    ],
                                },
                                {
                                    name: 'entryComponent',
                                    label: 'Entry',
                                    children: [
                                        {
                                            name: 'formSample',
                                            label: '폼',
                                            href: '/form-sample',
                                        },
                                    ],
                                },
                                {
                                    name: 'actionComponent',
                                    label: 'Action',
                                    children: [
                                        {
                                            name: 'buttonSample',
                                            label: '버튼',
                                            href: '/button-sample',
                                        },
                                        {
                                            name: 'exchangePanelSample',
                                            label: '교환 패널',
                                            href: '/exchange-panel-sample',
                                        },
                                    ],
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