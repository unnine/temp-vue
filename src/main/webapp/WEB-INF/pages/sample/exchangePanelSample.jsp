<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<_:Layout>
    <div component-id="${cid}">

        <h2>가로 패널</h2><br/>
        <_:ExchangePanel _bind="${cid}.panel" />

        <br/><br/><br/>

        <h2>세로 패널</h2><br/>
        <_:ExchangePanel _bind="${cid}.verticalPanel" />

    </div>
</_:Layout>

<script type="module">
    import {newComponent} from 'component';

    const component = newComponent({
        id: '${cid}',
        data({state}) {
            return {

                ...state('panel', {
                    onClickDownRight: () => alert('down button click'),
                    onClickUpLeft: () => alert('up button click'),
                }),

                ...state('verticalPanel', {
                    vertical: true,
                    onClickDownRight: () => alert('right button click'),
                    onClickUpLeft: () => alert('left button click'),
                }),
            };
        },
    });

</script>

<style>
</style>