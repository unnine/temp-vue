/**
 * author: 정언구
 * created: 2025. 12. 04
 */

const format = (year, month, date) => `${year}-${month}-${date}`;

class Calendar {

    #constants = {
        rect: {
            calendar: {
                width: 280,
                height: 329,
            },
        },
        language: {
            ko: {
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

    #id = 'simple-datepicker-calendar';
    #locale = 'en';
    #isOpen = false;
    #elements = {};
    #displayValue = {};
    #state = {};


    constructor() {
        this.#initState();
    }


    #initState() {
        this.$el = null;
        this.#isOpen = false;
        this.#elements = {
            $calendar: null,
            header: {
                $title: null,
            },
            body: {
                $table: null,
            },
        };
        this.#displayValue = {
            year: 0,
            month: 0,
        };
        this.#state = {
            rect: {
                bottom: 0,
                height: 0,
                left: 0,
                right: 0,
                top: 0,
                width: 0,
                x: 0,
                y: 0,
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

    #getLanguage() {
        return this.#constants.language[this.#locale];
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
            this.#isOpen = false;
            this.#close();
            return;
        }
        this.#isOpen = true;
        this.#state = state;
        this.#render();
    }

    #close() {
        this.#destroy();
    }

    #destroy() {
        if (!this.#elements.$calendar) {
            return;
        }
        this.#elements.$calendar.replaceChildren();
        this.#elements.$calendar.remove();
        this.#initState();
    }

    #render() {
        const { year, month } = this.#state.value;
        this.#setDisplayYear(year);
        this.#setDisplayMonth(month);
        this.#renderCalendar();
        this.#renderDays();
    }

    #renderCalendar() {
        const $calendar = document.createElement('div');
        $calendar.id = this.#id;
        $calendar.classList.add('simple-datepicker-calendar');

        const { calendar } = this.#constants.rect;
        $calendar.style.width = `${calendar.width}px`;
        $calendar.style.height = `${calendar.height}px`;

        const { top, left } = this.#getRenderingPoint();
        $calendar.style.top = top;
        $calendar.style.left = left;

        const $header = this.#createHeader();
        const $body = this.#createBody();
        $calendar.append($header, $body);

        this.#elements.$calendar = $calendar;
        document.body.insertAdjacentElement("beforeend", $calendar);
        this.#bindCalendarCloseEvent();
    }

    #getRenderingPoint() {
        const { calendar } = this.#constants.rect;
        const { x, y, height, right, top } = this.#state.rect;

        let renderingTop = y + height - 1;
        let renderingLeft = x;

        const overflowScreenX = renderingLeft + calendar.width > window.innerWidth;
        const overflowScreenY = renderingTop + calendar.height > window.innerHeight;

        if (overflowScreenX) {
            renderingLeft = right - 280;
        }
        if (overflowScreenY) {
            renderingTop = top - 329;
        }
        return {
            top: renderingTop,
            left: renderingLeft,
        };
    }

    #createHeader() {
        const $interaction = this.#createHeaderInteraction();
        const $divider = this.#createHeaderInfo();
        const $header = document.createElement('div');
        $header.classList.add('simple-datepicker-calendar__header');
        $header.append($interaction, $divider)
        return $header;
    }

    #onPrevMonthButtonEvent = function() {
        const { year, month } = this.#displayValue;
        const isJanuary = month === 1;
        const prevYear = isJanuary ? year -1 : year;
        const prevMonth = isJanuary ? 12 : month - 1;
        this.#setDisplayYear(prevYear);
        this.#setDisplayMonth(prevMonth);
        this.#renderDays();
    }.bind(this);

    #onNextMonthButtonEvent = function() {
        const { year, month } = this.#displayValue;
        const isDecember = month === 12;
        const nextYear = isDecember ? year + 1 : year;
        const nextMonth = isDecember ? 1 : month + 1;
        this.#setDisplayYear(nextYear);
        this.#setDisplayMonth(nextMonth);
        this.#renderDays();
    }.bind(this);

    #createHeaderInteraction() {
        const $prevButton = document.createElement('button');
        $prevButton.classList.add('simple-datepicker-calendar__header-interaction__button', 'prev');
        $prevButton.addEventListener('click', this.#onPrevMonthButtonEvent);

        const $title = document.createElement('div');
        $title.classList.add('simple-datepicker-calendar__header-interaction__title');
        this.#elements.header.$title = $title;

        const $nextButton = document.createElement('button');
        $nextButton.classList.add('simple-datepicker-calendar__header-interaction__button', 'next');
        $nextButton.addEventListener('click', this.#onNextMonthButtonEvent);

        const $interaction = document.createElement('div');
        $interaction.classList.add('simple-datepicker-calendar__header-interaction');
        $interaction.append($prevButton, $title, $nextButton);
        return $interaction;
    }

    #createHeaderInfo() {
        const $divider = document.createElement('div');
        $divider.classList.add('simple-datepicker-calendar__header-divider');
        return $divider;
    }

    #createBody() {
        const $table = document.createElement('table');
        this.#elements.body.$table = $table;

        const $body = document.createElement('div');
        $body.classList.add('simple-datepicker-calendar__body');
        $body.append($table);
        return $body;
    }

    #renderDays() {
        this.#removeDays();
        this.#renderDaysOfWeek();
        this.#renderDatePicker();
        this.#selectDateByCurrentValue();
        this.#refreshHeader();
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

    #removeDays() {
        const $table = this.#elements.body.$table;
        if (!$table) {
            return;
        }
        $table.replaceChildren();
    }

    #renderDatePicker() {
        const { year, month } = this.#displayValue;

        const getDatesByMonth = () => {
            const firstDate = new Date(year, month - 1, 1);
            const firstDayOfWeek = firstDate.getDay();
            const lastDate = new Date(year, month, 0);
            const dates = [...Array(lastDate.getDate()).keys().map(i => i + 1)];

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
                const $cell = this.#createDateCells(date);
                $row.append($cell);
            });
            this.#elements.body.$table.append($row);
        }

        const dates = getDatesByMonth();
        const weeks = toWeeks(dates);
        weeks.forEach(week => addRow(week));
    }

    #createDateCells(date) {
        const { year, month } = this.#displayValue;
        const $cell = document.createElement('td');

        if (date < 0) {
            $cell.classList.add('simple-datepicker-calendar__blank');
            return $cell;
        }
        $cell.classList.add('simple-datepicker-calendar__body__date');
        $cell.innerText = date;
        $cell.setAttribute('data-simple-datepicker-value', format(year, month, date));

        const dayOfWeekColor = this.#constants.color.dayOfWeek;
        const dayOfWeek = new Date(year, month - 1, date).getDay();

        if (Object.hasOwn(dayOfWeekColor, dayOfWeek)) {
            $cell.classList.add(dayOfWeekColor[dayOfWeek]);
        }

        this.#bindSelectDateEvent($cell);
        return $cell;
    }

    #bindSelectDateEvent($date) {
        $date.addEventListener('click', e => {
            e.stopPropagation();
            const { year, month }  = this.#displayValue;
            this.#selectValue(year, month, e.target.innerText);
            this.#close();
        });
    }

    #bindCalendarCloseEvent() {
        this.#elements.$calendar.addEventListener('click', e => e.stopPropagation());
        document.removeEventListener('click', this.#onCloseCalendar);
        document.addEventListener('click', this.#onCloseCalendar);
    }

    #onCloseCalendar = function(e) {
        this.#close();
    }.bind(this);

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

    #selectDateByCurrentValue() {
        const { year, month, date } = this.#state.value;
        const $target = document.querySelector(`[data-simple-datepicker-value="${format(year, month, date)}"]`);

        if (!$target) {
            return;
        }
        $target.classList.add('selected');
    }

    #refreshHeader() {
        const { year, month } = this.#displayValue;
        this.#elements.header.$title.innerText = this.#getLanguage().makeTitle(year, month);
    }
}

const globalCalendar = new Calendar();
globalCalendar.setConfig({ locale: 'ko' });

class Datepicker {

    #id;
    #$el;
    #$input;

    #value = {
        year: 0,
        month: 0,
        date: 0,
    };


    constructor(id) {
        this.#initContainer(id);
        this.#bindContainerEvents();
        this.#createDatepickerInput();
    }


    #initContainer(id) {
        if (!id) {
            throw new Error(`[Datepicker] id is required.`);
        }

        this.#id = id;

        const $el = document.getElementById(id);

        if (!$el) {
            throw new Error(`[Datepicker] not found element by id. '${id}'`);
        }

        this.#$el = $el;
        this.#$el.classList.add('simple-datepicker');
        this.#$el.style.borderColor = 'var(--base-color)';

        const today = new Date();
        this.#value.year = today.getFullYear();
        this.#value.month = today.getMonth() + 1;
        this.#value.date = today.getDate();
    }

    #generateId() {
        return Math.trunc(Math.pow(Math.random() * 10, 17));
    }

    #createDatepickerInput() {
        const $node = document.createElement('input');
        $node.type = 'text';
        $node.classList.add('simple-datepicker-input');
        $node.id = `simple-datepicker-input-${this.#generateId()}`;
        $node.value = this.#getToday();
        this.#$input = $node;
        this.#$el.append($node);
    }

    #getToday() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const date = today.getDate();
        return format(year, month, date);
    }

    #synchronizeValueToView() {
        const { year, month, date } = this.#value;
        const value = format(year, month, date);
        this.#$input.value = value;
    }

    #bindContainerEvents() {
        this.#$el.addEventListener('click', e => {
            e.stopPropagation();

            if (globalCalendar.isOpen()) {
                return;
            }
            const { x, y, width, height, top, left, right, bottom } = e.currentTarget.getBoundingClientRect();

            globalCalendar.toggle({
                rect: { x, y, width, height, top, left, right, bottom },
                value: { ...this.#value },
                onSelectedYear: this.#onSelectedYear,
                onSelectedMonth: this.#onSelectedMonth,
                onSelectedDate: this.#onSelectedDate,
            });
        });
    }

    #onSelectedYear = function(selectedYear) {
        this.#value.year = selectedYear;
        this.#synchronizeValueToView();
    }.bind(this);

    #onSelectedMonth = function(selectedMonth) {
        this.#value.month = selectedMonth;
        this.#synchronizeValueToView();
    }.bind(this);

    #onSelectedDate = function(selectedDate) {
        this.#value.date = selectedDate;
        this.#synchronizeValueToView();
    }.bind(this);


}

window.Datepicker = Datepicker;