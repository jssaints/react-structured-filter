import {
  default as React,
  Component,
} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Token from './token';
import KeyEvent from '../keyevent';
import Typeahead from '../typeahead';
import classNames from 'classnames';
import objectAssign from 'object-assign';

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 *
 * Example usage:
 *
 *      import StructuredFilter from 'react-structured-filter';
 *
 *      <StructuredFilter
 *        placeholder="Search..."
 *        options={[
 *          {category:"Name",type:"text"},
 *          {category:"Price",type:"number"},
 *        ]}
 *      />
 */
export default class Tokenizer extends Component {

  static propTypes = {
    /**
     * An array of structures with the components `category` and `type`
     *
     * * _category_: Name of the first thing the user types.
     * * _type_: This can be one of the following:
     *   * _text_: Arbitrary text for the value. No autocomplete options.
     *     Operator choices will be: `==`, `!=`, `contains`, `!contains`.
     *   * _textoptions_: You must additionally pass an options value which
     *     will be a function that returns the list of options choices as an
     *     array (for example `function getOptions() {return ["MSFT", "AAPL",
     *     "GOOG"]}`). Operator choices will be: `==`, `!=`.
     *   * _number_: Arbitrary text for the value. No autocomplete options.
     *     Operator choices will be: `==`, `!=`, `<`, `<=`, `>`, `>=`.
     *   * _date_: Shows a calendar and the input must be of the form
     *     `MMM D, YYYY H:mm A`. Operator choices will be: `==`, `!=`, `<`, `<=`, `>`,
     *     `>=`.
     *
     * Example:
     *
     *     [
     *       {
     *         "category": "Symbol",
     *         "type": "textoptions",
     *         "options": function() {return ["MSFT", "AAPL", "GOOG"]}
     *       },
     *       {
     *         "category": "Name",
     *         "type": "text"
     *       },
     *       {
     *         "category": "Price",
     *         "type": "number"
     *       },
     *       {
     *         "category": "MarketCap",
     *         "type": "number"
     *       },
     *       {
     *         "category": "IPO",
     *         "type": "date"
     *       }
     *     ]
     */
    options: PropTypes.array,

    /**
     * An object containing custom class names for child elements. Useful for
     * integrating with 3rd party UI kits. Allowed Keys: `input`, `results`,
     * `listItem`, `listAnchor`, `typeahead`, `hover`
     *
     * Example:
     *
     *     {
     *       input: 'filter-tokenizer-text-input',
     *       results: 'filter-tokenizer-list__container',
     *       listItem: 'filter-tokenizer-list__item'
     *     }
     */
    customClasses: PropTypes.object,
    searchIcon: PropTypes.object,


    /**
     * **Uncontrolled Component:** A default set of values of tokens to be
     * loaded on first render. Each token should be an object with a
     * `category`, `operator`, and `value` key.
     *
     * Example:
     *
     *     [
     *       {
     *         category: 'Industry',
     *         operator: '==',
     *         value: 'Books',
     *       },
     *       {
     *         category: 'IPO',
     *         operator: '>',
     *         value: 'Dec 8, 1980 10:50 PM',
     *       },
     *       {
     *         category: 'Name',
     *         operator: 'contains',
     *         value: 'Nabokov',
     *       },
     *     ]
     */
    defaultValue: PropTypes.array,

    /**
     * **Controlled Component:** A set of values of tokens to be loaded on
     * each render. Each token should be an object with a `category`,
     * `operator`, and `value` key.
     *
     * Example:
     *
     *     [
     *       {
     *         category: 'Industry',
     *         operator: '==',
     *         value: 'Books',
     *       },
     *       {
     *         category: 'IPO',
     *         operator: '>',
     *         value: 'Dec 8, 1980 10:50 PM',
     *       },
     *       {
     *         category: 'Name',
     *         operator: 'contains',
     *         value: 'Nabokov',
     *       },
     *     ]
     */
    value: PropTypes.array,

    /**
     * Placeholder text for the typeahead input.
     */
    placeholder: PropTypes.string,

    /**
     * Event handler triggered whenever the filter is changed and a token
     * is added or removed. Params: `(filter)`
     */
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    /**
     * A mapping of datatypes to operators.
     * Resolved by merging with default operators.
     * Example:
     *
     * ```javascript
     * {
     *    "textoptions":["equals","does not equal"],
     *    "text":["like","not like","equals","does not equal","matches","does not match"]
     * }
     * ```
     */
    operators: PropTypes.object,

    defaultProps: PropTypes.object,
    fetchLazyOption: PropTypes.object,
  }

  static defaultProps = {
    // value: [],
    // defaultValue: [],
    options: [],
    fetchLazyOption: {},
    customClasses: {},
    searchIcon: null,
    placeholder: '',
    onChange() { },
    onSubmit() { },
    operators: {
      textoptions: [`==`, `!=`],
      textcompareoptions: [`==`, `!=`],
      text: [`==`, `!=`, `contains`, `!contains`],
      number: [`==`, `!=`, `<`, `<=`, `>`, `>=`],
      date: [`==`, `!=`, `<`, `<=`, `>`, `>=`],
      color: [`==`, `!=`],
    },
  }

  constructor(...args) {
    super(...args);
    // this.textInput = null;
    this.textInput = React.createRef();
    this.tokencollection = React.createRef();
    this.justcheck = React.createRef();
    this._addTokenForValue = this._addTokenForValue.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._getOptionsForTypeahead = this._getOptionsForTypeahead.bind(this);
    this._removeTokenForValue = this._removeTokenForValue.bind(this);
    this._forceTrigger = this._forceTrigger.bind(this);
    Tokenizer.defaultProps = Object.assign(Tokenizer.defaultProps, this.props.defaultProps);
  }

  state = {
    selected: this.getStateFromProps(this.props),
    category: '',
    operator: '',
    textInput: '',
  }

  componentDidMount() {
    this.props.onChange(this.state.selected);
  }

  componentWillReceiveProps(nextProps) {
    const update = {};
    if (nextProps.value !== this.props.value) {
      update.selected = this.getStateFromProps(nextProps);
    }
    this.setState(update);
  }

  getStateFromProps(props) {
    const value = props.value || props.defaultValue || [];
    return value.slice(0);
  }

  _renderTokens() {
    const tokenClasses = {};
    tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;
    const classList = classNames(tokenClasses);
    const result = this.state.selected.map(selected => {
      const mykey = selected.category + selected.operator + selected.value;

      return (
        <Token
          key={mykey}
          className={classList}
          onRemove={this._removeTokenForValue}
        >
          {selected}
        </Token>

      );
    }, this);
    return result;
  }

  _getOptionsForTypeahead() {
    let categoryType;
    if (this.state.category === '') {
      const categories = [];
      for (let i = 0; i < this.props.options.length; i++) {
        let renObjData = this.state.selected.filter(selected => {
          return selected.category === this.props.options[i].category;
        });
        if (!renObjData.length) {
          categories.push({
            value: this.props.options[i].category,
            text: this.props.options[i].categoryText || this.props.options[i].category,
          });
        }
      }
      return categories;
    } else if (this.state.operator === '') {
      categoryType = this._getCategoryType();

      const operators = objectAssign({}, Tokenizer.defaultProps.operators, this.props.operators);
      switch (categoryType) {
        case 'text': return operators.text.map(itm => ({ value: itm, text: itm }));
        case 'textoptions': return operators.textoptions.map(itm => ({ value: itm, text: itm }));
        case 'textcompareoptions': return operators.textcompareoptions.map(itm => ({ value: itm, text: itm }));
        case 'date': return operators.date.map(itm => ({ value: itm, text: itm }));
        case 'color': return operators.color.map(itm => ({ value: itm, text: itm }));
        case 'number': return operators.number.map(itm => ({ value: itm, text: itm }));
        default:
          /* eslint-disable no-console */
          console.warn(`WARNING: Unknown category type in tokenizer: "${categoryType}"`);
          /* eslint-enable no-console */
          return [];
      }
    }

    const options = this._getCategoryOptions();
    if (options === null || options === undefined) return [];
    return options().map(itm => typeof itm === 'object' ?
      { value: itm.value, text: itm.text, image: itm.image, icon: itm.icon, username: itm.username } :
      { value: itm, text: itm });
  }

  _getHeader() {
    if (this.state.category === '') {
      return 'Category';
    } else if (this.state.operator === '') {
      return 'Operator';
    }

    return 'Value';
  }

  _getCategoryType(category) {
    let categoryType;
    let cat = category;
    if (!category || category === '') {
      cat = this.state.category;
    }
    for (let i = 0; i < this.props.options.length; i++) {
      if (this.props.options[i].category === cat) {
        categoryType = this.props.options[i].type;
        return categoryType;
      }
    }
  }

  _getCategoryOptions() {
    for (let i = 0; i < this.props.options.length; i++) {
      if (this.props.options[i].category === this.state.category) {
        return this.props.options[i].options;
      }
    }
  }


  _onKeyDown(event) {
    // We only care about intercepting backspaces
    if (event.keyCode !== KeyEvent.DOM_VK_BACK_SPACE) {
      return;
    }
    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    const entry = ReactDOM.findDOMNode(this.refs.typeahead.instanceRef.inputRef());
    if (entry.selectionStart === entry.selectionEnd &&
      entry.selectionStart === 0) {
      if (this.state.operator !== '') {
        this.setState({ operator: '' });
      } else if (this.state.category !== '') {
        this.setState({ category: '' });
      } else {
        // No tokens
        if (!this.state.selected.length) {
          return;
        }
        const lastSelected = JSON.parse(
          JSON.stringify(this.state.selected[this.state.selected.length - 1])
        );
        this._removeTokenForValue(
          this.state.selected[this.state.selected.length - 1]
        );
        this.setState({ category: lastSelected.category, operator: lastSelected.operator });
        if (this._getCategoryType(lastSelected.category) !== 'textoptions' && this._getCategoryType(lastSelected.category) !== 'color') {
          this.refs.typeahead.instanceRef.setEntryText(lastSelected.value);
        }
      }
      event.preventDefault();
    }
  }

  _removeTokenForValue(value) {
    const index = this.state.selected.indexOf(value);
    if (index === -1) {
      return;
    }

    this.state.selected.splice(index, 1);
    this.setState({ selected: this.state.selected });
    this.props.onChange(this.state.selected);

    return;
  }

  _addTokenForValue(result) {
    let newValue = {}
    if (result.text === "Search for this text") {
      let searchWordExists = this.state.selected.filter(selected => {
        return selected.value === result.value;
      });
      if (searchWordExists.length) {
        return;
      }
      newValue = {
        category: "",
        operator: "",
        value: (typeof result) === 'object' ? result.value : result,
        originalValue: (typeof result) === 'object' ? result.value : result,
      };
    } else {
      if (this.state.category === '') {
        this.setState({ category: result.value });
        this.refs.typeahead.instanceRef.setEntryText('');
        return;
      }

      if (this.state.operator === '') {
        this.setState({ operator: result.value });
        this.refs.typeahead.instanceRef.setEntryText('');
        return;
      }
      newValue = {
        category: this.state.category,
        operator: this.state.operator,
        value: (typeof result) === 'object' ? result.text : result,
        originalValue: (typeof result) === 'object' ? result.value : result,
      };
    }
    this.state.selected.push(newValue);
    this.setState({ selected: this.state.selected });
    this.refs.typeahead.instanceRef.setEntryText('');
    this.props.onChange(this.state.selected);

    this.setState({
      category: '',
      operator: '',
    });
    return;
  }

  /*
   * Returns the data type the input should use ("date" or "text")
   */
  _getInputType() {
    if (this.state.category !== '' && this.state.operator !== '') {
      return this._getCategoryType();
    }

    return 'text';
  }

  _forceTrigger() {
    setTimeout(() => {
      if (this.state.category !== "" || (this.state.selected.length > 0 && this.state.category === "")) {
        this.forceUpdate();
      }
    });
  }
  render() {
    const classes = {};
    classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;
    const classList = classNames(classes);
    let Lazyoptionfetch = (() => { });
    if (this.props.fetchLazyOption && this.state.category) {
      Lazyoptionfetch = this.props.fetchLazyOption[this.state.category];
    }
    let typeaheadLeft = 0;
    if (this.refs.typeahead !== undefined) {
      typeaheadLeft = this.refs.typeahead.componentNode.offsetLeft;
    }
    let setStaticWidth = false;
    if (this.state.selected.length > 0 || this.state.category !== '') {
      setStaticWidth = true;
    }
    return (
      <div className="filter-tokenizer" ref={this.textInput}>
        <div className="token-collection" ref={this.tokencollection}>
          <span className="justcheck" style={{ display: 'inherit' }} ref={this.justcheck}>
            {this._renderTokens()}
          </span>

          <div className="filter-input-group">
            <div className={'text-truncate filter-category ' + ((this.state.category && this.state.category.length > 0) ? 'form-pad' : '')}>{this.state.category} </div>
            <div className={'text-truncate filter-operator ' + ((this.state.operator && this.state.operator.length > 0) ? 'form-pad' : '')}>{this.state.operator} </div>

            <Typeahead ref="typeahead"
              className={classList}
              placeholder={this.props.placeholder}
              customClasses={this.props.customClasses}
              searchIcon={this.props.searchIcon}
              options={this._getOptionsForTypeahead()}
              fetchLazyOption={Lazyoptionfetch}
              onSubmit={this.props.onSubmit}
              typeHeadSelectorLeft={(this.textInput.current) ? this.textInput.current.clientWidth : 0}
              typeHeadTokenCollectionSelectorLeft={this.tokencollection}
              typeHeadJustCheckSelectorLeft={this.justcheck}
              typeaheadRef={typeaheadLeft}
              header={this._getHeader()}
              updateHeader={this._forceTrigger}
              datatype={this._getInputType()}
              onOptionSelected={this._addTokenForValue}
              onKeyDown={this._onKeyDown}
              setStaticWidth={setStaticWidth}
            />
          </div>
        </div>
      </div>
    );
  }
}
