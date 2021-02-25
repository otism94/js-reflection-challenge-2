"use strict";

var getImages = function getImages() {
  var randomPage = Math.floor(Math.random() * 10 + 1);
  var picsumURL = "https://picsum.photos/v2/list?page=".concat(randomPage, "&limit=100");
  fetch(picsumURL).then(function (response) {
    return response.json();
  }).then(pickRandomImage).then(loadImage)["catch"](function (err) {
    return console.log(err);
  });
};

var pickRandomImage = function pickRandomImage(json) {
  var randomImage = Math.floor(Math.random() * 99 + 0);
  var chosenImage = json[randomImage];
  return chosenImage;
};

var loadImage = function loadImage(src) {
  var img = new Image();

  img.onload = function () {
    $('#img-container').append(img);
    $('#loaded-img').fadeIn(500);
  };

  img.id = 'loaded-img';
  img.src = src.download_url;
};

var newImage = function newImage() {
  $('#loaded-img').fadeOut(500, function () {
    $('#loaded-img').remove();
    getImages();
  });
};

$(document).ready(function () {
  getImages();
});
$('#btn-refresh').on('click', function () {
  newImage();
});