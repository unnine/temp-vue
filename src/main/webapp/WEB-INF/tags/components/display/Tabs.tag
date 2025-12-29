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
    import { newComponent, ComponentConnector } from 'component';
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
                closeable: {
                    type: Boolean,
                    default: false,
                },
                stretch: {
                    type: Boolean,
                    default: false,
                },
            };
        },
        mounted() {
            this.initTabs();
        },
        data() {
            return {
                defaultTabName: null,
                currentTabName: null,
                tabNodes: new Map(),
                eventHandlers: new Map(),
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

                const $tab = document.createElement('div');
                $tab.classList.add('tabs-component__title-wrap');
                $tab.dataset.name = name;
                this.bindPointerUpEvent(name, $tab, e => this.onChangeTab(e));
                $tab.append($title);

                if (this.$props.closeable) {
                    const $close = this.createCloseButton(name);
                    $tab.append($close);
                }

                return { $tab, $title };
            },
            createCloseButton(name) {
                const $close = document.createElement('div');
                $close.classList.add('tabs-component__close');
                this.bindPointerUpEvent(name, $close, e => this.onCloseTab(e, name));
                return $close;
            },
            bindPointerUpEvent(name, $node, handler) {
                this.eventHandlers.set(name, { $node, handler });
                $node.addEventListener('pointerup', handler);
            },
            releasePointerUpEvent(name) {
                if (!this.eventHandlers.has(name)) {
                    return;
                }
                const { $node, handler } = this.eventHandlers.get(name);
                $node.removeEventListener('pointerup', handler);
                this.eventHandlers.delete(name);
            },
            onChangeTab(e) {
                const { name } = e.currentTarget.dataset;
                this.selectTab(name);
                this.$props.onChange(name);
            },
            onCloseTab(e, name) {
                e.stopPropagation();
                this.closeTab(name);
            },
            closeTab(name) {
                if (!this.tabNodes.has(name)) {
                    return;
                }
                const { $content, $tab } = this.tabNodes.get(name);

                ComponentConnector.releaseAllByContainer($content);
                this.releasePointerUpEvent(name);
                $content.replaceChildren();
                $content.remove();
                $tab.replaceChildren();
                $tab.remove();

                const currentTabName = this.currentTabName;

                if (name !== currentTabName) {
                    this.tabNodes.delete(name);
                    return;
                }

                let tabName;

                if (this.isFirstTab(currentTabName)) {
                    tabName = this.getNextTabName(currentTabName);
                } else {
                    tabName = this.getPrevTabName(currentTabName);
                }

                this.selectTab(tabName);
                this.tabNodes.delete(name);
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
                this.defaultTabName = null;
            },
            isFirstTab(name) {
                const [ firstTabName ] = Array.from(this.tabNodes.keys());
                return firstTabName === name;
            },
            getPrevTabName(name) {
                const tabNames = Array.from(this.tabNodes.keys());
                const pos = tabNames.findIndex(tabName => tabName === name);
                return pos > 0 ? tabNames[pos - 1] : tabNames[pos];
            },
            getNextTabName(name) {
                const tabNames = Array.from(this.tabNodes.keys());
                const pos = tabNames.findIndex(tabName => tabName === name);
                return pos >= tabNames.length - 1 ? tabNames[pos] : tabNames[pos + 1];
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
                const { $tab, $content, name } = tab;

                $tab.classList.add('selected');
                $content.classList.remove('hide');
                this.currentTabName = name;
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
    padding: 7px 22px 8px 16px;
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
    cursor: pointer;
}

.tabs-component__content-wrap {
    position: relative;
    width: 100%;
    background-color: #fff;
    padding: 12px;
    box-shadow: var(---box-shadow-base);
    border-radius: 0 0 2px 2px;
}

.tabs-component__close {
    position: absolute;
    width: 10px;
    height: 16px;
    top: 7px;
    right: 3px;
}

.tabs-component__close:before {
    position: absolute;
    content: '';
    width: 9px;
    height: 8px;
    top: 1px;
    right: 5px;
    border-right: 1px solid rgb(180, 180, 180);
    transform: rotate(45deg);
    cursor: pointer;
}

.tabs-component__close:after {
    position: absolute;
    content: '';
    width: 8px;
    height: 8px;
    top: 1px;
    right: 0;
    border-bottom: 1px solid rgb(180, 180, 180);
    transform: rotate(45deg);
    cursor: pointer;
}
</style>