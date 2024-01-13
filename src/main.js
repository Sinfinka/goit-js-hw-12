import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const form = document.querySelector('.form');
const searchInput = document.querySelector('.input');
const gallery = document.getElementById('gallery');
const loader = document.querySelector('.loader');
const loadMoreButton = document.querySelector('.load-more-btn');

const apiKey = '41719954-f83183d98e199e8ea762c32d5'; // код з Pixabay
let currentPage = 1;
let searchTerm = '';

function showLoadMoreButton() {
  loadMoreButton.style.display = gallery.children.length > 0 ? 'block' : 'none';
}

function showErrorToast() {
  iziToast.error({
    title: 'Error',
    message:
      'Sorry, there are no images matching your search query. Please try again!',
    position: 'topRight',
    timeout: 3500,
    progressBar: false,
  });
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  searchTerm = searchInput.value.trim();

  if (!searchTerm) {
    return;
  }

  loader.classList.remove('hide');
  gallery.innerHTML = '';
  currentPage = 1;

  try {
    const images = await fetchImages();
    if (images.length > 0) {
      displayImages(images);
    } else {
      showErrorToast();
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loader.classList.add('hide');
    showLoadMoreButton();
  }
});

loadMoreButton.addEventListener('click', async function () {
  loader.classList.remove('hide');
  currentPage++;

  try {
    const images = await fetchImages();
    displayImages(images);
  } catch (error) {
    console.error('Error fetching more data:', error);
    showErrorToast();
  } finally {
    loader.classList.add('hide');
    showLoadMoreButton();
  }
});

function fetchImages() {
  const perPage = 40;
  const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
    searchTerm
  )}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=${perPage}`;

  return axios.get(apiUrl).then(response => response.data.hits);
}

function displayImages(images) {
  const fragment = document.createDocumentFragment();

  images.forEach(image => {
    const li = document.createElement('li');
    li.classList.add('gallery-item');

    const a = document.createElement('a');
    a.href = image.largeImageURL;
    a.title = image.tags;

    const img = document.createElement('img');
    img.src = image.webformatURL;
    img.alt = image.tags;

    const descContainer = document.createElement('div');
    descContainer.classList.add('image-desc');

    const descItems = [
      { label: 'Likes', value: image.likes },
      { label: 'Views', value: image.views },
      { label: 'Comments', value: image.comments },
      { label: 'Downloads', value: image.downloads },
    ];

    descItems.forEach(item => {
      const descItem = document.createElement('div');
      descItem.classList.add('image-desc-item');

      const label = document.createElement('div');
      label.classList.add('image-desc-label');
      label.textContent = item.label;

      const value = document.createElement('div');
      value.textContent = item.value;

      descItem.appendChild(label);
      descItem.appendChild(value);
      descContainer.appendChild(descItem);
    });

    a.appendChild(img);
    li.appendChild(a);
    li.appendChild(descContainer);
    fragment.appendChild(li);
  });

  gallery.appendChild(fragment);
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}
