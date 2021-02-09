import {
  default as React,
  Component,
} from 'react';
import PropTypes from 'prop-types';

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
export default class Token extends Component {
  static propTypes = {
    children: PropTypes.object,
    onRemove: PropTypes.func,
  }

  constructor(...args) {
    super(...args);
    this._handleClick = this._handleClick.bind(this);
  }

  _handleClick(event) {
    this.props.onRemove(this.props.children);
    event.preventDefault();
  }

  _makeCloseButton() {
    if (!this.props.onRemove) {
      return '';
    }
    return (
      <a className="typeahead-token-close" href="#" onClick={this._handleClick}>&#x00d7;</a>
    );
  }

  render() {
    const { category, operator, value } = this.props.children;
    return (
      <div className="typeahead-token">
        <span className="token-category">{category}</span>
        <span className="token-operator">{operator}</span>
        <span className="token-value">{category !== 'Color' ? value : <span style={{
          width: '10px',
          height: '8px',
          borderRadius: '2px',
          background: `${(!value) ? 'transparent' : value}`,
        }} >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>}</span>
        { this._makeCloseButton()}
      </div>
    );
  }
}
