<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="menu-component">
</div>

<script type="module">
    import { newComponent } from 'component';

    const component = newComponent({
        id: '${cid}',
        propsState: `${_bind}`,
        props() {
            return {
                items: {
                    type: Array,
                    desc: `
                        MenuItem {
                            name: 'test-request',
                            label: '시험 의뢰',
                            href: 'menu url',
                            children: Array<<MenuItem>>,
                        }
                    `,
                    default: () => [],
                    watch(v) {
                        this.refresh(v);
                    },
                },
            };
        },
        data() {
            return {
                menus: new Map(),
                childrenWrappers: new Map(),
            };
        },
        methods: {
            refresh(menus) {
                this.appendMenuNodes(this.$self._$el, menus);
            },
            appendMenuNodes($container, menus, depth = 0) {
                menus.forEach(menu => {
                    const { name, children } = menu;

                    const $item = this.createMenuItemNode(menu, depth);
                    $container.append($item);

                    this.menus.set(name, $item);

                    if (children && children.length > 0) {
                        const $wrapper = this.createChildrenMenuWrapper(children.length);
                        this.appendMenuNodes($wrapper, children, depth + 1);
                        $item.append($wrapper);
                        this.childrenWrappers.set(name, $wrapper);
                    }
                });
            },
            createChildrenMenuWrapper(size) {
                const $wrapper = document.createElement('div');
                $wrapper.classList.add('menu-component__item__children-wrapper')
                $wrapper.setAttribute('data-expand-height', 42 * size + 'px');
                return $wrapper;
            },
            createMenuItemNode(menu, depth) {
                const { name, label, href, children } = menu;

                const $label = document.createElement('a');
                $label.classList.add('menu-component__label');
                $label.style.paddingLeft = 15 + (5 * depth) + 'px';
                $label.textContent = label;
                $label.setAttribute('data-menu-name', name);

                if (window.location.pathname === href) {
                    this.select($label);
                }

                if (!children || children.length === 0) {
                    $label.setAttribute('data-menu-is-leaf', 'true');
                    $label.setAttribute('href', href);
                }

                $label.addEventListener('click', this.onSelect);

                const $item = document.createElement('div');
                $item.classList.add('menu-component__item');
                $item.style.backgroundColor = 'rgb(' +
                    (255 - (10 * depth)) + ',' +
                    (255 - (10 * depth)) + ',' +
                    (255 - (14 * depth)) + ')';

                $item.append($label);
                return $item;
            },
            onSelect(e) {
                e.stopPropagation();

                const $label = e.target;
                const isLeaf = $label.dataset.menuIsLeaf;

                if (isLeaf === 'true') {
                    this.select($label);
                    return;
                }
                this.toggle($label);
            },
            select($label) {
                this.$self.call($el => {
                    const $selectedMenu = $el.querySelector('.menu-component__label.selected');
                    if ($selectedMenu) {
                        $selectedMenu.classList.remove('selected');
                    }
                })
                $label.classList.add('selected');
            },
            toggle($label) {
                const itemName = $label.dataset.menuName;

                if (!this.childrenWrappers.has(itemName)) {
                    console.warn(`not found children menu wrapper of '` + itemName + `'.`)
                    return;
                }

                const $wrapper = this.childrenWrappers.get(itemName);

                if ($wrapper.classList.contains('open')) {
                    $wrapper.classList.remove('open');
                } else {
                    $wrapper.classList.add('open');
                }
            },
        },
    });

</script>

<style>
.menu-component {
    position: relative;
}

.menu-component__item {
    --menu-item-height: 42px;

    position: relative;
    width: 100%;
    min-height: var(--menu-item-height);
    cursor: pointer;
    border-bottom: 1px solid var(---color-border--light);
}

.menu-component__item__children-wrapper {
    position: relative;
    display: none;
    height: auto;
    overflow: hidden;
}

.menu-component__item__children-wrapper.open {
    display: block;
}

.menu-component__item__children-wrapper:has(.menu-component__label.selected) {
    display: block;
}

.menu-component__label {
    position: relative;
    display: block;
    width: 100%;
    padding-right: 15px;
    font-weight: 500;
    font-size: 16px;
    color: rgb(130, 130, 130);
    text-align: left;
    line-height: var(--menu-item-height);
    text-decoration: none;
}

.menu-component__label.selected::after {
    position: absolute;
    content: '';
    width: 3px;
    height: 100%;
    right: 0;
    background-color: rgb(80, 120, 240);
}
</style>