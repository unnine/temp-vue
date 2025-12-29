import { FormBuilder } from 'form';
import { ColumnBuilder } from 'grid';

const searchForm = FormBuilder.builder('form')
    .Hidden('sample8', 'Hidden')
    .multiple('multiple', '멀티', {
        countPerRow: 2,
        children: FormBuilder.builder()
            .Input('m1', 'm1')
            .InputPassword('m3', 'm2')
            .Input('m2', 'm1')
            .InputPassword('m4', 'm2')
            .required()
            .build(),
    })
    .Input('sample1', 'Input', {
        validator(value) {
            if (value == 1) {
                return '1은 입력할 수 없습니다.';
            }
            if (value == 12) {
                return false;
            }
            if (value === '') {
                return '필수입니다.';
            }
            return true;
        },
    })
    .required()
    // .colSpan(2)
    // .rowSpan(2)
    .InputPassword('sample2', 'InputPassword')
    .required()
    .InputNumber('sample3', 'InputNumber')
    .required()
    .Select('sample6', 'Select', {
        value: 1,
        options: async () => {
            return [
                { label: '전체', value: '' },
                { label: 'a', value: 1 },
                { label: 'b', value: 2 }
            ];
        },
    })
    .Textarea('sample4', 'Textarea', { value: '234' })
    .InputFile('sample5', 'InputFile')
    .Button('sample9', 'Button')
    .Blank('sample10', 'Blank')
    .Radio('radio', 'Radio', {
        label: '체크박스aaa'
    })
    .RadioGroup('radioGroup', 'RadioGroup', {
        countPerRow: 2,
        groups: [
            { checkedValue: 1, label: 'a' },
            { checkedValue: 2, label: 'b' },
        ],
    })
    .Datepicker('sample13', 'Datepicker')
    .DatepickerRange('sample14', 'DatepickerRange')
    .DatepickerToggle('sample15', 'DatepickerWithSwitch', {
        checked: true,
    })
    .DatepickerRangeToggle('sample16', 'DatepickerRangeWithSwitch', {
        checked: true,
    })
    .Checkbox('sample17', 'Checkbox', {
        label: '라디오bbb',
    })
    .CheckboxGroup('sample18', 'CheckboxGroup', {
        value: ['Y', '1'],
        countPerRow: 3,
        groups: [
            { checkedValue: 'Y', uncheckedValue: 'N', label: '삭제여부' },
            { checkedValue: 'O', uncheckedValue: 'X', label: '동의여부' },
            { checkedValue: '1', label: '값' },
        ],
    })
    .TextView('sample19', 'TextView')
    .Label('sample7', 'Label')
    .build();

const columns = ColumnBuilder.builder()
    .col('id', 'ID')
    .col('userId', '사용자')
    .col('title', '제목')
    // .calendar('b', '2')
    // .icon('c', '3')
    .button('d', '4', { buttonLabel: '버튼' })
    // .checkbox('e', '5')
    // .combo('f', '6')
    .build();

export {
    searchForm,
    columns,
}