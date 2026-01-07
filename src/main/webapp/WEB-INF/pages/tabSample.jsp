<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<html>
<body component-id="${cid}">
    <_:Layout>

        <h2>Basic Tab</h2><br/>

        <_:Tabs _bind="${cid}.basicTabs">
            <_:Tab name="tab1">
                Tab1
            </_:Tab>

            <_:Tab name="tab2">
                Tab2
            </_:Tab>

            <_:Tab name="tab3">
                Tab3
            </_:Tab>
        </_:Tabs>

        <br/><h2>Closeable Tab</h2><br/>

        <_:Tabs _bind="${cid}.closeableTabs">
            <_:Tab name="tab1">
                Tab1
            </_:Tab>

            <_:Tab name="tab2">
                Tab2
            </_:Tab>

            <_:Tab name="tab3">
                Tab3
            </_:Tab>
        </_:Tabs>

        <br/><h2>Dynamic Tab</h2><br/>

        <_:Buttons _bind="${cid}.dynamicTabButtons" />

        <br/>

        <_:Tabs _bind="${cid}.dynamicTabs">
            <_:Tab name="tab1">
                Tab1
            </_:Tab>

            <_:Tab name="tab2">
                Tab2
            </_:Tab>

            <_:Tab name="tab3">
                Tab3
            </_:Tab>
        </_:Tabs>

    </_:Layout>
</body>

<script type="module">
    import {newComponent} from 'component';

    const component = newComponent({
        id: '${cid}',
        data({state}) {
            return {

                ...state('basicTabs', {
                    tabs: [
                        { name: 'tab1', label: '탭 1' },
                        { name: 'tab2', label: '탭 2' },
                        { name: 'tab3', label: '탭 3' },
                    ],
                }),

                ...state('closeableTabs', {
                    closeable: true,
                    tabs: [
                        { name: 'tab1', label: '탭 1' },
                        { name: 'tab2', label: '탭 2' },
                        { name: 'tab3', label: '탭 3' },
                    ],
                }),

                ...state('dynamicTabs', {
                    closeable: true,
                    tabs: [
                        { name: 'tab1', label: '탭 1' },
                        { name: 'tab2', label: '탭 2' },
                        { name: 'tab3', label: '탭 3' },
                    ],
                }),

                ...state('dynamicTabButtons', {
                    buttons: [
                        { name: 'addTab', label: '탭 추가', onClick: this.addTab },
                    ],
                })
            };
        },
        methods: {
            addTab() {
                const nextNum = this.dynamicTabs.tabs.length + 1;

                this.dynamicTabs.tabs = [
                    ...this.dynamicTabs.tabs,
                    {
                        name: 'tab ' + nextNum,
                        label: '탭 ' + nextNum,
                        content: 'Tab' + nextNum,
                    },
                ];
            },
        },
    });

</script>
</html>

<style>
</style>