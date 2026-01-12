<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<_:Layout>
    <div component-id="${cid}" class="horizontal-sample-component">


        <h2>2개 블록 수평 분할 (비율 = 6 : 4)</h2><br/>

        <_:Horizontal spans="[6, 4]">
            <div class="first"></div>
            <div class="second"></div>
        </_:Horizontal>

        <br/><br/>


        <h2>2개 블록 수평 분할 (비율 = 6 : 4, 간격 = 30px)</h2><br/>

        <_:Horizontal spans="[6, 4]" gap="30">
            <div class="first"></div>
            <div class="second"></div>
        </_:Horizontal>

        <br/><br/>


        <h2>3개 블록 수평 분할 (비율 = 6 : 1 : 3)</h2><br/>

        <_:Horizontal spans="[6, 1, 3]">
            <div class="first"></div>
            <div></div>
            <div class="second"></div>
        </_:Horizontal>

        <br/><br/>


        <h2>5개 블록 수평 분할 (비율 = 1 : 2 : 3 : 4 : 5)</h2><br/>

        <_:Horizontal spans="[1, 2, 3, 4, 5]">
            <div class="first"></div>
            <div class=""></div>
            <div class="second"></div>
            <div></div>
            <div class="third"></div>
        </_:Horizontal>
    </div>
</_:Layout>

<script type="module">
    import { newComponent } from 'component';

    const component = newComponent({
        id: '${cid}',
        data({ state }) {
            return {

            };
        },
    });

</script>

<style>
.horizontal-sample-component .first {
    width: 100%;
    height: 100px;
    background-color: rgb(100, 150, 250);
}

.horizontal-sample-component .second {
    width: 100%;
    height: 100px;
    background-color: rgb(250, 150, 100);
}

.horizontal-sample-component .third {
    width: 100%;
    height: 100px;
    background-color: rgb(200, 150, 150);
}
</style>