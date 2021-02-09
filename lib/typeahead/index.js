'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _fuzzy = require('fuzzy');

var _fuzzy2 = _interopRequireDefault(_fuzzy);

var _reactOnclickoutside = require('react-onclickoutside');

var _reactOnclickoutside2 = _interopRequireDefault(_reactOnclickoutside);

var _selector = require('./selector');

var _selector2 = _interopRequireDefault(_selector);

var _keyevent = require('../keyevent');

var _keyevent2 = _interopRequireDefault(_keyevent);

var _reactDatepicker = require('react-datepicker');

var _reactDatepicker2 = _interopRequireDefault(_reactDatepicker);

var _reactColor = require('react-color');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint eqeqeq: [2, "allow-null"] */

/* import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css'; */


// import "react-datepicker/dist/react-datepicker.css";

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
var Typeahead = function (_Component) {
  _inherits(Typeahead, _Component);

  function Typeahead() {
    var _ref;

    _classCallCheck(this, Typeahead);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = Typeahead.__proto__ || Object.getPrototypeOf(Typeahead)).call.apply(_ref, [this].concat(args)));

    _this.state = {
      // The set of all options... Does this need to be state?  I guess for lazy load...
      options: _this.props.options,
      header: _this.props.header,
      datatype: _this.props.datatype,
      typeHeadSelectorLeft: _this.props.typeHeadSelectorLeft,
      typeHeadTokenCollectionSelectorLeft: _this.props.typeHeadTokenCollectionSelectorLeft,
      typeHeadJustCheckSelectorLeft: _this.props.typeHeadJustCheckSelectorLeft,
      focused: false,

      // The currently visible set of options
      visible: _this.getOptionsForValue(_this.props.defaultValue, _this.props.options),

      // This should be called something else, "entryValue"
      entryValue: _this.props.defaultValue,

      // A valid typeahead value
      selection: null,
      displayColorPicker: false
    };

    _this.handleChangeColor = function (color) {
      _this.props.onOptionSelected(color.hex);
      _this.props.updateHeader();
      var nEntry = _reactDom2.default.findDOMNode(_this.inputRef());
      nEntry.focus();
    };

    _this._onTextEntryUpdated = _this._onTextEntryUpdated.bind(_this);
    _this._onKeyDown = _this._onKeyDown.bind(_this);
    _this._onBlur = _this._onBlur.bind(_this);
    _this._onFocus = _this._onFocus.bind(_this);
    _this._onOptionSelected = _this._onOptionSelected.bind(_this);
    _this._onSearchOptionSelected = _this._onSearchOptionSelected.bind(_this);
    _this._handleDateChange = _this._handleDateChange.bind(_this);
    _this._onEnter = _this._onEnter.bind(_this);
    _this._onEscape = _this._onEscape.bind(_this);
    _this._onTab = _this._onTab.bind(_this);
    // this._addTokenForValue = this._addTokenForValue.bind( this );
    return _this;
  }

  _createClass(Typeahead, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.setState({
        options: nextProps.options,
        header: nextProps.header,
        datatype: nextProps.datatype,
        typeHeadSelectorLeft: nextProps.typeHeadSelectorLeft,
        typeHeadTokenCollectionSelectorLeft: nextProps.typeHeadTokenCollectionSelectorLeft,
        typeHeadJustCheckSelectorLeft: nextProps.typeHeadJustCheckSelectorLeft,
        visible: this.getOptionsForValue(this.state.entryValue, nextProps.options)
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (prevProps.typeaheadRef !== this.props.typeaheadRef) {
        this.forceUpdate();
      }
    }
  }, {
    key: 'getOptionsForValue',
    value: function getOptionsForValue(value, options) {
      // let result = fuzzy
      //   .filter( value, options )
      //   .map( res => res.string );
      var result = options;
      if (this.state && this.state.header === 'Category' && value) {
        var valueSearch = value && typeof value === 'string' ? value.toLowerCase() : value;
        result = options.filter(function (itm) {
          return itm.text.toLowerCase().indexOf(valueSearch) !== -1;
        });
      }
      if (this.props.maxVisible) {
        result = result.slice(0, this.props.maxVisible);
      }

      result = result.map(function (itm) {
        return { value: itm.value, text: itm.text, image: itm.image, icon: itm.icon, username: itm.username };
      });
      return result;
    }
  }, {
    key: 'setEntryText',
    value: function setEntryText(value) {
      if (this.refs.entry != null) {
        _reactDom2.default.findDOMNode(this.refs.entry).value = value;
      }
      this._onTextEntryUpdated();
    }
  }, {
    key: '_renderIncrementalSearchResults',
    value: function _renderIncrementalSearchResults() {
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
      return _react2.default.createElement(_selector2.default, {
        ref: 'sel',
        options: this.state.visible,
        typeHeadSelectorLeft: this.state.typeHeadSelectorLeft,
        typeHeadTokenCollectionSelectorLeft: this.state.typeHeadTokenCollectionSelectorLeft,
        typeHeadJustCheckSelectorLeft: this.state.typeHeadJustCheckSelectorLeft,
        typeHeadInputSelectorLeft: this.refs.input ? this.refs.input.offsetLeft : this.refs.input.offsetLeft,
        header: this.state.header,
        onOptionSelected: this._onOptionSelected,
        onSearchOptionSelected: this._onSearchOptionSelected,
        customClasses: this.props.customClasses
      });
    }
  }, {
    key: '_onOptionSelected',
    value: function _onOptionSelected(option) {
      var nEntry = _reactDom2.default.findDOMNode(this.inputRef());
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
  }, {
    key: '_onSearchOptionSelected',
    value: function _onSearchOptionSelected(option) {
      var nEntry = _reactDom2.default.findDOMNode(this.inputRef());
      var SearchOption = option;
      nEntry.focus();
      nEntry.value = "";
      SearchOption.value = this.state.entryValue;
      this.props.onOptionSelected(SearchOption);
      if (this.refs.sel && this.refs.sel.setSelectionIndex) {
        this.refs.sel.setSelectionIndex(null);
      }
      this._onFocus();
    }
  }, {
    key: '_onTextEntryUpdated',
    value: function _onTextEntryUpdated() {
      var value = '';

      if (this.refs.entry != null) {
        value = _reactDom2.default.findDOMNode(this.refs.entry).value;
      }
      if (this.state.header === 'Value' && this.props.fetchLazyOption) {
        this.props.fetchLazyOption(value);
      }
      this.setState({
        visible: this.getOptionsForValue(value, this.state.options),
        selection: null,
        entryValue: value
      });
    }
  }, {
    key: '_onEnter',
    value: function _onEnter(event) {
      if (!this.refs.sel.state.selection && this.refs.sel.state.selectionIndex === null) {
        if (this.state.entryValue && this.state.entryValue !== "" && this.state.header === "Category") {
          this._onOptionSelected({ text: "Search for this text", value: this.state.entryValue, image: undefined, icon: undefined, username: undefined });
          return this.props.onKeyDown(event);
        }
        if (this.props.onSubmit && this.state.header === "Category") {
          this.props.onSubmit();
        }
        return this.props.onKeyDown(event);
      } else if (!this.refs.sel.state.selection && this.refs.sel.state.selectionIndex !== null && this.state.header === "Category") {
        this._onOptionSelected({ text: "Search for this text", value: this.state.entryValue, image: undefined, icon: undefined, username: undefined });
        return this.props.onKeyDown(event);
      }
      this._onOptionSelected(this.refs.sel.state.selection);
    }
  }, {
    key: '_onEscape',
    value: function _onEscape() {
      this.refs.sel.setSelectionIndex(null);
    }
  }, {
    key: '_onTab',
    value: function _onTab() {
      var option = this.refs.sel.state.selection ? this.refs.sel.state.selection : this.state.visible[0];
      this._onOptionSelected(option);
    }
  }, {
    key: 'eventMap',
    value: function eventMap() {
      var events = {};

      events[_keyevent2.default.DOM_VK_UP] = this.refs.sel.navUp;
      events[_keyevent2.default.DOM_VK_DOWN] = this.refs.sel.navDown;
      events[_keyevent2.default.DOM_VK_RETURN] = events[_keyevent2.default.DOM_VK_ENTER] = this._onEnter;
      events[_keyevent2.default.DOM_VK_ESCAPE] = this._onEscape;
      events[_keyevent2.default.DOM_VK_TAB] = this._onTab;

      return events;
    }
  }, {
    key: '_onKeyDown',
    value: function _onKeyDown(event) {
      // If Enter pressed
      if (event.keyCode === _keyevent2.default.DOM_VK_RETURN || event.keyCode === _keyevent2.default.DOM_VK_ENTER) {
        // If no options were provided so we can match on anything
        if (this.props.options.length === 0 && this.props.datatype !== 'textoptions' && this.props.datatype !== 'textcompareoptions' && this.state.entryValue) {
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
      var handler = this.eventMap()[event.keyCode];
      if (handler) {
        handler(event);
      } else {
        return this.props.onKeyDown(event);
      }
      // Don't propagate the keystroke back to the DOM/browser
      event.preventDefault();
    }
  }, {
    key: '_onBlur',
    value: function _onBlur(event) {
      // If Enter pressed
      // If no options were provided so we can match on anything
      if (this.props.options.length === 0 && this.props.datatype !== 'textoptions' && this.props.datatype !== 'textcompareoptions' && this.state.entryValue) {
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
      var handler = this.eventMap()[event.keyCode];
      if (handler) {
        handler(event);
      } else {
        return this.props.onKeyDown(event);
      }
      // Don't propagate the keystroke back to the DOM/browser
      event.preventDefault();
    }
  }, {
    key: '_onFocus',
    value: function _onFocus() {
      this.setState({ focused: true });
      this.props.updateHeader();
    }
  }, {
    key: 'handleClickOutside',
    value: function handleClickOutside() {
      this.setState({ focused: false });
    }
  }, {
    key: 'isDescendant',
    value: function isDescendant(parent, child) {
      var node = child.parentNode;
      while (node !== null) {
        if (node === parent) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    }
  }, {
    key: '_handleDateChange',
    value: function _handleDateChange(date) {
      var newDate = (0, _moment2.default)(date, 'YYYY-MM-DD');
      if (!newDate.isValid()) newDate = (0, _moment2.default)();
      this.props.onOptionSelected(newDate.format('YYYY-MM-DD'));
    }
  }, {
    key: '_showDatePicker',
    value: function _showDatePicker() {
      if (this.state.datatype === 'date') {
        return true;
      }
      return false;
    }
  }, {
    key: '_showColorPicker',
    value: function _showColorPicker() {
      if (this.state.datatype === 'color') {
        return true;
      }
      return false;
    }
  }, {
    key: 'inputRef',
    value: function inputRef() {
      if (this._showDatePicker()) {
        return this.refs.datepicker.input;
      }

      return this.refs.entry;
    }
  }, {
    key: 'render',
    value: function render() {
      var inputClasses = {};
      inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
      var inputClassList = (0, _classnames2.default)(inputClasses);
      var dateClassName = '';
      if (this.state.focused || this.props.setStaticWidth) {
        inputClassList += ' filter-tokenizer-text-input-width';
        dateClassName = 'filter-tokenizer-text-input-width';
      }

      var classes = {
        typeahead: true
      };
      classes[this.props.className] = !!this.props.className;
      var classList = (0, _classnames2.default)(classes);
      if (this._showDatePicker()) {
        var _React$createElement;

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
        var defaultDate = (0, _moment2.default)(this.state.entryValue, 'YYYY-MM-DD');
        if (!defaultDate.isValid()) defaultDate = (0, _moment2.default)();
        return _react2.default.createElement(
          'span',
          {
            ref: 'input',
            className: classList,
            onFocus: this._onFocus
          },
          _react2.default.createElement(_reactDatepicker2.default, (_React$createElement = {
            ref: 'datepicker',
            selected: this.state.startDate,
            onChange: this.handleChange,
            defaultValue: defaultDate,
            dateFormat: "YYYY-MM-DD"
          }, _defineProperty(_React$createElement, 'onChange', this._handleDateChange), _defineProperty(_React$createElement, 'open', this.state.focused), _defineProperty(_React$createElement, 'onKeyDown', this._onKeyDown), _React$createElement))
        );
      }
      var left = 0;
      var styles = {};
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
        };
      }
      var colors = ['#ff8080', '#ff8097', '#ff80ae', '#ff80c6', '#ff80dd', '#ff80f4', '#f280ff', '#db80ff', '#c480ff', '#ac80ff', '#9580ff', '#8082ff', '#8099ff', '#80b0ff', '#80c8ff', '#80dfff', '#80f7ff', '#80fff0', '#80ffd9', '#80ffc1', '#80ffaa', '#80ff93', '#84ff80', '#9bff80', '#b3ff80', '#caff80', '#e1ff80', '#f9ff80', '#ffee80', '#ffd780', '#ffbf80', '#bfbfbf'];
      return _react2.default.createElement(
        'span',
        {
          ref: 'input',
          className: classList,
          onFocus: this._onFocus
        },
        _react2.default.createElement('input', {
          ref: 'entry',
          type: 'text',
          autoFocus: this.state.focused,
          placeholder: this.props.placeholder,
          className: inputClassList,
          defaultValue: this.state.entryValue,
          onChange: this._onTextEntryUpdated,
          onKeyDown: this._onKeyDown,
          onBlur: this._onBlur
        }),
        this._showColorPicker() ? _react2.default.createElement(
          'div',
          { style: styles.popover },
          _react2.default.createElement('div', null),
          _react2.default.createElement(_reactColor.BlockPicker, { color: this.state.entryValue || 'transparent', colors: colors, onChange: this.handleChangeColor, width: 268 })
        ) : null,
        this.props.searchIcon && _react2.default.createElement(
          'div',
          { className: 'input-group-append' },
          _react2.default.createElement(
            'span',
            { className: 'input-group-text' },
            ' ',
            this.props.searchIcon
          )
        ),
        this._renderIncrementalSearchResults()
      );
    }
  }]);

  return Typeahead;
}(_react.Component);

Typeahead.propTypes = {
  customClasses: _propTypes2.default.object,
  maxVisible: _propTypes2.default.number,
  options: _propTypes2.default.array,
  header: _propTypes2.default.string,
  searchIcon: _propTypes2.default.object,
  datatype: _propTypes2.default.string,
  defaultValue: _propTypes2.default.string,
  placeholder: _propTypes2.default.string,
  onOptionSelected: _propTypes2.default.func,
  onSubmit: _propTypes2.default.func,
  onKeyDown: _propTypes2.default.func,
  fetchLazyOption: _propTypes2.default.func,
  updateHeader: _propTypes2.default.func,
  className: _propTypes2.default.string,
  typeHeadSelectorLeft: _propTypes2.default.number,
  typeHeadTokenCollectionSelectorLeft: _propTypes2.default.object,
  typeHeadJustCheckSelectorLeft: _propTypes2.default.object,
  typeaheadRef: _propTypes2.default.number,
  setStaticWidth: _propTypes2.default.bool
};
Typeahead.defaultProps = {
  options: [],
  header: 'Category',
  datatype: 'text',
  customClasses: {},
  defaultValue: '',
  placeholder: '',
  onKeyDown: function onKeyDown() {
    return;
  },
  onOptionSelected: function onOptionSelected() {},
  onSubmit: function onSubmit() {}
};
exports.default = (0, _reactOnclickoutside2.default)(Typeahead);