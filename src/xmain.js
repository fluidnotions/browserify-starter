'use strict';

global.$ = require('jquery');
global.jQuery = global.$;
require('jquery.hotkeys');


$(document).ready(function() {


      $(".nav").click(function(e) {
        var show = e.target.dataset.show;
        $(".nav-pills > li.active").removeClass("active");
        $(e.target.parentElement).addClass("active");
        console.log("show: "+ show );
        view[show]();
      });

      $(document).bind('keydown', 'ctrl+]', function() {
        console.log("test key pressed");


      });

});
