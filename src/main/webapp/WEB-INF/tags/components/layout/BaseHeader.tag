<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>

<div component-id="${cid}" class="base-header-component">
    <div class="base-header-component__logo-box">
        <div e-id="logo" class="base-header-component__logo"></div>
    </div>

    <div class="base-header-component__toolbar">
        <_:Toolbar />
    </div>
</div>

<script type="module">
    import {newComponent} from 'component';

    const component = newComponent({
        id: '${cid}',
        propsState: '${_bind}',
        props() {
          return {
              logo: {
                  type: String,
                  onInit(v) {
                      this.$find('logo').setStyle({
                          backgroundImage: 'url(' + v + ')',
                      });
                  },
              },
          };
        },
    });

</script>


<style>
.base-header-component {
    position: relative;
    display: flex;
    height: 40px;
    background: linear-gradient(135deg, var(---color--primary-light), var(---color--primary));
}

.base-header-component__logo-box {
    position: relative;
    width: 100px;
    height: 100%;
    padding: 10px;
}

.base-header-component__logo {
    position: relative;
    width: 100%;
    height: 100%;
    background-size: contain;
    background-repeat: no-repeat;
}

.base-header-component__toolbar {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>