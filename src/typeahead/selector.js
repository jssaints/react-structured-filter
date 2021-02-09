import {
  default as React,
  Component,
} from 'react';
import PropTypes from 'prop-types';
import TypeaheadOption from './option';
import classNames from 'classnames';

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
export default class TypeaheadSelector extends Component {
  static propTypes = {
    options: PropTypes.array,
    header: PropTypes.string,
    customClasses: PropTypes.object,
    selectionIndex: PropTypes.number,
    onOptionSelected: PropTypes.func,
    typeHeadSelectorLeft: PropTypes.number,
    typeHeadTokenCollectionSelectorLeft: PropTypes.object,
    typeHeadJustCheckSelectorLeft: PropTypes.object,
    typeHeadInputSelectorLeft: PropTypes.number,
    onSearchOptionSelected:PropTypes.func,
  }

  static defaultProps = {
    selectionIndex: null,
    customClasses: {},
    onOptionSelected() { },
  }

  constructor(...args) {
    super(...args);
    this._onClick = this._onClick.bind(this);
    this._onSearchClick = this._onSearchClick.bind(this);
    this.navDown = this.navDown.bind(this);
    this.navUp = this.navUp.bind(this);
  }

  state = {
    typeHeadSelectorLeft: this.props.typeHeadSelectorLeft,
    typeHeadTokenCollectionSelectorLeft: this.props.typeHeadTokenCollectionSelectorLeft,
    typeHeadJustCheckSelectorLeft: this.props.typeHeadJustCheckSelectorLeft,
    typeHeadInputSelectorLeft: this.props.typeHeadInputSelectorLeft,
    selectionIndex: this.props.selectionIndex,
    selection: this.getSelectionForIndex(this.props.selectionIndex),
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      selectionIndex: null,
      typeHeadSelectorLeft: nextProps.typeHeadSelectorLeft,
      typeHeadTokenCollectionSelectorLeft: nextProps.typeHeadTokenCollectionSelectorLeft,
      typeHeadInputSelectorLeft: nextProps.typeHeadInputSelectorLeft,
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.typeHeadInputSelectorLeft !== this.props.typeHeadInputSelectorLeft) {
      this.forceUpdate();
    }
  }

  setSelectionIndex(index) {
    this.setState({
      selectionIndex: index,
      selection: this.getSelectionForIndex(index),
    });
  }

  getSelectionForIndex(index) {
    if (index === null) {
      return null;
    }
    return this.props.options[index];
  }

  _onClick(result) {
    this.props.onOptionSelected(result);
  }

  _onSearchClick(result){
    this.props.onSearchOptionSelected(result);
  }
  _nav(delta) {
    if (!this.props.options) {
      return;
    }

    let newIndex;
    if (this.state.selectionIndex === null) {
      if (delta === 1) {
        newIndex = 0;
      } else {
        newIndex = delta;
      }
    } else {
      newIndex = this.state.selectionIndex + delta;
    }

    if (newIndex < 0) {
      newIndex += this.props.options.length;
    } else if (newIndex >= this.props.options.length) {
      newIndex -= this.props.options.length;
    }

    const newSelection = this.getSelectionForIndex(newIndex);
    this.setState({
      selectionIndex: newIndex,
      selection: newSelection,
    });
  }

  navDown() {
    this._nav(1);
  }

  navUp() {
    this._nav(-1);
  }

  render() {
    const classes = {
      'typeahead-selector': true,
    };
    classes[this.props.customClasses.results] = this.props.customClasses.results;
    const classList = classNames(classes);
    let left = 0;
    if (this.state.typeHeadInputSelectorLeft) {
      left = this.state.typeHeadInputSelectorLeft;
    }
    if (left > this.state.typeHeadTokenCollectionSelectorLeft.current.clientWidth) {
      // dummy x calculation 
      this.state.typeHeadTokenCollectionSelectorLeft.current.scrollTo(50000, 0);
      left = this.state.typeHeadJustCheckSelectorLeft.current.clientWidth + this.state.typeHeadJustCheckSelectorLeft.current.getBoundingClientRect().left + 8;
    }
    const results = this.props.options.map((result, i) => (
      <TypeaheadOption
        ref={i}
        key={i}
        result={result}
        hover={this.state.selectionIndex === i}
        customClasses={this.props.customClasses}
        onClick={this._onClick}
      >
        {result}
      </TypeaheadOption>
    )
      , this);
    const defaultoption = { text: "Search for this text", image: undefined, icon: undefined, username: undefined }
    return (
      <span>
        {results.length > 0 &&
          (<ul className={classList} style={{ left }}>
            {results}
          </ul>)
        }
        {this.props.header === "Category" && !results.length &&
          (<ul className={classList} style={{ left }}>
            <TypeaheadOption
              ref={0}
              key={0}
              result={defaultoption}
              hover={this.state.selectionIndex === 0}
              customClasses={this.props.customClasses}
              onClick={this._onSearchClick}
            >
              {defaultoption}
            </TypeaheadOption>
          </ul>)
        }
      </span>
    );
  }
}
