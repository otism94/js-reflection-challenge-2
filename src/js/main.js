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

// Image storage
let displayedImg = null
let linkedImages = {}

// Email storage
const savedEmails = {}
let lastUsedEmail = null

// State trackers
let modalVisible = false

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
    fetch(getPicsum)
        .then(response => response.json())
        .then(pickRandomImage)
        .then($('#error').remove())
        .catch(err => errorHandler(err))
}

// Picks a random image from the fetched data
const pickRandomImage = json => {
    let randomImage = Math.floor(Math.random() * 99)
    const chosenImage = json[randomImage]
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
                <i class="fas fa-link" id="icon-link"></i> ${displayedImg.links.length}
            </div>
        </div>
        <ul id="info-list">
            <li><i class="fas fa-user-circle"></i>${displayedImg.author}</li>
            <li><i class="fab fa-unsplash"></i><a href="${displayedImg.url}" target="_blank">View this image on Unsplash</a></li>
        </li>
    `)
}

// Removes image and loads a new one
const newImage = () => {
    loadedImg.fadeOut(500, function() {
        this.remove()
        getImages()
    })
}

// Display error on page
const errorHandler = err => {
    imgContainer.html(`
        <div id="error" style="text-align: center">
            <h2>Something went wrong!</h2>
            <span style="color: #ec3746">${err}</span>
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
    for (savedEmail in savedEmails) {
        if (savedEmail === email) {
            isNewEmail = false
            break
        }
    }
    if (isNewEmail) {
        savedEmails[`${email}`] = [displayedImg]
    } else {
        for (let i = 0; i < savedEmails[`${email}`].length; i++) {
            if (savedEmails[`${email}`][i].id === displayedImg.id) {
                alreadyLinked = true
                break
            }
        }
        if (!alreadyLinked) {
            savedEmails[`${email}`].push(displayedImg)
        } else {
            emailField.focus()
            linkStatus.addClass('fail')
                .html(`
                    <i class="fas fa-exclamation-circle"></i> Email already linked!
                `)
            btnLinkIt.removeAttr('disabled')
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
        btnLinkIt.removeAttr('disabled')
    } else {
        const alreadyLinked = linkEmail(inputEmail)
        if (!alreadyLinked) {
            linkedImages[displayedImg.id] = displayedImg
            linkedImages[displayedImg.id].links.push(inputEmail)
            $('#links-count').html(`
                <i class="fas fa-link" id="icon-link"></i> ${linkedImages[displayedImg.id].links.length}
            `)
            lastUsedEmail = inputEmail
            linkStatus.removeClass('fail')
                .addClass('success')
                .html(`
                    <i class="fas fa-exclamation-circle"></i> Linked!
                `)
            setTimeout(() => {
                linkBox.fadeOut(500, () => {
                    linkStatus.removeClass('success')
                        .html('')
                    emailField.val('')
                    btnLinkIt.removeAttr('disabled')
                    modalVisible = false
                })
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

/**
 * Event Listeners
 */

// Page open
$(document).ready(() => {
    getImages()
    logoColor()
})

// 'Link Image' button
btnLink.on('click', () => {
    if (!modalVisible) {
        modalVisible = true
        linkBox.fadeIn(500)
        emailField.focus()
        if (lastUsedEmail !== null) {
            $('#past-email').show()
            btnPastEmail.html(`${lastUsedEmail}`)
        }
    } else if (modalVisible) {
        linkBox.fadeOut(500, () => {
            emailField.val('')
            linkStatus.removeClass('fail')
                .html('')
            modalVisible = false
        })
    }
})

// Modal 'Link to Previous Email' button
btnPastEmail.on('click', () => {
    linkImage(lastUsedEmail)
})

// Modal 'Cancel' button
btnCancel.on('click', () => {
    linkBox.fadeOut(500, () => {
        emailField.val('')
        linkStatus.removeClass('fail')
            .html('')
        modalVisible = false
    })
})

// Modal 'Link It' button
btnLinkIt.on('click', () => {
    btnLinkIt.attr('disabled', 'disabled')
    const inputEmail = emailField.val()
    linkImage(inputEmail)
})

// User presses enter to Link It
emailField.keyup(event => {
    if (event.keyCode === 13) {
        btnLinkIt.click()
    }
})

// 'New Image' button
btnRefresh.on('click', () => {
    if (modalVisible) {
        linkBox.fadeOut(500, () => {
            linkStatus.removeClass('fail')
                .html('')
            modalVisible = false
        })
    }
    newImage()
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
})