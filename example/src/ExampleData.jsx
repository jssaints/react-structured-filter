import Taffy from 'taffy';
import faker from 'faker';
import moment from 'moment';
/*******************************************************************************
 * WARNING: DO NOT DO WHAT THIS FILE DOES
 * You should NOT put all of your data in a local file like this.
 * You should query a server.  This is purely for demo purposes.
 ******************************************************************************/

const fakeData = [];

for ( let i = 0; i < 500; i++ ) {
  fakeData.push(
    {
      Symbol: faker.lorem.word().substring( 0, 3 ).toUpperCase(),
      Name: faker.company.companyName(),
      Price: parseFloat( faker.finance.amount()),
      MarketCap: faker.random.number() * 100,
      IPO: faker.date.past( 50, new Date()).getFullYear(),
      Sector: faker.company.catchPhraseAdjective(),
      Industry: faker.commerce.department(),
    }
  );
}

var ExampleData = {
    // Create instance variable of static data
    db: Taffy( fakeData )
  ,

  filter: function(filterString, sortColumn, sortAscending, page, pageSize) {
    console.log("Filter: "+filterString);

    // Apply filters
    var filteredData = this.db(),
    i, 
    filter;

    if (filterString != "") {
  var filterArray = JSON.parse(filterString);
  for (i = 0; i < filterArray.length; i++) {
    filter = filterArray[i];

    // Filter Symbol
    if (filter.category == "Symbol") {
      if (filter.operator == "==") {
    filteredData = filteredData.filter({Symbol:{'==':filter.value}});
      } else if (filter.operator == "!=") {
    filteredData = filteredData.filter({Symbol:{'!==':filter.value}});
      }
    }

    // Filter Name
    else if (filter.category == "Name") {
      if (filter.operator == "==") {
    filteredData = filteredData.filter({Name:{'==':filter.value}});
      } else if (filter.operator == "!=") {
    filteredData = filteredData.filter({Name:{'!==':filter.value}});
      } else if (filter.operator == "contains") {
    filteredData = filteredData.filter({Name:{'likenocase':filter.value}});
      } else if (filter.operator == "!contains") {
    filteredData = filteredData.filter({Name:{'!likenocase':filter.value}});
      }
    }

    // Filter Sector
    else if (filter.category == "Sector") {
      if (filter.operator == "==") {
    filteredData = filteredData.filter({Sector:{'==':filter.value}});
      } else if (filter.operator == "!=") {
    filteredData = filteredData.filter({Sector:{'!==':filter.value}});
      }
    }

    // Filter Industry
    else if (filter.category == "Industry") {
      if (filter.operator == "==") {
    filteredData = filteredData.filter({Industry:{'==':filter.value}});
      } else if (filter.operator == "!=") {
    filteredData = filteredData.filter({Industry:{'!==':filter.value}});
      }
    }

    // Filter Price
    else if (filter.category == "Price") {
      if (filter.operator == "==") {
    filteredData = filteredData.filter({Price:{'==':filter.value}});
      } else if (filter.operator == "!=") {
    filteredData = filteredData.filter({Price:{'!==':filter.value}});
      } else if (filter.operator == "<") {
    filteredData = filteredData.filter({Price:{'<':filter.value}});
      } else if (filter.operator == "<=") {
    filteredData = filteredData.filter({Price:{'<=':filter.value}});
      } else if (filter.operator == ">") {
    filteredData = filteredData.filter({Price:{'>':filter.value}});
      } else if (filter.operator == ">=") {
    filteredData = filteredData.filter({Price:{'>=':filter.value}});
      }
    }

    // Filter MarketCap
    else if (filter.category == "MarketCap") {
      if (filter.operator == "==") {
    filteredData = filteredData.filter({MarketCap:{'==':filter.value}});
      } else if (filter.operator == "!=") {
    filteredData = filteredData.filter({MarketCap:{'!==':filter.value}});
      } else if (filter.operator == "<") {
    filteredData = filteredData.filter({MarketCap:{'<':filter.value}});
      } else if (filter.operator == "<=") {
    filteredData = filteredData.filter({MarketCap:{'<=':filter.value}});
      } else if (filter.operator == ">") {
    filteredData = filteredData.filter({MarketCap:{'>':filter.value}});
      } else if (filter.operator == ">=") {
    filteredData = filteredData.filter({MarketCap:{'>=':filter.value}});
      }
    }

    // Filter IPO
    else if (filter.category == "IPO") {
      var year = moment( filter.value, 'lll' ).year();
      console.log( year );
      if (filter.operator == "==") {
    filteredData = filteredData.filter({IPO:{'==':year}});
      } else if (filter.operator == "!=") {
    filteredData = filteredData.filter({IPO:{'!==':year}});
      } else if (filter.operator == "<") {
    filteredData = filteredData.filter({IPO:{'<':year}});
      } else if (filter.operator == "<=") {
    filteredData = filteredData.filter({IPO:{'<=':year}});
      } else if (filter.operator == ">") {
    filteredData = filteredData.filter({IPO:{'>':year}});
      } else if (filter.operator == ">=") {
    filteredData = filteredData.filter({IPO:{'>=':year}});
      }
    }



  }
    }


    // Get count
    var totalResults = filteredData.count();

    // Set ordering
    var ordering = "Symbol asec";
    if (sortColumn != "") {
  ordering = sortColumn;
  if (sortAscending) {
    ordering += " asec";
  } else {
    ordering += " desc";
  }
    }
    // Get data with limits
    var results = filteredData.order(ordering).start(pageSize*page).limit(pageSize).get();

    // Taffy returns my data with "___id" and "___s" added, so delete those things.
    // (There is likely a cleaner way to do this)
    for (i = 0; i < results.length; i++) {
  delete results[i]["___id"];
  delete results[i]["___s"]
    }

    return {
  results: results,
  totalResults: totalResults,
  pageSize: pageSize
    };
  },

  getSymbolOptions: function() {
    return this.db().distinct("Symbol");
  },

  getSectorOptions: function() {
    return this.db().distinct("Sector");
  },

  getIndustryOptions: function() {
    return this.db().distinct("Industry");
  }
};

module.exports = ExampleData;
