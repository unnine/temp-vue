<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="tabs-component">
    <div e-id="navigator" class="tabs-component__navigator"></div>
    <div e-id="contentWrap" class="tabs-component__content-wrap"></div>
    <div class="tabs-component__hidden">
        <jsp:doBody />
    </div>
</div>

<script type="module">
    import { newComponent } from 'component';
    import { XSSUtil } from 'util';

    const component = newComponent({
        id: '${cid}',
        propsState: `${_bind}`,
        props() {
            return {
                tabs: {
                    type: Array,
                    default: () => [],
                    onUpdate(value) {
                        if (!Array.isArray(value)) {
                            console.warn(`tabs muse be an array.`, value);
                            return;
                        }
                        this.addTab(...value);
                    },
                },
                onChange: {
                    type: Function,
                    default: () => {},
                },
            };
        },
        mounted() {
            this.initTabs();
        },
        data() {
            return {
                defaultTabName: null,
                tabNodes: new Map(),
            };
        },
        methods: {
            initTabs() {
                const childrenTabs = this.getChildrenTagNodes();
                this.addTab(...childrenTabs);
                this.initDefaultTabName();
                this.selectTab(this.defaultTabName);
            },
            getChildrenTagNodes() {
                const $tabs = this.$self.call($el => $el.querySelectorAll('.tab-component'));
                return Array.from($tabs).map($tab => {
                    const { name } = $tab.dataset;

                    return {
                        name,
                        label: this.getLabel(name),
                        content: $tab,
                    };
                });
            },
            getLabel(name) {
                const tab = this.$props.tabs.find(tab => tab.name === name);
                if (tab == null) {
                    return '';
                }
                return tab.label ?? name;
            },
            addTab(...newTabs) {
                newTabs.forEach(tab => {
                    if (this.tabNodes.has(tab.name)) {
                        return;
                    }

                    const { name, label, content } = tab;

                    if (!name) {
                        console.warn('tab name is required.', tab);
                    }
                    if (!content) {
                        console.warn('tab content is required.', tab);
                    }

                    this.tabNodes.set(name, {
                        ...this.addNavigator(name, label),
                        $content: this.addContent(content),
                    });
                });
            },
            addContent(content) {
                const $content = document.createElement('div');
                $content.classList.add('tabs-component__content', 'hide');

                if (content instanceof HTMLElement) {
                    $content.append(content);
                } else {
                    $content.innerHTML = XSSUtil.escape(content);
                }

                this.$find('contentWrap').append($content);
                return $content;
            },
            addNavigator(name, label) {
                const { $tab, $title } = this.createTab(name, label);
                const navigator = this.$find('navigator');
                navigator.append($tab);
                return { name, label, $tab, $title };
            },
            createTab(name, label) {
                const $title = document.createElement('h4');
                $title.classList.add('tabs-component__title');
                $title.innerText = label ?? name;

                const $close = document.createElement('div');
                $close.classList.add('tabs-component__close');

                const $tab = document.createElement('div');
                $tab.classList.add('tabs-component__title-wrap');
                $tab.dataset.name = name;
                $tab.append($title, $close);
                $tab.addEventListener('pointerdown', e => this.onChangeTab(e.currentTarget.dataset.name));

                return { $tab, $title };
            },
            initDefaultTabName() {
                const { tabs } = this.$props;

                const defaultTab = tabs.find(tab => tab.selected);

                if (defaultTab) {
                    this.defaultTabName = defaultTab.name;
                    return;
                }
                if (tabs?.length > 0) {
                    this.defaultTabName = tabs[0].name;
                    return;
                }
            },
            onChangeTab(name) {
                this.selectTab(name);
                this.$props.onChange(name);
            },
            selectTab(name) {
                this.tabNodes.forEach(tab => {
                    if (tab.name === name) {
                        this.showTab(tab);
                        return;
                    }
                    this.hideTab(tab);
                });
            },
            showTab(tab) {
                const { $tab, $content } = tab;

                $tab.classList.add('selected');
                $content.classList.remove('hide');
            },
            hideTab(tab) {
                const { $tab, $content } = tab;

                $tab.classList.remove('selected');
                $content.classList.add('hide');
            },
        },
    });

</script>

<style>
.tabs-component {
    position: relative;
    margin-bottom: 12px;
}

.tabs-component__navigator {
    position: relative;
    display: flex;
}

.tabs-component__title-wrap {
    position: relative;
    background-color: #fff;
    padding: 7px 23px 8px 16px;
    border-radius: 2px 2px 0 0;
    border-right: 1px solid var(---color-border--light);
    cursor: pointer;
}

.tabs-component__title-wrap.selected {
    box-shadow: var(---box-shadow-base);
    border-bottom: 2px solid var(---color-button-primary);
    cursor: default;
}

.tabs-component__title-wrap:not(.selected):hover > h4 {
    color: var(---color-button-primary);
    cursor: default;
}

.tabs-component__content-wrap {
    position: relative;
    width: 100%;
    background-color: #fff;
    padding: 12px;
    box-shadow: var(---box-shadow-base);
    border-radius: 0 0 2px 2px;
}
</style>