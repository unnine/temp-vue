import { FormBuilder } from 'form';
import { ColumnBuilder } from 'grid';

const searchForm = FormBuilder.builder('form')
    .Input('sample1', '아이디1')
    .InputPassword('sample2', '비밀번호1')
    .InputNumber('sample3', '나이1')
    .Textarea('sample4', '비고1')
    .Input('sample5', '아이디2')
    .InputPassword('sample6', '비밀번호2')
    .InputNumber('sample7', '나이2')
    .Textarea('sample8', '비고2')
    .Input('sample9', '아이디3')
    .InputPassword('sample10', '비밀번호3')
    .InputNumber('sample11', '나이3')
    .Textarea('sample12', '비고3')
    .Input('sample13', '아이디4')
    .InputPassword('sample14', '비밀번호4')
    .InputNumber('sample15', '나이4')
    .Textarea('sample16', '비고4')
    .Input('sample17', '아이디5')
    .InputPassword('sample18', '비밀번호5')
    .InputNumber('sample19', '나이5')
    .Textarea('sample20', '비고5')
    .TextView('sample17', '아이디6')
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