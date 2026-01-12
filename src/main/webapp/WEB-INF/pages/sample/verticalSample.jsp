<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<_:Layout>
    <div component-id="${cid}" class="vertical-sample-component">

        <h2>2개 블록 수직 분할</h2><br/>

        <_:Vertical>
            <div class="first"></div>
            <div class="second"></div>
        </_:Vertical>

        <br/><br/><br/>


        <h2>2개 블록 수직 분할 (간격: 20px)</h2><br/>

        <_:Vertical gap="20">
            <div class="first"></div>
            <div class="second"></div>
        </_:Vertical>

    </div>
</_:Layout>

<script type="module">
    import {newComponent} from 'component';

    const component = newComponent({
        id: '${cid}',
        data({state}) {
            return {};
        },
    });

</script>

<style>
.vertical-sample-component .first {
    width: 100%;
    height: 100px;
    background-color: rgb(100, 150, 250);
}

.vertical-sample-component .second {
    width: 100%;
    height: 100px;
    background-color: rgb(250, 150, 100);
}

.vertical-sample-component .third {
    width: 100%;
    height: 100px;
    background-color: rgb(200, 150, 150);
}
</style>