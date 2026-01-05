<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<html>
<body component-id="${cid}">
    <_:Layout>
        <_:Form _bind="${cid}.form" />
    </_:Layout>
</body>

<script type="module">
    import { newComponent } from 'component';
    import { FormBuilder } from 'form';

    const component = newComponent({
        id: '${cid}',
        data({ state }) {

            return {

                ...state('form', {
                    countPerRow: 3,
                    forms: createForms(),
                    event: {

                    },
                }),
            };
        },
    });


    function createForms() {
        return FormBuilder.builder()

            .build();
    }


</script>
</html>

<style>
</style>