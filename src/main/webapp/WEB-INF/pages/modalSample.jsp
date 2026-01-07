<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<_:Layout>
    <div component-id="${cid}">

        <_:Buttons _bind="${cid}.modalControl" />

        <_:Modal _bind="${cid}.modal">
            Content
        </_:Modal>
    </div>
</_:Layout>

<script type="module">
    import { newComponent } from 'component';

    const component = newComponent({
        id: '${cid}',
        data({ state }) {
            return {

                ...state('modal', {
                    show: false,
                }),

                ...state('modalControl', {
                    buttons: [
                        { name: 'show', label: '모달 열기', onClick: () => this.modal.show = true },
                    ],
                }),
            };
        },
    });

</script>

<style>
</style>