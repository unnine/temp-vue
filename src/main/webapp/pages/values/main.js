import { FormBuilder } from 'form';
import { ColumnBuilder } from 'grid';

const searchForm = FormBuilder.builder('form')
    .Hidden('sample8', 'Hidden')
    .Input('sample1', 'Input', { value: '123' })
    .InputPassword('sample2', 'InputPassword')
    .InputNumber('sample3', 'InputNumber')
    .Textarea('sample4', 'Textarea', { value: '234' })
    .InputFile('sample5', 'InputFile')
    .Select('sample6', 'Select')
    .Button('sample9', 'Button', { value: '등록' })
    .Blank('sample10', 'Blank')
    .Radio('radio', 'Radio', {
        label: '체크박스aaa'
    })
    .RadioGroup('radioGroup', 'RadioGroup', {
        countPerRow: 2,
        groups: [
            { checkedValue: 1, label: 'a' },
            { checkedValue: 2, label: 'b' },
            { checkedValue: 3},
        ],
    })
    .Datepicker('sample13', 'Datepicker')
    .DatepickerTwin('sample14', 'DatepickerTwin')
    .DatepickerWithSwitch('sample15', 'DatepickerWithSwitch')
    .DatepickerTwinWithSwitch('sample16', 'DatepickerTwinWithSwitch')
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