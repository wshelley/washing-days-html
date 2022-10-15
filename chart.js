var args = {
  lat: 55.7,
  lon: -3.35
}

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

var ideal_times = [];
var weekday_ordered = [];

fetch("https://api.open-meteo.com/v1/forecast?latitude=" + args.lat + "&longitude=" + args.lon + "&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m,windgusts_10m,direct_radiation&windspeed_unit=mph").then(function (response) {
	// The API call was successful!
	return response.json();
}).then(function (data) {
	// This is the JSON from our response
	console.log(data);
    
  var forecast = data.hourly;

  function getArray(object) {
      return Object.keys(object).reduce(function (r, k) {
          object[k].forEach(function (a, i) {
              r[i] = r[i] || {};
              r[i][k] = a;
          });
          return r;
      }, []);
  }

  function getObject(array) {
      return array.reduce(function (r, o, i) {
          Object.keys(o).forEach(function (k) {
              r[k] = r[k] || [];
              r[k][i] = o[k];
          });
          return r;
      }, {});
  }

  forecast.chart = [];
  forecast.ideal = [];
  forecast.day = [];
  forecast.rainlarge = [];
  forecast.score = [];
  for (let index = 0; index < forecast.time.length; ++index) {
      var recordDate = new Date(forecast.time[index]);
      var day = weekday[recordDate.getDay()];
      forecast.day[index] = day;
      forecast.rainlarge[index] = forecast.precipitation[index] * 20;
      var sunscore = forecast.direct_radiation[index];
      var windscore = (2 *  forecast.windspeed_10m[index]);
      var humidityscore = (100 - forecast.relativehumidity_2m[index])/100;
      forecast.score[index] =  (sunscore + windscore) * humidityscore;
      if (forecast.temperature_2m[index] > 0 &&
      forecast.relativehumidity_2m[index] < 80 &&
      forecast.precipitation[index] == 0 &&
      forecast.windspeed_10m[index] > 5 &&
      forecast.windgusts_10m[index] < 40 &&
      forecast.direct_radiation[index] > 50)
      {
        forecast.chart[index] = "Ideal";
      }
      else
      {
        if (forecast.precipitation[index] > 0)
        {
          forecast.chart[index] = "Maybe";
          forecast.score[index] = 0;
        }
        else
        {
          forecast.chart[index] = "Maybe";
        }
      }
  }
 
  console.log(forecast.score);

  /*var mydata = getArray(forecast);
  console.log(mydata);
  const filter2 = mydata.filter(d => d.ideal == true);
  console.log(filter2);
  */

  //console.log(getArray(data));
  //console.log(getObject(getObject(data)));




  var plotdata = [
    {
      "name": "Windspeed (mph)",
      "x": forecast.time,
      "y": forecast.windspeed_10m,
      "type": "line",
      "hovertemplate": "<b>%{x}</b><br>%{fullData.name}: %{y}<extra></extra>",
      "marker": {
        "color": "#DAECFC"
      }
    },
    {
      "name": "Precipitation",
      "x": forecast.time,
      "y": forecast.precipitation,
      "yaxis": 'y2',
      "type": "line",
      "hovertemplate": "<b>%{x}</b><br>%{fullData.name}: %{y}<extra></extra>",
      "marker": {
        "color": "#033663"
      }
    },
    {
      "name": "Score",
      "x": forecast.time,
      "y": forecast.score,
      "type": "bar",
      "hovertemplate": "<b>%{x}</b><br>%{fullData.name}: %{y}<extra></extra>",
      "transforms": [
        {
          "type": "groupby",
          "groups": forecast.chart,
          "styles": [
            {
              "target": "Maybe",
              "value": {
                "marker": {
                  "color": "#EECA86"
                }
              }
            },
            {
              "target": "Ideal",
              "value": {
                "marker": {
                  "color": "#55A874"
                }
              }
            }
          ]
        },
        {
          "type": "sort",
          "target": forecast.time,
          "order": "ascending"
        },
        {
          "type": "aggregate",
          "groups": forecast.time,
          "aggregations": [
            {
              "target": "y",
              "func": "sum",
              "enabled": true
            }
          ]
        }
      ]
    }
  ];

  var layout = {
    "title": {
      "text": "",
      "font": {
        "color": "#3D3D3D",
        "size": 16
      }
    },
    "font": {
      "family": "Inter",
      "color": "#979797"
    },
    "showlegend": true,
    "legend": {
      "xanchor": "center",
      "x": 0.45,
      "y": -0.2,
      "orientation": "h"
    },
    "margin": {
      "l": 72,
      "r": 24,
      "t": 24,
      "b": 32,
      "pad": 2
    },
    "hovermode": "closest",
    "hoverlabel": {
      "bgcolor": "#000",
      "bordercolor": "#000",
      "font": {
        "color": "#fff",
        "family": "Inter",
        "size": 12
      }
    },
    "clickmode": "select+event",
    "dragmode": "select",
    "xaxis": {
      "title": {
        "text": "",
        "standoff": 6,
        "font": {
          "size": 12
        }
      },
      "type": "-",
      "tickformat": "%a",
      "ticklabelmode" : "period",
      "automargin": true,
      "fixedrange": true,
      "gridcolor": "#fff",
      "zerolinecolor": "#fff"
    },
    "yaxis": {
      "title": {
        "text": "Drying Score / Windspeed (mph)",
        "standoff": 6,
        "font": {
          "size": 12
        }
      },
      "type": "linear",
      "tickformat": "",
      "automargin": true,
      "fixedrange": true,
      "zerolinecolor": "#DEDEDE",
      "rangemode": "nonnegative"
    },
    "yaxis2": {
      "title": {
        "text": "Precipitation",
        "standoff": 6,
        "font": {
          "size": 12
        }
      },
      "type": "linear",
      "tickformat": "",
      "automargin": true,
      "fixedrange": false,
      "zerolinecolor": "#DEDEDE",
      "overlaying": "y",
      "side": "right",
      "range": [0,15],
      "rangemode": "nonnegative"
    },
    "barmode": "stack"
  }

  console.log(plotdata);

  Plotly.newPlot('myDiv', plotdata, layout);

}).catch(function (err) {
	// There was an error
	console.warn('Something went wrong.', err);
});