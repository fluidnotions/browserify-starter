'use strict';

global.$ = require('jquery');
require('bootstrap-notify');
var spin = require('spin');
var jsrender = require('jsrender');
var moment = require('moment');
var Promise = require("bluebird");
global.d3 = require("d3");
var nv = require("nvd3");

var Charts = function Charts() {

  var exampleData = function exampleData() {
    return [{
      "key": "One",
      "y": 29.765957771107
    }, {
      "key": "Two",
      "y": 0
    }, {
      "key": "Three",
      "y": 32.807804682612
    }, {
      "key": "Four",
      "y": 196.45946739256
    }, {
      "key": "Five",
      "y": 0.19434030906893
    }, {
      "key": "Six",
      "y": 98.079782601442
    }, {
      "key": "Seven",
      "y": 13.925743130903
    }, {
      "key": "Eight",
      "value": 5.1387322875705
    }];
  }

  var getPieChart = function getPieChart(opts) {
    var
      data = opts.data || exampleData(),
      el = opts.el || '#chart',
      showLabels = opts.showLabels || false;

    nv.addGraph(function() {
      var chart = nv.models.pieChart()
        .x(function(d) {
          return d.key
        })
        .y(function(d) {
          return d.y
        })
        .showLabels(showLabels);

      d3.select(el + " svg")
        .datum(data)
        .transition().duration(350)
        .call(chart);

      return chart;
    });

  }

  return {
    getPieChart: getPieChart
  }

}

var TemplateUtils = function TemplateUtils(temaplatePath) {

  jsrender.views.converters("dateformat", function(val) {
    //2015-09-02T12:25:33.9500000Z
    return moment(val).format("dddd, MMMM Do, h:mm:ss a");
  });

  var
    getPath = function getPath(name) {
      return temaplatePath + name + '.tmpl.html';
    },
    renderExtTemplate = function renderExtTemplate(item) {

      var file = getPath(item.name);

      console.log("renderExtTemplate with file: " + file + ", has data: " + JSON.stringify(item.data, null, 2));

      return Promise.resolve($.get(file))
        .then(function(tmplData) {

          jsrender.templates({
            tmpl: tmplData
          });
          var html = jsrender.render.tmpl(item.data);

          $(item.selector).html(html);

          return html;
        });
    }


  return {
    getPath: getPath,
    renderExtTemplate: renderExtTemplate
  }

}

var Spinner = function Spinner() {

  var spinner = null,
    start = function start() {
      var target = document.getElementById('spinner');
      console.log("spin target: " + target);
      spinner = new spin({
        lines: 11, // The number of lines to draw
        length: 29, // The length of each line
        width: 12, // The line thickness
        radius: 76, // The radius of the inner circle
        scale: 1, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        color: '#000', // #rgb or #rrggbb or array of colors
        opacity: 0.25, // Opacity of the lines
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        className: 'spinner', // The CSS class to assign to the spinner
        top: '50%', // Top position relative to parent
        left: '50%', // Left position relative to parent
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        position: 'relative', // Element positioning
      }).spin(target);
      console.log("spinner started");


    },
    stop = function stop() {
      spinner.stop();
      console.log("spinner stopped");
    }

  return {
    start: start,
    stop: stop
  }
}

var QuickGrowl = function QuickGrowl() {

  var grrr = function grrr(options) {
      $.notify({
        // options
        message: options.msg,
      }, {
        // settings
        element: options.ele || 'body',
        position: null,
        type: options.type,
        allow_dismiss: true,
        newest_on_top: false,
        showProgressbar: false,
        placement: {
          from: "top",
          align: "right"
        },
        offset: 50,
        spacing: 10,
        z_index: 1031,
        delay: (options.displaySec * 1000) || 3000,
        animate: {
          enter: 'animated fadeInDown',
          exit: 'animated fadeOutUp'
        },
        icon_type: 'class'
      });
    },
    ajaxErr = function ajaxErr(type, name, url, e) {

      var errMsg = "";
      //response text preferred
      if(e.responseText){
        errMsg = e.responseText;
        var resp = JSON.parse(errMsg);
        if(resp){
          errMsg = resp.exception;
        }
      }else if (e.statusText){
        errMsg = e.statusText;
      }

      console.log("Error: $.ajax:" + type + " " + url + "." + errMsg);
      grrr({
        msg: type + " " + name + " sever error " +  errMsg,
        type: "danger"
      });
    }

  return {
    grrr: grrr,
    xerr: ajaxErr
  }

}

var AjaxWrap = function AjaxWrap(){

var gwl = QuickGrowl(),
spin = Spinner(),
postJSON = function postJSON(url, data) {
    spin.start();
    return Promise.resolve(
      $.ajax({
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: "POST",
        url: url,
        data: JSON.stringify(data)
      })
    ).then(function(responseData) {
      if (responseData) console.log("postJSON response: " + JSON.stringify(responseData, null, 2));
      else console.log("postJSON response is null");
      spin.stop();
      return responseData;
    }).catch(function(e) {
      spin.stop();
        console.log("mark debug");
      if (e && e.status && e.status !== 200) {
        gwl.xerr("POST", "", url, e);
        return Promise.reject(e);
      }else{
        console.log("Error caught but status is OK");
        return null;
      }
    });
  },
  getJSON = function getJSON(url, data) {
    spin.start();
    return Promise.resolve(
      $.get(url, data)
    ).then(function(responseData) {
      if (responseData) console.log("getJSON response: " + JSON.stringify(responseData, null, 2));
      else console.log("getJSON response is null");
      spin.stop();
      return responseData;
    }).catch(function(e) {
      spin.stop();
      console.log("mark debug");
      if (e && e.status && e.status !== 200) {
        gwl.xerr("GET", "", url, e);
        return Promise.reject(e);
      }else{
        console.log("Error caught but status is OK");
        return null;
      }
    });
  }

  return {
    postJSON: postJSON,
    getJSON: getJSON
  }
}

module.exports.TemplateUtils = TemplateUtils;
module.exports.Spinner = Spinner;
module.exports.QuickGrowl = QuickGrowl;
module.exports.Charts = Charts;
module.exports.AjaxWrap = AjaxWrap;
