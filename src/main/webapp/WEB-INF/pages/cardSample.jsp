<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<_:Layout>
    <div component-id="${cid}">
        <_:Card _bind="${cid}.card">
            Content
        </_:Card>

        <br/><br/>

        <_:Card _bind="${cid}.cardWithButtons">
            Content
        </_:Card>

        <br/><br/>

        <!--
          - body가 아닌 attribute를 사용할 때는 반드시 body보다 먼저 선언해야 합니다.
          - body 외 다른 attribute가 있을 때, body는 반드시 마지막에 선언해야 합니다.

         *주의*
          - 태그의 내부는 주석도 하나의 요소로 인식하므로 꼭 밖에 작성해야 합니다.
        -->
        <_:Card _bind="${cid}.cardWithFooter">
            <jsp:attribute name="footer">
                Footer
            </jsp:attribute>

            <jsp:body>
                Content2
            </jsp:body>
        </_:Card>
    </div>
</_:Layout>

<script type="module">
    import {newComponent} from 'component';

    const component = newComponent({
        id: '${cid}',
        data({ state }) {
            return {

                ...state('card', {
                    title: 'Basic Card',
                }),

                ...state('cardWithButtons', {
                    title: 'Card with Buttons',
                    buttons: [
                        { name: 'search', label: '검색', onClick: this.search },
                        { name: 'save', label: '저장', onClick: this.save },
                    ],
                }),

                ...state('cardWithFooter', {
                    title: 'Card with Footer',
                }),
            };
        },
        methods: {
            search() {
                alert('검색');
            },
            save() {
                alert('저장');
            },
        },
    });

</script>

<style>
</style>