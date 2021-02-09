var React = require('react');
var Griddle = require('griddle-react');
var GriddleWithCallback = require('./GriddleWithCallback');
var StructuredFilter = require('../../src/main');

require('../../src/react-structured-filter.css');

var ExampleData = require('./ExampleData');

class ExampleTable extends React.Component {
  constructor(...args) {
    super(...args);
    this.getSymbolOptions = this.getSymbolOptions.bind(this);
    this.getLazySymbolOptions = this.getLazySymbolOptions.bind(this);

  }
  state = {
    filter: [
      {
        category: 'Industry',
        categoryText: 'Industry',
        operator: '==',
        value: 'Music',
        originalValue: 'Music',
      },
      {
        category: 'IPO',
        categoryText: 'IPO',
        operator: '>',
        value: 'Dec 8, 1980 10:50 PM',
        originalValue: 'Dec 8, 1980 10:50 PM',
      },
    ],
    symbolOptions: [
      "1", "2", "3"
    ]
  };

  getJsonData(filterString, sortColumn, sortAscending, page, pageSize, callback) {

    if (filterString == undefined) {
      filterString = "";
    }
    if (sortColumn == undefined) {
      sortColumn = "";
    }

    // Normally you would make a Reqwest here to the server
    var results = ExampleData.filter(filterString, sortColumn, sortAscending, page, pageSize);
    callback(results);
  }


  updateFilter(filter) {
    // Set our filter to json data of the current filter tokens
    this.setState({ filter: filter });
  }


  getSymbolOptions() {
    return this.state.symbolOptions;
  };

  getLazySymbolOptions(QueryValue) {
    const overalloptions = ExampleData.getSymbolOptions();
    this.setState({
      symbolOptions: [
      {value: 1, text:"baleajs123", image: "https://www.winhelponline.com/blog/wp-content/uploads/2017/12/user.png"},
      {value: 2, text:"Vinoth", image: "https://cdn0.iconfinder.com/data/icons/user-pictures/100/maturewoman-3-128.png"},
      ]
    });

  }



  getIndustryOptions() {
    return ExampleData.getIndustryOptions();
  }


  render() {
    return (
      <div>
        <StructuredFilter
          placeholder="Filter data..."
          options={[
            { category: "Symbol", categoryText: "Symbol", type: "textoptions", options: this.getSymbolOptions },
            { category: "Name", categoryText: "Name", type: "text", options: () => ['aa', 'bb'] },
            { category: "Price", type: "number" },
            { category: "MarketCap", type: "number" },
            { category: "IPO", type: "date" },
            { category: "Sector", type: "textoptions", options: this.getSectorOptions },
            { category: "Industry", type: "textoptions", options: this.getIndustryOptions }
          ]}
          customClasses={{
            input: "filter-tokenizer-text-input",
            results: "filter-tokenizer-list__container",
            listItem: "filter-tokenizer-list__item"
          }}
          onChange={this.updateFilter.bind(this)}
          value={this.state.filter}
          fetchLazyOption={{
            Symbol: this.getLazySymbolOptions
          }}
          operators={{
            textoptions: [`==`, `!=`],
            text: [`contains`, `!contains`],
            number: [`==`, `!=`, `<`, `<=`, `>`, `>=`],
            date: [`==`, `!=`, `<`, `<=`, `>`, `>=`],
          }}
        />

        {/* <GriddleWithCallback
          getExternalResults={this.getJsonData} filter={this.state.filter}
          resultsPerPage={10}
        />
        <ExampleData ref="ExampleData" /> */}

      </div>
    )
  }
}
module.exports = ExampleTable;
