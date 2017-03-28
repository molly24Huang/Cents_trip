import SelectField from 'material-ui/SelectField';

export default (
  { input: { onChange, ...inputProps },
  label,
  text,
  defaultValue,
  meta: { touched, error },
  children,
  ...custom }) =>
    <SelectField
      floatingLabelText={label || text}
      errorText={touched && error}
      onChange={(_, __, value) => onChange(value)}
      {...inputProps}
      {...custom}
    >{children}</SelectField>;
