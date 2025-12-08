/**
 * author: 정언구
 * created: 2025. 12. 04
 */

class Calendar {

    #constants = {
        selectType: {
            DATE: 'date',
            MONTH: 'month',
            YEAR: 'year',
        },
        rect: {
            calendar: {
                width: 282,
                height: 336,
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
    #elements = {
        $calendar: null,
        header: {
            $title: null,
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
        this.#selectType = this.#constants.selectType.DATE;
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

    #currentSelectType() {
        return {
           isDate: this.#selectType === this.#constants.selectType.DATE,
           isMonth: this.#selectType === this.#constants.selectType.MONTH,
           isYear: this.#selectType === this.#constants.selectType.YEAR,
        };
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
        $calendar.style.top = top;
        $calendar.style.left = left;
    }

    #getRenderingPoint() {
        const { calendar } = this.#constants.rect;
        const { x, y, height, right, top } = this.#state.rect;

        let renderingTop = y + height - 1;
        let renderingLeft = x;

        const overflowScreenX = renderingLeft + calendar.width > window.innerWidth;
        const overflowScreenY = renderingTop + calendar.height > window.innerHeight;

        if (overflowScreenX) {
            renderingLeft = right - this.#constants.rect.calendar.width;
        }
        if (overflowScreenY) {
            renderingTop = top - this.#constants.rect.calendar.height;
        }
        return {
            top: renderingTop,
            left: renderingLeft,
        };
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

    #renderCalendar() {
        const $calendar = document.createElement('div');
        $calendar.id = this.#id;
        $calendar.classList.add('simple-datepicker-calendar');

        const { calendar } = this.#constants.rect;
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

    #renderDatePicker() {
        this.#selectType = this.#constants.selectType.DATE;

        this.#clearTable();
        this.#renderDaysOfWeek();
        this.#renderDates();
        this.#selectDateByCurrentValue();

        const { year, month } = this.#displayValue;
        const title = this.#getLanguage().makeTitle(year, month);
        this.#refreshTitle(title);
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
        $cell.setAttribute('data-value', this.#format(year, month, date));

        const dayOfWeekColor = this.#constants.color.dayOfWeek;
        const dayOfWeek = new Date(year, month - 1, date).getDay();

        if (Object.hasOwn(dayOfWeekColor, dayOfWeek)) {
            $cell.classList.add(dayOfWeekColor[dayOfWeek]);
        }

        this.#bindSelectDateEvent($cell);
        return $cell;
    }

    #renderMonthPicker() {
        this.#selectType = this.#constants.selectType.MONTH;

        this.#clearTable();
        this.#renderMonths();
        this.#selectMonthByCurrentValue();

        const { year } = this.#displayValue;
        this.#refreshTitle(year);
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
        const $cell = document.createElement('td');
        $cell.classList.add('simple-datepicker-calendar__body__month');
        $cell.innerText = monthName;
        $cell.setAttribute('data-value', monthValue);
        this.#bindSelectMonthEvent($cell);
        return $cell;
    }

    #renderYearPicker() {
        this.#selectType = this.#constants.selectType.YEAR;

        this.#clearTable();
        this.#renderYears();
        this.#selectYearByCurrentValue();

        const { min, max } = this.#getYearsRange();
        this.#refreshTitle(`${min} - ${max}`);
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

    #bindCalendarCloseEvent($calendar) {
        $calendar.addEventListener('pointerdown', e => e.stopPropagation());
        document.addEventListener('pointerdown', () => this.#close());
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
            this.#refreshTitle(prevYear);
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
            this.#refreshTitle(nextYear);
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
        this.#selectCellByValue(this.#format(year, month, date));
    }

    #selectMonthByCurrentValue() {
        const { month } = this.#displayValue;
        this.#selectCellByValue(month);
    }

    #selectYearByCurrentValue() {
        const { year } = this.#displayValue;
        this.#selectCellByValue(year);
    }

    #refreshTitle(title) {
        this.#elements.header.$title.innerText = title;
    }

    #format(year, month, date) {
        return `${year}-${month}-${date}`;
    }

}

const globalCalendar = new Calendar();
// globalCalendar.setConfig({ locale: 'ko' });

class Datepicker {

    #id;
    #$el;
    #$input;

    #value = {
        year: 0,
        month: 0,
        date: 0,
    };

    #state = {
        event: {
            onInput: () => {},
        },
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
        return this.#format(year, month, date);
    }

    #synchronizeValueToView() {
        this.#$input.value = this.value();
    }

    #format(year, month, date) {
        return `${year}-${this.#padZero(month)}-${this.#padZero(date)}`;
    }

    #padZero = (value) => {
        if (value == null) {
            return value;
        }
        return String(value).padStart(2, '0');
    }

    #bindContainerEvents() {
        document.addEventListener('pointerdown', e => {
            const isMe = this.#$el === e.target;
            const isChild = this.#$el.contains(e.target);

            if (!isMe && !isChild) {
                return;
            }
            if (globalCalendar.isOpen()) {
                return;
            }

            const { x, y, width, height, top, left, right, bottom } = this.#$el.getBoundingClientRect();

            globalCalendar.toggle({
                rect: { x, y, width, height, top, left, right, bottom },
                value: { ...this.#value },
                onSelectedYear: this.#onSelectedYear,
                onSelectedMonth: this.#onSelectedMonth,
                onSelectedDate: this.#onSelectedDate,
            });
        });
    }

    #onSelectedYear = (selectedYear) => {
        this.#value.year = selectedYear;
        this.#synchronizeValueToView();
    };

    #onSelectedMonth = (selectedMonth) => {
        this.#value.month = selectedMonth;
        this.#synchronizeValueToView();
    };

    #onSelectedDate = (selectedDate) => {
        this.#value.date = selectedDate;
        this.#synchronizeValueToView();
        this.#state.event.onInput({
            value: this.value()
        });
    };

    value() {
        const { year, month, date } = this.#value;
        return this.#format(year, month, date);
    }

    onInput(handler) {
        if (typeof handler === 'function') {
            this.#state.event.onInput = handler;
        }
    }

}

window.Datepicker = Datepicker;