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
    constructor(id, author, url, download_url) {
        this.id = id,
        this.author = author,
        this.url = url,
        this.download_url = download_url,
        this.links = []
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
        .then(checkLinks)
        .catch(err => console.log(err))
}

// Picks a random image from the fetched array
const pickRandomImage = json => {
    let randomImage = Math.floor(Math.random() * 99)
    const chosenImage = json[randomImage]
    const imageInfo = new ImageDetails(chosenImage.id, chosenImage.author, chosenImage.url, chosenImage.download_url, 0)
    displayedImg = imageInfo
    return imageInfo
}

// Fades in the image once it's fully loaded
const loadImage = src => {
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
    img.src = src.download_url
    return src
}

// Retrieves image details from object and displays in sidebar
const loadImageDetails = obj => {
    $('#photo-info').html(`
        <div id="photo-heading">
            <div id="photo-id">
                <h2>Image</h2>
                <span>${obj.id}</span>
            </div>
            <div id="links-count">
                <i class="fas fa-link" id="icon-link"></i> ${obj.links.length}
            </div>
        </div>
        <ul id="info-list">
            <li><i class="fas fa-user-circle"></i>${obj.author}</li>
            <li><i class="fab fa-unsplash"></i><a href="${obj.url}" target="_blank">View this image on Unsplash</a></li>
        </li>
    `)
    return obj
}

// Checks how many times the displayed image has been linked
const checkLinks = img => {
    for (const id in linkedImages) {
        if (id === img.id) {
            const displayedImgLinks = linkedImages[id].links.length
            $('#links-count').html(`
                <i class="fas fa-link" id="icon-link"></i> ${displayedImgLinks}
            `)
            break
        }
    }
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
btnLink.on('click', function() {
    linkedImages[displayedImg.id] = displayedImg
    const inputEmail = prompt('Enter an email address')
    linkedImages[displayedImg.id].links.push(inputEmail)
    const displayedImgLinks = linkedImages[displayedImg.id].links.length
    $('#links-count').html(`
        <i class="fas fa-link" id="icon-link"></i> ${displayedImgLinks}
    `)
})

// 'New Image' button click
btnRefresh.on('click', function() {
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