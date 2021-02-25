const getImages = () => {
    const randomPage = Math.floor(Math.random() * (10) + 1)
    const picsumURL = `https://picsum.photos/v2/list?page=${randomPage}&limit=100`
    fetch(picsumURL)
        .then(response => response.json())
        .then(pickRandomImage)
        .then(loadImage)
        .catch(err => console.log(err))
}

const pickRandomImage = json => {
    let randomImage = Math.floor(Math.random() * (99) + 0)
    const chosenImage = json[randomImage]
    return chosenImage
}

const loadImage = src => {
    const img = new Image()
    img.onload = () => {
        $('#img-container').append(img)
        $('#loaded-img').fadeIn(500)
    };
    img.id = 'loaded-img'
    img.src = src.download_url
}

const newImage = () => {
    $('#loaded-img').fadeOut(500, () => {
        $('#loaded-img').remove()
        getImages()
    })
}

$(document).ready(() => {
    getImages()
})

$('#btn-refresh').on('click', () => {
    newImage()
})