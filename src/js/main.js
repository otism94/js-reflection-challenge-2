/**
 * Variables
 */

// Picsum API
const picsumURL = page => `https://picsum.photos/v2/list?page=${page}&limit=100`

// Main page DOM queries
const linkBox = $('#modal-link-box')
const imgContainer = $('#img-container')
let loadedImg = $('#loaded-img')
const btnLink = $('.btn-link')
const btnRefresh = $('.btn-refresh')
const btnRefreshHTML = '<i class="fas fa-redo-alt" id="icon-refresh"></i>'

// Modal box DOM queries
const emailField = $('#user-email-field')
const linkStatus = $('#status')
const btnPastEmail = $('.btn-past-email')
const btnCancel = $('.btn-cancel')
const btnLinkIt = $('.btn-linkit')

// State tracker
let fromLinksView = false
let getOldImg = false

// Image storage
const linkedImages = {}
let displayedImg = null

// Email storage
const savedEmails = {}
let lastUsedEmail = null

// Email format regex
const mailFormat = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

/**
 * Classes
 */

// Image Details for displayedImg and linkedImages
const ImageDetails = class {
    constructor(id, author, url, download_url, links) {
        this.id = id,
        this.author = author,
        this.url = url,
        this.download_url = download_url,
        this.links = links
    }
}

/**
 * Image Functions
 */

// Fetches an image
const getImages = () => {
    const randomPage = Math.floor(Math.random() * (10) + 1)
    const getPicsum = picsumURL(randomPage)
    axios.get(getPicsum)
        .then(response => {
            pickRandomImage(response.data)
            $('#error').remove()
        })
        .catch(err => errorHandler(err))
}

// Picks a random image from the fetched data
const pickRandomImage = array => {
    const randomImage = Math.floor(Math.random() * (array.length - 1))
    const chosenImage = array[randomImage]
    const chosenImageLinks = checkLinks(chosenImage)
    displayedImg = new ImageDetails(chosenImage.id, chosenImage.author, chosenImage.url, chosenImage.download_url, chosenImageLinks)
    loadImage()
    loadImageDetails()
}

// Checks how many times the displayed image has been linked
const checkLinks = img => {
    if (!jQuery.isEmptyObject(linkedImages)) {
        for (const id in linkedImages) {
            if (linkedImages[id].links.length > 0 && id === img.id) {
                return linkedImages[id].links
            } else {
                return []
            }
        }
    } else {
        return []
    }
}

// Fades in the image once it's fully loaded
const loadImage = () => {
    const img = new Image()
    img.onload = () => {
        btnRefresh.html(`${btnRefreshHTML}New Image`)
            .removeClass('loading')
            .removeAttr('disabled')
        btnLink.removeClass('loading')
            .removeAttr('disabled')
        imgContainer.append(img)
        loadedImg = $('#loaded-img')
        loadedImg.fadeIn(500)
    }
    img.id = 'loaded-img'
    img.src = displayedImg.download_url
}

// Retrieves image details from object and displays in sidebar
const loadImageDetails = () => {
    $('#photo-info').html(`
        <div id="photo-heading">
            <div id="photo-id">
                <h2>Image</h2>
                <span>${displayedImg.id}</span>
            </div>
            <div id="links-count">
                <i class="fas fa-link"></i> ${displayedImg.links.length}
            </div>
        </div>
        <ul id="info-list">
            <li><i class="fas fa-user-circle"></i>${displayedImg.author}</li>
            <li><i class="fab fa-unsplash"></i><a href="${displayedImg.url}" target="_blank">View this image on Unsplash</a></li>
        </li>
    `)
    if (displayedImg.links.length) {
        displayedImg.links.forEach(email => {
            $('#no-links').hide()
            $('#sidemenu-no-links').hide()
            $('#sidemenu-no-emails').hide()
            $('#links-list').append(`<li><span class="email-links-count">${savedEmails[email].length}</span> <span class="email-link">${email}</span></li>`)
            $('#sidemenu-links-list').append(`<li><span class="email-links-count">${savedEmails[email].length}</span> <span class="email-link">${email}</span></li>`)
        })
    } else {
        $('#no-links').show()
        $('#sidemenu-no-links').show()
    }
}

// Removes image and loads a new one
const newImage = () => {
    if (fromLinksView) {
        $('#column-1').fadeOut(500)
        $('#column-2').fadeOut(500, () => {
            $('#column-1, #column-2').remove()
            if (!getOldImg) {
                getImages()
            } else if (getOldImg) {
                loadImage()
                loadImageDetails()
            }
            $('#links-info, #sidemenu-links').show()
            getOldImg = fromLinksView = false
        })
    } else {
        loadedImg.fadeOut(500, () => {
            loadedImg.remove()
            getImages()
        })
    }
    $('#links-list').children().toArray().forEach(child => {
        $(child).remove()
    })
    $('#sidemenu-links-list').children().toArray().forEach(child => {
        if ($(child).attr('id') !== 'sidemenu-no-links') {
            $(child).remove()
        }
    })
    btnRefresh.html(`${btnRefreshHTML}Loading...`)
        .addClass('loading')
        .attr('disabled', 'disabled')
    btnLink.addClass('loading')
        .attr('disabled', 'disabled')
    $({rotation: 0}).animate({rotation: 360}, {
        duration: 1500,
        easing: 'linear',
        step: function() {
            $('#icon-refresh').css({transform: `rotate(${this.rotation}deg)`})
        }
    })
}

// Display API request error on page
const errorHandler = err => {
    imgContainer.html(`
        <div id="error">
            <h2>Something went wrong!</h2>
            <span>${err}</span>
        </div>
    `)
}

/**
 * Email linking functions
 */

// Link email
const linkEmail = email => {
    let isNewEmail = true
    let alreadyLinked = false
    for (let savedEmail in savedEmails) {
        if (savedEmail === email) {
            isNewEmail = false
            break
        }
    }
    if (isNewEmail) {
        savedEmails[`${email}`] = [displayedImg]
        updateEmails()
    } else {
        for (let i = 0; i < savedEmails[`${email}`].length; i++) {
            if (savedEmails[`${email}`][i].id === displayedImg.id) {
                alreadyLinked = true
                break
            }
        }
        if (!alreadyLinked) {
            savedEmails[`${email}`].push(displayedImg)
            updateEmails()
        } else {
            emailField.focus()
            linkStatus.addClass('fail')
                .html(`
                    <i class="fas fa-exclamation-circle"></i> Email already linked!
                `)
            modalBtnDisable('enable')
        }
    }
    return alreadyLinked
}

// Link image
const linkImage = inputEmail => {
    let isValid = validateEmail(inputEmail)
    if (!isValid) {
        emailField.focus()
        linkStatus.addClass('fail')
            .html(`
                <i class="fas fa-exclamation-circle"></i> Invalid email! Try again.
            `)
        modalBtnDisable('enable')
    } else {
        const alreadyLinked = linkEmail(inputEmail)
        if (!alreadyLinked) {
            linkedImages[displayedImg.id] = displayedImg
            linkedImages[displayedImg.id].links.push(inputEmail)
            $('#links-count').html(`
                <i class="fas fa-link" id="icon-link"></i> ${linkedImages[displayedImg.id].links.length}
            `)
            $('#no-links, #sidemenu-no-links').hide()
            $('#links-list, #sidemenu-links-list').append(`
                <li>
                    <span class="email-links-count">${savedEmails[inputEmail].length}</span>
                    <span class="email-link">${inputEmail}</span>
                </li>
            `)
            if (!$('.hamburger').hasClass('notification')) {
                $('.hamburger').toggleClass('notification')
            }
            lastUsedEmail = inputEmail
            linkStatus.removeClass('fail')
                .addClass('success')
                .html(`
                    <i class="fas fa-exclamation-circle"></i> Linked!
                `)
            setTimeout(() => {
                modalFade('out')
            }, 1000)
        }
    }
}

// Email validator
const validateEmail = email => {
    if (email.match(mailFormat) && email.length > 0) {
        return true
    } else {
        return false
    }
}

// Update 'All linked emails' list
const updateEmails = () => {
    $('#sidemenu-emails-list').children().toArray().forEach(child => $(child).remove())
    for (let email in savedEmails) {
        $('#sidemenu-emails-list').append(`<li><span class="email-links-count">${savedEmails[email].length}</span> <span class="email-link">${email}</span></li>`)
    }
}

/**
 * Load Saved Images Functions
 */

const waitForLoad = img => {
    img.onload = () => {
        $(`#column-${column}`).append('<div class="linked-img">')
            .append(img)
            .append('</div>')
        loadedImg.fadeIn(500)
        return true
    }
}

const getSavedImages = email => {
    $(loadedImg, '#column-1, #column-2').fadeOut(500)
    setTimeout(() => {
        loadedImg.remove()
        $('#column-1, #column-2').remove()
        for (let i = 1; i <= 2; i++) {
            imgContainer.append(`<div id="column-${i}"></div>`)
        }
        loadSavedImages(savedEmails[email], displayLoadedImages)
    }, 500)
}

const loadSavedImages = (array, onAllLoaded) => {
    let i = 0
    let numLoading = array.length
    const onload = () => --numLoading === 0 && onAllLoaded(images)
    let images = {}
    while (i < array.length) {
        const img = images[i] = new Image
        img.src = array[i].download_url
        img.className = 'loaded-linked-img'
        img.id = array[i].id
        img.onload = onload
        i++
    }
}

const displayLoadedImages = imageCollection => {
    let column = 1
    for (let image in imageCollection) {
        $(`#column-${column}`).append(`<div class="linked-img" id="img-${imageCollection[image].id}">`)
        $(`#img-${imageCollection[image].id}`).append(imageCollection[image])
        column++
        if (column > 2) {
            column = 1
        }
    }
}

/**
 * Other Functions
 */

// Logo colour animation
const logoColor = () => {
    let hue = 0
    setInterval(() => {
        $('#icon-logo').css({
            'color': `hsl(${hue}, 90%, 60%)`,
            'text-shadow': `0 0 5px hsl(${hue}, 90%, 60%)`
        })
        hue++
        if (hue === 360) {
            hue = 0
        }
    }, 10)
}

// Modal fade
const modalFade = dest => {
    if (dest === 'in') {
        linkBox.fadeIn(500)
        emailField.focus()
        if (lastUsedEmail !== null) {
            $('#past-email').show()
            btnPastEmail.html(`${lastUsedEmail}`)
        }
    } else if (dest === 'out') {
        linkBox.fadeOut(500, () => {
            emailField.val('')
            modalBtnDisable('enable')
            linkStatus.removeClass('success', 'fail')
                .html('')
        })
    }
}

// Modal button disable/re-enable
const modalBtnDisable = attr => {
    if (attr === 'disable') {
        $(btnPastEmail, btnCancel, btnCancel).attr('disabled', 'disabled')
    } else if (attr === 'enable') {
        $(btnPastEmail, btnCancel, btnCancel).removeAttr('disabled')
    }
}

/**
 * Event Listeners
 */

// Page load
$(document).ready(() => {
    getImages()
    logoColor()
})

// Hamburger button
$('.hamburger').on('click', function() {
    $(this).toggleClass('is-active')
    if ($(this).hasClass('notification')) {
        $('.hamburger').toggleClass('notification')
    }
    $('#sidemenu-links-h3, #sidemenu-emails-h3').removeClass('submenu--closed submenu--open')
    if ($(window).width() < 1024) {
        $('#sidemenu-links-h3').addClass('submenu--open')
            .next().slideDown(500)
        $('#sidemenu-emails-h3').addClass('submenu--closed')
            .next().hide()
    } else {
        $('#sidemenu-links-h3').addClass('submenu--closed')
            .next().hide()
        $('#sidemenu-emails-h3').addClass('submenu--open')
            .next().slideDown(500)
    }
})

// Site overlay
$('.site-overlay').on('click', () => $('.hamburger').toggleClass('is-active'))

// Side menu submenus
$('#sidemenu-links-h3, #sidemenu-emails-h3').on('click', function(event) {
    if ($(this).hasClass('submenu--closed')) {
        $(this).removeClass('submenu--closed')
            .addClass('submenu--open')
            .next().slideDown(200)
    } else {
        $(this).removeClass('submenu--open')
            .addClass('submenu--closed')
            .next().slideUp(200)
    }
})

// 'Link Image' button
btnLink.on('click', () => modalFade('in'))

// 'New Image' button
btnRefresh.on('click', () => newImage())

// Closes modal box when clicking outside it
linkBox.on('click', event => {
    if (!Object.values($('#link-input').find('*')).includes(event.target)) {
        modalFade('out')
    }
})

// Modal 'Link to Previous Email' button
btnPastEmail.on('click', () => {
    modalBtnDisable('disable')
    linkImage(lastUsedEmail)
})

// Modal 'Cancel' button
btnCancel.on('click', () => modalFade('out'))

// Modal 'Link It' button
btnLinkIt.on('click', () => {
    modalBtnDisable('disable')
    const inputEmail = emailField.val()
    linkImage(inputEmail)
})

// Pressing enter from the email field fires Link It event
emailField.keyup(event => {
    if (event.keyCode === 13) {
        btnLinkIt.click()
    }
})

// Read text content when clicking dynamic list item
$(document).on('click', '.email-link', event => {
    fromLinksView = true
    $(btnLink).addClass('loading')
        .attr('disabled', 'disabled')
    const selectedEmail = event.target.textContent
    getSavedImages(`${selectedEmail}`)
    let headingMessage = ''
    if (savedEmails[selectedEmail].length === 1) {
        headingMessage = '1 image linked to'
    } else {
        headingMessage = `${savedEmails[selectedEmail].length} images linked to`
    }
    $('#photo-info').html(`
        <div id="photo-heading">
            <div id="photo-id">
                <h2>${headingMessage}</h2><br/>
            </div>
        </div>
        <span id="selected-email">${selectedEmail}</span>
    `)
    $('#links-info').hide()
    $('#sidemenu-links').hide()
})

// Read ID when clicking dynamic linked image
$(document).on('click', '.loaded-linked-img', event => {
    getOldImg = true
    const clickedImgID = $(event.target).attr('id')
    displayedImg = linkedImages[clickedImgID]
    newImage()
})