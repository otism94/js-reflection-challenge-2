/**
 * Global Variables
 */

// Main page DOM queries
const linkBox = $('#modal-link-box')
const imgContainer = $('#img-container')
let loadedImg = $('#loaded-img') // This element gets added/removed and so needs to be updated
const imgInfo = $('#photo-info')
const btnLink = $('.btn-link')
const btnRefresh = $('.btn-refresh')
const btnRefreshHTML = '<i class="fas fa-redo-alt" id="icon-refresh"></i>'
const btnHamburger = $('.hamburger')

// Modal box DOM queries
const emailField = $('#user-email-field')
const linkStatus = $('#status')
const btnPastEmail = $('.btn-past-email')
const btnCancel = $('.btn-cancel')
const btnLinkIt = $('.btn-linkit')

// Linked emails DOM queries
const linksInfo = $('#links-info')
const linksInfoSide = $('#sidemenu-links')
const allLinkedEmailsList = $('#sidemenu-emails-list')
const thisImgLinksHead = $('#sidemenu-links-h3')
const allImgsLinksHead = $('#sidemenu-emails-h3')
const linksList = $('#links-list')
const linksListSide = $('#sidemenu-links-list')
const noLinksInfo = $('#no-links')
const noLinksInfoSide = $('#sidemenu-no-links')

// Image storage
const linkedImgs = {}
let displayedImg = null

// Email storage
const savedEmails = {}
let lastUsedEmail = null

// Email format regex
const mailFormat = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

/**
 * Classes
 */

// Image Details for displayedImg and linkedImgs
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
    axios.get(`https://picsum.photos/v2/list?page=${randomPage}&limit=100`)
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
    loadImage(), loadImageDetails()
}

// Checks how many times the displayed image has been linked
const checkLinks = img => {
    if (!jQuery.isEmptyObject(linkedImgs)) {
        for (const id in linkedImgs) {
            return (linkedImgs[id].links.length > 0 && id === img.id) ? linkedImgs[id].links : []
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
        btnRefresh.add(btnLink)
            .removeClass('loading')
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
    imgInfo.html(`
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
            noLinksInfo.add(noLinksInfoSide).add('#sidemenu-no-emails').hide()
            linksList.add(linksListSide).append(`
                <li>
                    <span class="email-links-count">${savedEmails[email].length}</span> <span class="email-link">${email}</span>
                </li>
            `)
        })
    } else {
        noLinksInfo.add(noLinksInfoSide).show()
    }
}

// Removes image and loads a new one
const newImage = (fromLinksView, wantOldImg) => {
    if (fromLinksView) {
        $('#column-1, #column-2').fadeOut(500)
        setTimeout(() => {
            $('#column-1, #column-2').remove()
            wantOldImg ? (loadImage(), loadImageDetails()) : getImages()
            $(window).innerWidth < 1024 ? linksInfoSide.show() : linksInfo.show()
            linksInfo.add(linksInfoSide).removeAttr('style')
        }, 500)
    } else {
        loadedImg.fadeOut(500, () => {
            loadedImg.remove()
            getImages()
        })
    }
    linksList.add(linksListSide).children().toArray().forEach(child => $(child).attr('id') !== 'sidemenu-no-links' && $(child).remove())
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
                .html(`<i class="fas fa-exclamation-circle"></i> Email already linked!`)
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
            .html(`<i class="fas fa-exclamation-circle"></i> Invalid email! Try again.`)
        modalBtnDisable('enable')
    } else {
        const alreadyLinked = linkEmail(inputEmail)
        if (!alreadyLinked) {
            linkedImgs[displayedImg.id] = displayedImg
            linkedImgs[displayedImg.id].links.push(inputEmail)
            $('#links-count').html(`<i class="fas fa-link" id="icon-link"></i> ${linkedImgs[displayedImg.id].links.length}`)
            noLinksInfo.add(noLinksInfoSide).hide()
            linksList.add(linksListSide).append(`
                <li>
                    <span class="email-links-count">${savedEmails[inputEmail].length}</span> <span class="email-link">${inputEmail}</span>
                </li>
            `)
            !btnHamburger.hasClass('notification') && btnHamburger.toggleClass('notification')
            lastUsedEmail = inputEmail
            linkStatus.removeClass('fail')
                .addClass('success')
                .html(`<i class="fas fa-exclamation-circle"></i> Linked!`)
            setTimeout(() => {
                modalFade('out')
            }, 1000)
        }
    }
}

// Email validator
const validateEmail = email => {
    return (email.match(mailFormat) && email.length) > 0 ? true : false
}

// Update 'All linked emails' list
const updateEmails = () => {
    allLinkedEmailsList.children().toArray().forEach(child => $(child).remove())
    for (let email in savedEmails) {
        allLinkedEmailsList.append(`
            <li>
                <span class="email-links-count">${savedEmails[email].length}</span> <span class="email-link">${email}</span>
            </li>
        `)
    }
}

/**
 * Load Saved Images Functions
 */

// Hide current image(s) and get an email's linked image(s)
const getSavedImages = email => {
    $('#column-1, #column-2').add(loadedImg).fadeOut(500)
    setTimeout(() => {
        $('#column-1, #column-2').add(loadedImg).remove()
        for (let i = 1; i <= 2; i++) {
            imgContainer.append(`<div id="column-${i}"></div>`)
        }
        loadSavedImages(savedEmails[email], displayLoadedImages)
    }, 500)
}

// Create a new element for each saved image and do not continue until all are loaded
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

// Create columns and append images to each
const displayLoadedImages = imageCollection => {
    let column = 1
    for (let image in imageCollection) {
        $(`#column-${column}`).append(`<div class="linked-img" id="img-${imageCollection[image].id}"></div>`)
        $(`#img-${imageCollection[image].id}`).append(imageCollection[image])
        column++ && column > 2 && (column = 1)
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
        hue++ && hue === 360 && (hue = 0)
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
        btnPastEmail.add(btnCancel).add(btnLinkIt).attr('disabled', 'disabled')
    } else if (attr === 'enable') {
        btnPastEmail.add(btnCancel).add(btnLinkIt).removeAttr('disabled')
    }
}

/**
 * Event Listeners
 */

// Page load
$(document).ready(() => {
    logoColor(), getImages()
})

// Hamburger button
btnHamburger.on('click', function() {
    $(this).toggleClass('is-active')
    $(this).hasClass('notification') && $(this).toggleClass('notification')
    thisImgLinksHead.add(allImgsLinksHead).removeClass('submenu--closed submenu--open')
    if ($(window).width() < 1024) {
        thisImgLinksHead.addClass('submenu--open')
            .next().slideDown(500)
        allImgsLinksHead.addClass('submenu--closed')
            .next().hide()
    } else {
        thisImgLinksHead.addClass('submenu--closed')
            .next().hide()
        allImgsLinksHead.addClass('submenu--open')
            .next().slideDown(500)
    }
})

// Site overlay
$('.site-overlay').on('click', () => btnHamburger.toggleClass('is-active'))

// Side menu submenus
thisImgLinksHead.add(allImgsLinksHead).on('click', event => {
    if ($(event.target).hasClass('submenu--closed')) {
        $(event.target).removeClass('submenu--closed')
            .addClass('submenu--open')
            .next().slideDown(200)
    } else {
        $(event.target).removeClass('submenu--open')
            .addClass('submenu--closed')
            .next().slideUp(200)
    }
})

// 'Link Image' button
btnLink.on('click', () => modalFade('in'))

// 'New Image' button
btnRefresh.on('click', () => {
    const fromLinksView = $('#column-1').length ? true : false
    const wantOldImg = false
    newImage(fromLinksView, wantOldImg)
})

// Closes modal box when clicking outside it
linkBox.on('click', event => {
    !Object.values($('#link-input').find('*')).includes(event.target) && modalFade('out')
})

// Modal 'Link to Previous Email' button
btnPastEmail.on('click', () => {
    modalBtnDisable('disable'), linkImage(lastUsedEmail)
})

// Modal 'Cancel' button
btnCancel.on('click', () => modalFade('out'))

// Modal 'Link It' button
btnLinkIt.on('click', () => {
    const inputEmail = emailField.val()
    modalBtnDisable('disable'), linkImage(inputEmail)
})

// Pressing enter from the email field fires Link It event
emailField.keyup(event => {
    event.keyCode === 13 && btnLinkIt.click()
})

// Dynamic linked emails list item click event
$(document).on('click', '.email-link', event => {
    btnLink.addClass('loading')
        .attr('disabled', 'disabled')
    const selectedEmail = event.target.textContent
    getSavedImages(`${selectedEmail}`)
    const headingMessage = savedEmails[selectedEmail].length === 1 ? '1 image linked to' : `${savedEmails[selectedEmail].length} images linked to`
    imgInfo.html(`
        <div id="photo-heading">
            <div id="photo-id">
                <h2>${headingMessage}</h2><br/>
            </div>
        </div>
        <span id="selected-email">${selectedEmail}</span>
    `)
    linksInfo.add(linksInfoSide).hide()
})

// Dynamic linked image element click event
$(document).on('click', '.loaded-linked-img', event => {
    const fromLinksView = $('#column-1').length ? true : false
    const wantOldImg = true
    const clickedImgID = $(event.target).attr('id')
    displayedImg = linkedImgs[clickedImgID]
    newImage(fromLinksView, wantOldImg)
})