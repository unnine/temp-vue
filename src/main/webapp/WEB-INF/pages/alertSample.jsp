<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<_:Layout>
    <div component-id="${cid}">

        <h2>알림창</h2><br/>

        <_:Horizontal spans="[1, 1, 1, 1, 1]" gap="50">
            <_:Buttons _bind="${cid}.buttons" />
        </_:Horizontal>
    </div>
</_:Layout>

<script type="module">
    import { newComponent } from 'component';

    const component = newComponent({
        id: '${cid}',
        data({ state }) {
            return {

                ...state('buttons', {
                    buttons: [
                        { name: 'info', label: '일반', onClick: this.info },
                        { name: 'info', label: '주의', onClick: this.warn, type: 'warn' },
                        { name: 'info', label: '경고', onClick: this.danger, type: 'danger' },
                        { name: 'info', label: '확인', onClick: this.confirm },
                    ],
                }),

            };
        },
        methods: {
            info() {
                this.$info('클릭');
            },
            warn() {
                this.$warn('클릭');
            },
            danger() {
                this.$danger('클릭');
            },
            confirm() {
                this.$confirm('Yes?');
            },
        },
    });

</script>

<style>
</style>