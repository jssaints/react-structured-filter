/* eslint eqeqeq: [2, "allow-null"] */

import {
  default as React,
  Component,
} from 'react';
import ReactDOM from 'react-dom';
import PropTypes, { string } from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import fuzzy from 'fuzzy';
/* import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css'; */
import listensToClickOutside from 'react-onclickoutside';

import TypeaheadSelector from './selector';
import KeyEvent from '../keyevent';
import DatePicker from "react-datepicker";
import { BlockPicker } from 'react-color';
// import "react-datepicker/dist/react-datepicker.css";

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
class Typeahead extends Component {
  static propTypes = {
    customClasses: PropTypes.object,
    maxVisible: PropTypes.number,
    options: PropTypes.array,
    header: PropTypes.string,
    searchIcon: PropTypes.object,
    datatype: PropTypes.string,
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    onOptionSelected: PropTypes.func,
    onSubmit: PropTypes.func,
    onKeyDown: PropTypes.func,
    fetchLazyOption: PropTypes.func,
    updateHeader: PropTypes.func,
    className: PropTypes.string,
    typeHeadSelectorLeft: PropTypes.number,
    typeHeadTokenCollectionSelectorLeft: PropTypes.object,
    typeHeadJustCheckSelectorLeft: PropTypes.object,
    typeaheadRef: PropTypes.number,
    setStaticWidth: PropTypes.bool,
  }

  static defaultProps = {
    options: [],
    header: 'Category',
    datatype: 'text',
    customClasses: {},
    defaultValue: '',
    placeholder: '',
    onKeyDown() { return; },
    onOptionSelected() { },
    onSubmit() { },
  }

  constructor(...args) {
    super(...args);
    this._onTextEntryUpdated = this._onTextEntryUpdated.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onOptionSelected = this._onOptionSelected.bind(this);
    this._onSearchOptionSelected = this._onSearchOptionSelected.bind(this);
    this._handleDateChange = this._handleDateChange.bind(this);
    this._onEnter = this._onEnter.bind(this);
    this._onEscape = this._onEscape.bind(this);
    this._onTab = this._onTab.bind(this);
    // this._addTokenForValue = this._addTokenForValue.bind( this );
  }
  state = {
    // The set of all options... Does this need to be state?  I guess for lazy load...
    options: this.props.options,
    header: this.props.header,
    datatype: this.props.datatype,
    typeHeadSelectorLeft: this.props.typeHeadSelectorLeft,
    typeHeadTokenCollectionSelectorLeft: this.props.typeHeadTokenCollectionSelectorLeft,
    typeHeadJustCheckSelectorLeft: this.props.typeHeadJustCheckSelectorLeft,
    focused: false,

    // The currently visible set of options
    visible: this.getOptionsForValue(this.props.defaultValue, this.props.options),

    // This should be called something else, "entryValue"
    entryValue: this.props.defaultValue,

    // A valid typeahead value
    selection: null,
    displayColorPicker: false
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      options: nextProps.options,
      header: nextProps.header,
      datatype: nextProps.datatype,
      typeHeadSelectorLeft: nextProps.typeHeadSelectorLeft,
      typeHeadTokenCollectionSelectorLeft: nextProps.typeHeadTokenCollectionSelectorLeft,
      typeHeadJustCheckSelectorLeft: nextProps.typeHeadJustCheckSelectorLeft,
      visible: this.getOptionsForValue(this.state.entryValue, nextProps.options),
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.typeaheadRef !== this.props.typeaheadRef) {
      this.forceUpdate();
    }
  }

  getOptionsForValue(value, options) {
    // let result = fuzzy
    //   .filter( value, options )
    //   .map( res => res.string );
    let result = options;
    if (this.state && this.state.header === 'Category' && value) {
      const valueSearch = (value && typeof value === 'string') ? value.toLowerCase() : value;
      result = options.filter(itm => {
        return (itm.text.toLowerCase().indexOf(valueSearch) !== -1)
      });
    }
    if (this.props.maxVisible) {
      result = result.slice(0, this.props.maxVisible);
    }

    result = result.map(itm => ({ value: itm.value, text: itm.text, image: itm.image, icon: itm.icon, username: itm.username }));
    return result;
  }

  setEntryText(value) {
    if (this.refs.entry != null) {
      ReactDOM.findDOMNode(this.refs.entry).value = value;
    }
    this._onTextEntryUpdated();
  }

  _renderIncrementalSearchResults() {
    if (!this.state.focused) {
      return '';
    }

    // Something was just selected
    if (this.state.selection) {
      return '';
    }

    // There are no typeahead / autocomplete suggestions
    /*   if (!this.state.visible.length) {
        return '';
      } */
    return (
      <TypeaheadSelector
        ref="sel"
        options={this.state.visible}
        typeHeadSelectorLeft={this.state.typeHeadSelectorLeft}
        typeHeadTokenCollectionSelectorLeft={this.state.typeHeadTokenCollectionSelectorLeft}
        typeHeadJustCheckSelectorLeft={this.state.typeHeadJustCheckSelectorLeft}
        typeHeadInputSelectorLeft={(this.refs.input) ? this.refs.input.offsetLeft : this.refs.input.offsetLeft}
        header={this.state.header}
        onOptionSelected={this._onOptionSelected}
        onSearchOptionSelected={this._onSearchOptionSelected}
        customClasses={this.props.customClasses}
      />
    );
  }

  _onOptionSelected(option) {
    const nEntry = ReactDOM.findDOMNode(this.inputRef());
    nEntry.focus();
    nEntry.value = typeof option === 'string' ? option : option.value;
    this.setState({
      visible: this.getOptionsForValue(option, this.state.options),
      selection: option,
      entryValue: option,
      typeHeadSelectorLeft: this.props.typeHeadSelectorLeft,
      typeHeadTokenCollectionSelectorLeft: this.props.typeHeadTokenCollectionSelectorLeft,
      typeHeadJustCheckSelectorLeft: this.props.typeHeadJustCheckSelectorLeft
    });
    this.props.onOptionSelected(option);
    if (this.refs.sel && this.refs.sel.setSelectionIndex) {
      this.refs.sel.setSelectionIndex(null);
    }
    this._onFocus();
  }

  _onSearchOptionSelected(option) {
    const nEntry = ReactDOM.findDOMNode(this.inputRef());
    const SearchOption = option;
    nEntry.focus();
    nEntry.value = "";
    SearchOption.value = this.state.entryValue;
    if(SearchOption && SearchOption.text === "Search for this text"){
      if(SearchOption.value.trim() === ""){
        return;
      }
    }
    this.props.onOptionSelected(SearchOption);
    if (this.refs.sel && this.refs.sel.setSelectionIndex) {
      this.refs.sel.setSelectionIndex(null);
    }
    this._onFocus();

  }
  _onTextEntryUpdated() {
    let value = '';

    if (this.refs.entry != null) {
      value = ReactDOM.findDOMNode(this.refs.entry).value;
    }
    if (this.state.header === 'Value' && this.props.fetchLazyOption) {
      this.props.fetchLazyOption(value);
    }
    this.setState({
      visible: this.getOptionsForValue(value, this.state.options),
      selection: null,
      entryValue: value,
    });
  }

  _onEnter(event) {
    if (!this.refs.sel.state.selection && this.refs.sel.state.selectionIndex === null) {
      if (this.state.entryValue && this.state.entryValue !== "" && this.state.header === "Category" && this.state.entryValue.trim() !== "") {
        this._onOptionSelected({ text: "Search for this text", value: this.state.entryValue, image: undefined, icon: undefined, username: undefined });
        return this.props.onKeyDown(event);
      }
      if (this.props.onSubmit && this.state.header === "Category") {
        this.props.onSubmit();
      }
      return this.props.onKeyDown(event);
    } else if (!this.refs.sel.state.selection && this.refs.sel.state.selectionIndex !== null && this.state.header === "Category") {
      if(this.state.entryValue && this.state.entryValue !== ""  && this.state.entryValue.trim() !== ""){
        this._onOptionSelected({ text: "Search for this text", value: this.state.entryValue, image: undefined, icon: undefined, username: undefined });
      }
      return this.props.onKeyDown(event);
    }
    this._onOptionSelected(this.refs.sel.state.selection);
  }

  _onEscape() {
    this.refs.sel.setSelectionIndex(null);
  }

  _onTab() {
    const option = this.refs.sel.state.selection ?
      this.refs.sel.state.selection : this.state.visible[0];
    this._onOptionSelected(option);
  }

  eventMap() {
    const events = {};

    events[KeyEvent.DOM_VK_UP] = this.refs.sel.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.refs.sel.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  }

  _onKeyDown(event) {
    // If Enter pressed
    if (event.keyCode === KeyEvent.DOM_VK_RETURN || event.keyCode === KeyEvent.DOM_VK_ENTER) {
      // If no options were provided so we can match on anything
      if (this.props.options.length === 0 && (this.props.datatype !== 'textoptions' && this.props.datatype !== 'textcompareoptions') && this.state.entryValue) {
        this._onOptionSelected(this.state.entryValue);
      }

      // If what has been typed in is an exact match of one of the options
      if (this.props.options.indexOf(this.state.entryValue) > -1) {
        this._onOptionSelected(this.state.entryValue);
      }
    }

    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler
    if (!this.refs.sel) {
      return this.props.onKeyDown(event);
    }
    const handler = this.eventMap()[event.keyCode];
    if (handler) {
      handler(event);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    event.preventDefault();
  }


  _onBlur(event) {
    // If Enter pressed
    // If no options were provided so we can match on anything
    if (this.props.options.length === 0 && (this.props.datatype !== 'textoptions' && this.props.datatype !== 'textcompareoptions') && this.state.entryValue) {
      this._onOptionSelected(this.state.entryValue);
    }

    // If what has been typed in is an exact match of one of the options
    if (this.props.options.indexOf(this.state.entryValue) > -1) {
      this._onOptionSelected(this.state.entryValue);
    }

    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler
    if (!this.refs.sel) {
      return this.props.onKeyDown(event);
    }
    const handler = this.eventMap()[event.keyCode];
    if (handler) {
      handler(event);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    event.preventDefault();
  }

  _onFocus() {
    this.setState({ focused: true });
    this.props.updateHeader();
  }


  handleClickOutside() {
    this.setState({ focused: false });
  }

  isDescendant(parent, child) {
    let node = child.parentNode;
    while (node !== null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  _handleDateChange(date) {
    let newDate = moment(date, 'YYYY-MM-DD');
    if (!newDate.isValid()) newDate = moment();
    this.props.onOptionSelected(newDate.format('YYYY-MM-DD'));
  }

  _showDatePicker() {
    if (this.state.datatype === 'date') {
      return true;
    }
    return false;
  }
  _showColorPicker() {
    if (this.state.datatype === 'color') {
      return true;
    }
    return false;
  }
  inputRef() {
    if (this._showDatePicker()) {
      return this.refs.datepicker.input;
    }

    return this.refs.entry;
  }
  handleChangeColor = (color) => {
    this.props.onOptionSelected(color.hex);
    this.props.updateHeader();
    const nEntry = ReactDOM.findDOMNode(this.inputRef());
    nEntry.focus();
    // this._onFocus();
  };
  render() {
    const inputClasses = {};
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    let inputClassList = classNames(inputClasses);
    let dateClassName = '';
    if (this.state.focused || this.props.setStaticWidth) {
      inputClassList += ' filter-tokenizer-text-input-width';
      dateClassName = 'filter-tokenizer-text-input-width';
    }

    const classes = {
      typeahead: true,
    };
    classes[this.props.className] = !!this.props.className;
    const classList = classNames(classes);
    if (this._showDatePicker()) {
      /* let left = 0;
      if (this.refs.datepicker && this.refs.datepicker.offsetLeft) {
        left = this.refs.datepicker.offsetLeft;
      }
      console.log(this.refs.input);
      console.log(this.refs.input.offsetLeft);
       if (left > this.state.typeHeadTokenCollectionSelectorLeft.current.clientWidth) {
      // hardcoded xpos input
      this.state.typeHeadTokenCollectionSelectorLeft.current.scrollTo(50000, 0);
      left = this.state.typeHeadJustCheckSelectorLeft.current.clientWidth + this.state.typeHeadJustCheckSelectorLeft.current.getBoundingClientRect().left + 8;
       } */
      let defaultDate = moment(this.state.entryValue, 'YYYY-MM-DD');
      if (!defaultDate.isValid()) defaultDate = moment();
      return (
        <span
          ref="input"
          className={classList}
          onFocus={this._onFocus}
        >
          <DatePicker
            ref="datepicker"
            selected={this.state.startDate}
            onChange={this.handleChange}
            defaultValue={defaultDate}
            dateFormat={"YYYY-MM-DD"}
            onChange={this._handleDateChange}
            open={this.state.focused}
            onKeyDown={this._onKeyDown}
          />
          {/*  <div  style={{ left }}>
            <Datetime
              style={{ left }}
              ref="datepicker"
              dateFormat={"YYYY-MM-DD"}
              timeFormat={false}
              inputProps={{ className: inputClassList }}
              defaultValue={defaultDate}
              onChange={this._handleDateChange}
              open={this.state.focused}
            />
          </div> */}
        </span>
      );
    }
    let left = 0;
    let styles = {};
    if (this._showColorPicker()) {
      if (this.refs.input && this.refs.input.offsetLeft) {
        left = this.refs.input.offsetLeft;
      }
      if (this.state.typeHeadTokenCollectionSelectorLeft && this.state.typeHeadTokenCollectionSelectorLeft.current) {
        if (left > this.state.typeHeadTokenCollectionSelectorLeft.current.clientWidth) {
          // dummy x calculation 
          this.state.typeHeadTokenCollectionSelectorLeft.current.scrollTo(50000, 0);
          left = this.state.typeHeadJustCheckSelectorLeft.current.clientWidth + this.state.typeHeadJustCheckSelectorLeft.current.getBoundingClientRect().left + 8;
        }
      }
      styles = {
        popover: {
          position: 'absolute',
          zIndex: '2',
          left: left
        }
      }
    }
    const colors = ['#ff8080', '#ff8097', '#ff80ae', '#ff80c6', '#ff80dd', '#ff80f4', '#f280ff', '#db80ff', '#c480ff', '#ac80ff', '#9580ff', '#8082ff', '#8099ff', '#80b0ff', '#80c8ff', '#80dfff', '#80f7ff', '#80fff0', '#80ffd9', '#80ffc1', '#80ffaa', '#80ff93', '#84ff80', '#9bff80', '#b3ff80', '#caff80', '#e1ff80', '#f9ff80', '#ffee80', '#ffd780', '#ffbf80', '#bfbfbf']
    return (
      <span
        ref="input"
        className={classList}
        onFocus={this._onFocus}
      >
        <input
          ref="entry"
          type="text"
          autoFocus={this.state.focused}
          placeholder={this.props.placeholder}
          className={inputClassList}
          defaultValue={this.state.entryValue}
          onChange={this._onTextEntryUpdated}
          onKeyDown={this._onKeyDown}
          onBlur={this._onBlur}
        />
        {this._showColorPicker() ? <div style={styles.popover}>
          <div />
          <BlockPicker color={this.state.entryValue || 'transparent'} colors={colors} onChange={this.handleChangeColor} width={268} />
        </div> : null}
        {this.props.searchIcon && (
          <div className="input-group-append">
            <span className="input-group-text"> {this.props.searchIcon}</span>
          </div>
        )}
        {this._renderIncrementalSearchResults()}

      </span>
    );
  }
}

export default listensToClickOutside(Typeahead);
