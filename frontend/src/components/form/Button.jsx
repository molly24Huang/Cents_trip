import lodash from 'lodash'
import FlatButton from 'material-ui/FlatButton';
import * as colors from 'material-ui/styles/colors';

const _FlatButton = props =>
  <FlatButton
    label={props.label || props.text}
    primary
    rippleColor={colors[props.rColor]}
    // onTouchTap={props.onClick(val)}
    {...lodash.omit(['lable', 'text', 'rColor', 'onClick'], props)}
  />;

export default {
  FlatButton: _FlatButton,
};
