"use strict";

var React = require("react");
var classnames = require("classnames");

var MainButton = React.createClass({
  displayName: "MainButton",

  getDefaultProps: function getDefaultProps() {
    return {
      href: "#",
      onClick: function onClick(e) {
          console.log(e)
          e.preventDefault()
          e.stopPropagation()
      },
      iconResting: "",
      iconActive: "",
      label: null
    };
  },
  render: function render() {
    var iconResting = classnames("mfb-component__main-icon--resting", this.props.iconResting);
    var iconActive = classnames("mfb-component__main-icon--active", this.props.iconActive);
    var mainClass = classnames("mfb-component__button--main", this.props.className);
    if (this.props.label) {
      return React.createElement(
        "span",
        { className: mainClass, onClick: this.props.onClick, "data-mfb-label": this.props.label },
        React.createElement("i", { className: iconResting }),
        React.createElement("i", { className: iconActive })
      );
    } else {
      return React.createElement(
        "span",
        {  className: mainClass, onClick: this.props.onClick },
        React.createElement("i", { className: iconResting }),
        React.createElement("i", { className: iconActive })
      );
    }
  }
});

module.exports = MainButton;
