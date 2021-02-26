/**
 * Variables
 */

const picsumURL = page => `https://picsum.photos/v2/list?page=${page}&limit=100`

const btnLink = $('.btn-link')
const btnRefresh = $('.btn-refresh')
const btnRefreshHTML = '<i class="fas fa-redo-alt" id="icon-refresh"></i>'

const imgContainer = $('#img-container')
let loadedImg = $('#loaded-img')

let displayedImg = null

let linkedImages = {}

/**
 * Classes
 */

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
        .then(loadImage)
        .then(loadImageDetails)
        .catch(err => console.log(err))
}

// Picks a random image from the fetched data
const pickRandomImage = json => {
    let randomImage = Math.floor(Math.random() * 99)
    const chosenImage = json[randomImage]
    const chosenImageLinks = checkLinks(chosenImage)
    displayedImg = new ImageDetails(chosenImage.id, chosenImage.author, chosenImage.url, chosenImage.download_url, chosenImageLinks)
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

/**
 * Other Functions
 */

// Logo colour animation
const logoColor = () => {
    let hue = 0
    setInterval(() => {
        $('#icon-logo').css('color', `hsl(${hue}, 90%, 60%)`)
            .css('text-shadow', `0 0 5px hsl(${hue}, 90%, 60%)`)
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

// 'Link Image' button click
btnLink.on('click', () => {
    const inputEmail = prompt('Enter an email address')
    linkedImages[displayedImg.id] = displayedImg
    linkedImages[displayedImg.id].links.push(inputEmail)
    $('#links-count').html(`
        <i class="fas fa-link" id="icon-link"></i> ${linkedImages[displayedImg.id].links.length}
    `)
})

// 'New Image' button click
btnRefresh.on('click', () => {
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