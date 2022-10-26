
// Resize Chart
document.getElementById("myDiv").style.width=98 + '%';
window.onresize = function() {
  // dont resize too much
  if (window.innerWidth > 1000)
  {
    Plotly.Plots.resize('myDiv')
  }
};

function reloadWashingDays() {
  var args = {
    lat: document.getElementById("lat").value,
    lon: document.getElementById("lon").value
  }

  const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  var ideal_times = [];
  var weekday_ordered = [];
  //fetch("https://api.open-meteo.com/v1/forecast?latitude=" + args.lat + "&longitude=" + args.lon + "&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m,windgusts_10m,direct_radiation&windspeed_unit=mph").then(function (response) {
  fetch("https://api.open-meteo.com/v1/gfs?latitude=" + args.lat + "&longitude=" + args.lon + "&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m,windgusts_10m,direct_radiation&windspeed_unit=mph").then(function (response) {
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
    var scoresubtotal;
    var started = false;
    for (let index = 0; index < forecast.time.length; ++index) {
        var recordDate = new Date(forecast.time[index]);
        var day = weekday[recordDate.getDay()];
        forecast.day[index] = day;
        var startTime;
        forecast.rainlarge[index] = forecast.precipitation[index] * 20;
        
        var sunscore = forecast.direct_radiation[index];
        var windscore = (3 *  forecast.windspeed_10m[index]);
        var humidityscore = (100 - forecast.relativehumidity_2m[index])/100;
        forecast.score[index] =  (sunscore + windscore) * humidityscore;

        if (forecast.temperature_2m[index] > 0 &&
        forecast.relativehumidity_2m[index] < 80 &&
        forecast.precipitation[index] == 0 &&
        forecast.direct_radiation[index] > 20 &&
        forecast.windgusts_10m[index] < 60 &&
        (forecast.windspeed_10m[index] > 10 || forecast.windgusts_10m[index] > 15))
        {
          forecast.chart[index] = "Ideal";
          if (started == false)
          {
            started = true;
            startTime = new Date(forecast.time[index]);
            scoresubtotal = forecast.score[index];
          }
          else
          {
            scoresubtotal = scoresubtotal + forecast.score[index];
          }
        }
        else
        {
          if (started == true)
          {
            ideal_times.push({"startDate":startTime});
            ideal_times[ideal_times.length - 1].endDate = new Date(forecast.time[index])
            ideal_times[ideal_times.length - 1].day = weekday[ideal_times[ideal_times.length - 1].endDate.getDay()];
            ideal_times[ideal_times.length - 1].status = "Ideal"
            ideal_times[ideal_times.length - 1].totalscore = scoresubtotal;
            var timespan = new Date(forecast.time[index]) - startTime
            const msInHour = 1000 * 60 * 60;
            var timespan_hrs = Math.round(Math.abs(timespan) / msInHour);
            ideal_times[ideal_times.length - 1].timespan_hrs = timespan_hrs;
            ideal_times[ideal_times.length - 1].timespan = startTime.getHours() + ":00-" + ideal_times[ideal_times.length - 1].endDate.getHours() + ":00  (" + timespan_hrs + " hours)";
            started = false;
          }
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
    console.log(ideal_times);
    var summary = "Summary of Ideal Times for Drying Outside<br>";
    for (let index = 0; index < ideal_times.length; ++index) {
      if (ideal_times[index].timespan_hrs > 2)
      {
        summary = summary + ideal_times[index].day  + " " + ideal_times[index].timespan + " - Score: " + Math.round(ideal_times[index].totalscore) + "<br>"
      }
    }
    document.getElementById("summary").innerHTML = summary;
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
        "name": "Windspeed Gusts (mph)",
        "x": forecast.time,
        "y": forecast.windgusts_10m,
        "type": "line",
        "hovertemplate": "<b>%{x}</b><br>%{fullData.name}: %{y}<extra></extra>",
        "marker": {
          "color": "#DAECFC"
        }
      },
      {
        "name": "Relative Humidity",
        "x": forecast.time,
        "y": forecast.relativehumidity_2m,
        "type": "line",
        "hovertemplate": "<b>%{x}</b><br>%{fullData.name}: %{y}<extra></extra>",
        "marker": {
          "color": "#DAECDC"
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
        "family": "Open Sans, verdana, arial, sans-serif",
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
      "xaxis": {
        "title": {
          "text": "",
          "standoff": 6,
          "font": {
            "size": 12
          }
        },
        "type": "-",
        "dtick": (60 * 60 * 1000) * 4,
        "tickformat": '%H\n %a',
        "showgrid": true,
        "ticks": "outside", 
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
        "showgrid": false,
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


}



