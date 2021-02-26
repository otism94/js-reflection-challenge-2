"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Variables
 */
var picsumURL = function picsumURL(page) {
  return "https://picsum.photos/v2/list?page=".concat(page, "&limit=100");
};

var btnLink = $('.btn-link');
var btnRefresh = $('.btn-refresh');
var btnRefreshHTML = '<i class="fas fa-redo-alt" id="icon-refresh"></i>';
var imgContainer = $('#img-container');
var loadedImg = $('#loaded-img');
var displayedImg = null;
var linkedImages = {};
/**
 * Classes
 */

var ImageDetails = function ImageDetails(id, author, url, download_url, links) {
  _classCallCheck(this, ImageDetails);

  this.id = id, this.author = author, this.url = url, this.download_url = download_url, this.links = links;
};
/**
 * Image Functions
 */
// Fetches an image


var getImages = function getImages() {
  var randomPage = Math.floor(Math.random() * 10 + 1);
  var getPicsum = picsumURL(randomPage);
  fetch(getPicsum).then(function (response) {
    return response.json();
  }).then(pickRandomImage).then(loadImage).then(loadImageDetails)["catch"](function (err) {
    return console.log(err);
  });
}; // Picks a random image from the fetched data


var pickRandomImage = function pickRandomImage(json) {
  var randomImage = Math.floor(Math.random() * 99);
  var chosenImage = json[randomImage];
  var chosenImageLinks = checkLinks(chosenImage);
  displayedImg = new ImageDetails(chosenImage.id, chosenImage.author, chosenImage.url, chosenImage.download_url, chosenImageLinks);
}; // Checks how many times the displayed image has been linked


var checkLinks = function checkLinks(img) {
  if (!jQuery.isEmptyObject(linkedImages)) {
    for (var id in linkedImages) {
      if (linkedImages[id].links.length > 0 && id === img.id) {
        return linkedImages[id].links;
      } else {
        return [];
      }
    }
  } else {
    return [];
  }
}; // Fades in the image once it's fully loaded


var loadImage = function loadImage() {
  var img = new Image();

  img.onload = function () {
    btnRefresh.html("".concat(btnRefreshHTML, "New Image")).removeClass('loading').removeAttr('disabled');
    btnLink.removeClass('loading').removeAttr('disabled');
    imgContainer.append(img);
    loadedImg = $('#loaded-img');
    loadedImg.fadeIn(500);
  };

  img.id = 'loaded-img';
  img.src = displayedImg.download_url;
}; // Retrieves image details from object and displays in sidebar


var loadImageDetails = function loadImageDetails() {
  $('#photo-info').html("\n        <div id=\"photo-heading\">\n            <div id=\"photo-id\">\n                <h2>Image</h2>\n                <span>".concat(displayedImg.id, "</span>\n            </div>\n            <div id=\"links-count\">\n                <i class=\"fas fa-link\" id=\"icon-link\"></i> ").concat(displayedImg.links.length, "\n            </div>\n        </div>\n        <ul id=\"info-list\">\n            <li><i class=\"fas fa-user-circle\"></i>").concat(displayedImg.author, "</li>\n            <li><i class=\"fab fa-unsplash\"></i><a href=\"").concat(displayedImg.url, "\" target=\"_blank\">View this image on Unsplash</a></li>\n        </li>\n    "));
}; // Removes image and loads a new one


var newImage = function newImage() {
  loadedImg.fadeOut(500, function () {
    this.remove();
    getImages();
  });
};
/**
 * Other Functions
 */
// Logo colour animation


var logoColor = function logoColor() {
  var hue = 0;
  setInterval(function () {
    $('#icon-logo').css('color', "hsl(".concat(hue, ", 90%, 60%)")).css('text-shadow', "0 0 5px hsl(".concat(hue, ", 90%, 60%)"));
    hue++;

    if (hue === 360) {
      hue = 0;
    }
  }, 10);
};
/**
 * Event Listeners
 */
// Page open


$(document).ready(function () {
  getImages();
  logoColor();
}); // 'Link Image' button click

btnLink.on('click', function () {
  var inputEmail = prompt('Enter an email address');
  linkedImages[displayedImg.id] = displayedImg;
  linkedImages[displayedImg.id].links.push(inputEmail);
  $('#links-count').html("\n        <i class=\"fas fa-link\" id=\"icon-link\"></i> ".concat(linkedImages[displayedImg.id].links.length, "\n    "));
}); // 'New Image' button click

btnRefresh.on('click', function () {
  newImage();
  btnRefresh.html("".concat(btnRefreshHTML, "Loading...")).addClass('loading').attr('disabled', 'disabled');
  btnLink.addClass('loading').attr('disabled', 'disabled');
  $({
    rotation: 0
  }).animate({
    rotation: 360
  }, {
    duration: 1500,
    easing: 'linear',
    step: function step() {
      $('#icon-refresh').css({
        transform: "rotate(".concat(this.rotation, "deg)")
      });
    }
  });
});