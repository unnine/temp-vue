/*
 *************
 * Component *
 *************
 * Developed by Eg 2019-07-23
 */
(function(factory) {
    window['Component'] = factory();
}(
    function() {
        'use strict';

        const __hasProp = Object.prototype.hasOwnProperty;

        const __REGEXP = {
            /*
             * html, javascript 주석을 선택하는 정규식
             */
            annotation: /(\/\*(\s|\S)*?\*\/)|<!-{2,}(\s|\S)*?-{2,}>|^\/\/.*|(\/\/.*)/g,

            /*
             * 스크립트 태그(<script></script>)만 선택하는 정규식
             */
            scriptTags: /<script(\s|\S)*?\>|\<\/script(\s|\S)*?\>/g,

            /*
             * 모든 스크립트 영역(스크립트 태그 포함)을 선택하는 정규식
             */
            allScriptAreas: /<script(\s|\S)*?(\s|\S)*?<\/script(\s|\S)*?>/g,
        };

        /*
         * Ajax요청으로 파일을 로드할 때 로드된 문자열을 이 객체에 저장힙니다.
         * 그 후 동일한 파일의 요청이 들어오면 Ajax요청을 다시 보내지 않고 이 객체에서 꺼내서 할당합니다.
         */
        const __cache = Object.create(null);


        function Component(option) {
            if (!(this instanceof Component)) {
                throw new SyntaxError('[Component] "new" constructor operator is required');
            }
            if (!option || !option.url) {
                return this.callee;
            }
            this.reload(option);
            return this.callee;
        }

        Component.prototype.reload = function(option) {
            this.initProps(option);
            this.create();
        }

        Component.prototype.initProps = function({ url, props }) {
            this.url = url;
            this.props = props;

            /*
             * 호출한 Component객체의 load함수가 종료된 후 실행될 콜백 함수입니다.
             */
            this.loadListener = null;

            /*
             * 파라미터로 받은 함수의 리턴값을 loadListener의 인자로 하여 실행합니다.
             */
            this.load = function(fn) {
                const result = fn.call(this.scope, this.props);
                if( this.loadListener ){
                    this.loadListener.call(this.callee, result);
                }
            }.bind(this);

            /*
             * Component로 호출한 페이지와 Message.on함수의 스코프 영역으로 사용할 객체입니다.
             */
            this.scope = {
                on: this.createOnFn(),
                emit: this.createEmitFn()
            }
            
            /*
             * Component객체 내부의 호스트 객체에 thisBinding할 Component 객체
             */
            this.component = {
                load: this.load,
                ...this.scope,
            };

            /*
             * Component객체 내부의 호스트 객체에 thisBinding할 메세지 객체
             */
            this.message = {};

            /*
             * Component 객체 생성 시 반한해줄 객체를 생성합니다.
             */
            this.callee = {
                emit: this.createEmitFn(),
                onLoad: this.onLoad.bind(this),
                reload: this.reload.bind(this),
            };


            /*
             * scope객체의 property 변경이나 재할당을 하지 못하게 처리합니다.
             */
            const descriptor = {
                configurable: false,
                enumerable: false,
                writable: false
            };
            Object.defineProperties(this.scope, { 'on': descriptor, 'emit': descriptor });
            Object.defineProperties(this.component, { 'load': descriptor });
        }

        /*
         * 파일을 로드하여 Component 객체를 생성합니다.
         */
        Component.prototype.create = function() {
            const _this = this;

            /*
             * url에 맞는 페이지를 호출합니다.
             */
            this.getComponent(this.url, function(loadedHtml) {
                const annotationExcludedHtml = loadedHtml.replace(__REGEXP.annotation, '');

                const scriptExcludedHtml = annotationExcludedHtml.replace(__REGEXP.allScriptAreas, '');
                _this.component.html = scriptExcludedHtml;

                const onlyScripts = annotationExcludedHtml.match(__REGEXP.allScriptAreas);
                onlyScripts.forEach((script) => {
                    const scriptWithoutTags = script.replace(__REGEXP.scriptTags, '');
                    _this.makeFn(scriptWithoutTags)(_this.component);
                });
            });
        }

        /*
         * 스크립트 문자열을 함수로 변환합니다.
         * 이 함수에서 사용된 Function 내장 객체는 특성상 메모리 누수에 취약합니다.
         * 최초 로딩 이후에 재로딩되는 로직은 피하는걸 권장합니다.
         */
        Component.prototype.makeFn = function(script) {                        
            return new Function('Component', script);
        }

        /*
         * 각 페이지별로 message listener를 설정하는 on 생성 함수.
         */
        Component.prototype.createOnFn = function() {
            return function on(key, fn) {
                this.message[key] = fn.bind(this.scope);
            }.bind(this);
        }

        /*
         * message listener를 호출하는 emit 생성 함수.
         */
        Component.prototype.createEmitFn = function() {
            return function emit(key, param) {
                if(__hasProp.call(this.message, key)) {
                    return this.message[key](param);
                }
                this.throwError('error', 'not found message: ' + key);
            }.bind(this);
        }

        Component.prototype.onLoad = function(fn) {
            this.loadListener = fn;
            return this.callee;
        }

        /*
         * 비동기 방식으로 url에 해당하는 파일을 문자열로 가져옵니다.
         */
        Component.prototype.getComponent = function(url, fn) {

            /*
             * 캐시된 페이지라면 캐시에서 꺼내옵니다.
             */
            if (this.hasCache(url)) {
                fn(this.getCache(url));
                return;
            }

            const _this = this;

            const xhr = new XMLHttpRequest();
            xhr.open('get', url, true);
            xhr.onload = function(res) {
                const isOK = xhr.readyState === 4 && res.target.status === 200;

                if (isOK) {
                    /*
                     * 최초 로드된 페이지라면 캐싱합니다.
                     */
                    _this.setCache(url, res.target.responseText);
                    fn(res.target.responseText);
                    return;
                }

                _this.throwError('error', 'Invalid url: "' + url + '" [' + res.target.status + ']');
            }
            xhr.send();
        }

        Component.prototype.throwError = function(type, msg) {
            const errorMsg = `[Component] ${msg}`;

            if (type === 'syntax') {
                throw new SyntaxError(errorMsg);
            }
            throw new Error(errorMsg);
        }

        Component.prototype.hasCache = function(key) {
            return __hasProp.call(__cache, key);
        }

        Component.prototype.setCache = function(key, value) {
            return __cache[key] = value;
        }

        Component.prototype.getCache = function(key) {
            return __cache[key];
        }

        return Component;
    }
));