import { Notify } from 'notiflix';
import NewsApiService from './new-service';
import debounce from 'lodash.debounce';
import LoadMoreBtn from './load-more-btn';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const DEBOUNCE_DELAY = 300;
const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  btnSearch: document.querySelector('.btn-search'),
  input: document.querySelector('.input'),
  linkError: document.querySelector('.link-error'),
};
const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});
const newsApiService = new NewsApiService();

refs.form.addEventListener('submit', searchImage);
loadMoreBtn.refs.button.addEventListener('click', getCollectionPhotoRequest);
refs.input.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

function onInput() {
  refs.btnSearch.disabled = false;
}
function searchImage(e) {
  e.preventDefault();

  newsApiService.query = e.currentTarget.elements.searchQuery.value;
  if (!e.currentTarget.elements.searchQuery.value.trim()) {
    setTimeout(() => {
      refs.form.reset();
    }, 500);
    return Notify.info('Empty string, enter your request');
  }

  loadMoreBtn.show();
  newsApiService.resetPage();
  newsApiService.onTotalPageReset();
  getCollectionPhotoRequest();
  refs.form.reset();
  refs.btnSearch.disabled = true;
  clearPhotoGallery();
}
//отримання статьи
function getCollectionPhotoRequest() {
  loadMoreBtn.disable();

  newsApiService
    .searchGelleryPhoto()
    .then(articles => {
      if (articles.data.hits.length === 0) {
        loadMoreBtn.hide();
        return failure();
      }
      if (newsApiService.totalPage >= 500) {
        warning();
        loadMoreBtn.hide();

        photoGalleryRenderer(articles.data.hits);
        return;
      }
      if (articles.data.hits.length < 40) {
        if (newsApiService.page === 1) {
          success(articles);
        }

        photoGalleryRenderer(articles.data.hits);
        loadMoreBtn.hide();
        return;
      }

      if (newsApiService.page === 1) {
        success(articles);
      }

      photoGalleryRenderer(articles.data.hits);
      if (articles.data.totalHits < 20) {
        loadMoreBtn.hide();
      }
      newsApiService.incrementPage();
      newsApiService.onTotalPage();
      loadMoreBtn.enable();
      if (newsApiService.page > 2) {
        scrollBy();
      }
      console.log(articles);
    })
    .catch(error => {
      console.log(error.message);
      loadMoreBtn.hide();

      const errorMessage = `
        <div class='container-error'>
        <h2 class='title-error-h2'>${error.message}</h2>
           <h1 class='title-error-h1'>${error.request.status}</h1>
           <a href='index.html' class='link-error'>Go back home</a>
        </div>`;
      refs.gallery.innerHTML = errorMessage;
    });
}
//рендер галерей фото по запиту з серверу
function photoGalleryRenderer(photos) {
  const gallery = photos
    .map(
      ({
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        largeImageURL,
      }) => {
        return `
    <div  class="photo-card">
 <a href='${largeImageURL}'><img src=${webformatURL} alt="${tags}" loading="lazy" class='img-card'/></a> 
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
     ${downloads}
    </p>
  </div>
</div>`;
      }
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', gallery);

  //? налаштування бібліотеки simplelightbox
  let lightbox = new SimpleLightbox('.gallery a', {
    overlayOpacity: 0.8,
    animationSpeed: 300,
  });
}
//очистити вміст контейнеру з фото
function clearPhotoGallery() {
  refs.gallery.innerHTML = '';
}

// повыдомлення бібліотека Notify
function failure() {
  Notify.failure(
    `"Sorry, there are no images matching your search query. Please try again."`
  );
}
// повыдомлення бібліотека Notify
function success(articles) {
  Notify.success(`Hooray! We found ${articles.data.totalHits} images.`);
}

// повыдомлення бібліотека Notify
function warning() {
  Notify.warning("We're sorry, but you've reached the end of search results.");
}

//! опрацювання помилки 400-404
//! розібратись чому мигает кнопка Loading... при завантаженні сторінки на git

//скрол для сторінки
function scrollBy() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,

    behavior: 'smooth',
  });
}

//зробити анімацію коли немає фото
