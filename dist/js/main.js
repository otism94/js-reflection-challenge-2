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
var btnLinkIt = $('.btn-linkit'); // State tracker

var fromLinksView = false;
var getOldImg = false; // Image storage

var linkedImages = {};
var displayedImg = null; // Email storage

var savedEmails = {};
var lastUsedEmail = null; // Email format regex

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
  axios.get(getPicsum).then(function (response) {
    pickRandomImage(response.data);
    $('#error').remove();
  })["catch"](function (err) {
    return errorHandler(err);
  });
}; // Picks a random image from the fetched data


var pickRandomImage = function pickRandomImage(array) {
  var randomImage = Math.floor(Math.random() * (array.length - 1));
  var chosenImage = array[randomImage];
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
  $('#photo-info').html("\n        <div id=\"photo-heading\">\n            <div id=\"photo-id\">\n                <h2>Image</h2>\n                <span>".concat(displayedImg.id, "</span>\n            </div>\n            <div id=\"links-count\">\n                <i class=\"fas fa-link\"></i> ").concat(displayedImg.links.length, "\n            </div>\n        </div>\n        <ul id=\"info-list\">\n            <li><i class=\"fas fa-user-circle\"></i>").concat(displayedImg.author, "</li>\n            <li><i class=\"fab fa-unsplash\"></i><a href=\"").concat(displayedImg.url, "\" target=\"_blank\">View this image on Unsplash</a></li>\n        </li>\n    "));

  if (displayedImg.links.length) {
    displayedImg.links.forEach(function (email) {
      $('#no-links').hide();
      $('#sidemenu-no-links').hide();
      $('#sidemenu-no-emails').hide();
      $('#links-list').append("<li><span class=\"email-links-count\">".concat(savedEmails[email].length, "</span> <span class=\"email-link\">").concat(email, "</span></li>"));
      $('#sidemenu-links-list').append("<li><span class=\"email-links-count\">".concat(savedEmails[email].length, "</span> <span class=\"email-link\">").concat(email, "</span></li>"));
    });
  } else {
    $('#no-links').show();
    $('#sidemenu-no-links').show();
  }
}; // Removes image and loads a new one


var newImage = function newImage() {
  if (fromLinksView) {
    $('#column-1').fadeOut(500);
    $('#column-2').fadeOut(500, function () {
      $('#column-1, #column-2').remove();

      if (!getOldImg) {
        getImages();
      } else if (getOldImg) {
        loadImage();
        loadImageDetails();
      }

      $('#links-info, #sidemenu-links').show();
      getOldImg = fromLinksView = false;
    });
  } else {
    loadedImg.fadeOut(500, function () {
      loadedImg.remove();
      getImages();
    });
  }

  $('#links-list').children().toArray().forEach(function (child) {
    $(child).remove();
  });
  $('#sidemenu-links-list').children().toArray().forEach(function (child) {
    if ($(child).attr('id') !== 'sidemenu-no-links') {
      $(child).remove();
    }
  });
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
}; // Display API request error on page


var errorHandler = function errorHandler(err) {
  imgContainer.html("\n        <div id=\"error\">\n            <h2>Something went wrong!</h2>\n            <span>".concat(err, "</span>\n        </div>\n    "));
};
/**
 * Email linking functions
 */
// Link email


var linkEmail = function linkEmail(email) {
  var isNewEmail = true;
  var alreadyLinked = false;

  for (var savedEmail in savedEmails) {
    if (savedEmail === email) {
      isNewEmail = false;
      break;
    }
  }

  if (isNewEmail) {
    savedEmails["".concat(email)] = [displayedImg];
    updateEmails();
  } else {
    for (var i = 0; i < savedEmails["".concat(email)].length; i++) {
      if (savedEmails["".concat(email)][i].id === displayedImg.id) {
        alreadyLinked = true;
        break;
      }
    }

    if (!alreadyLinked) {
      savedEmails["".concat(email)].push(displayedImg);
      updateEmails();
    } else {
      emailField.focus();
      linkStatus.addClass('fail').html("\n                    <i class=\"fas fa-exclamation-circle\"></i> Email already linked!\n                ");
      modalBtnDisable('enable');
    }
  }

  return alreadyLinked;
}; // Link image


var linkImage = function linkImage(inputEmail) {
  var isValid = validateEmail(inputEmail);

  if (!isValid) {
    emailField.focus();
    linkStatus.addClass('fail').html("\n                <i class=\"fas fa-exclamation-circle\"></i> Invalid email! Try again.\n            ");
    modalBtnDisable('enable');
  } else {
    var alreadyLinked = linkEmail(inputEmail);

    if (!alreadyLinked) {
      linkedImages[displayedImg.id] = displayedImg;
      linkedImages[displayedImg.id].links.push(inputEmail);
      $('#links-count').html("\n                <i class=\"fas fa-link\" id=\"icon-link\"></i> ".concat(linkedImages[displayedImg.id].links.length, "\n            "));
      $('#no-links, #sidemenu-no-links').hide();
      $('#links-list, #sidemenu-links-list').append("\n                <li>\n                    <span class=\"email-links-count\">".concat(savedEmails[inputEmail].length, "</span>\n                    <span class=\"email-link\">").concat(inputEmail, "</span>\n                </li>\n            "));

      if (!$('.hamburger').hasClass('notification')) {
        $('.hamburger').toggleClass('notification');
      }

      lastUsedEmail = inputEmail;
      linkStatus.removeClass('fail').addClass('success').html("\n                    <i class=\"fas fa-exclamation-circle\"></i> Linked!\n                ");
      setTimeout(function () {
        modalFade('out');
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
}; // Update 'All linked emails' list


var updateEmails = function updateEmails() {
  $('#sidemenu-emails-list').children().toArray().forEach(function (child) {
    return $(child).remove();
  });

  for (var email in savedEmails) {
    $('#sidemenu-emails-list').append("<li><span class=\"email-links-count\">".concat(savedEmails[email].length, "</span> <span class=\"email-link\">").concat(email, "</span></li>"));
  }
};
/**
 * Load Saved Images Functions
 */


var waitForLoad = function waitForLoad(img) {
  img.onload = function () {
    $("#column-".concat(column)).append('<div class="linked-img">').append(img).append('</div>');
    loadedImg.fadeIn(500);
    return true;
  };
};

var getSavedImages = function getSavedImages(email) {
  $(loadedImg, '#column-1, #column-2').fadeOut(500);
  setTimeout(function () {
    loadedImg.remove();
    $('#column-1, #column-2').remove();

    for (var i = 1; i <= 2; i++) {
      imgContainer.append("<div id=\"column-".concat(i, "\"></div>"));
    }

    loadSavedImages(savedEmails[email], displayLoadedImages);
  }, 500);
};

var loadSavedImages = function loadSavedImages(array, onAllLoaded) {
  var i = 0;
  var numLoading = array.length;

  var onload = function onload() {
    return --numLoading === 0 && onAllLoaded(images);
  };

  var images = {};

  while (i < array.length) {
    var img = images[i] = new Image();
    img.src = array[i].download_url;
    img.className = 'loaded-linked-img';
    img.id = array[i].id;
    img.onload = onload;
    i++;
  }
};

var displayLoadedImages = function displayLoadedImages(imageCollection) {
  var column = 1;

  for (var image in imageCollection) {
    $("#column-".concat(column)).append("<div class=\"linked-img\" id=\"img-".concat(imageCollection[image].id, "\">"));
    $("#img-".concat(imageCollection[image].id)).append(imageCollection[image]);
    column++;

    if (column > 2) {
      column = 1;
    }
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
}; // Modal fade


var modalFade = function modalFade(dest) {
  if (dest === 'in') {
    linkBox.fadeIn(500);
    emailField.focus();

    if (lastUsedEmail !== null) {
      $('#past-email').show();
      btnPastEmail.html("".concat(lastUsedEmail));
    }
  } else if (dest === 'out') {
    linkBox.fadeOut(500, function () {
      emailField.val('');
      modalBtnDisable('enable');
      linkStatus.removeClass('success', 'fail').html('');
    });
  }
}; // Modal button disable/re-enable


var modalBtnDisable = function modalBtnDisable(attr) {
  if (attr === 'disable') {
    $(btnPastEmail, btnCancel, btnCancel).attr('disabled', 'disabled');
  } else if (attr === 'enable') {
    $(btnPastEmail, btnCancel, btnCancel).removeAttr('disabled');
  }
};
/**
 * Event Listeners
 */
// Page load


$(document).ready(function () {
  getImages();
  logoColor();
}); // Hamburger button

$('.hamburger').on('click', function () {
  $(this).toggleClass('is-active');

  if ($(this).hasClass('notification')) {
    $('.hamburger').toggleClass('notification');
  }

  $('#sidemenu-links-h3, #sidemenu-emails-h3').removeClass('submenu--closed submenu--open');

  if ($(window).width() < 1024) {
    $('#sidemenu-links-h3').addClass('submenu--open').next().slideDown(500);
    $('#sidemenu-emails-h3').addClass('submenu--closed').next().hide();
  } else {
    $('#sidemenu-links-h3').addClass('submenu--closed').next().hide();
    $('#sidemenu-emails-h3').addClass('submenu--open').next().slideDown(500);
  }
}); // Site overlay

$('.site-overlay').on('click', function () {
  return $('.hamburger').toggleClass('is-active');
}); // Side menu submenus

$('#sidemenu-links-h3, #sidemenu-emails-h3').on('click', function (event) {
  if ($(this).hasClass('submenu--closed')) {
    $(this).removeClass('submenu--closed').addClass('submenu--open').next().slideDown(200);
  } else {
    $(this).removeClass('submenu--open').addClass('submenu--closed').next().slideUp(200);
  }
}); // 'Link Image' button

btnLink.on('click', function () {
  return modalFade('in');
}); // 'New Image' button

btnRefresh.on('click', function () {
  return newImage();
}); // Closes modal box when clicking outside it

linkBox.on('click', function (event) {
  if (!Object.values($('#link-input').find('*')).includes(event.target)) {
    modalFade('out');
  }
}); // Modal 'Link to Previous Email' button

btnPastEmail.on('click', function () {
  modalBtnDisable('disable');
  linkImage(lastUsedEmail);
}); // Modal 'Cancel' button

btnCancel.on('click', function () {
  return modalFade('out');
}); // Modal 'Link It' button

btnLinkIt.on('click', function () {
  modalBtnDisable('disable');
  var inputEmail = emailField.val();
  linkImage(inputEmail);
}); // Pressing enter from the email field fires Link It event

emailField.keyup(function (event) {
  if (event.keyCode === 13) {
    btnLinkIt.click();
  }
}); // Read text content when clicking dynamic list item

$(document).on('click', '.email-link', function (event) {
  fromLinksView = true;
  $(btnLink).addClass('loading').attr('disabled', 'disabled');
  var selectedEmail = event.target.textContent;
  getSavedImages("".concat(selectedEmail));
  var headingMessage = '';

  if (savedEmails[selectedEmail].length === 1) {
    headingMessage = '1 image linked to';
  } else {
    headingMessage = "".concat(savedEmails[selectedEmail].length, " images linked to");
  }

  $('#photo-info').html("\n        <div id=\"photo-heading\">\n            <div id=\"photo-id\">\n                <h2>".concat(headingMessage, "</h2><br/>\n            </div>\n        </div>\n        <span id=\"selected-email\">").concat(selectedEmail, "</span>\n    "));
  $('#links-info').hide();
  $('#sidemenu-links').hide();
}); // Read ID when clicking dynamic linked image

$(document).on('click', '.loaded-linked-img', function (event) {
  getOldImg = true;
  var clickedImgID = $(event.target).attr('id');
  displayedImg = linkedImages[clickedImgID];
  newImage();
});