import { Component, PropTypes } from 'react'
import { IconButton } from 'material-ui'
import { colors } from 'material-ui/styles'
import ToggleStar from 'material-ui/svg-icons/toggle/star'
import ToggleStarBorder from 'material-ui/svg-icons/toggle/star-border'
import ToggleStarHalf from 'material-ui/svg-icons/toggle/star-half'

const styles = {
  disabled: {
    pointerEvents: 'none'
  }
}

export default class Rating extends Component {
  constructor(props) {
    super(props)
  }


  renderIcon(i) {
      const rawRatingValue = this.props.ratingValue
      const intRatingValue = parseInt(this.props.ratingValue)

      if (i<=rawRatingValue){
          return this.props.iconFilled
      }
      if (rawRatingValue != intRatingValue && i == (intRatingValue + 1)){
          return this.props.iconHalf
      }
      return this.props.iconNormal

  //   const filled = i  this.props.ratingValue
  //   if (filled) {
  //     return <ToggleStar color={colors.orange500}/>
  // } else if i>= parseInt(this.props.ratingValue) + 1{
  //     return
  //   }
  }

  render() {
    const rating = []
    for (let i = 1; i <= this.props.max; i++) {
      rating.push(
        <IconButton
          key={i}
          disabled={this.props.disabled}
          iconStyle={this.props.itemIconStyle}
          style={this.props.itemStyle}
        >
          {this.renderIcon(i)}
        </IconButton>
      )
    }

    return (
      <div
        style={this.props.disabled || this.props.readOnly ? { ...styles.disabled, ...this.props.style } : this.props.style}
      >
        {rating}
      </div>
    )
  }
}

Rating.defaultProps = {
  disabled: false,
  iconFilled: <ToggleStar color={colors.teal400}/>,
  iconHovered: <ToggleStarBorder color={colors.teal400}/>,
  iconHalf: <ToggleStarHalf color={colors.teal400}/>,
  iconNormal: <ToggleStarBorder color={colors.green100}/>,
  max: 5,
  readOnly: false,
  ratingValue: 0
}

Rating.propTypes = {
  disabled: PropTypes.bool,
  itemStyle: PropTypes.object,
  itemIconStyle: PropTypes.object,
  max: PropTypes.number,
  readOnly: PropTypes.bool,
  style: PropTypes.object,
  ratingValue: PropTypes.number
}
