/**
 * author: 정언구
 * created: 2025. 12. 04
 */

(function DatePicker(module) {
    window.Datepicker = module;
}(
    (function(Util, createCalendar) {

        const Calendar = createCalendar(Util);

        const __calendar = new Calendar();
        const __util = Util;


        class Datepicker {
            #$container;
            #$input;

            #initialValue = {};
            #state = {
                value: {},
                limit: {},
                attr: {
                    disabled: false,
                    readonly: false,
                },
                event: {
                    onInput: () => {},
                },
            };


            constructor(idOrElement, initProps) {
                this.#initContainer(idOrElement, initProps);
                this.#bindContainerEvents();
                this.#createDatepickerInput();
                this.#synchronizeValueToView();
            }


            #initContainer($target, initProps) {
                if (typeof $target === 'string') {
                    $target = document.getElementById($target);
                }

                if (!$target) {
                    throw new Error(`[Datepicker] not found target element.`);
                }

                const $self = document.createElement('div');
                this.#$container = $self;
                this.#$container.classList.add('simple-datepicker-container');
                this.#$container.style.borderColor = 'var(--base-color)';
                $target.append($self);

                const initialFullDate = initProps?.value ?? __util.getToday();
                const initialValue = __util.splitFullDateToNumber(initialFullDate);
                this.#initialValue = { ...initialValue };

                this.#initState();
            }

            #initState() {
                this.#state.value = { ...this.#initialValue }

                this.#state.limit = {
                    before: {
                        year: 0,
                        month: 0,
                        date: 0,
                    },
                    after: {
                        year: 0,
                        month: 0,
                        date: 0,
                    },
                };
            }

            #createDatepickerInput() {
                const $node = document.createElement('input');
                $node.type = 'text';
                $node.classList.add('simple-datepicker-input');
                $node.id = `simple-datepicker-input-${__util.generateId()}`;
                $node.value = __util.getToday();
                $node.setAttribute('readonly', 'readonly');
                this.#$input = $node;
                this.#$container.append($node);
            }

            #synchronizeValueToView() {
                this.#$input.value = this.value();
            }

            #bindContainerEvents() {
                document.addEventListener('pointerdown', e => {
                    const isMe = this.#$container === e.target;
                    const isChild = this.#$container.contains(e.target);

                    if (!isMe && !isChild) {
                        return;
                    }
                    if (__calendar.isOpen()) {
                        return;
                    }

                    const { width, height, top, right, bottom, left }= this.#$container.getBoundingClientRect();

                    __calendar.toggle({
                        rect: { width, height, top, right, bottom, left },
                        value: { ...this.#state.value },
                        limit: {
                            before: {
                                ...this.#state.limit.before,
                            },
                            after: {
                                ...this.#state.limit.after,
                            },
                        },
                        onSelectedYear: this.#onSelectedYear,
                        onSelectedMonth: this.#onSelectedMonth,
                        onSelectedDate: this.#onSelectedDate,
                    });
                });
            }

            #onSelectedYear = (selectedYear) => {
                this.#state.value.year = selectedYear;
                this.#synchronizeValueToView();
            };

            #onSelectedMonth = (selectedMonth) => {
                this.#state.value.month = selectedMonth;
                this.#synchronizeValueToView();
            };

            #onSelectedDate = (selectedDate) => {
                this.#state.value.date = selectedDate;
                this.#synchronizeValueToView();
                this.#state.event.onInput({
                    value: this.value(),
                    target: this,
                });
            };

            _restrictBefore(fullDate) {
                this.#state.limit.before = __util.splitFullDateToNumber(fullDate);
            }

            _restrictAfter(fullDate) {
                this.#state.limit.after = __util.splitFullDateToNumber(fullDate);
            }

            init() {
                this.#initState();
                this.#synchronizeValueToView();
            }

            setValue(fullDate) {
                this.#state.value = __util.splitFullDateToNumber(fullDate);
                this.#synchronizeValueToView();
            }

            value() {
                const { year, month, date } = this.#state.value;
                return __util.format(year, month, date);
            }

            onInput(handler) {
                if (typeof handler === 'function') {
                    this.#state.event.onInput = handler;
                }
            }

            isDeactivated() {
                const { disabled, readonly } = this.#state.attr;
                return disabled || readonly;
            }

            enable() {
                const { attr } = this.#state;
                attr.disabled = false;
                attr.readonly = false;
                this.#$container.classList.remove('disabled', 'readonly');
            }

            disable() {
                this.#state.attr.disabled = true;
                this.#$container.classList.add('disabled');
            }

            readonly() {
                this.#state.attr.readonly = true;
                this.#$container.classList.add('readonly');
            }
        }


        class RangeDatepicker {
            #datepicker = {
                before: null,
                after: null,
            };

            #initialValue = {
                before: '',
                after: '',
            };

            #state = {
                value: {
                    before: '',
                    after: '',
                },
                attr: {
                    disabled: false,
                    readonly: false,
                },
                event: {
                    onInput: () => {},
                },
            };


            constructor(idOrElement, initProps) {
                this.#initContainer(idOrElement, initProps);
                this.#bindMutualLimitEvents();
            }


            #initContainer($target, initProps) {
                if (typeof $target === 'string') {
                    $target = document.getElementById($target);
                }

                if (!$target) {
                    throw new Error(`[RangeDatepicker] not found target element.`);
                }

                const $before = this.#createBeforeDatepicker();
                const $after = this.#createAfterDatepicker();
                const $container = this.#createContainer();
                $container.append($before, $after);
                $target.append($container);

                const beforeInitProps = {};
                const afterInitProps = {};

                if (initProps?.value) {
                    beforeInitProps.value = initProps.value[0];
                    afterInitProps.value = initProps.value[1];
                }

                this.#datepicker.before = new Datepicker($before.id, beforeInitProps);
                this.#datepicker.after = new Datepicker($after.id, afterInitProps);

                this.#initialValue.before = this.#datepicker.before.value();
                this.#initialValue.after = this.#datepicker.after.value();

                this.#initState();
            }

            #initState() {
                this.#state.value = { ...this.#initialValue };

                this.#datepicker.before._restrictAfter(this.#state.value.after);
                this.#datepicker.after._restrictBefore(this.#state.value.before);
            }

            #createContainer() {
                const $container = document.createElement('div');
                $container.classList.add('simple-range-datepicker-container');
                return $container;
            }

            #createBeforeDatepicker() {
                const $before = document.createElement('div');
                $before.id = __util.generateId();
                return $before;
            }

            #createAfterDatepicker() {
                const $after = document.createElement('div');
                $after.id = __util.generateId();
                return $after;
            }

            #bindMutualLimitEvents() {
                const { before, after } = this.#datepicker;

                before.onInput(e => {
                    const { value } = e;
                    this.#state.value.before = value;
                    after._restrictBefore(value);

                    if (this.#isBeforeValueGreaterThanAfterValue()) {
                        after.setValue(value);
                    }

                    this.#state.event.onInput({
                        value: this.value(),
                        target: this,
                    });
                });

                after.onInput(e => {
                    const { value } = e;
                    this.#state.value.after = value;
                    before._restrictAfter(value);

                    if (this.#isBeforeValueGreaterThanAfterValue()) {
                        before.setValue(value);
                    }

                    this.#state.event.onInput({
                        value: this.value(),
                        target: this,
                    });
                });
            }

            #isBeforeValueGreaterThanAfterValue() {
                const { before, after } = this.#getValuesToNumber();
                return before > after;
            }

            #getValuesToNumber() {
                const { before, after } = this.#state.value;
                const beforeNumber = this.#fullDateToNumber(before);
                const afterNumber = this.#fullDateToNumber(after);
                return {
                    before: beforeNumber,
                    after: afterNumber,
                };
            }

            #fullDateToNumber(fullDate) {
                const [ year, month, date ] = fullDate.split('-');
                return __util.toNumber(year, month, date);
            }

            init() {
                this.#datepicker.before.init();
                this.#datepicker.after.init();
                this.#initState();
            }

            setValue(dates) {
                const [ beforeFullDate, afterFullDate ] = dates;
                this.#datepicker.before.setValue(beforeFullDate);
                this.#datepicker.after.setValue(afterFullDate);
                this.#state.value.before = beforeFullDate;
                this.#state.value.after = afterFullDate;
            }

            value() {
                const { before, after } = this.#state.value;
                return [ before, after ]
            }

            onInput(handler) {
                if (typeof handler === 'function') {
                    this.#state.event.onInput = handler;
                }
            }

            isDeactivated() {
                const { before, after } = this.#datepicker;
                return before.isDeactivated() && after.isDeactivated();
            }

            enable() {
                const { attr } = this.#state;
                attr.disabled = false;
                attr.readonly = false;

                const { before, after } = this.#datepicker;
                before.enable();
                after.enable();
            }

            disable() {
                this.#state.attr.disabled = true;

                const { before, after } = this.#datepicker;
                before.disable();
                after.disable();
            }

            readonly() {
                this.#state.attr.readonly = true;

                const { before, after } = this.#datepicker;
                before.readonly();
                after.readonly();
            }
        }


        return {
            single(id, initProps) {
                return new Datepicker(id, initProps);
            },
            range(id, initProps) {
                return new RangeDatepicker(id, initProps);
            },
            setConfig(config) {
                __calendar.setConfig(config);
            },
        };

    }(

        (function Util() {

            return {
                generateId() {
                    return crypto.randomUUID();
                },
                getToday() {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = today.getMonth() + 1;
                    const date = today.getDate();
                    return this.format(year, month, date);
                },
                padZero(value) {
                    if (value == null) {
                        return value;
                    }
                    return String(value).padStart(2, '0');
                },
                format(year, month, date) {
                    return `${year}-${this.padZero(month)}-${this.padZero(date)}`;
                },
                toNumber(year, month, date) {
                    const fullDate = `${year}${this.padZero(month)}${this.padZero(date)}`;
                    return Number(fullDate);
                },
                splitFullDateToNumber(fullDate) {
                    const [ year, month, date ] = fullDate.split('-');
                    return {
                        year: Number(year),
                        month: Number(month),
                        date: Number(date),
                    };
                },
            };
        }()),

        (function createCalendar(Util) {

            const __util = Util;

            const __constants = {
                selectType: {
                    DATE: 'date',
                    MONTH: 'month',
                    YEAR: 'year',
                },
                rect: {
                    calendar: {
                        width: 282,
                        height: 363,
                    },
                },
                language: {
                    ko: {
                        info: {
                            prevYear: '이전 연도.',
                            nextYear: '다음 연도.',
                        },
                        month: {
                            names: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                        },
                        daysOfWeek: {
                            names: ['일', '월', '화', '수', '목', '금', '토'],
                        },
                        makeTitle(year, month) {
                            return `${year}년 ${this.month.names[month - 1]}`;
                        },
                    },
                    en: {
                        info: {
                            prevYear: 'prev year.',
                            nextYear: 'next year.',
                        },
                        month: {
                            names: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        },
                        daysOfWeek: {
                            names: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        },
                        makeTitle(year, month) {
                            return `${this.month.names[month - 1]} ${year}`;
                        },
                    },
                },
                color: {
                    dayOfWeek: {
                        0: 'sun',
                        6: 'sat',
                    },
                },
            };

            return class Calendar {
                #id = 'simple-datepicker-calendar';
                #locale = 'en';
                #isOpen = false;
                #elements = {
                    $calendar: null,
                    header: {
                        $title: null,
                        info: {
                            $prevButton: null,
                            $nextButton: null,
                        },
                    },
                    body: {
                        $table: null,
                    },
                };
                #selectType = null;
                #displayValue = {};
                #state = {};


                constructor() {
                    this.#initState();
                    this.#renderCalendar();
                }


                #initState() {
                    this.#selectType = __constants.selectType.DATE;
                    this.#displayValue = {
                        year: 0,
                        month: 0,
                    };
                    this.#state = {
                        rect: {
                            width: 0,
                            height: 0,
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                        },
                        limit: {
                            before: {
                                year: 0,
                                month: 0,
                                date: 0,
                            },
                            after: {
                                year: 0,
                                month: 0,
                                date: 0,
                            },
                        },
                        value: {
                            year: 0,
                            month: 0,
                            date: 0,
                        },
                        onSelectedYear: (selectedYear) => {},
                        onSelectedMonth: (selectedMonth) => {},
                        onSelectedDate: (selectedDate) => {},
                    };
                }

                #renderCalendar() {
                    const $calendar = document.createElement('div');
                    $calendar.id = this.#id;
                    $calendar.classList.add('simple-datepicker-calendar');

                    const { calendar } = __constants.rect;
                    $calendar.style.width = `${calendar.width}px`;
                    $calendar.style.height = `${calendar.height}px`;
                    $calendar.style.top = `-${calendar.height}px`;
                    $calendar.style.left = `-${calendar.width}px`;

                    const $header = this.#createHeader();
                    const $body = this.#createBody();
                    $calendar.append($header, $body);

                    this.#bindCalendarCloseEvent($calendar);

                    this.#elements.$calendar = $calendar;

                    const onLoaded = () => {
                        document.body.insertAdjacentElement("beforeend", $calendar);
                        document.removeEventListener('DOMContentLoaded', onLoaded);
                    }
                    document.addEventListener('DOMContentLoaded', onLoaded);
                }

                #createHeader() {
                    const $interaction = this.#createHeaderInteraction();
                    const $divider = this.#createHeaderInfo();
                    const $header = document.createElement('div');
                    $header.classList.add('simple-datepicker-calendar__header');
                    $header.append($interaction, $divider)
                    return $header;
                }

                #createHeaderInteraction() {
                    const $prevButton = document.createElement('button');
                    $prevButton.classList.add('simple-datepicker-calendar__header-interaction__button', 'prev');
                    this.#bindPrevMonthButtonEvent($prevButton);

                    const $title = document.createElement('div');
                    $title.classList.add('simple-datepicker-calendar__header-interaction__title');
                    this.#elements.header.$title = $title;
                    this.#bindTitleButtonEvent($title);

                    const $nextButton = document.createElement('button');
                    $nextButton.classList.add('simple-datepicker-calendar__header-interaction__button', 'next');
                    this.#bindNextMonthButtonEvent($nextButton);

                    const $interaction = document.createElement('div');
                    $interaction.classList.add('simple-datepicker-calendar__header-interaction');
                    $interaction.append($prevButton, $title, $nextButton);
                    return $interaction;
                }

                #createHeaderInfo() {
                    const $prevButton = document.createElement('button');
                    $prevButton.classList.add('simple-datepicker-calendar__header-info__button', 'prev');
                    this.#elements.header.info.$prevButton = $prevButton;
                    this.#bindHeaderInfoPrevButtonEvent($prevButton);

                    const $nextButton = document.createElement('button');
                    $nextButton.classList.add('simple-datepicker-calendar__header-info__button', 'next');
                    this.#elements.header.info.$nextButton = $nextButton;
                    this.#bindHeaderInfoNextButtonEvent($nextButton);

                    const $info = document.createElement('div');
                    $info.classList.add('simple-datepicker-calendar__header-info');
                    $info.append($prevButton, $nextButton);
                    return $info;
                }

                #createBody() {
                    const $table = document.createElement('table');
                    this.#elements.body.$table = $table;

                    const $body = document.createElement('div');
                    $body.classList.add('simple-datepicker-calendar__body');
                    $body.append($table);
                    return $body;
                }

                #getLanguage() {
                    return __constants.language[this.#locale];
                }

                #currentSelectType() {
                    return {
                        isDate: this.#selectType === __constants.selectType.DATE,
                        isMonth: this.#selectType === __constants.selectType.MONTH,
                        isYear: this.#selectType === __constants.selectType.YEAR,
                    };
                }

                #open() {
                    const { year, month } = this.#state.value;

                    this.#isOpen = true;
                    this.#showCalendar();
                    this.#setDisplayYear(year);
                    this.#setDisplayMonth(month);
                    this.#renderDatePicker();
                }

                #showCalendar() {
                    const { top, left } = this.#getRenderingPoint();
                    const { $calendar } = this.#elements;

                    $calendar.style.display = 'block';
                    $calendar.style.top = `${top}px`;
                    $calendar.style.left = `${left}px`;
                }

                #getRenderingPoint() {
                    const top = this.#getRenderingTop();
                    const left = this.#getRenderingLeft();
                    return { top, left };
                }

                #getRenderingLeft() {
                    const windowWidth = window.innerWidth;
                    const { width: calendarWidth } = __constants.rect.calendar;
                    const { left, right } = this.#state.rect;

                    let renderingLeft = left;

                    const overflowScreenX = renderingLeft + calendarWidth > windowWidth;
                    if (overflowScreenX) {
                        renderingLeft = right - calendarWidth;
                    }

                    const renderingRight = renderingLeft + calendarWidth;
                    if (renderingRight > windowWidth) {
                        renderingLeft = renderingLeft - (renderingRight - windowWidth);
                    }

                    if (renderingLeft < 0) {
                        renderingLeft = 0;
                    }
                    return renderingLeft;
                }

                #getRenderingTop() {
                    const windowHeight = window.innerHeight;
                    const { height: calendarHeight } = __constants.rect.calendar;
                    const { top, height } = this.#state.rect;

                    let renderingTop = top + height - 1;

                    const overflowScreenY = renderingTop + calendarHeight > windowHeight;
                    if (overflowScreenY) {
                        renderingTop = top - calendarHeight;
                    }

                    const renderingBottom = renderingTop + calendarHeight;
                    if (renderingBottom > windowHeight) {
                        renderingTop = renderingTop - (renderingBottom - windowHeight);
                    }

                    if (renderingTop < 0) {
                        renderingTop = 0;
                    }
                    return renderingTop;
                }

                #close() {
                    this.#isOpen = false;

                    if (!this.#elements.$calendar) {
                        return;
                    }
                    this.#elements.$calendar.style.display = 'none';
                    this.#clearTable();
                    this.#initState();
                }

                #renderDatePicker() {
                    this.#selectType = __constants.selectType.DATE;

                    this.#clearTable();
                    this.#renderDaysOfWeek();
                    this.#renderDates();
                    this.#selectDateByCurrentValue();

                    const { year, month } = this.#displayValue;
                    const title = this.#getLanguage().makeTitle(year, month);
                    this.#refreshHeader(title);
                }

                #renderDaysOfWeek() {
                    const daysOfWeek = this.#getLanguage().daysOfWeek.names;
                    const $tr = document.createElement('tr');
                    daysOfWeek.forEach(dayOfWeek => {
                        const $th = document.createElement('th');
                        $th.classList.add('simple-datepicker-calendar__body__day-of-week');
                        $th.innerHTML = dayOfWeek;
                        $tr.append($th);
                    });
                    this.#elements.body.$table.append($tr);
                }

                #clearTable() {
                    const $table = this.#elements.body.$table;
                    if (!$table) {
                        return;
                    }
                    $table.replaceChildren();
                }

                #renderDates() {
                    const { year, month } = this.#displayValue;

                    const getDatesByMonth = () => {
                        const firstDate = new Date(year, month - 1, 1);
                        const firstDayOfWeek = firstDate.getDay();
                        const lastDate = new Date(year, month, 0);
                        const dates = [...new Array(lastDate.getDate()).keys().map(i => i + 1)];

                        for (let i = 0; i < firstDayOfWeek; i++) {
                            dates.unshift(-1);
                        }
                        return dates;
                    }

                    const toWeeks = (dates) => {
                        const weeks = [];

                        while (dates.length > 0) {
                            weeks.push([...dates.splice(0, 7)]);
                        }
                        return weeks;
                    }

                    const addRow = (week) => {
                        const $row = document.createElement('tr');

                        week.forEach(date => {
                            const $cell = this.#createDateCell(date);
                            $row.append($cell);
                        });
                        this.#elements.body.$table.append($row);
                    }

                    const dates = getDatesByMonth();
                    const weeks = toWeeks(dates);
                    weeks.forEach(week => addRow(week));
                }

                #isPastThanBeforeLimit(year, month, date) {
                    const { before } = this.#state.limit;
                    const current = __util.toNumber(year, month, date);
                    const beforeLimit = __util.toNumber(before.year, before.month, before.date);
                    return beforeLimit > 0 && current < beforeLimit;
                }

                #isFutureThanAfterLimit(year, month, date) {
                    const { after } = this.#state.limit;
                    const current = __util.toNumber(year, month, date);
                    const afterLimit = __util.toNumber(after.year, after.month, after.date);
                    return afterLimit > 0 && current > afterLimit;
                }

                #createDateCell(date) {
                    const { year, month } = this.#displayValue;
                    const $cell = document.createElement('td');

                    if (date < 0) {
                        return $cell;
                    }

                    if (this.#isPastThanBeforeLimit(year, month, date) || this.#isFutureThanAfterLimit(year, month, date)) {
                        $cell.classList.add('disabled');
                    }

                    $cell.classList.add('simple-datepicker-calendar__body__date');
                    $cell.innerText = date;
                    $cell.setAttribute('data-value', __util.format(year, month, date));

                    const dayOfWeekColor = __constants.color.dayOfWeek;
                    const dayOfWeek = new Date(year, month - 1, date).getDay();

                    if (Object.hasOwn(dayOfWeekColor, dayOfWeek)) {
                        $cell.classList.add(dayOfWeekColor[dayOfWeek]);
                    }

                    this.#bindSelectDateEvent($cell);
                    return $cell;
                }

                #renderMonthPicker() {
                    this.#selectType = __constants.selectType.MONTH;

                    this.#clearTable();
                    this.#renderMonths();
                    this.#selectMonthByCurrentValue();

                    const { year } = this.#displayValue;
                    this.#refreshHeader(year);
                }

                #renderMonths() {
                    const monthNames = [...this.#getLanguage().month.names];

                    const toRows = (monthNames) => {
                        const rows = [];

                        while (monthNames.length > 0) {
                            rows.push([...monthNames.splice(0, 3)]);
                        }
                        return rows;
                    }

                    let monthValue = 0;

                    const addRow = (row) => {
                        const $row = document.createElement('tr');

                        row.forEach((monthName) => {
                            monthValue += 1;
                            const $cell = this.#createMonthCell(monthName, monthValue);
                            $row.append($cell);
                        });
                        this.#elements.body.$table.append($row);
                    }

                    const rows = toRows(monthNames);
                    rows.forEach(row => addRow(row));
                }

                #createMonthCell(monthName, monthValue) {
                    const { year } = this.#displayValue;
                    const $cell = document.createElement('td');

                    if (this.#isPastThanBeforeLimit(year, monthValue, 32) || this.#isFutureThanAfterLimit(year, monthValue, 0)) {
                        $cell.classList.add('disabled');
                    }

                    $cell.classList.add('simple-datepicker-calendar__body__month');
                    $cell.innerText = monthName;
                    $cell.setAttribute('data-value', monthValue);
                    this.#bindSelectMonthEvent($cell);
                    return $cell;
                }

                #renderYearPicker() {
                    this.#selectType = __constants.selectType.YEAR;

                    this.#clearTable();
                    this.#renderYears();
                    this.#selectYearByCurrentValue();

                    const { min, max } = this.#getYearsRange();
                    this.#refreshHeader(`${min} - ${max}`);
                }

                #renderYears() {
                    const { year } = this.#displayValue;

                    const toRows = (years) => {
                        const rows = [];

                        while (years.length > 0) {
                            rows.push([...years.splice(0, 3)]);
                        }
                        return rows;
                    }

                    const addRow = (row) => {
                        const $row = document.createElement('tr');

                        row.forEach((year) => {
                            const $cell = this.#createYearCell(year);
                            $row.append($cell);
                        });
                        this.#elements.body.$table.append($row);
                    }

                    const { min, max } = this.#getYearsRange();
                    const years = new Array(max - min)
                        .fill(min)
                        .map((v, i) => v + i);

                    const rows = toRows(years);
                    rows.forEach(row => addRow(row));
                }

                #createYearCell(year) {
                    const $cell = document.createElement('td');

                    if (this.#isPastThanBeforeLimit(year, 13, 32) || this.#isFutureThanAfterLimit(year, 0, 0)) {
                        $cell.classList.add('disabled');
                    }

                    $cell.classList.add('simple-datepicker-calendar__body__year');
                    $cell.innerText = year;
                    $cell.setAttribute('data-value', year);
                    this.#bindSelectYearEvent($cell);
                    return $cell;
                }

                #getYearsRange() {
                    const { year } = this.#displayValue;
                    const min = year - (year % 10);
                    const max = min + 10;
                    return { min, max };
                }

                #bindCalendarCloseEvent($calendar) {
                    $calendar.addEventListener('pointerdown', e => e.stopPropagation());
                    document.addEventListener('pointerdown', () => this.#close());
                }

                #bindSelectDateEvent($date) {
                    $date.addEventListener('pointerdown', e => {
                        e.stopPropagation();
                        const { year, month }  = this.#displayValue;
                        this.#selectValue(year, month, e.target.innerText);
                        this.#close();
                    });
                }

                #bindSelectMonthEvent($month) {
                    $month.addEventListener('pointerdown', e => {
                        e.stopPropagation();
                        this.#setDisplayMonth(e.target.dataset.value);
                        this.#renderDatePicker();
                    });
                }

                #bindSelectYearEvent($year) {
                    $year.addEventListener('pointerdown', e => {
                        e.stopPropagation();
                        this.#setDisplayYear(e.target.dataset.value);
                        this.#renderMonthPicker();
                    });
                }

                #bindPrevMonthButtonEvent($button) {
                    const onDatePicker = () => {
                        const { year, month } = this.#displayValue;
                        const isJanuary = month === 1;
                        const prevYear = isJanuary ? year - 1 : year;
                        const prevMonth = isJanuary ? 12 : month - 1;
                        this.#setDisplayYear(prevYear);
                        this.#setDisplayMonth(prevMonth);
                        this.#renderDatePicker();
                    }

                    const onMonthPicker = () => {
                        const { year } = this.#displayValue;
                        const prevYear = year - 1;
                        this.#setDisplayYear(prevYear);
                        this.#refreshHeader(prevYear);
                    }

                    const onYearPicker = () => {
                        const { year } = this.#displayValue;
                        const prevYear = year - 10;
                        this.#setDisplayYear(prevYear);
                        this.#renderYearPicker();
                    }

                    $button.addEventListener('pointerdown', e => {
                        const currentSelectType = this.#currentSelectType();

                        if (currentSelectType.isDate) {
                            onDatePicker();
                            return;
                        }
                        if (currentSelectType.isMonth) {
                            onMonthPicker();
                            return;
                        }
                        if (currentSelectType.isYear) {
                            onYearPicker();
                        }
                    });
                }

                #bindNextMonthButtonEvent($button) {
                    const onDatePicker = () => {
                        const { year, month } = this.#displayValue;
                        const isDecember = month === 12;
                        const nextYear = isDecember ? year + 1 : year;
                        const nextMonth = isDecember ? 1 : month + 1;
                        this.#setDisplayYear(nextYear);
                        this.#setDisplayMonth(nextMonth);
                        this.#renderDatePicker();
                    }

                    const onMonthPicker = () => {
                        const { year } = this.#displayValue;
                        const nextYear = year + 1;
                        this.#setDisplayYear(nextYear);
                        this.#refreshHeader(nextYear);
                    }

                    const onYearPicker = () => {
                        const { year } = this.#displayValue;
                        const nextYear = year + 10;
                        this.#setDisplayYear(nextYear);
                        this.#renderYearPicker();
                    }

                    $button.addEventListener('pointerdown', e => {
                        const currentSelectType = this.#currentSelectType();

                        if (currentSelectType.isDate) {
                            onDatePicker();
                            return;
                        }
                        if (currentSelectType.isMonth) {
                            onMonthPicker();
                            return;
                        }
                        if (currentSelectType.isYear) {
                            onYearPicker();
                        }
                    });
                }

                #bindTitleButtonEvent($title) {
                    $title.addEventListener('pointerdown', () => {
                        const currentSelectType = this.#currentSelectType();

                        if (currentSelectType.isDate) {
                            this.#renderMonthPicker();
                            return;
                        }
                        if (currentSelectType.isMonth) {
                            this.#renderYearPicker();
                            return;
                        }
                    });
                }

                #bindHeaderInfoPrevButtonEvent($info) {
                    $info.addEventListener('pointerdown', () => {
                        const { year } = this.#displayValue;

                        this.#setDisplayYear(year - 1);
                        this.#renderDatePicker();
                    });
                }

                #bindHeaderInfoNextButtonEvent($info) {
                    $info.addEventListener('pointerdown', () => {
                        const { year } = this.#displayValue;

                        this.#setDisplayYear(year + 1);
                        this.#renderDatePicker();
                    });
                }

                #setDisplayYear(year) {
                    this.#displayValue.year = Number(year);
                }

                #setDisplayMonth(month) {
                    this.#displayValue.month = Number(month);
                }

                #selectValue(year, month, date) {
                    const n_year = Number(year);
                    const n_month = Number(month);
                    const n_date = Number(date);

                    this.#state.value.year = n_year;
                    this.#state.value.month = n_month;
                    this.#state.value.date = n_date;

                    this.#state.onSelectedYear(n_year);
                    this.#state.onSelectedMonth(n_month);
                    this.#state.onSelectedDate(n_date);
                }

                #selectCellByValue(value) {
                    const $target = document.querySelector(`#${this.#id} [data-value="${value}"]`);

                    if (!$target) {
                        return;
                    }
                    $target.classList.add('selected');
                }

                #selectDateByCurrentValue() {
                    const { year, month, date } = this.#state.value;
                    this.#selectCellByValue(__util.format(year, month, date));
                }

                #selectMonthByCurrentValue() {
                    const { month } = this.#displayValue;
                    this.#selectCellByValue(month);
                }

                #selectYearByCurrentValue() {
                    const { year } = this.#displayValue;
                    this.#selectCellByValue(year);
                }

                #refreshHeader(title) {
                    this.#refreshTitle(title);
                    this.#refreshHeaderInfo();
                }

                #refreshTitle(title) {
                    this.#elements.header.$title.innerText = title;
                }

                #refreshHeaderInfo() {
                    const currentSelectType = this.#currentSelectType();
                    const { $prevButton, $nextButton } = this.#elements.header.info;

                    if (currentSelectType.isDate) {
                        $prevButton.classList.remove('empty');
                        $nextButton.classList.remove('empty');
                        $prevButton.innerText = this.#getLanguage().info.prevYear;
                        $nextButton.innerText = this.#getLanguage().info.nextYear;
                        return;
                    }
                    $prevButton.classList.add('empty');
                    $nextButton.classList.add('empty');
                    $prevButton.innerText = '';
                    $nextButton.innerText = '';

                }


                setConfig(config) {
                    const { locale } = config;

                    if (['ko', 'en'].includes(locale)) {
                        this.#locale = locale;
                    }
                }

                isOpen() {
                    return this.#isOpen;
                }

                toggle(state) {
                    if (this.#isOpen) {
                        this.#close();
                        return;
                    }
                    this.#state = state;
                    this.#open();
                }
            }
        }),

    ))
));