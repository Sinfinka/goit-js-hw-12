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
const paginationInfo = document.getElementById('pagination-info');

const apiKey = '41719954-f83183d98e199e8ea762c32d5';
let currentPage = 1;
let searchTerm = '';

function showLoadMoreButton() {
  if (gallery.children.length > 0) {
    loadMoreButton.classList.add('visible');
  } else {
    loadMoreButton.classList.add('not-visible');
  }
}

function showErrorToastNoImages() {
  iziToast.error({
    title: 'Error',
    message:
      'Sorry, there are no images matching your search query. Please try again!',
    position: 'topRight',
    timeout: 3500,
    progressBar: false,
  });
}

function showCautionToastRechedTheEnd() {
  iziToast.warning({
    title: 'Caution',
    message: "We're sorry, but you've reached the end of search results.",
    position: 'topRight',
    timeout: 3500,
    progressBar: false,
    color: 'blue',
  });
}

function showPaginationInfo(totalHits) {
  const perPage = 40;
  const totalPages = Math.ceil(totalHits / perPage);
  paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  if (parseInt(totalPages, 10) <= parseInt(currentPage, 10)) {
    loadMoreButton.classList.add('not-visible');
    showCautionToastRechedTheEnd();
  }
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
    const response = await fetchImages();
    const images = response.data.hits;

    if (images.length > 0) {
      displayImages(images);
      showPaginationInfo(response.data.totalHits);
    } else {
      showErrorToastNoImages();
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
    const response = await fetchImages();
    const images = response.data.hits;

    if (images.length > 0) {
      displayImages(images);
      showPaginationInfo(response.data.totalHits);

      const cardHeight = gallery.firstElementChild.clientHeight;
      console.log(cardHeight);

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    } else {
      showErrorToastNoImages();
    }
  } catch (error) {
    console.error('Error fetching more data:', error);
    showErrorToastNoImages();
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

  return axios.get(apiUrl);
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
