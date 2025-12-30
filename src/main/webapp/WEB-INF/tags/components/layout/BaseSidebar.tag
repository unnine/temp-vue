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
                                    children: [
                                        {
                                            name: '2-1',
                                            label: '의뢰 시작',
                                            href: '/main',
                                        }
                                    ],
                                }, {
                                    name: '3',
                                    label: '시험 접수',
                                    href: '/test-receipt',
                                    children: [
                                        {
                                            name: '3-1',
                                            label: '접수 시작',
                                            href: '/main2',
                                        }
                                    ],
                                },
                            ],
                        },
                        {
                            name: '11',
                            label: '시험',
                            children: [
                                {
                                    name: '22',
                                    label: '시험 의뢰',
                                    href: '/test-request',
                                    children: [
                                        {
                                            name: '2-1',
                                            label: '의뢰 시작',
                                            href: '/main3',
                                        }
                                    ],
                                }, {
                                    name: '33',
                                    label: '시험 접수',
                                    href: '/test-receipt',
                                    children: [
                                        {
                                            name: '33-1',
                                            label: '접수 시작',
                                            href: '/test-request/begin',
                                        }
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