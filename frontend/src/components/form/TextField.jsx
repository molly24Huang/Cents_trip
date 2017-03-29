import TextField from 'material-ui/TextField';

export default ({ input,label, meta,  ...others }) =>
  <TextField
    floatingLabelText={label}
    // errorText={touched && error}
    hintText={ label }
    { ...input }
    {...others}
  />;
