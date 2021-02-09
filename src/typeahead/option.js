import {
  default as React,
  Component,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * A single option within the TypeaheadSelector
 */
export default class TypeaheadOption extends Component {
  static propTypes = {
    customClasses: PropTypes.object,
    result: PropTypes.object,
    onClick: PropTypes.func,
    children: PropTypes.object,
    hover: PropTypes.bool,
  }

  static defaultProps = {
    customClasses: {},
    onClick(event) {
      event.preventDefault();
    },
  }

  constructor(...args) {
    super(...args);
    this._onClick = this._onClick.bind(this);
  }

  _getClasses() {
    const classes = {
      'typeahead-option': true,
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;
    return classNames(classes);
  }

  _onClick(event) {
    event.preventDefault();
    return this.props.onClick(this.props.result);
  }

  render() {
    const classes = {
      hover: this.props.hover,
    };
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;
    const classList = classNames(classes);
    let image = "";
    if (this.props.children.image !== undefined) {
      image = this.props.children.image;
    }
    let style = {};
    if (this.props.children.username) {
      style = { lineHeight: '15px' };
    }
    return (
      <li className={classList}>
        <a
          href="#"
          onClick={this._onClick}
          className={this._getClasses()}
          ref="anchor"
        >
          {image && (
            <img width="25" height="25" className="mr-2 rounded-circle" src={image} />
          )}
          {this.props.children.icon && (
            <span>
              {this.props.children.icon}
            </span>
          )}
          <span className="text-truncate" style={style}>{this.props.children.text}
            {this.props.children.username &&
              <span className="d-block text-truncate"><small className="text-muted" >@{this.props.children.username}</small></span>
            }
          </span>
        </a>
      </li>
    );
  }
}
