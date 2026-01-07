<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<html>
<body>
<_:Layout>
    <div component-id="${cid}">

        <h2>Button</h2><br/>

        <div e-id="button-group"></div>

        <br/><br/><br/>

        <h2>Buttons Component</h2><br/>

        <_:Buttons _bind="${cid}.buttons" />
    </div>
</_:Layout>
</body>

<script type="module">
    import { newComponent } from 'component';
    import { ButtonRenderer } from 'form';

    const component = newComponent({
        id: '${cid}',
        data({ state }) {
            return {

                ...state('buttons', {
                    buttons: [
                        { name: 'history', label: '이력 보기', onClick: () => alert('클릭') },
                        { name: 'printReport', label: '보고서 출력', onClick: () => alert('클릭') },
                    ],
                }),
            };
        },
        mounted() {
            this.$find('button-group').call($el => {
                ButtonRenderer.render($el, [
                    { name: 'show', label: '보기', onClick: () => alert('클릭') },
                ]);
            });
        },
    });

</script>
</html>

<style>
</style>