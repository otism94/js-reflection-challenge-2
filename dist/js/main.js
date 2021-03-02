"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Variables
 */
// Picsum API
var picsumURL = function picsumURL(page) {
  return "https://picsum.photos/v2/list?page=".concat(page, "&limit=100");
}; // Main page DOM queries


var linkBox = $('#modal-link-box');
var imgContainer = $('#img-container');
var loadedImg = $('#loaded-img');
var btnLink = $('.btn-link');
var btnRefresh = $('.btn-refresh');
var btnRefreshHTML = '<i class="fas fa-redo-alt" id="icon-refresh"></i>'; // Modal box DOM queries

var emailField = $('#user-email-field');
var linkStatus = $('#status');
var btnPastEmail = $('.btn-past-email');
var btnCancel = $('.btn-cancel');
var btnLinkIt = $('.btn-linkit'); // Image storage

var displayedImg = null;
var linkedImages = {}; // Email storage

var savedEmails = {};
var lastUsedEmail = null; // State trackers

var modalVisible = false; // Email format regex

var mailFormat = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
/**
 * Classes
 */
// Image Details for displayedImg and linkedImages

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
  }).then(pickRandomImage).then($('#error').remove())["catch"](function (err) {
    return errorHandler(err);
  });
}; // Picks a random image from the fetched data


var pickRandomImage = function pickRandomImage(json) {
  var randomImage = Math.floor(Math.random() * 99);
  var chosenImage = json[randomImage];
  var chosenImageLinks = checkLinks(chosenImage);
  displayedImg = new ImageDetails(chosenImage.id, chosenImage.author, chosenImage.url, chosenImage.download_url, chosenImageLinks);
  loadImage();
  loadImageDetails();
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
}; // Display error on page


var errorHandler = function errorHandler(err) {
  imgContainer.html("\n        <div id=\"error\" style=\"text-align: center\">\n            <h2>Something went wrong!</h2>\n            <span style=\"color: #ec3746\">".concat(err, "</span>\n        </div>\n    "));
};
/**
 * Email linking functions
 */
// Link email


var linkEmail = function linkEmail(email) {
  var isNewEmail = true;
  var alreadyLinked = false;

  for (savedEmail in savedEmails) {
    if (savedEmail === email) {
      isNewEmail = false;
      break;
    }
  }

  if (isNewEmail) {
    savedEmails["".concat(email)] = [displayedImg];
  } else {
    for (var i = 0; i < savedEmails["".concat(email)].length; i++) {
      if (savedEmails["".concat(email)][i].id === displayedImg.id) {
        alreadyLinked = true;
        break;
      }
    }

    if (!alreadyLinked) {
      savedEmails["".concat(email)].push(displayedImg);
    } else {
      emailField.focus();
      linkStatus.addClass('fail').html("\n                    <i class=\"fas fa-exclamation-circle\"></i> Email already linked!\n                ");
      btnLinkIt.removeAttr('disabled');
    }
  }

  return alreadyLinked;
}; // Link image


var linkImage = function linkImage(inputEmail) {
  var isValid = validateEmail(inputEmail);

  if (!isValid) {
    emailField.focus();
    linkStatus.addClass('fail').html("\n                <i class=\"fas fa-exclamation-circle\"></i> Invalid email! Try again.\n            ");
    btnLinkIt.removeAttr('disabled');
  } else {
    var alreadyLinked = linkEmail(inputEmail);

    if (!alreadyLinked) {
      linkedImages[displayedImg.id] = displayedImg;
      linkedImages[displayedImg.id].links.push(inputEmail);
      $('#links-count').html("\n                <i class=\"fas fa-link\" id=\"icon-link\"></i> ".concat(linkedImages[displayedImg.id].links.length, "\n            "));
      lastUsedEmail = inputEmail;
      linkStatus.removeClass('fail').addClass('success').html("\n                    <i class=\"fas fa-exclamation-circle\"></i> Linked!\n                ");
      setTimeout(function () {
        linkBox.fadeOut(500, function () {
          linkStatus.removeClass('success').html('');
          emailField.val('');
          btnLinkIt.removeAttr('disabled');
          modalVisible = false;
        });
      }, 1000);
    }
  }
}; // Email validator


var validateEmail = function validateEmail(email) {
  if (email.match(mailFormat) && email.length > 0) {
    return true;
  } else {
    return false;
  }
};
/**
 * Other Functions
 */
// Logo colour animation


var logoColor = function logoColor() {
  var hue = 0;
  setInterval(function () {
    $('#icon-logo').css({
      'color': "hsl(".concat(hue, ", 90%, 60%)"),
      'text-shadow': "0 0 5px hsl(".concat(hue, ", 90%, 60%)")
    });
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
}); // 'Link Image' button

btnLink.on('click', function () {
  if (!modalVisible) {
    modalVisible = true;
    linkBox.fadeIn(500);
    emailField.focus();

    if (lastUsedEmail !== null) {
      $('#past-email').show();
      btnPastEmail.html("".concat(lastUsedEmail));
    }
  } else if (modalVisible) {
    linkBox.fadeOut(500, function () {
      emailField.val('');
      linkStatus.removeClass('fail').html('');
      modalVisible = false;
    });
  }
}); // Modal 'Link to Previous Email' button

btnPastEmail.on('click', function () {
  linkImage(lastUsedEmail);
}); // Modal 'Cancel' button

btnCancel.on('click', function () {
  linkBox.fadeOut(500, function () {
    emailField.val('');
    linkStatus.removeClass('fail').html('');
    modalVisible = false;
  });
}); // Modal 'Link It' button

btnLinkIt.on('click', function () {
  btnLinkIt.attr('disabled', 'disabled');
  var inputEmail = emailField.val();
  linkImage(inputEmail);
}); // User presses enter to Link It

emailField.keyup(function (event) {
  if (event.keyCode === 13) {
    btnLinkIt.click();
  }
}); // 'New Image' button

btnRefresh.on('click', function () {
  if (modalVisible) {
    linkBox.fadeOut(500, function () {
      linkStatus.removeClass('fail').html('');
      modalVisible = false;
    });
  }

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